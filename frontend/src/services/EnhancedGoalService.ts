import { goalEstimationService } from './GoalEstimationService';
import type { GoalContext, GoalEstimation } from './GoalEstimationService';
import { componentDataGenerator } from './ComponentDataGenerator';
import type { ComponentData } from './ComponentDataGenerator';
import { getComponentsForCategory } from '../config/GoalCategoryMapping';
import { apiService } from './api';

export interface EnhancedGoal {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  estimatedCost: number;
  currentSaved: number;
  targetDate: string;
  feasibilityScore: number;
  smartGoalData: string; // JSON stringified
  assignedAgents: string; // JSON stringified
  componentData: string; // JSON stringified - NEW
  activeComponents: string; // JSON stringified - NEW
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  userLocation?: string;
  userBudget?: number;
  userTimeframe?: string;
  userExperience?: string;
}

export interface GoalWithDashboard extends EnhancedGoal {
  dashboardComponents: string[];
  componentData: ComponentData;
  estimation: GoalEstimation;
}

class EnhancedGoalService {
  
  /**
   * Create a new goal with AI-driven estimation and component data
   */
  async createGoal(request: CreateGoalRequest): Promise<GoalWithDashboard> {
    try {
      // Step 1: Create context for AI estimation
      const context: GoalContext = {
        title: request.title,
        description: request.description,
        category: request.category,
        userLocation: request.userLocation,
        userBudget: request.userBudget,
        userTimeframe: request.userTimeframe,
        userExperience: request.userExperience
      };

      // Step 2: Get AI-driven estimation
      console.log('🤖 Generating AI estimation for goal...');
      const estimation = await goalEstimationService.estimateGoal(context);

      // Step 3: Determine active components for this category
      const allComponents = getComponentsForCategory(request.category, true);
      const activeComponents = [
        ...estimation.requiredComponents,
        ...estimation.contextualComponents,
        ...estimation.optionalComponents.slice(0, 3) // Limit optional components
      ];

      // Step 4: Generate realistic component data
      console.log('📊 Generating dashboard component data...');
      const componentData = componentDataGenerator.generateComponentData(
        context,
        estimation.estimatedCost,
        estimation.targetDate,
        estimation.smartGoalData
      );

      // Step 5: Calculate feasibility score
      const feasibilityScore = this.calculateFeasibilityScore(estimation, context);

      // Step 6: Prepare goal data for database
      const goalData: EnhancedGoal = {
        userId: 'current-user-id', // This should come from auth context
        title: request.title,
        description: request.description,
        category: request.category,
        priority: request.priority || 'medium',
        status: 'planning',
        estimatedCost: estimation.estimatedCost,
        currentSaved: Math.round(estimation.estimatedCost * 0.1), // Start with 10%
        targetDate: estimation.targetDate.toISOString().split('T')[0],
        feasibilityScore,
        smartGoalData: JSON.stringify(estimation.smartGoalData),
        assignedAgents: JSON.stringify(estimation.suggestedAgents),
        componentData: JSON.stringify(componentData),
        activeComponents: JSON.stringify(activeComponents)
      };

      // Step 7: Save to database
      console.log('💾 Saving goal to database...');
      const savedGoal = await this.saveGoalToDatabase(goalData);

      // Step 8: Return enhanced goal with dashboard data
      return {
        ...savedGoal,
        dashboardComponents: activeComponents,
        componentData,
        estimation
      };

    } catch (error) {
      console.error('❌ Error creating enhanced goal:', error);
      throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get an existing goal with its dashboard data
   */
  async getGoalWithDashboard(goalId: string): Promise<GoalWithDashboard | null> {
    try {
      // Fetch goal from database
      const goal = await apiService.getGoal(goalId);
      if (!goal) return null;

      // Parse stored data
      const componentData = JSON.parse(goal.componentData || '{}');
      const activeComponents = JSON.parse(goal.activeComponents || '[]');
      const smartGoalData = JSON.parse(goal.smartGoalData || '{}');
      const assignedAgents = JSON.parse(goal.assignedAgents || '[]');

      // Create estimation object from stored data
      const estimation: GoalEstimation = {
        estimatedCost: goal.estimatedCost,
        targetDate: new Date(goal.targetDate),
        timeframe: this.calculateTimeframe(new Date(goal.targetDate)),
        complexity: this.assessComplexity(goal.title, goal.description),
        requiredComponents: activeComponents.slice(0, 4), // First 4 are typically required
        contextualComponents: activeComponents.slice(4, 8), // Next 4 are contextual
        optionalComponents: activeComponents.slice(8), // Remaining are optional
        suggestedAgents: assignedAgents,
        smartGoalData
      };

      return {
        ...goal,
        dashboardComponents: activeComponents,
        componentData,
        estimation
      };

    } catch (error) {
      console.error('❌ Error fetching goal with dashboard:', error);
      return null;
    }
  }

  /**
   * Update goal progress and regenerate dynamic data
   */
  async updateGoalProgress(goalId: string, progress: number): Promise<GoalWithDashboard | null> {
    try {
      const goal = await this.getGoalWithDashboard(goalId);
      if (!goal) return null;

      // Regenerate component data with new progress
      const context: GoalContext = {
        title: goal.title,
        description: goal.description,
        category: goal.category
      };

      const updatedComponentData = componentDataGenerator.generateComponentData(
        context,
        goal.estimatedCost,
        new Date(goal.targetDate),
        JSON.parse(goal.smartGoalData)
      );

      // Update current saved amount based on progress
      const updatedCurrentSaved = Math.round(goal.estimatedCost * progress);

      // Save updated data
      const updatedGoal: EnhancedGoal = {
        ...goal,
        currentSaved: updatedCurrentSaved,
        componentData: JSON.stringify(updatedComponentData),
        updatedAt: new Date().toISOString()
      };

      const savedGoal = await this.updateGoalInDatabase(goalId, updatedGoal);

      return {
        ...savedGoal,
        dashboardComponents: goal.dashboardComponents,
        componentData: updatedComponentData,
        estimation: goal.estimation
      };

    } catch (error) {
      console.error('❌ Error updating goal progress:', error);
      return null;
    }
  }

  /**
   * Get all goals for a user with basic dashboard data
   */
  async getUserGoalsWithDashboard(userId: string): Promise<GoalWithDashboard[]> {
    try {
      const goals = await apiService.getGoals();
      
      return goals.map(goal => {
        const componentData = JSON.parse(goal.componentData || '{}');
        const activeComponents = JSON.parse(goal.activeComponents || '[]');
        const smartGoalData = JSON.parse(goal.smartGoalData || '{}');
        const assignedAgents = JSON.parse(goal.assignedAgents || '[]');

        const estimation: GoalEstimation = {
          estimatedCost: goal.estimatedCost,
          targetDate: new Date(goal.targetDate),
          timeframe: this.calculateTimeframe(new Date(goal.targetDate)),
          complexity: this.assessComplexity(goal.title, goal.description),
          requiredComponents: activeComponents.slice(0, 4),
          contextualComponents: activeComponents.slice(4, 8),
          optionalComponents: activeComponents.slice(8),
          suggestedAgents: assignedAgents,
          smartGoalData
        };

        return {
          ...goal,
          dashboardComponents: activeComponents,
          componentData,
          estimation
        };
      });

    } catch (error) {
      console.error('❌ Error fetching user goals:', error);
      return [];
    }
  }

  /**
   * Regenerate component data for existing goal (useful for testing)
   */
  async regenerateGoalData(goalId: string): Promise<GoalWithDashboard | null> {
    try {
      const goal = await apiService.getGoal(goalId);
      if (!goal) return null;

      const context: GoalContext = {
        title: goal.title,
        description: goal.description,
        category: goal.category
      };

      // Regenerate estimation
      const estimation = await goalEstimationService.estimateGoal(context);

      // Regenerate component data
      const componentData = componentDataGenerator.generateComponentData(
        context,
        estimation.estimatedCost,
        estimation.targetDate,
        estimation.smartGoalData
      );

      // Update active components
      const activeComponents = [
        ...estimation.requiredComponents,
        ...estimation.contextualComponents,
        ...estimation.optionalComponents.slice(0, 3)
      ];

      // Update goal
      const updatedGoal: EnhancedGoal = {
        ...goal,
        estimatedCost: estimation.estimatedCost,
        targetDate: estimation.targetDate.toISOString().split('T')[0],
        smartGoalData: JSON.stringify(estimation.smartGoalData),
        componentData: JSON.stringify(componentData),
        activeComponents: JSON.stringify(activeComponents),
        updatedAt: new Date().toISOString()
      };

      const savedGoal = await this.updateGoalInDatabase(goalId, updatedGoal);

      return {
        ...savedGoal,
        dashboardComponents: activeComponents,
        componentData,
        estimation
      };

    } catch (error) {
      console.error('❌ Error regenerating goal data:', error);
      return null;
    }
  }

  // === PRIVATE HELPER METHODS ===

  private calculateFeasibilityScore(estimation: GoalEstimation, context: GoalContext): number {
    let score = 75; // Base score

    // Time factor
    const timeInMonths = Math.ceil((estimation.targetDate.getTime() - Date.now()) / (1000 * 3600 * 24 * 30));
    if (timeInMonths < 3) score -= 10; // Too rushed
    if (timeInMonths > 24) score -= 5;  // Too long-term
    if (timeInMonths >= 6 && timeInMonths <= 18) score += 10; // Sweet spot

    // Cost factor
    if (context.userBudget) {
      const budgetRatio = context.userBudget / estimation.estimatedCost;
      if (budgetRatio >= 1.5) score += 15; // Well-funded
      else if (budgetRatio >= 1) score += 10; // Adequately funded
      else if (budgetRatio >= 0.7) score += 5; // Somewhat funded
      else score -= 15; // Underfunded
    }

    // Complexity factor
    switch (estimation.complexity) {
      case 'simple': score += 10; break;
      case 'moderate': score += 5; break;
      case 'complex': score -= 5; break;
    }

    // Category-specific adjustments
    const categoryBoosts: Record<string, number> = {
      'habits': 10,     // Habits are highly achievable
      'reading': 10,    // Reading goals are very doable
      'fitness': 5,     // Fitness requires consistency
      'savings': 8,     // Savings are straightforward
      'education': 0,   // Neutral
      'business': -5,   // Business goals are challenging
      'travel': 3       // Travel goals are moderate
    };

    score += categoryBoosts[context.category] || 0;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateTimeframe(targetDate: Date): string {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  }

  private assessComplexity(title: string, description: string): 'simple' | 'moderate' | 'complex' {
    const content = `${title} ${description}`.toLowerCase();
    
    const complexityIndicators = {
      complex: ['master', 'expert', 'advanced', 'professional', 'business', 'startup', 'career change'],
      simple: ['basic', 'simple', 'beginner', 'start', 'habit', 'daily']
    };

    for (const indicator of complexityIndicators.complex) {
      if (content.includes(indicator)) return 'complex';
    }

    for (const indicator of complexityIndicators.simple) {
      if (content.includes(indicator)) return 'simple';
    }

    return 'moderate';
  }

  private async saveGoalToDatabase(goalData: EnhancedGoal): Promise<EnhancedGoal> {
    // Transform to API format
    const apiGoalData = {
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      priority: goalData.priority,
      estimatedCost: goalData.estimatedCost,
      currentSaved: goalData.currentSaved,
      targetDate: goalData.targetDate,
      feasibilityScore: goalData.feasibilityScore,
      smartGoalData: goalData.smartGoalData,
      assignedAgents: goalData.assignedAgents,
      // Add new fields for component data
      componentData: goalData.componentData,
      activeComponents: goalData.activeComponents
    };

    const response = await apiService.createGoal(apiGoalData);
    return { ...goalData, ...response };
  }

  private async updateGoalInDatabase(goalId: string, goalData: EnhancedGoal): Promise<EnhancedGoal> {
    const apiGoalData = {
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      priority: goalData.priority,
      estimatedCost: goalData.estimatedCost,
      currentSaved: goalData.currentSaved,
      targetDate: goalData.targetDate,
      feasibilityScore: goalData.feasibilityScore,
      smartGoalData: goalData.smartGoalData,
      assignedAgents: goalData.assignedAgents,
      componentData: goalData.componentData,
      activeComponents: goalData.activeComponents
    };

    const response = await apiService.updateGoal(goalId, apiGoalData);
    return { ...goalData, ...response };
  }
}

export const enhancedGoalService = new EnhancedGoalService();