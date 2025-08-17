import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../config/jwt';
import { prisma } from '../config/database';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: any;
  jwtPayload?: JWTPayload;
}

// JWT Authentication middleware
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.token;

    if (!token) {
      logger.warn(`No token provided for ${req.path}`);
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const payload = JWTService.verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        onboardingCompleted: true,
        profilePicture: true,
        location: true,
        ageRange: true,
        currentSituation: true,
        availableTime: true,
        riskTolerance: true,
        preferredApproach: true,
        firstGoal: true,
        annualIncome: true,
        currentSavings: true,
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        goalReminders: true,
        theme: true,
        language: true,
        currency: true,
        defaultGoalCategory: true,
        privacyLevel: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      logger.warn(`User not found for token: ${payload.id}`);
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Invalid token'
      });
    }

    req.user = user;
    req.jwtPayload = payload;
    next();

  } catch (error) {
    logger.warn(`Authentication failed for ${req.path}: ${error}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

// Session-based authentication (for OAuth flow)
export const requireSessionAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
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