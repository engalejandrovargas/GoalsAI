import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { JWTService } from '../config/jwt';
import logger from '../utils/logger';

export interface CreateUserData {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
}

export interface UpdateUserData {
  name?: string;
  location?: string;
  nationality?: string;
  travelBudget?: string;
  travelStyle?: string;
  firstGoal?: string;
  // Legacy fields (commented for future expansion)
  // ageRange?: string;
  // currentSituation?: string;
  // availableTime?: string;
  // riskTolerance?: string;
  // preferredApproach?: string;
  // annualIncome?: number;
  // currentSavings?: number;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  goalReminders?: boolean;
  theme?: string;
  language?: string;
  currency?: string;
  defaultGoalCategory?: string;
  privacyLevel?: string;
  // Extended profile fields (commented for future expansion)
  // occupation?: string;
  // workSchedule?: string;
  // personalityType?: string;
  // learningStyle?: string;
  // decisionMakingStyle?: string;
  // communicationStyle?: string;
  // motivationalFactors?: string;
  // lifePriorities?: string;
  // previousExperiences?: string;
  // skillsAndStrengths?: string;
  // AI settings
  aiInstructions?: string;
  aiTone?: string;
  aiDetailLevel?: string;
  aiApproachStyle?: string;
}

export interface OnboardingData extends UpdateUserData {
  onboardingCompleted: boolean;
}

export class UserService {
  static async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { googleId }
      });
    } catch (error) {
      logger.error('Error finding user by Google ID:', error);
      throw new Error('Failed to find user');
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name,
          profilePicture: userData.profilePicture,
          onboardingCompleted: false,
        }
      });

      logger.info(`New user created: ${user.email} (${user.id})`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      logger.info(`User updated: ${user.email} (${user.id})`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  static async completeOnboarding(userId: string, onboardingData: OnboardingData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...onboardingData,
          onboardingCompleted: true,
        }
      });

      logger.info(`Onboarding completed for user: ${user.email} (${user.id})`);
      return user;
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });

      logger.info(`User deleted: ${userId}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  static async getUserStats(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    totalSavings: number;
    totalEstimatedCost: number;
  }> {
    try {
      const [totalGoals, completedGoals, inProgressGoals, goalAggregates] = await Promise.all([
        prisma.goal.count({
          where: { userId }
        }),
        prisma.goal.count({
          where: { userId, status: 'completed' }
        }),
        prisma.goal.count({
          where: { userId, status: 'in_progress' }
        }),
        prisma.goal.aggregate({
          where: { userId },
          _sum: {
            currentSaved: true,
            estimatedCost: true,
          }
        })
      ]);

      return {
        totalGoals,
        completedGoals,
        inProgressGoals,
        totalSavings: goalAggregates._sum.currentSaved || 0,
        totalEstimatedCost: goalAggregates._sum.estimatedCost || 0,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw new Error('Failed to get user stats');
    }
  }

  static async getUserWithGoals(userId: string): Promise<User & {
    goals: any[];
    _count: { goals: number };
  } | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          goals: {
            orderBy: { createdAt: 'desc' },
            take: 10 // Latest 10 goals
          },
          _count: {
            select: { goals: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting user with goals:', error);
      throw new Error('Failed to get user with goals');
    }
  }

  static async updateUserPreferences(userId: string, preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyReports?: boolean;
    goalReminders?: boolean;
    theme?: string;
    language?: string;
    currency?: string;
    defaultGoalCategory?: string;
    privacyLevel?: string;
  }): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: preferences
      });

      logger.info(`User preferences updated: ${user.email} (${user.id})`);
      return user;
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  static async refreshUserToken(userId: string): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const token = JWTService.generateToken(user);
      const refreshToken = JWTService.generateRefreshToken(user);

      return { user, token, refreshToken };
    } catch (error) {
      logger.error('Error refreshing user token:', error);
      throw new Error('Failed to refresh user token');
    }
  }
}