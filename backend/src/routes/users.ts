import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Validation schema for onboarding
const onboardingSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  ageRange: z.string().min(1, 'Age range is required'),
  interests: z.array(z.string()).min(1, 'At least one interest is required'),
  goals: z.string().min(1, 'Goals are required'),
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

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        location: validatedData.location,
        ageRange: validatedData.ageRange,
        interests: JSON.stringify(validatedData.interests), // Store as JSON string
        initialGoals: validatedData.goals,
        onboardingCompleted: true,
      },
    });

    logger.info(`User ${userId} completed onboarding`);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePicture: updatedUser.profilePicture,
        location: updatedUser.location,
        ageRange: updatedUser.ageRange,
        annualIncome: updatedUser.annualIncome,
        currentSavings: updatedUser.currentSavings,
        riskTolerance: updatedUser.riskTolerance,
        timezone: updatedUser.timezone,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : [],
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
        timezone: user.timezone,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        weeklyReports: user.weeklyReports,
        goalReminders: user.goalReminders,
        theme: user.theme,
        language: user.language,
        currency: user.currency,
        defaultGoalCategory: user.defaultGoalCategory,
        privacyLevel: user.privacyLevel,
        interests: user.interests ? JSON.parse(user.interests) : [],
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
        riskTolerance: updatedUser.riskTolerance,
        timezone: updatedUser.timezone,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : [],
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
        riskTolerance: updatedUser.riskTolerance,
        timezone: updatedUser.timezone,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        weeklyReports: updatedUser.weeklyReports,
        goalReminders: updatedUser.goalReminders,
        theme: updatedUser.theme,
        language: updatedUser.language,
        currency: updatedUser.currency,
        defaultGoalCategory: updatedUser.defaultGoalCategory,
        privacyLevel: updatedUser.privacyLevel,
        interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : [],
        onboardingCompleted: updatedUser.onboardingCompleted,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;