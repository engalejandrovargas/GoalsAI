import express from 'express';
import passport from '../config/passport';
import logger from '../utils/logger';
import axios from 'axios';

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
    
    // Redirect based on onboarding status
    if (user.onboardingCompleted) {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/onboarding`);
    }
  }
);

// Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({ 
      success: false,
      error: 'Not authenticated' 
    });
  }
});

// Logout
router.post('/logout', (req, res, next) => {
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
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
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
router.post('/refresh-avatar', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authenticated' 
    });
  }

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

export default router;