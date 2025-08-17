import express from 'express';
import passport from '../config/passport';
import { JWTService } from '../config/jwt';
import { prisma } from '../config/database';
import logger from '../utils/logger';
import axios from 'axios';
import { requireAuth, requireSessionAuth } from '../middleware/auth';

const router = express.Router();

// Google OAuth login
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` 
  }),
  (req, res) => {
    const user = req.user as any;
    
    logger.info(`OAuth callback successful for user: ${user.email}`);
    
    // Generate JWT token
    const token = JWTService.generateToken(user);
    const refreshToken = JWTService.generateRefreshToken(user);
    
    // Set secure HTTP-only cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    // Redirect to frontend with token in URL (temporary for SPA)
    const redirectUrl = user.onboardingCompleted 
      ? `${process.env.FRONTEND_URL}/dashboard?token=${token}`
      : `${process.env.FRONTEND_URL}/onboarding?token=${token}`;
    
    res.redirect(redirectUrl);
  }
);

// Get current user (JWT-based)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (session-based for OAuth flow)
router.get('/session-me', requireSessionAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (JWT-based)
router.post('/logout', requireAuth, (req, res) => {
  const userEmail = (req.user as any)?.email;
  
  // Clear JWT cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  
  logger.info(`User logged out: ${userEmail}`);
  
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// Logout (session-based)
router.post('/session-logout', requireSessionAuth, (req, res, next) => {
  const userEmail = (req.user as any)?.email;
  
  req.logout((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return next(err);
    }
    
    logger.info(`User logged out: ${userEmail}`);
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Could not log out' 
        });
      }
      
      res.clearCookie('connect.sid');
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    });
  });
});

// Check authentication status (JWT-based)
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.substring(7);
    
    if (!token) {
      return res.json({
        authenticated: false,
        user: null
      });
    }
    
    const payload = JWTService.verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    
    res.json({
      authenticated: !!user,
      user: user
    });
    
  } catch (error) {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Check session authentication status
router.get('/session-status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});

// Proxy endpoint for profile pictures to avoid CORS issues
router.get('/avatar/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Add CORS headers first
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    });
    
    // Find user and get their profile picture URL
    const { prisma } = await import('../config/database');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true }
    });

    if (!user || !user.profilePicture) {
      logger.warn(`Avatar not found for user: ${userId}`);
      return res.status(404).json({ error: 'Avatar not found' });
    }

    logger.info(`Fetching avatar for user ${userId}: ${user.profilePicture}`);

    // Fetch the image from Google
    const response = await axios.get(user.profilePicture, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://accounts.google.com/',
      }
    });

    // Set appropriate headers for image response
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Content-Length': response.headers['content-length']
    });

    // Pipe the image data
    response.data.pipe(res);

    logger.info(`Avatar successfully served for user: ${userId}`);

  } catch (error) {
    logger.error('Avatar proxy error:', error);
    
    // Send CORS headers even on error
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    
    res.status(500).json({ error: 'Failed to load avatar' });
  }
});

// Refresh user profile picture from Google
router.post('/refresh-avatar', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Here you could fetch fresh profile data from Google API
    // For now, we'll just trigger a re-login flow
    res.json({
      success: true,
      message: 'To refresh your avatar, please log out and log in again',
      currentAvatar: user.profilePicture
    });
  } catch (error) {
    logger.error('Avatar refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh avatar'
    });
  }
});

// Refresh JWT token using refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided'
      });
    }
    
    const payload = JWTService.verifyToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const newToken = JWTService.generateToken(user);
    
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

export default router;