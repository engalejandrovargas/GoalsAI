import express from 'express';
import passport from '../config/passport';
import logger from '../utils/logger';

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

export default router;