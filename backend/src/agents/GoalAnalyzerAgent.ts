import { BaseAgent, TaskParameters, AgentResult, AgentCapability } from '../types/agent';
import logger from '../utils/logger';

interface GoalAnalysisParams {
  goalDescription: string;
  userContext: any;
}

interface GoalComplexityParams {
  goalDescription: string;
  userProfile: any;
}

interface RequiredAgentsParams {
  goalDescription: string;
  complexity: any;
  userContext: any;
}

export class GoalAnalyzerAgent extends BaseAgent {
  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'analyzeGoalComplexity',
        description: 'Analyze goal complexity and determine required information',
        parameters: {
          goalDescription: { type: 'string', required: true },
          userProfile: { type: 'object', required: true },
        },
      },
      {
        name: 'determineRequiredAgents',
        description: 'Determine which agents are needed for a complex goal',
        parameters: {
          goalDescription: { type: 'string', required: true },
          complexity: { type: 'object', required: true },
          userContext: { type: 'object', required: true },
        },
      },
      {
        name: 'generateClarificationQuestions',
        description: 'Generate questions to clarify vague or incomplete goals',
        parameters: {
          goalDescription: { type: 'string', required: true },
          userContext: { type: 'object', required: true },
        },
      },
      {
        name: 'decomposeComplexGoal',
        description: 'Break down complex goals into manageable sub-goals',
        parameters: {
          goalDescription: { type: 'string', required: true },
          userContext: { type: 'object', required: true },
          requiredAgents: { type: 'array', required: true },
        },
      },
    ];
  }

  validateParameters(parameters: Record<string, any>): boolean {
    return parameters && typeof parameters === 'object';
  }

  async executeTask(task: TaskParameters): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`GoalAnalyzerAgent executing task: ${task.type} for goal ${task.goalId}`);
      
      let result: any;
      let confidence = 0.85;
      
      switch (task.type) {
        case 'analyzeGoalComplexity':
          result = await this.analyzeGoalComplexity(task.parameters as GoalComplexityParams);
          confidence = 0.90;
          break;
          
        case 'determineRequiredAgents':
          result = await this.determineRequiredAgents(task.parameters as RequiredAgentsParams);
          confidence = 0.85;
          break;
          
        case 'generateClarificationQuestions':
          result = await this.generateClarificationQuestions(task.parameters as GoalAnalysisParams);
          confidence = 0.80;
          break;
          
        case 'decomposeComplexGoal':
          result = await this.decomposeComplexGoal(task.parameters);
          confidence = 0.75;
          break;
          
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      this.logPerformance(startTime, true);
      
      return {
        success: true,
        data: result,
        confidence,
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'goal_analyzer',
          taskType: task.type,
        },
      };
    } catch (error) {
      this.logPerformance(startTime, false);
      
      logger.error(`GoalAnalyzerAgent task failed: ${error}`);
      
      return {
        success: false,
        data: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'goal_analyzer',
          taskType: task.type,
        },
      };
    }
  }

  private async analyzeGoalComplexity(params: GoalComplexityParams): Promise<any> {
    const { goalDescription, userProfile } = params;
    logger.info(`Analyzing goal complexity: "${goalDescription.substring(0, 50)}..."`);
    
    // Analyze goal text for keywords and patterns
    const goalLower = goalDescription.toLowerCase();
    const goalWords = goalLower.split(' ');
    
    // Complexity indicators
    const complexityFactors = {
      financial: this.detectFinancialComplexity(goalLower, goalWords),
      temporal: this.detectTemporalComplexity(goalLower, goalWords),
      skill: this.detectSkillComplexity(goalLower, goalWords),
      external: this.detectExternalDependencies(goalLower, goalWords),
      planning: this.detectPlanningComplexity(goalLower, goalWords),
    };

    // Calculate overall complexity score (0-100)
    const complexityScore = this.calculateComplexityScore(complexityFactors);
    
    // Determine missing information based on user profile
    const missingInfo = this.identifyMissingInformation(goalDescription, userProfile, complexityFactors);
    
    // Categorize the goal
    const category = this.categorizeGoal(goalLower, goalWords);
    
    return {
      complexityScore,
      category,
      complexityFactors,
      missingInformation: missingInfo,
      informationSufficiency: missingInfo.length === 0 ? 'complete' : missingInfo.length <= 2 ? 'partial' : 'insufficient',
      recommendedActions: this.generateRecommendedActions(complexityScore, missingInfo),
      estimatedTimeframe: this.estimateTimeframe(complexityFactors, goalDescription),
      riskFactors: this.identifyRiskFactors(complexityFactors, goalDescription),
    };
  }

  private async determineRequiredAgents(params: RequiredAgentsParams): Promise<any> {
    const { goalDescription, complexity, userContext } = params;
    logger.info(`Determining required agents for goal: "${goalDescription.substring(0, 50)}..."`);
    
    const requiredAgents: string[] = [];
    const agentRoles: Record<string, string[]> = {};
    
    // Always include goal analyzer for coordination
    requiredAgents.push('goal_analyzer');
    agentRoles['goal_analyzer'] = ['coordination', 'progress_monitoring', 'goal_refinement'];
    
    // Determine agents based on complexity factors and goal category
    if (complexity.complexityFactors.financial > 0.3 || complexity.category === 'financial') {
      requiredAgents.push('financial');
      agentRoles['financial'] = ['budget_planning', 'savings_strategy', 'investment_advice', 'cost_analysis'];
    }
    
    if (complexity.category === 'travel' || this.detectTravelKeywords(goalDescription)) {
      requiredAgents.push('travel');
      agentRoles['travel'] = ['flight_search', 'accommodation', 'itinerary_planning', 'visa_requirements'];
    }
    
    if (complexity.complexityFactors.external > 0.4 || complexity.category === 'business') {
      requiredAgents.push('research');
      agentRoles['research'] = ['market_research', 'feasibility_analysis', 'competitive_intelligence'];
    }
    
    if (complexity.category === 'health' || this.detectHealthKeywords(goalDescription)) {
      requiredAgents.push('health');
      agentRoles['health'] = ['fitness_planning', 'nutrition_guidance', 'health_monitoring'];
    }
    
    if (this.detectWeatherDependency(goalDescription)) {
      requiredAgents.push('weather');
      agentRoles['weather'] = ['weather_forecasting', 'seasonal_planning', 'activity_recommendations'];
    }
    
    if (complexity.complexityFactors.skill > 0.5 || complexity.category === 'education') {
      requiredAgents.push('learning');
      agentRoles['learning'] = ['skill_assessment', 'course_recommendations', 'learning_path_design'];
    }
    
    // Generate coordination workflow
    const workflow = this.generateAgentWorkflow(requiredAgents, agentRoles, complexity);
    
    return {
      requiredAgents,
      agentRoles,
      workflow,
      coordinationType: requiredAgents.length > 2 ? 'complex_coordination' : 'simple_coordination',
      estimatedCoordinationTime: this.estimateCoordinationTime(requiredAgents.length),
      priorityOrder: this.determinePriorityOrder(requiredAgents, complexity),
    };
  }

  private async generateClarificationQuestions(params: GoalAnalysisParams): Promise<any> {
    const { goalDescription, userContext } = params;
    logger.info(`Generating clarification questions for: "${goalDescription.substring(0, 50)}..."`);
    
    const questions: any[] = [];
    const goalLower = goalDescription.toLowerCase();
    
    // Generic clarification questions based on vagueness
    if (this.isVague(goalDescription)) {
      questions.push({
        id: 'goal_specificity',
        type: 'open_text',
        question: 'Can you provide more specific details about what exactly you want to achieve?',
        importance: 'high',
        category: 'clarity',
      });
    }
    
    // Timeline questions
    if (!this.hasTimeframe(goalDescription)) {
      questions.push({
        id: 'timeline',
        type: 'date_range',
        question: 'When would you like to achieve this goal?',
        importance: 'high',
        category: 'timeline',
        suggestions: ['3 months', '6 months', '1 year', '2+ years'],
      });
    }
    
    // Budget questions for cost-related goals
    if (this.hasCostImplications(goalDescription) && !this.hasBudget(goalDescription)) {
      questions.push({
        id: 'budget',
        type: 'number_range',
        question: 'What budget range are you working with for this goal?',
        importance: 'high',
        category: 'financial',
        suggestions: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', 'Over $10,000'],
      });
    }
    
    // Travel-specific questions
    if (this.detectTravelKeywords(goalDescription)) {
      if (!this.hasCompanionInfo(goalDescription)) {
        questions.push({
          id: 'travel_companions',
          type: 'multiple_choice',
          question: 'Who will you be traveling with?',
          importance: 'medium',
          category: 'travel',
          options: ['Solo', 'With partner', 'With family', 'With friends', 'Group trip'],
        });
      }
      
      questions.push({
        id: 'travel_style',
        type: 'multiple_choice',
        question: 'What travel style do you prefer?',
        importance: 'medium',
        category: 'travel',
        options: ['Budget-friendly', 'Mid-range comfort', 'Luxury experience', 'Adventure/backpacking'],
      });
    }
    
    // Business/career questions
    if (this.detectBusinessKeywords(goalDescription)) {
      questions.push({
        id: 'business_experience',
        type: 'multiple_choice',
        question: 'What is your experience level with this type of goal?',
        importance: 'medium',
        category: 'business',
        options: ['Complete beginner', 'Some experience', 'Experienced', 'Expert level'],
      });
    }
    
    // Risk tolerance questions
    questions.push({
      id: 'risk_tolerance',
      type: 'scale',
      question: 'How comfortable are you with taking risks to achieve this goal?',
      importance: 'low',
      category: 'personality',
      scale: { min: 1, max: 5, labels: ['Very conservative', 'Conservative', 'Moderate', 'Adventurous', 'High risk'] },
    });
    
    return {
      questions,
      totalQuestions: questions.length,
      estimatedTime: Math.ceil(questions.length * 30 / 60), // 30 seconds per question in minutes
      priorityOrder: questions.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.importance as keyof typeof importanceOrder] - importanceOrder[a.importance as keyof typeof importanceOrder];
      }),
    };
  }

  private async decomposeComplexGoal(params: any): Promise<any> {
    const { goalDescription, userContext, requiredAgents } = params;
    logger.info(`Decomposing complex goal: "${goalDescription.substring(0, 50)}..."`);
    
    const subGoals: any[] = [];
    
    // Create sub-goals based on required agents
    for (const agentType of requiredAgents) {
      if (agentType === 'goal_analyzer') continue; // Skip coordinator
      
      const subGoal = this.createSubGoalForAgent(agentType, goalDescription, userContext);
      if (subGoal) {
        subGoals.push(subGoal);
      }
    }
    
    // Add coordination and tracking sub-goals
    subGoals.push({
      id: 'goal_setup',
      title: 'Goal Setup & Planning',
      description: 'Initial goal analysis, planning, and agent coordination setup',
      agentType: 'goal_analyzer',
      priority: 'high',
      estimatedDuration: '1-2 days',
      dependencies: [],
      tasks: [
        'Complete goal analysis',
        'Set up coordination between agents',
        'Create initial timeline',
        'Establish success metrics',
      ],
    });
    
    subGoals.push({
      id: 'progress_monitoring',
      title: 'Progress Monitoring & Adjustments',
      description: 'Ongoing monitoring of progress and making necessary adjustments',
      agentType: 'goal_analyzer',
      priority: 'medium',
      estimatedDuration: 'Ongoing',
      dependencies: subGoals.map(sg => sg.id).filter(id => id !== 'progress_monitoring'),
      tasks: [
        'Weekly progress reviews',
        'Adjust timeline if needed',
        'Coordinate agent updates',
        'Handle obstacles and blockers',
      ],
    });
    
    return {
      subGoals,
      totalSubGoals: subGoals.length,
      estimatedTotalTime: this.calculateTotalTime(subGoals),
      criticalPath: this.identifyCriticalPath(subGoals),
      coordinationComplexity: this.assessCoordinationComplexity(subGoals, requiredAgents),
    };
  }

  // Helper methods for complexity analysis
  private detectFinancialComplexity(goalLower: string, goalWords: string[]): number {
    const financialKeywords = ['buy', 'purchase', 'save', 'invest', 'money', 'budget', 'cost', 'expensive', 'cheap', 'price', 'financial', 'loan', 'mortgage', 'debt'];
    const matches = goalWords.filter(word => financialKeywords.includes(word)).length;
    return Math.min(matches / 5, 1); // Normalize to 0-1
  }

  private detectTemporalComplexity(goalLower: string, goalWords: string[]): number {
    const temporalKeywords = ['by', 'before', 'after', 'during', 'within', 'month', 'year', 'week', 'day', 'soon', 'quickly', 'slowly', 'deadline'];
    const matches = goalWords.filter(word => temporalKeywords.includes(word)).length;
    return Math.min(matches / 3, 1);
  }

  private detectSkillComplexity(goalLower: string, goalWords: string[]): number {
    const skillKeywords = ['learn', 'master', 'skill', 'course', 'training', 'education', 'practice', 'study', 'improve', 'develop'];
    const matches = goalWords.filter(word => skillKeywords.includes(word)).length;
    return Math.min(matches / 3, 1);
  }

  private detectExternalDependencies(goalLower: string, goalWords: string[]): number {
    const externalKeywords = ['with', 'help', 'partner', 'team', 'company', 'others', 'together', 'collaborate', 'market', 'customer'];
    const matches = goalWords.filter(word => externalKeywords.includes(word)).length;
    return Math.min(matches / 4, 1);
  }

  private detectPlanningComplexity(goalLower: string, goalWords: string[]): number {
    const planningKeywords = ['plan', 'organize', 'prepare', 'setup', 'create', 'build', 'develop', 'design', 'strategy', 'steps'];
    const matches = goalWords.filter(word => planningKeywords.includes(word)).length;
    return Math.min(matches / 4, 1);
  }

  private calculateComplexityScore(factors: any): number {
    const weights = {
      financial: 0.2,
      temporal: 0.15,
      skill: 0.25,
      external: 0.2,
      planning: 0.2,
    };
    
    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += (value as number) * weights[factor as keyof typeof weights];
    }
    
    return Math.round(score * 100); // Convert to 0-100 scale
  }

  private categorizeGoal(goalLower: string, goalWords: string[]): string {
    const categories = {
      travel: ['travel', 'trip', 'vacation', 'visit', 'explore', 'journey', 'fly', 'hotel', 'destination'],
      financial: ['save', 'invest', 'money', 'financial', 'budget', 'debt', 'income', 'wealth'],
      health: ['health', 'fitness', 'exercise', 'diet', 'weight', 'workout', 'healthy', 'medical'],
      education: ['learn', 'study', 'course', 'degree', 'education', 'skill', 'training', 'certification'],
      business: ['business', 'startup', 'company', 'career', 'job', 'work', 'professional', 'market'],
      personal: ['relationship', 'family', 'social', 'hobby', 'personal', 'lifestyle'],
    };
    
    let maxScore = 0;
    let bestCategory = 'general';
    
    for (const [category, keywords] of Object.entries(categories)) {
      const score = goalWords.filter(word => keywords.includes(word)).length;
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  private identifyMissingInformation(goalDescription: string, userProfile: any, complexityFactors: any): string[] {
    const missing: string[] = [];
    
    if (!this.hasTimeframe(goalDescription)) {
      missing.push('timeline');
    }
    
    if (complexityFactors.financial > 0.3 && !this.hasBudget(goalDescription)) {
      missing.push('budget');
    }
    
    if (this.detectTravelKeywords(goalDescription) && !this.hasCompanionInfo(goalDescription)) {
      missing.push('travel_companions');
    }
    
    if (!userProfile?.riskTolerance) {
      missing.push('risk_tolerance');
    }
    
    if (complexityFactors.skill > 0.4 && !userProfile?.skillLevel) {
      missing.push('current_skill_level');
    }
    
    return missing;
  }

  private generateRecommendedActions(complexityScore: number, missingInfo: string[]): string[] {
    const actions: string[] = [];
    
    if (complexityScore > 70) {
      actions.push('Break down into smaller, manageable sub-goals');
      actions.push('Consider extending timeline for better success probability');
    }
    
    if (missingInfo.length > 2) {
      actions.push('Complete goal refinement questionnaire');
    }
    
    if (missingInfo.includes('budget')) {
      actions.push('Research and estimate total costs involved');
    }
    
    if (missingInfo.includes('timeline')) {
      actions.push('Set a realistic target date with milestones');
    }
    
    return actions;
  }

  private estimateTimeframe(complexityFactors: any, goalDescription: string): any {
    const baseTime = this.hasTimeframe(goalDescription) ? 
      this.extractTimeframe(goalDescription) : 
      this.defaultTimeframe(complexityFactors);
    
    return {
      estimated: baseTime,
      minimum: Math.ceil(baseTime * 0.7),
      realistic: baseTime,
      conservative: Math.ceil(baseTime * 1.5),
    };
  }

  private identifyRiskFactors(complexityFactors: any, goalDescription: string): string[] {
    const risks: string[] = [];
    
    if (complexityFactors.external > 0.6) {
      risks.push('High dependency on external factors');
    }
    
    if (complexityFactors.financial > 0.7) {
      risks.push('Significant financial commitment required');
    }
    
    if (complexityFactors.temporal > 0.8) {
      risks.push('Tight timeline may be challenging');
    }
    
    if (complexityFactors.skill > 0.8) {
      risks.push('Requires substantial skill development');
    }
    
    return risks;
  }

  // Helper methods for agent determination
  private detectTravelKeywords(goalDescription: string): boolean {
    const travelKeywords = ['travel', 'trip', 'vacation', 'visit', 'explore', 'journey', 'fly', 'hotel', 'destination', 'country', 'city'];
    return travelKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  private detectHealthKeywords(goalDescription: string): boolean {
    const healthKeywords = ['health', 'fitness', 'exercise', 'diet', 'weight', 'workout', 'healthy', 'medical', 'marathon', 'gym'];
    return healthKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  private detectWeatherDependency(goalDescription: string): boolean {
    const weatherKeywords = ['outdoor', 'hiking', 'camping', 'beach', 'skiing', 'weather', 'season', 'climate'];
    return weatherKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  private detectBusinessKeywords(goalDescription: string): boolean {
    const businessKeywords = ['business', 'startup', 'company', 'career', 'job', 'work', 'professional', 'market', 'revenue'];
    return businessKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  private generateAgentWorkflow(requiredAgents: string[], agentRoles: Record<string, string[]>, complexity: any): any {
    const workflow = {
      phases: [] as any[],
      dependencies: {} as Record<string, string[]>,
      estimatedDuration: '2-4 weeks',
    };
    
    // Phase 1: Analysis and Planning
    workflow.phases.push({
      name: 'Analysis & Planning',
      agents: ['goal_analyzer', 'research'],
      duration: '3-5 days',
      tasks: ['Goal analysis', 'Feasibility study', 'Resource identification'],
    });
    
    // Phase 2: Resource Gathering
    workflow.phases.push({
      name: 'Resource Gathering',
      agents: requiredAgents.filter(a => a !== 'goal_analyzer'),
      duration: '1-2 weeks',
      tasks: ['Data collection', 'Option research', 'Cost analysis'],
    });
    
    // Phase 3: Execution Planning
    workflow.phases.push({
      name: 'Execution Planning',
      agents: ['goal_analyzer'],
      duration: '2-3 days',
      tasks: ['Create final plan', 'Set up monitoring', 'Begin execution'],
    });
    
    return workflow;
  }

  private estimateCoordinationTime(agentCount: number): string {
    if (agentCount <= 2) return '1-2 hours';
    if (agentCount <= 4) return '2-4 hours';
    return '4-8 hours';
  }

  private determinePriorityOrder(requiredAgents: string[], complexity: any): string[] {
    const priorityMap: Record<string, number> = {
      goal_analyzer: 10, // Always first
      research: 9,       // Foundation research
      financial: 8,      // Budget planning
      travel: 7,
      health: 6,
      learning: 5,
      weather: 4,        // Usually last for supplementary info
    };
    
    return requiredAgents.sort((a, b) => (priorityMap[b] || 0) - (priorityMap[a] || 0));
  }

  // Helper methods for question generation
  private isVague(goalDescription: string): boolean {
    const vagueIndicators = ['want to', 'would like', 'maybe', 'somehow', 'better', 'more', 'improve'];
    return vagueIndicators.some(indicator => goalDescription.toLowerCase().includes(indicator)) ||
           goalDescription.split(' ').length < 5;
  }

  private hasTimeframe(goalDescription: string): boolean {
    const timeIndicators = ['by', 'before', 'after', 'during', 'within', 'month', 'year', 'week', 'day'];
    return timeIndicators.some(indicator => goalDescription.toLowerCase().includes(indicator));
  }

  private hasCostImplications(goalDescription: string): boolean {
    const costKeywords = ['buy', 'purchase', 'cost', 'price', 'expensive', 'money', 'budget', 'save', 'invest'];
    return costKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  private hasBudget(goalDescription: string): boolean {
    const budgetPattern = /\$[\d,]+|\d+\s*(dollars?|usd|k|thousand|million)/i;
    return budgetPattern.test(goalDescription);
  }

  private hasCompanionInfo(goalDescription: string): boolean {
    const companionKeywords = ['alone', 'solo', 'with', 'family', 'friends', 'partner', 'group'];
    return companionKeywords.some(keyword => goalDescription.toLowerCase().includes(keyword));
  }

  // Helper methods for goal decomposition
  private createSubGoalForAgent(agentType: string, goalDescription: string, userContext: any): any | null {
    const subGoalTemplates: Record<string, any> = {
      financial: {
        id: 'financial_planning',
        title: 'Financial Planning & Budgeting',
        description: 'Analyze costs, create savings plan, and optimize financial strategy',
        priority: 'high',
        estimatedDuration: '3-5 days',
        tasks: [
          'Analyze total costs and expenses',
          'Create savings timeline',
          'Identify funding sources',
          'Set up automated savings plan',
        ],
      },
      travel: {
        id: 'travel_planning',
        title: 'Travel Research & Booking',
        description: 'Research destinations, find best deals, and handle all travel arrangements',
        priority: 'high',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Research flights and compare prices',
          'Find accommodation options',
          'Plan itinerary and activities',
          'Handle visa and documentation',
        ],
      },
      research: {
        id: 'research_analysis',
        title: 'Market Research & Feasibility',
        description: 'Conduct thorough research and validate goal feasibility',
        priority: 'high',
        estimatedDuration: '1 week',
        tasks: [
          'Conduct market research',
          'Analyze competition and opportunities',
          'Validate assumptions',
          'Identify potential obstacles',
        ],
      },
      health: {
        id: 'health_planning',
        title: 'Health & Fitness Strategy',
        description: 'Create personalized health plan and track progress',
        priority: 'medium',
        estimatedDuration: '3-5 days',
        tasks: [
          'Assess current health status',
          'Create workout plan',
          'Design nutrition strategy',
          'Set up progress tracking',
        ],
      },
      learning: {
        id: 'learning_path',
        title: 'Skill Development Plan',
        description: 'Identify learning requirements and create education pathway',
        priority: 'medium',
        estimatedDuration: '1 week',
        tasks: [
          'Assess current skill level',
          'Identify learning requirements',
          'Find courses and resources',
          'Create learning schedule',
        ],
      },
      weather: {
        id: 'weather_planning',
        title: 'Weather & Timing Optimization',
        description: 'Analyze weather patterns and optimize timing',
        priority: 'low',
        estimatedDuration: '1-2 days',
        tasks: [
          'Analyze weather patterns',
          'Recommend optimal timing',
          'Provide activity suggestions',
          'Monitor weather updates',
        ],
      },
    };
    
    const template = subGoalTemplates[agentType];
    if (!template) return null;
    
    return {
      ...template,
      agentType,
      dependencies: agentType === 'weather' ? [] : ['goal_setup'],
    };
  }

  private calculateTotalTime(subGoals: any[]): string {
    // Simple estimation based on number of sub-goals and their complexity
    const days = subGoals.length * 3; // Average 3 days per sub-goal
    
    if (days <= 7) return `${days} days`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  }

  private identifyCriticalPath(subGoals: any[]): string[] {
    // Identify the longest chain of dependencies
    const highPriorityGoals = subGoals
      .filter(sg => sg.priority === 'high')
      .map(sg => sg.id);
    
    return highPriorityGoals;
  }

  private assessCoordinationComplexity(subGoals: any[], requiredAgents: string[]): string {
    if (requiredAgents.length <= 2) return 'simple';
    if (requiredAgents.length <= 4) return 'moderate';
    return 'complex';
  }

  private extractTimeframe(goalDescription: string): number {
    // Simple pattern matching for timeframes
    if (/week/i.test(goalDescription)) return 1;
    if (/month/i.test(goalDescription)) return 4;
    if (/year/i.test(goalDescription)) return 52;
    return 12; // Default 3 months in weeks
  }

  private defaultTimeframe(complexityFactors: any): number {
    const avgComplexity = Object.values(complexityFactors).reduce((sum: number, val) => sum + (val as number), 0) / Object.keys(complexityFactors).length;
    
    if (avgComplexity < 0.3) return 4;  // 1 month
    if (avgComplexity < 0.6) return 12; // 3 months
    if (avgComplexity < 0.8) return 26; // 6 months
    return 52; // 1 year
  }
}