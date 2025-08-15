import { Goal, GoalStep, User } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../utils/logger';

export interface ProgressMetrics {
  goalProgress: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    pausedGoals: number;
    completionRate: number;
  };
  stepProgress: {
    totalSteps: number;
    completedSteps: number;
    completionRate: number;
  };
  financialProgress: {
    totalTargetAmount: number;
    totalSavedAmount: number;
    savingsRate: number;
    monthlyAverageSavings: number;
  };
  timeProgress: {
    onTrackGoals: number;
    behindScheduleGoals: number;
    aheadOfScheduleGoals: number;
    upcomingDeadlines: Array<{
      goalId: string;
      title: string;
      deadline: Date;
      daysRemaining: number;
    }>;
  };
}

export interface GoalInsights {
  goalId: string;
  title: string;
  overallProgress: number;
  stepCompletion: number;
  savingsProgress: number;
  timeProgress: number;
  status: 'on_track' | 'at_risk' | 'behind_schedule' | 'completed';
  insights: string[];
  recommendations: string[];
  nextActions: string[];
}

export interface UserAnalytics {
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastActivity: Date;
  };
  productivity: {
    averageGoalCompletionTime: number; // in days
    mostProductiveCategory: string;
    goalsCompletedThisMonth: number;
    goalsCompletedLastMonth: number;
  };
  patterns: {
    preferredGoalTypes: string[];
    averageGoalCost: number;
    successFactors: string[];
  };
}

export class ProgressService {
  static async getProgressMetrics(userId: string): Promise<ProgressMetrics> {
    try {
      const [goals, steps] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          include: {
            steps: true
          }
        }),
        prisma.goalStep.findMany({
          where: {
            goal: { userId }
          }
        })
      ]);

      // Goal Progress
      const totalGoals = goals.length;
      const activeGoals = goals.filter(g => ['planning', 'in_progress'].includes(g.status)).length;
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const pausedGoals = goals.filter(g => g.status === 'paused').length;
      const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Step Progress
      const totalSteps = steps.length;
      const completedSteps = steps.filter(s => s.completed).length;
      const stepCompletionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      // Financial Progress
      const totalTargetAmount = goals.reduce((sum, g) => sum + (g.estimatedCost || 0), 0);
      const totalSavedAmount = goals.reduce((sum, g) => sum + g.currentSaved, 0);
      const savingsRate = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

      // Calculate monthly average savings (basic estimation)
      const oldestGoal = goals.reduce((oldest, goal) => 
        goal.createdAt < oldest.createdAt ? goal : oldest, 
        goals[0]
      );
      const monthsSinceStart = oldestGoal ? 
        Math.max(1, Math.floor((Date.now() - oldestGoal.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1;
      const monthlyAverageSavings = totalSavedAmount / monthsSinceStart;

      // Time Progress
      const now = new Date();
      const activeGoalsWithDeadlines = goals.filter(g => 
        ['planning', 'in_progress'].includes(g.status) && g.targetDate
      );

      let onTrackGoals = 0;
      let behindScheduleGoals = 0;
      let aheadOfScheduleGoals = 0;

      const upcomingDeadlines = activeGoalsWithDeadlines
        .map(goal => {
          const deadline = new Date(goal.targetDate!);
          const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calculate if goal is on track based on step completion
          const goalSteps = steps.filter(s => s.goalId === goal.id);
          const goalStepCompletion = goalSteps.length > 0 ? 
            (goalSteps.filter(s => s.completed).length / goalSteps.length) * 100 : 0;
          
          const totalDuration = Math.ceil((deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          const timeElapsed = Math.ceil((now.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          const timeProgress = totalDuration > 0 ? (timeElapsed / totalDuration) * 100 : 0;

          if (goalStepCompletion >= timeProgress + 10) {
            aheadOfScheduleGoals++;
          } else if (goalStepCompletion < timeProgress - 10) {
            behindScheduleGoals++;
          } else {
            onTrackGoals++;
          }

          return {
            goalId: goal.id,
            title: goal.title,
            deadline,
            daysRemaining
          };
        })
        .filter(d => d.daysRemaining <= 30 && d.daysRemaining > 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 5);

      return {
        goalProgress: {
          totalGoals,
          activeGoals,
          completedGoals,
          pausedGoals,
          completionRate: Math.round(goalCompletionRate)
        },
        stepProgress: {
          totalSteps,
          completedSteps,
          completionRate: Math.round(stepCompletionRate)
        },
        financialProgress: {
          totalTargetAmount,
          totalSavedAmount,
          savingsRate: Math.round(savingsRate),
          monthlyAverageSavings: Math.round(monthlyAverageSavings)
        },
        timeProgress: {
          onTrackGoals,
          behindScheduleGoals,
          aheadOfScheduleGoals,
          upcomingDeadlines
        }
      };
    } catch (error) {
      logger.error('Error getting progress metrics:', error);
      throw new Error('Failed to get progress metrics');
    }
  }

  static async getGoalInsights(userId: string, goalId?: string): Promise<GoalInsights[]> {
    try {
      const whereClause = goalId ? 
        { id: goalId, userId } : 
        { userId, status: { in: ['planning', 'in_progress'] } };

      const goals = await prisma.goal.findMany({
        where: whereClause,
        include: {
          steps: true
        }
      });

      return goals.map(goal => this.generateGoalInsight(goal));
    } catch (error) {
      logger.error('Error getting goal insights:', error);
      throw new Error('Failed to get goal insights');
    }
  }

  private static generateGoalInsight(goal: Goal & { steps: GoalStep[] }): GoalInsights {
    const now = new Date();
    
    // Calculate step completion
    const totalSteps = goal.steps.length;
    const completedSteps = goal.steps.filter(s => s.completed).length;
    const stepCompletion = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    // Calculate savings progress
    const savingsProgress = goal.estimatedCost && goal.estimatedCost > 0 ? 
      (goal.currentSaved / goal.estimatedCost) * 100 : 100;

    // Calculate time progress
    let timeProgress = 0;
    if (goal.targetDate) {
      const totalDuration = goal.targetDate.getTime() - goal.createdAt.getTime();
      const timeElapsed = now.getTime() - goal.createdAt.getTime();
      timeProgress = totalDuration > 0 ? Math.min(100, (timeElapsed / totalDuration) * 100) : 0;
    }

    // Overall progress (weighted average)
    const overallProgress = Math.round(
      (stepCompletion * 0.5) + 
      (savingsProgress * 0.3) + 
      (timeProgress * 0.2)
    );

    // Determine status
    let status: 'on_track' | 'at_risk' | 'behind_schedule' | 'completed' = 'on_track';
    if (goal.status === 'completed') {
      status = 'completed';
    } else if (stepCompletion < timeProgress - 20) {
      status = 'behind_schedule';
    } else if (stepCompletion < timeProgress - 10) {
      status = 'at_risk';
    }

    // Generate insights
    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextActions: string[] = [];

    if (stepCompletion < 25) {
      insights.push('Goal is in early stages with limited progress on action steps');
      recommendations.push('Focus on completing the first few action steps to build momentum');
    }

    if (savingsProgress < timeProgress) {
      insights.push('Savings are falling behind schedule');
      recommendations.push('Consider increasing monthly savings or adjusting the target amount');
    }

    if (goal.targetDate && goal.targetDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) {
      insights.push('Goal deadline is approaching within 30 days');
      recommendations.push('Focus on high-priority action items');
    }

    if (totalSteps === 0) {
      insights.push('No action steps defined for this goal');
      recommendations.push('Break down the goal into specific, actionable steps');
      nextActions.push('Create detailed action plan with specific steps');
    } else {
      const nextIncompleteStep = goal.steps
        .filter(s => !s.completed)
        .sort((a, b) => a.stepOrder - b.stepOrder)[0];
      
      if (nextIncompleteStep) {
        nextActions.push(`Complete: ${nextIncompleteStep.title}`);
      }
    }

    return {
      goalId: goal.id,
      title: goal.title,
      overallProgress,
      stepCompletion: Math.round(stepCompletion),
      savingsProgress: Math.round(savingsProgress),
      timeProgress: Math.round(timeProgress),
      status,
      insights,
      recommendations,
      nextActions
    };
  }

  static async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        include: {
          steps: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate streaks (simplified - based on goal completions)
      const completedGoals = goals.filter(g => g.status === 'completed')
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const lastActivity = completedGoals[0]?.updatedAt || new Date();

      // Simplified streak calculation - consecutive completed goals
      for (let i = 0; i < completedGoals.length; i++) {
        const goal = completedGoals[i];
        const timeSinceCompletion = Date.now() - goal.updatedAt.getTime();
        const daysSinceCompletion = timeSinceCompletion / (1000 * 60 * 60 * 24);

        if (daysSinceCompletion <= 30) { // Active if completed within 30 days
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Productivity metrics
      const completedGoalsWithTime = completedGoals.filter(g => g.createdAt && g.updatedAt);
      const averageCompletionTime = completedGoalsWithTime.length > 0 ? 
        completedGoalsWithTime.reduce((sum, g) => {
          const duration = (g.updatedAt.getTime() - g.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + duration;
        }, 0) / completedGoalsWithTime.length : 0;

      // Category analysis
      const categoryCount: { [key: string]: number } = {};
      goals.forEach(goal => {
        categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
      });
      const mostProductiveCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'personal';

      // Monthly completions
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const goalsCompletedThisMonth = completedGoals.filter(g => 
        g.updatedAt >= thisMonth
      ).length;

      const goalsCompletedLastMonth = completedGoals.filter(g => 
        g.updatedAt >= lastMonth && g.updatedAt < thisMonth
      ).length;

      // Patterns
      const preferredGoalTypes = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      const averageGoalCost = goals.length > 0 ? 
        goals.reduce((sum, g) => sum + (g.estimatedCost || 0), 0) / goals.length : 0;

      const successFactors = [
        'Clear action plan with specific steps',
        'Regular progress tracking',
        'Realistic timeline and budget'
      ];

      return {
        streaks: {
          currentStreak,
          longestStreak,
          lastActivity
        },
        productivity: {
          averageGoalCompletionTime: Math.round(averageCompletionTime),
          mostProductiveCategory,
          goalsCompletedThisMonth,
          goalsCompletedLastMonth
        },
        patterns: {
          preferredGoalTypes,
          averageGoalCost: Math.round(averageGoalCost),
          successFactors
        }
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw new Error('Failed to get user analytics');
    }
  }

  static async updateGoalProgress(goalId: string, userId: string, progressData: {
    currentSaved?: number;
    stepId?: string;
    stepCompleted?: boolean;
    notes?: string;
  }): Promise<Goal> {
    try {
      // Verify goal ownership
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      });

      if (!goal) {
        throw new Error('Goal not found or access denied');
      }

      // Update current saved amount if provided
      if (progressData.currentSaved !== undefined) {
        await prisma.goal.update({
          where: { id: goalId },
          data: { currentSaved: progressData.currentSaved }
        });
      }

      // Update step completion if provided
      if (progressData.stepId && progressData.stepCompleted !== undefined) {
        await prisma.goalStep.updateMany({
          where: { 
            id: progressData.stepId,
            goal: { userId }
          },
          data: { completed: progressData.stepCompleted }
        });
      }

      // Get updated goal
      const updatedGoal = await prisma.goal.findUniqueOrThrow({
        where: { id: goalId }
      });

      logger.info(`Progress updated for goal ${goalId} by user ${userId}`);
      return updatedGoal;
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      throw new Error('Failed to update goal progress');
    }
  }
}