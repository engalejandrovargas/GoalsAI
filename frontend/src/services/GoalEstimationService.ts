import { GOAL_CATEGORY_MAPPING } from '../config/GoalCategoryMapping';
import type { GoalCategoryConfig } from '../config/GoalCategoryMapping';

export interface GoalEstimation {
  estimatedCost: number;
  targetDate: Date;
  timeframe: string;
  complexity: 'simple' | 'moderate' | 'complex';
  requiredComponents: string[];
  contextualComponents: string[];
  optionalComponents: string[];
  suggestedAgents: string[];
  smartGoalData: any;
}

export interface GoalContext {
  title: string;
  description: string;
  category: string;
  userLocation?: string;
  userBudget?: number;
  userTimeframe?: string;
  userExperience?: string;
}

class GoalEstimationService {
  
  /**
   * Main method to estimate all goal parameters using AI-like logic
   */
  async estimateGoal(context: GoalContext): Promise<GoalEstimation> {
    const categoryConfig = GOAL_CATEGORY_MAPPING[context.category];
    
    if (!categoryConfig) {
      throw new Error(`Unknown goal category: ${context.category}`);
    }

    // AI-driven estimation logic
    const estimatedCost = this.estimateCost(context, categoryConfig);
    const targetDate = this.estimateTargetDate(context, categoryConfig);
    const timeframe = this.calculateTimeframe(targetDate);
    const complexity = this.assessComplexity(context, categoryConfig);
    const smartGoalData = this.generateSmartGoalData(context, categoryConfig, estimatedCost, targetDate);

    return {
      estimatedCost,
      targetDate,
      timeframe,
      complexity,
      requiredComponents: categoryConfig.requiredComponents,
      contextualComponents: this.selectContextualComponents(context, categoryConfig),
      optionalComponents: categoryConfig.optionalComponents,
      suggestedAgents: categoryConfig.suggestedAgents,
      smartGoalData
    };
  }

  /**
   * AI-driven cost estimation based on goal content and category
   */
  private estimateCost(context: GoalContext, categoryConfig: GoalCategoryConfig): number {
    let baseCost = categoryConfig.defaultEstimatedCost;
    
    // Parse goal for cost indicators
    const title = context.title.toLowerCase();
    const description = context.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Extract monetary values from the goal text
    const moneyMatches = content.match(/\$[\d,]+|\$[\d]+k|\$[\d]+,?[\d]*\.?[\d]*[kK]?/g);
    if (moneyMatches && moneyMatches.length > 0) {
      const extractedAmount = this.parseMonetaryValue(moneyMatches[0]);
      if (extractedAmount > 0) {
        baseCost = extractedAmount;
      }
    }

    // Adjust based on goal complexity indicators
    if (content.includes('luxury') || content.includes('premium') || content.includes('high-end')) {
      baseCost *= 1.5;
    }
    
    if (content.includes('budget') || content.includes('cheap') || content.includes('affordable')) {
      baseCost *= 0.7;
    }

    // Location-based adjustments
    if (context.userLocation) {
      const locationMultiplier = this.getLocationCostMultiplier(context.userLocation);
      baseCost *= locationMultiplier;
    }

    // Category-specific adjustments
    switch (context.category) {
      case 'investment':
        // Investment goals typically involve larger amounts
        if (content.includes('portfolio') || content.includes('wealth')) {
          baseCost = Math.max(baseCost, 10000);
        }
        break;
      
      case 'travel':
        // Adjust based on destination and duration
        if (content.includes('europe') || content.includes('asia')) {
          baseCost = Math.max(baseCost, 3000);
        }
        if (content.includes('week')) baseCost *= 0.8;
        if (content.includes('month')) baseCost *= 2.0;
        break;
        
      case 'business':
        // Business goals vary widely
        if (content.includes('startup') || content.includes('launch')) {
          baseCost = Math.max(baseCost, 5000);
        }
        break;
    }

    return Math.round(baseCost);
  }

  /**
   * AI-driven date estimation based on goal complexity and content
   */
  private estimateTargetDate(context: GoalContext, categoryConfig: GoalCategoryConfig): Date {
    const title = context.title.toLowerCase();
    const description = context.description?.toLowerCase() || '';
    const content = `${title} ${description}`;
    
    let estimatedDays = categoryConfig.defaultDeadlineDays;

    // Extract time indicators from the goal text
    const timeMatches = content.match(/(\d+)\s*(day|week|month|year)s?/g);
    if (timeMatches && timeMatches.length > 0) {
      estimatedDays = this.parseTimeValue(timeMatches[0]);
    }

    // Adjust based on complexity indicators
    if (content.includes('master') || content.includes('expert') || content.includes('advanced')) {
      estimatedDays *= 1.5;
    }
    
    if (content.includes('basic') || content.includes('beginner') || content.includes('simple')) {
      estimatedDays *= 0.7;
    }

    // Category-specific time adjustments
    switch (context.category) {
      case 'habits':
        // Habits typically need 66 days minimum to form
        estimatedDays = Math.max(estimatedDays, 66);
        break;
        
      case 'language':
        // Language learning is typically long-term
        if (content.includes('fluent') || content.includes('conversational')) {
          estimatedDays = Math.max(estimatedDays, 365);
        }
        break;
        
      case 'fitness':
        // Fitness goals can show results in 4-12 weeks
        if (content.includes('5k') || content.includes('marathon')) {
          estimatedDays = content.includes('marathon') ? 180 : 90;
        }
        break;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + estimatedDays);
    return targetDate;
  }

  /**
   * Select contextual components based on goal content
   */
  private selectContextualComponents(context: GoalContext, categoryConfig: GoalCategoryConfig): string[] {
    const content = `${context.title} ${context.description || ''}`.toLowerCase();
    const contextualComponents = [...categoryConfig.contextualComponents];
    
    // Add components based on goal content
    if (content.includes('habit') && !contextualComponents.includes('habit_tracker')) {
      contextualComponents.push('habit_tracker');
    }
    
    if (content.includes('money') || content.includes('save') || content.includes('cost')) {
      if (!contextualComponents.includes('budget_breakdown')) {
        contextualComponents.push('budget_breakdown');
      }
    }
    
    if (content.includes('daily') || content.includes('weekly')) {
      if (!contextualComponents.includes('streak_counter')) {
        contextualComponents.push('streak_counter');
      }
    }

    return contextualComponents;
  }

  /**
   * Generate realistic smart goal data for dashboard components
   */
  private generateSmartGoalData(
    context: GoalContext, 
    categoryConfig: GoalCategoryConfig, 
    estimatedCost: number, 
    targetDate: Date
  ): any {
    const currentDate = new Date();
    const totalDays = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
    const elapsedDays = Math.floor(totalDays * 0.2); // Assume 20% progress
    
    const baseData = {
      specificGoal: context.title,
      measurable: this.generateMeasurableMetrics(context),
      achievable: `Based on ${totalDays} day timeline and available resources`,
      relevant: this.generateRelevanceStatement(context),
      timeBound: `Target completion: ${targetDate.toLocaleDateString()}`,
      goalDashboard: this.generateDashboardData(context, categoryConfig, estimatedCost, totalDays, elapsedDays)
    };

    return baseData;
  }

  /**
   * Generate category-specific dashboard data
   */
  private generateDashboardData(
    context: GoalContext, 
    categoryConfig: GoalCategoryConfig, 
    estimatedCost: number, 
    totalDays: number, 
    elapsedDays: number
  ): any {
    const progress = Math.min(elapsedDays / totalDays, 0.8); // Cap at 80% for realism
    
    const baseData = {
      currentProgress: Math.round(progress * 100),
      targetProgress: 100,
      estimatedCost,
      currentSaved: Math.round(estimatedCost * progress * 0.6), // 60% of expected savings
      daysRemaining: Math.max(0, totalDays - elapsedDays),
      totalDays
    };

    // Category-specific data generation
    switch (context.category) {
      case 'savings':
        return {
          ...baseData,
          monthlySavingsNeeded: Math.round(estimatedCost / (totalDays / 30)),
          savingsProgress: Math.round(progress * 100),
          emergencyFundGoal: estimatedCost
        };

      case 'investment':
        return {
          ...baseData,
          portfolioValue: Math.round(estimatedCost * progress),
          targetValue: estimatedCost,
          monthlyContribution: Math.round(estimatedCost / (totalDays / 30)),
          totalReturn: this.generateRandomReturn(),
          ytdReturn: this.generateRandomReturn(0.8),
          riskLevel: this.assessRiskLevel(context)
        };

      case 'fitness':
      case 'weight_loss':
        return {
          ...baseData,
          currentWeight: 170 - (progress * 15), // Example weight loss
          targetWeight: 155,
          workoutsThisMonth: Math.floor(progress * 20),
          targetWorkouts: 20,
          caloriesBurned: Math.floor(progress * 2000),
          sleepAverage: 7.2 + (progress * 0.8)
        };

      case 'language':
      case 'education':
        return {
          ...baseData,
          skillLevel: Math.round(progress * 10),
          maxLevel: 10,
          studyHours: Math.round(progress * 100),
          targetHours: Math.round(totalDays * 0.5),
          coursesCompleted: Math.floor(progress * 3),
          targetCourses: 3,
          vocabularySize: Math.round(500 + (progress * 1500))
        };

      case 'reading':
        return {
          ...baseData,
          booksRead: Math.floor(progress * 52),
          targetBooks: 52,
          pagesRead: Math.floor(progress * 15000),
          targetPages: 15000,
          averageRating: 4.2,
          readingStreak: Math.floor(progress * 100)
        };

      case 'travel':
        return {
          ...baseData,
          destinations: this.extractDestinations(context),
          budgetProgress: Math.round(progress * 100),
          bookingProgress: Math.max(0, Math.round((progress - 0.3) * 100)),
          documentsCompleted: Math.floor(progress * 8),
          totalDocuments: 8
        };

      case 'business':
        return {
          ...baseData,
          monthlyRevenue: Math.round(progress * 5000),
          targetRevenue: 10000,
          totalCustomers: Math.floor(progress * 200),
          targetCustomers: 200,
          conversionRate: 2.5 + (progress * 2),
          profitMargin: 15 + (progress * 15)
        };

      case 'career':
        return {
          ...baseData,
          skillsProgress: Math.round(progress * 100),
          networkingProgress: Math.round(progress * 100),
          applicationsSent: Math.floor(progress * 15),
          interviewsScheduled: Math.floor(progress * 5),
          certifications: Math.floor(progress * 3)
        };

      default:
        return baseData;
    }
  }

  // Helper methods
  private parseMonetaryValue(moneyString: string): number {
    const cleanString = moneyString.replace(/[$,]/g, '');
    if (cleanString.includes('k') || cleanString.includes('K')) {
      return parseFloat(cleanString.replace(/[kK]/g, '')) * 1000;
    }
    return parseFloat(cleanString) || 0;
  }

  private parseTimeValue(timeString: string): number {
    const match = timeString.match(/(\d+)\s*(day|week|month|year)s?/i);
    if (!match) return 90; // Default

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'day': return value;
      case 'week': return value * 7;
      case 'month': return value * 30;
      case 'year': return value * 365;
      default: return 90;
    }
  }

  private calculateTimeframe(targetDate: Date): string {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  }

  private assessComplexity(context: GoalContext, categoryConfig: GoalCategoryConfig): 'simple' | 'moderate' | 'complex' {
    const content = `${context.title} ${context.description || ''}`.toLowerCase();
    
    if (content.includes('master') || content.includes('expert') || content.includes('advanced') || content.includes('complex')) {
      return 'complex';
    }
    
    if (content.includes('basic') || content.includes('simple') || content.includes('easy')) {
      return 'simple';
    }
    
    return 'moderate';
  }

  private getLocationCostMultiplier(location: string): number {
    const locationLower = location.toLowerCase();
    
    // High-cost locations
    if (locationLower.includes('san francisco') || locationLower.includes('new york') || 
        locationLower.includes('london') || locationLower.includes('tokyo')) {
      return 1.4;
    }
    
    // Medium-cost locations
    if (locationLower.includes('canada') || locationLower.includes('australia') || 
        locationLower.includes('germany') || locationLower.includes('france')) {
      return 1.2;
    }
    
    // Lower-cost locations
    if (locationLower.includes('mexico') || locationLower.includes('india') || 
        locationLower.includes('thailand') || locationLower.includes('philippines')) {
      return 0.6;
    }
    
    return 1.0; // Default multiplier
  }

  private generateMeasurableMetrics(context: GoalContext): string {
    const category = context.category;
    const title = context.title.toLowerCase();
    
    switch (category) {
      case 'fitness':
        return 'Track workouts, weight, body measurements, strength gains';
      case 'language':
        return 'Complete courses, practice daily, track vocabulary growth, take proficiency tests';
      case 'savings':
        return 'Save specific amount monthly, track expenses, monitor account balance';
      case 'reading':
        return 'Track books completed, pages read, reading time, comprehension notes';
      default:
        return 'Track daily progress, complete milestones, measure key performance indicators';
    }
  }

  private generateRelevanceStatement(context: GoalContext): string {
    const relevanceMap: Record<string, string> = {
      'fitness': 'For improved health, confidence, and physical well-being',
      'language': 'For career advancement, travel, and cultural enrichment',
      'savings': 'For financial security, emergency preparedness, and future opportunities',
      'investment': 'For long-term wealth building and financial independence',
      'travel': 'For cultural experiences, personal growth, and life memories',
      'business': 'For financial independence, career growth, and personal fulfillment',
      'career': 'For professional advancement, skill development, and increased earning potential',
      'education': 'For knowledge expansion, career opportunities, and personal development'
    };
    
    return relevanceMap[context.category] || 'For personal growth and life improvement';
  }

  private generateRandomReturn(multiplier: number = 1): number {
    return Math.round((Math.random() * 15 + 5) * multiplier * 10) / 10; // 5-20% range
  }

  private assessRiskLevel(context: GoalContext): string {
    const content = `${context.title} ${context.description || ''}`.toLowerCase();
    
    if (content.includes('conservative') || content.includes('safe') || content.includes('stable')) {
      return 'conservative';
    }
    if (content.includes('aggressive') || content.includes('high risk') || content.includes('growth')) {
      return 'aggressive';
    }
    return 'moderate';
  }

  private extractDestinations(context: GoalContext): string[] {
    const content = `${context.title} ${context.description || ''}`;
    const destinations = [];
    
    // Simple destination extraction - can be enhanced with AI
    const commonDestinations = ['japan', 'europe', 'asia', 'italy', 'france', 'spain', 'thailand', 'india'];
    
    for (const dest of commonDestinations) {
      if (content.toLowerCase().includes(dest)) {
        destinations.push(dest.charAt(0).toUpperCase() + dest.slice(1));
      }
    }
    
    return destinations.length > 0 ? destinations : ['Selected Destination'];
  }
}

export const goalEstimationService = new GoalEstimationService();