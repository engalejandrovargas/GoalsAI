import { Goal, GoalStep, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../utils/logger';

export interface CreateGoalData {
  title: string;
  description?: string;
  category: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'planning' | 'in_progress' | 'completed' | 'paused' | 'pivoted';
  estimatedCost?: number;
  currentSaved?: number;
  targetDate?: Date;
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'planning' | 'in_progress' | 'completed' | 'paused' | 'pivoted';
  estimatedCost?: number;
  currentSaved?: number;
  targetDate?: Date;
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  redFlags?: any[];
  suggestedAlternatives?: any[];
  aiPlan?: any;
  researchData?: any;
}

export interface CreateGoalStepData {
  title: string;
  description?: string;
  stepOrder: number;
  estimatedCost?: number;
  estimatedDuration?: string;
  deadline?: Date;
  createdBy?: 'ai' | 'user';
}

export interface GoalFilters {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'targetDate' | 'priority' | 'estimatedCost';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class GoalService {
  static async createGoal(userId: string, goalData: CreateGoalData): Promise<Goal> {
    try {
      const goal = await prisma.goal.create({
        data: {
          userId,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          priority: goalData.priority || 'medium',
          status: goalData.status || 'planning',
          estimatedCost: goalData.estimatedCost,
          currentSaved: goalData.currentSaved || 0,
          targetDate: goalData.targetDate,
        }
      });

      logger.info(`Goal created: ${goal.title} (${goal.id}) for user ${userId}`);
      return goal;
    } catch (error) {
      logger.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  }

  static async getGoal(goalId: string, userId: string): Promise<Goal | null> {
    try {
      return await prisma.goal.findFirst({
        where: { 
          id: goalId,
          userId: userId
        },
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting goal:', error);
      throw new Error('Failed to get goal');
    }
  }

  static async getUserGoals(userId: string, filters: GoalFilters = {}): Promise<{
    goals: Goal[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const {
        category,
        status,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 20,
        offset = 0
      } = filters;

      // Build where clause
      const where: Prisma.GoalWhereInput = {
        userId,
        ...(category && { category }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } }
          ]
        })
      };

      // Get total count
      const totalCount = await prisma.goal.count({ where });

      // Get goals
      const goals = await prisma.goal.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' }
          },
          _count: {
            select: { steps: true }
          }
        }
      });

      return {
        goals,
        totalCount,
        hasMore: (offset + limit) < totalCount
      };
    } catch (error) {
      logger.error('Error getting user goals:', error);
      throw new Error('Failed to get user goals');
    }
  }

  static async updateGoal(goalId: string, userId: string, updateData: UpdateGoalData): Promise<Goal> {
    try {
      const goal = await prisma.goal.updateMany({
        where: { 
          id: goalId,
          userId: userId
        },
        data: {
          ...updateData,
          feasibilityAnalysis: updateData.feasibilityAnalysis ? 
            JSON.stringify(updateData.feasibilityAnalysis) : undefined,
          redFlags: updateData.redFlags ? 
            JSON.stringify(updateData.redFlags) : undefined,
          suggestedAlternatives: updateData.suggestedAlternatives ? 
            JSON.stringify(updateData.suggestedAlternatives) : undefined,
          aiPlan: updateData.aiPlan ? 
            JSON.stringify(updateData.aiPlan) : undefined,
          researchData: updateData.researchData ? 
            JSON.stringify(updateData.researchData) : undefined,
        }
      });

      if (goal.count === 0) {
        throw new Error('Goal not found or access denied');
      }

      const updatedGoal = await prisma.goal.findUniqueOrThrow({
        where: { id: goalId }
      });

      logger.info(`Goal updated: ${updatedGoal.title} (${goalId}) by user ${userId}`);
      return updatedGoal;
    } catch (error) {
      logger.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  static async deleteGoal(goalId: string, userId: string): Promise<void> {
    try {
      const result = await prisma.goal.deleteMany({
        where: { 
          id: goalId,
          userId: userId
        }
      });

      if (result.count === 0) {
        throw new Error('Goal not found or access denied');
      }

      logger.info(`Goal deleted: ${goalId} by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
  }

  static async createGoalStep(goalId: string, userId: string, stepData: CreateGoalStepData): Promise<GoalStep> {
    try {
      // Verify goal ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found or access denied');
      }

      const step = await prisma.goalStep.create({
        data: {
          goalId,
          title: stepData.title,
          description: stepData.description,
          stepOrder: stepData.stepOrder,
          estimatedCost: stepData.estimatedCost,
          estimatedDuration: stepData.estimatedDuration,
          deadline: stepData.deadline,
          createdBy: stepData.createdBy || 'user',
        }
      });

      logger.info(`Goal step created: ${step.title} (${step.id}) for goal ${goalId}`);
      return step;
    } catch (error) {
      logger.error('Error creating goal step:', error);
      throw new Error('Failed to create goal step');
    }
  }

  static async getGoalSteps(goalId: string, userId: string): Promise<GoalStep[]> {
    try {
      // Verify goal ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found or access denied');
      }

      return await prisma.goalStep.findMany({
        where: { goalId },
        orderBy: { stepOrder: 'asc' }
      });
    } catch (error) {
      logger.error('Error getting goal steps:', error);
      throw new Error('Failed to get goal steps');
    }
  }

  static async updateGoalStep(stepId: string, userId: string, updateData: Partial<GoalStep>): Promise<GoalStep> {
    try {
      // Verify step ownership through goal
      const step = await prisma.goalStep.findFirst({
        where: { 
          id: stepId,
          goal: { userId }
        }
      });

      if (!step) {
        throw new Error('Goal step not found or access denied');
      }

      const updatedStep = await prisma.goalStep.update({
        where: { id: stepId },
        data: updateData
      });

      logger.info(`Goal step updated: ${updatedStep.title} (${stepId}) by user ${userId}`);
      return updatedStep;
    } catch (error) {
      logger.error('Error updating goal step:', error);
      throw new Error('Failed to update goal step');
    }
  }

  static async deleteGoalStep(stepId: string, userId: string): Promise<void> {
    try {
      // Verify step ownership through goal
      const step = await prisma.goalStep.findFirst({
        where: { 
          id: stepId,
          goal: { userId }
        }
      });

      if (!step) {
        throw new Error('Goal step not found or access denied');
      }

      await prisma.goalStep.delete({
        where: { id: stepId }
      });

      logger.info(`Goal step deleted: ${stepId} by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting goal step:', error);
      throw new Error('Failed to delete goal step');
    }
  }

  static async getGoalCategories(userId: string): Promise<Array<{
    category: string;
    count: number;
  }>> {
    try {
      const categories = await prisma.goal.groupBy({
        by: ['category'],
        where: { userId },
        _count: { category: true }
      });

      return categories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      }));
    } catch (error) {
      logger.error('Error getting goal categories:', error);
      throw new Error('Failed to get goal categories');
    }
  }

  static async getGoalProgress(goalId: string, userId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    progressPercentage: number;
    savingsProgress: number;
    timeProgress: number;
  }> {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId },
        include: {
          steps: true
        }
      });

      if (!goal) {
        throw new Error('Goal not found or access denied');
      }

      const totalSteps = goal.steps.length;
      const completedSteps = goal.steps.filter(step => step.completed).length;
      const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      const savingsProgress = goal.estimatedCost && goal.estimatedCost > 0 
        ? (goal.currentSaved / goal.estimatedCost) * 100 
        : 0;

      let timeProgress = 0;
      if (goal.targetDate) {
        const now = new Date();
        const created = new Date(goal.createdAt);
        const target = new Date(goal.targetDate);
        const totalTime = target.getTime() - created.getTime();
        const elapsedTime = now.getTime() - created.getTime();
        timeProgress = totalTime > 0 ? Math.min((elapsedTime / totalTime) * 100, 100) : 0;
      }

      return {
        totalSteps,
        completedSteps,
        progressPercentage: Math.round(progressPercentage),
        savingsProgress: Math.round(savingsProgress),
        timeProgress: Math.round(timeProgress)
      };
    } catch (error) {
      logger.error('Error getting goal progress:', error);
      throw new Error('Failed to get goal progress');
    }
  }

  static async updateGoalProgress(goalId: string, userId: string, currentSaved: number): Promise<Goal> {
    try {
      const goal = await prisma.goal.updateMany({
        where: { 
          id: goalId,
          userId: userId
        },
        data: { currentSaved }
      });

      if (goal.count === 0) {
        throw new Error('Goal not found or access denied');
      }

      const updatedGoal = await prisma.goal.findUniqueOrThrow({
        where: { id: goalId }
      });

      logger.info(`Goal progress updated: ${updatedGoal.title} (${goalId}) - $${currentSaved} saved`);
      return updatedGoal;
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      throw new Error('Failed to update goal progress');
    }
  }

  static async getDashboardStats(userId: string): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalSavingsTarget: number;
    currentSavings: number;
    upcomingDeadlines: Array<{
      goalId: string;
      title: string;
      targetDate: Date;
      daysUntil: number;
    }>;
  }> {
    try {
      const [goals, upcomingGoals] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          select: {
            id: true,
            status: true,
            estimatedCost: true,
            currentSaved: true,
          }
        }),
        prisma.goal.findMany({
          where: { 
            userId,
            targetDate: { gte: new Date() },
            status: { in: ['planning', 'in_progress'] }
          },
          select: {
            id: true,
            title: true,
            targetDate: true
          },
          orderBy: { targetDate: 'asc' },
          take: 5
        })
      ]);

      const totalGoals = goals.length;
      const activeGoals = goals.filter(g => ['planning', 'in_progress'].includes(g.status)).length;
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const totalSavingsTarget = goals.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);
      const currentSavings = goals.reduce((sum, g) => sum + g.currentSaved, 0);

      const upcomingDeadlines = upcomingGoals
        .filter(g => g.targetDate)
        .map(goal => {
          const now = new Date();
          const target = new Date(goal.targetDate!);
          const diffTime = target.getTime() - now.getTime();
          const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            goalId: goal.id,
            title: goal.title,
            targetDate: goal.targetDate!,
            daysUntil
          };
        })
        .filter(d => d.daysUntil <= 30); // Next 30 days

      return {
        totalGoals,
        activeGoals,
        completedGoals,
        totalSavingsTarget,
        currentSavings,
        upcomingDeadlines
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard stats');
    }
  }
}