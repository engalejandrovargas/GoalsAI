import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { GoalService } from '../services/GoalService';
import logger from '../utils/logger';

const router = express.Router();

// Validation schema for onboarding
const onboardingSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  currentSituation: z.string().min(1, 'Current situation is required'),
  availableTime: z.string().min(1, 'Available time is required'),
  riskTolerance: z.string().min(1, 'Risk tolerance is required'),
  preferredApproach: z.string().min(1, 'Preferred approach is required'),
  firstGoal: z.string().min(1, 'First goal is required'),
});

// POST /users/complete-onboarding - Complete user onboarding
router.post('/complete-onboarding', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    const validatedData = onboardingSchema.parse(req.body);

    // Complete onboarding using UserService
    const updatedUser = await UserService.completeOnboarding(userId, {
      location: validatedData.location,
      ageRange: validatedData.ageRange,
      currentSituation: validatedData.currentSituation,
      availableTime: validatedData.availableTime,
      riskTolerance: validatedData.riskTolerance,
      preferredApproach: validatedData.preferredApproach,
      firstGoal: validatedData.firstGoal,
      onboardingCompleted: true,
    });

    // Create the first goal as an actual Goal object
    let createdGoal = null;
    if (validatedData.firstGoal && validatedData.firstGoal.trim() !== '') {
      try {
        // Map goals to appropriate categories
        const goalCategoryMap: Record<string, string> = {
          'Learn Spanish': 'learning',
          'Run a 5K': 'health',
          'Save $5,000': 'financial',
          'Read 12 books this year': 'learning',
          'Learn to cook Italian food': 'learning',
          'Travel to Japan': 'travel',
          'Learn Python programming': 'learning',
          'Learn to play guitar': 'learning',
          'Buy my first home': 'financial',
          'Buy a car': 'financial',
          'Start a side business': 'career',
          'Meditate daily for 6 months': 'health',
        };

        const goalCategory = goalCategoryMap[validatedData.firstGoal] || 'personal';

        createdGoal = await GoalService.createGoal(userId, {
          title: validatedData.firstGoal.length > 50 
            ? validatedData.firstGoal.substring(0, 47) + '...' 
            : validatedData.firstGoal,
          description: validatedData.firstGoal,
          category: goalCategory,
          status: 'planning',
        });
        logger.info(`Created first goal for user ${userId}: ${createdGoal.id}`);
      } catch (error) {
        logger.error(`Failed to create first goal for user ${userId}:`, error);
        // Don't fail the onboarding if goal creation fails
      }
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      createdGoal: createdGoal ? {
        id: createdGoal.id,
        title: createdGoal.title,
        description: createdGoal.description,
        category: createdGoal.category,
        status: createdGoal.status,
      } : null,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture,
        location: updatedUser.location,
        ageRange: updatedUser.ageRange,
        annualIncome: updatedUser.annualIncome,
        currentSavings: updatedUser.currentSavings,
        currentSituation: updatedUser.currentSituation,
        availableTime: updatedUser.availableTime,
        riskTolerance: updatedUser.riskTolerance,
        preferredApproach: updatedUser.preferredApproach,
        firstGoal: updatedUser.firstGoal,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        // Extended profile fields
        nationality: updatedUser.nationality,
        occupation: updatedUser.occupation,
        workSchedule: updatedUser.workSchedule,
        personalityType: updatedUser.personalityType,
        learningStyle: updatedUser.learningStyle,
        decisionMakingStyle: updatedUser.decisionMakingStyle,
        communicationStyle: updatedUser.communicationStyle,
        motivationalFactors: updatedUser.motivationalFactors,
        lifePriorities: updatedUser.lifePriorities,
        previousExperiences: updatedUser.previousExperiences,
        skillsAndStrengths: updatedUser.skillsAndStrengths,
        // AI settings
        aiInstructions: updatedUser.aiInstructions,
        aiTone: updatedUser.aiTone,
        aiDetailLevel: updatedUser.aiDetailLevel,
        aiApproachStyle: updatedUser.aiApproachStyle,
        onboardingCompleted: updatedUser.onboardingCompleted,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/profile - Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        location: user.location,
        ageRange: user.ageRange,
        annualIncome: user.annualIncome,
        currentSavings: user.currentSavings,
        riskTolerance: user.riskTolerance,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        weeklyReports: user.weeklyReports,
        goalReminders: user.goalReminders,
        theme: user.theme,
        language: user.language,
        currency: user.currency,
        defaultGoalCategory: user.defaultGoalCategory,
        privacyLevel: user.privacyLevel,
        nationality: user.nationality,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/profile - Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.email;
    delete updateData.googleId;
    delete updateData.createdAt;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture,
        location: updatedUser.location,
        ageRange: updatedUser.ageRange,
        annualIncome: updatedUser.annualIncome,
        currentSavings: updatedUser.currentSavings,
        currentSituation: updatedUser.currentSituation,
        availableTime: updatedUser.availableTime,
        riskTolerance: updatedUser.riskTolerance,
        preferredApproach: updatedUser.preferredApproach,
        firstGoal: updatedUser.firstGoal,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        // Extended profile fields
        nationality: updatedUser.nationality,
        occupation: updatedUser.occupation,
        workSchedule: updatedUser.workSchedule,
        personalityType: updatedUser.personalityType,
        learningStyle: updatedUser.learningStyle,
        decisionMakingStyle: updatedUser.decisionMakingStyle,
        communicationStyle: updatedUser.communicationStyle,
        motivationalFactors: updatedUser.motivationalFactors,
        lifePriorities: updatedUser.lifePriorities,
        previousExperiences: updatedUser.previousExperiences,
        skillsAndStrengths: updatedUser.skillsAndStrengths,
        // AI settings
        aiInstructions: updatedUser.aiInstructions,
        aiTone: updatedUser.aiTone,
        aiDetailLevel: updatedUser.aiDetailLevel,
        aiApproachStyle: updatedUser.aiApproachStyle,
        onboardingCompleted: updatedUser.onboardingCompleted,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/profile - Partially update user profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.email;
    delete updateData.googleId;
    delete updateData.createdAt;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture,
        location: updatedUser.location,
        ageRange: updatedUser.ageRange,
        annualIncome: updatedUser.annualIncome,
        currentSavings: updatedUser.currentSavings,
        currentSituation: updatedUser.currentSituation,
        availableTime: updatedUser.availableTime,
        riskTolerance: updatedUser.riskTolerance,
        preferredApproach: updatedUser.preferredApproach,
        firstGoal: updatedUser.firstGoal,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        // Extended profile fields
        nationality: updatedUser.nationality,
        occupation: updatedUser.occupation,
        workSchedule: updatedUser.workSchedule,
        personalityType: updatedUser.personalityType,
        learningStyle: updatedUser.learningStyle,
        decisionMakingStyle: updatedUser.decisionMakingStyle,
        communicationStyle: updatedUser.communicationStyle,
        motivationalFactors: updatedUser.motivationalFactors,
        lifePriorities: updatedUser.lifePriorities,
        previousExperiences: updatedUser.previousExperiences,
        skillsAndStrengths: updatedUser.skillsAndStrengths,
        // AI settings
        aiInstructions: updatedUser.aiInstructions,
        aiTone: updatedUser.aiTone,
        aiDetailLevel: updatedUser.aiDetailLevel,
        aiApproachStyle: updatedUser.aiApproachStyle,
        onboardingCompleted: updatedUser.onboardingCompleted,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/stats - Get user statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await UserService.getUserStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/preferences - Update user preferences
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validPreferences = {
      emailNotifications: req.body.emailNotifications,
      pushNotifications: req.body.pushNotifications,
      weeklyReports: req.body.weeklyReports,
      goalReminders: req.body.goalReminders,
      theme: req.body.theme,
      language: req.body.language,
      currency: req.body.currency,
      defaultGoalCategory: req.body.defaultGoalCategory,
      privacyLevel: req.body.privacyLevel,
    };

    // Remove undefined values
    Object.keys(validPreferences).forEach(key => {
      if ((validPreferences as any)[key] === undefined) {
        delete (validPreferences as any)[key];
      }
    });

    const updatedUser = await UserService.updateUserPreferences(userId, validPreferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
      }
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /users/profile - Delete user account
router.delete('/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await UserService.deleteUser(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validation schema for extended profile
const extendedProfileSchema = z.object({
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.number().positive().optional(),
  currentSavings: z.number().min(0).optional(),
  workSchedule: z.string().optional(),
  personalityType: z.string().optional(),
  learningStyle: z.string().optional(),
  decisionMakingStyle: z.string().optional(),
  communicationStyle: z.string().optional(),
  motivationalFactors: z.array(z.string()).optional(),
  lifePriorities: z.array(z.string()).optional(),
  previousExperiences: z.array(z.string()).optional(),
  skillsAndStrengths: z.array(z.string()).optional(),
});

// PUT /users/extended-profile - Update extended profile information
router.put('/extended-profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = extendedProfileSchema.parse(req.body);
    
    // Convert arrays to JSON strings for SQLite storage
    const updateData: any = { ...validatedData };
    if (updateData.motivationalFactors) {
      updateData.motivationalFactors = JSON.stringify(updateData.motivationalFactors);
    }
    if (updateData.lifePriorities) {
      updateData.lifePriorities = JSON.stringify(updateData.lifePriorities);
    }
    if (updateData.previousExperiences) {
      updateData.previousExperiences = JSON.stringify(updateData.previousExperiences);
    }
    if (updateData.skillsAndStrengths) {
      updateData.skillsAndStrengths = JSON.stringify(updateData.skillsAndStrengths);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Extended profile updated successfully',
      profile: {
        nationality: updatedUser.nationality,
        occupation: updatedUser.occupation,
        annualIncome: updatedUser.annualIncome,
        currentSavings: updatedUser.currentSavings,
        workSchedule: updatedUser.workSchedule,
        personalityType: updatedUser.personalityType,
        learningStyle: updatedUser.learningStyle,
        decisionMakingStyle: updatedUser.decisionMakingStyle,
        communicationStyle: updatedUser.communicationStyle,
        motivationalFactors: updatedUser.motivationalFactors ? JSON.parse(updatedUser.motivationalFactors) : [],
        lifePriorities: updatedUser.lifePriorities ? JSON.parse(updatedUser.lifePriorities) : [],
        previousExperiences: updatedUser.previousExperiences ? JSON.parse(updatedUser.previousExperiences) : [],
        skillsAndStrengths: updatedUser.skillsAndStrengths ? JSON.parse(updatedUser.skillsAndStrengths) : [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error updating extended profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validation schema for AI settings
const aiSettingsSchema = z.object({
  aiInstructions: z.string().max(1000).optional(),
  aiTone: z.enum(['helpful', 'casual', 'formal', 'motivational']).optional(),
  aiDetailLevel: z.enum(['brief', 'balanced', 'detailed']).optional(),
  aiApproachStyle: z.enum(['structured', 'adaptive', 'creative']).optional(),
});

// PUT /users/ai-settings - Update AI behavior settings
router.put('/ai-settings', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = aiSettingsSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    res.json({
      success: true,
      message: 'AI settings updated successfully',
      aiSettings: {
        aiInstructions: updatedUser.aiInstructions,
        aiTone: updatedUser.aiTone,
        aiDetailLevel: updatedUser.aiDetailLevel,
        aiApproachStyle: updatedUser.aiApproachStyle,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error updating AI settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/ai-settings - Get AI behavior settings
router.get('/ai-settings', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiInstructions: true,
        aiTone: true,
        aiDetailLevel: true,
        aiApproachStyle: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      aiSettings: {
        aiInstructions: user.aiInstructions,
        aiTone: user.aiTone,
        aiDetailLevel: user.aiDetailLevel,
        aiApproachStyle: user.aiApproachStyle,
      },
    });
  } catch (error) {
    logger.error('Error fetching AI settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;