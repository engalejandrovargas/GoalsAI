import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  logger.warn(`Unauthorized access attempt to ${req.path}`);
  
  res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  });
};

// Optional authentication (doesn't block, just adds user info)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // User info is already attached by passport deserializeUser if authenticated
  next();
};

// Admin middleware (for future use)
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Add admin check logic here when needed
  // For now, just proceed
  next();
};

// Onboarding check middleware
export const requireOnboarding = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const user = req.user as any;
  if (!user.onboardingCompleted) {
    return res.status(403).json({
      success: false,
      error: 'Onboarding required',
      message: 'Please complete your onboarding first'
    });
  }

  next();
};