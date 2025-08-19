import { PrismaClient } from '@prisma/client';
import { AgentManager } from './AgentManager';
import { aiService } from './aiService';
import logger from '../utils/logger';

interface GoalAnalysis {
  needsClirification: boolean;
  clarity: 'clear' | 'partial' | 'vague';
  requiredAgents: string[];
  estimatedComplexity: number;
  questions?: ClarificationQuestion[];
}

interface ClarificationQuestion {
  question: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  required: boolean;
  category: string;
}

interface ProcessedGoal {
  originalGoal: string;
  clarifiedGoal: string;
  goalDashboard: GoalDashboard;
  assignedAgents: string[];
  analysis: GoalAnalysis;
}

interface GoalDashboard {
  goalSummary: {
    title: string;
    description: string;
    category: string;
    timeline: string;
  };
  tasks: Task[];
  financialCalculator?: FinancialCalculator;
  contextualInfo: any;
}

interface Task {
  id: number;
  task: string;
  completed: boolean;
  deadline?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
}

interface FinancialCalculator {
  totalBudget: number;
  breakdown: Record<string, { estimated: number; saved: number; remaining: number }>;
  savingsNeeded?: string;
  monthlyTarget?: number;
}

export class SmartGoalProcessor {
  private agentManager: AgentManager;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.agentManager = new AgentManager(prisma);
  }

  /**
   * Step 1: Analyze if the goal needs clarification using AI
   */
  async analyzeGoal(goalDescription: string, userContext: any): Promise<GoalAnalysis> {
    logger.info(`AI analyzing goal: "${goalDescription.substring(0, 50)}..."`);

    try {
      // Use AI service for intelligent goal analysis
      const feasibilityAnalysis = await aiService.analyzeFeasibility(goalDescription, userContext);
      
      // Determine if goal needs clarification based on AI analysis and goal complexity
      const clarity = this.determineGoalClarity(goalDescription);
      const requiredAgents = this.determineRequiredAgents(goalDescription);
      const complexity = this.calculateComplexity(goalDescription, requiredAgents);
      
      const analysis: GoalAnalysis = {
        needsClirification: clarity !== 'clear' || this.needsMoreContext(goalDescription, feasibilityAnalysis),
        clarity,
        requiredAgents,
        estimatedComplexity: complexity,
      };

      if (analysis.needsClirification) {
        analysis.questions = await this.generateSmartQuestions(goalDescription, userContext, feasibilityAnalysis);
      }

      return analysis;
    } catch (error) {
      logger.error('Error in AI goal analysis, falling back to basic analysis:', error);
      
      // Fallback to basic analysis if AI fails
      const clarity = this.determineGoalClarity(goalDescription);
      const requiredAgents = this.determineRequiredAgents(goalDescription);
      const complexity = this.calculateComplexity(goalDescription, requiredAgents);
      
      return {
        needsClirification: clarity !== 'clear',
        clarity,
        requiredAgents,
        estimatedComplexity: complexity,
        questions: this.generateClarificationQuestions(goalDescription, userContext)
      };
    }
  }

  /**
   * Step 2: Generate smart clarification questions
   */
  private generateClarificationQuestions(goalDescription: string, userContext: any): ClarificationQuestion[] {
    const questions: ClarificationQuestion[] = [];
    const goalLower = goalDescription.toLowerCase();

    // Travel goals
    if (goalLower.includes('travel') || goalLower.includes('trip') || goalLower.includes('visit')) {
      questions.push(
        {
          question: "When would you like to travel?",
          type: 'text',
          required: true,
          category: 'timeline'
        },
        {
          question: "Who will be traveling?",
          type: 'select',
          options: ['Just me', 'Me + 1 person', 'Family (3-4 people)', 'Group (5+ people)'],
          required: true,
          category: 'logistics'
        },
        {
          question: "What's your approximate budget?",
          type: 'select',
          options: ['Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Above $10,000'],
          required: true,
          category: 'financial'
        },
        {
          question: "What type of experience are you looking for?",
          type: 'select',
          options: ['Cultural & Historical', 'Adventure & Outdoor', 'Relaxation & Spa', 'Business/Work', 'Food & Dining', 'Shopping'],
          required: true,
          category: 'preferences'
        },
        {
          question: "Do you have specific cities or regions in mind?",
          type: 'text',
          required: false,
          category: 'destination'
        }
      );
    }

    // Financial goals
    if (goalLower.includes('save') || goalLower.includes('money') || goalLower.includes('budget') || goalLower.includes('invest')) {
      questions.push(
        {
          question: "How much money do you want to save/invest?",
          type: 'number',
          required: true,
          category: 'financial'
        },
        {
          question: "By when do you want to achieve this?",
          type: 'date',
          required: true,
          category: 'timeline'
        },
        {
          question: "What's this money for?",
          type: 'select',
          options: ['Emergency fund', 'House down payment', 'Car purchase', 'Education', 'Retirement', 'Travel', 'Investment', 'Other'],
          required: true,
          category: 'purpose'
        }
      );
    }

    // Health/Fitness goals
    if (goalLower.includes('lose weight') || goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('health')) {
      questions.push(
        {
          question: "What's your specific target? (e.g., lose 20 pounds, run a marathon)",
          type: 'text',
          required: true,
          category: 'target'
        },
        {
          question: "What's your timeline?",
          type: 'select',
          options: ['1-3 months', '3-6 months', '6-12 months', 'More than 1 year'],
          required: true,
          category: 'timeline'
        },
        {
          question: "How much time can you dedicate per week?",
          type: 'select',
          options: ['1-2 hours', '3-5 hours', '6-10 hours', 'More than 10 hours'],
          required: true,
          category: 'time_commitment'
        }
      );
    }

    // Business/Career goals
    if (goalLower.includes('business') || goalLower.includes('career') || goalLower.includes('job') || goalLower.includes('startup')) {
      questions.push(
        {
          question: "What type of business/career change are you planning?",
          type: 'text',
          required: true,
          category: 'business_type'
        },
        {
          question: "What's your timeline for this goal?",
          type: 'select',
          options: ['1-6 months', '6-12 months', '1-2 years', 'More than 2 years'],
          required: true,
          category: 'timeline'
        },
        {
          question: "Do you have a target income or revenue goal?",
          type: 'number',
          required: false,
          category: 'financial'
        }
      );
    }

    return questions;
  }

  /**
   * Step 3: Process answers and create goal dashboard
   */
  async processGoalWithAnswers(goalDescription: string, answers: Record<string, any>, userContext: any): Promise<ProcessedGoal> {
    logger.info(`Processing goal with answers: "${goalDescription}"`);

    // Create clarified goal description
    const clarifiedGoal = this.createClarifiedGoal(goalDescription, answers);
    
    // Generate agents assignment
    const assignedAgents = this.determineRequiredAgents(clarifiedGoal);
    
    // Create goal-specific dashboard
    const goalDashboard = await this.generateGoalDashboard(clarifiedGoal, answers, userContext);
    
    const analysis = await this.analyzeGoal(goalDescription, userContext);

    return {
      originalGoal: goalDescription,
      clarifiedGoal,
      goalDashboard,
      assignedAgents,
      analysis
    };
  }

  /**
   * Generate goal-specific dashboard with AI enhancement
   */
  private async generateGoalDashboard(goalDescription: string, answers: Record<string, any>, userContext: any): Promise<GoalDashboard> {
    const goalLower = goalDescription.toLowerCase();

    try {
      // Get AI feasibility analysis for enhanced dashboard
      const feasibilityAnalysis = await aiService.analyzeFeasibility(goalDescription, userContext);
      
      // Use AI action steps for better task generation
      const aiTasks = feasibilityAnalysis.actionSteps?.map((step, index) => ({
        id: index + 1,
        task: step.step,
        completed: false,
        deadline: this.calculateTaskDeadline(step.timeframe),
        category: this.categorizeTask(step.step),
        priority: step.priority,
        estimatedTime: step.timeframe
      })) || [];

      // Generate category-specific dashboard with AI enhancement
      if (goalLower.includes('travel')) {
        return this.generateTravelDashboard(goalDescription, answers, userContext, feasibilityAnalysis, aiTasks);
      }
      
      if (goalLower.includes('save') || goalLower.includes('money') || goalLower.includes('buy')) {
        return this.generateFinancialDashboard(goalDescription, answers, userContext, feasibilityAnalysis, aiTasks);
      }

      if (goalLower.includes('lose weight') || goalLower.includes('fitness') || goalLower.includes('health')) {
        return this.generateHealthDashboard(goalDescription, answers, userContext, feasibilityAnalysis, aiTasks);
      }

      if (goalLower.includes('business') || goalLower.includes('career') || goalLower.includes('startup')) {
        return this.generateBusinessDashboard(goalDescription, answers, userContext, feasibilityAnalysis, aiTasks);
      }

      // Enhanced default dashboard with AI insights
      return this.generateAIEnhancedDashboard(goalDescription, answers, userContext, feasibilityAnalysis, aiTasks);
      
    } catch (error) {
      logger.error('Error generating AI-enhanced dashboard, falling back to basic:', error);
      
      // Fallback to basic dashboard generation
      if (goalLower.includes('travel')) {
        return this.generateTravelDashboard(goalDescription, answers, userContext);
      }
      if (goalLower.includes('save') || goalLower.includes('money')) {
        return this.generateFinancialDashboard(goalDescription, answers, userContext);
      }
      if (goalLower.includes('fitness') || goalLower.includes('health')) {
        return this.generateHealthDashboard(goalDescription, answers, userContext);
      }
      if (goalLower.includes('business') || goalLower.includes('career')) {
        return this.generateBusinessDashboard(goalDescription, answers, userContext);
      }
      
      return this.generateDefaultDashboard(goalDescription, answers, userContext);
    }
  }

  private generateTravelDashboard(
    goalDescription: string, 
    answers: Record<string, any>, 
    userContext: any, 
    feasibilityAnalysis?: any, 
    aiTasks?: Task[]
  ): GoalDashboard {
    const destination = this.extractDestination(goalDescription);
    const travelers = answers.travelers || 1;
    const budget = this.parseBudgetFromAnswer(answers.budget);
    const timeframe = answers.timeline;

    const tasks: Task[] = aiTasks && aiTasks.length > 0 ? aiTasks : [
      { id: 1, task: `Research visa requirements for ${destination}`, completed: false, category: 'documents', priority: 'high' },
      { id: 2, task: 'Book round-trip flights', completed: false, category: 'travel', priority: 'high', deadline: this.calculateDeadline(timeframe, -60) },
      { id: 3, task: 'Reserve accommodation', completed: false, category: 'accommodation', priority: 'high', deadline: this.calculateDeadline(timeframe, -45) },
      { id: 4, task: 'Get travel insurance', completed: false, category: 'insurance', priority: 'medium', deadline: this.calculateDeadline(timeframe, -30) },
      { id: 5, task: 'Plan daily itinerary', completed: false, category: 'planning', priority: 'medium', deadline: this.calculateDeadline(timeframe, -14) },
      { id: 6, task: 'Download offline maps & translation apps', completed: false, category: 'preparation', priority: 'low', deadline: this.calculateDeadline(timeframe, -7) },
    ];

    const financialCalculator: FinancialCalculator = {
      totalBudget: budget,
      breakdown: {
        flights: { estimated: budget * 0.35, saved: 0, remaining: budget * 0.35 },
        accommodation: { estimated: budget * 0.30, saved: 0, remaining: budget * 0.30 },
        food: { estimated: budget * 0.20, saved: 0, remaining: budget * 0.20 },
        activities: { estimated: budget * 0.10, saved: 0, remaining: budget * 0.10 },
        misc: { estimated: budget * 0.05, saved: 0, remaining: budget * 0.05 }
      }
    };

    return {
      goalSummary: {
        title: `Travel to ${destination}`,
        description: `${answers.experience || 'Cultural'} trip for ${travelers} ${travelers === 1 ? 'person' : 'people'}`,
        category: 'travel',
        timeline: timeframe || 'To be determined'
      },
      tasks,
      financialCalculator,
      contextualInfo: {
        destination,
        travelers,
        userLocation: userContext.location,
        userNationality: userContext.nationality
      }
    };
  }

  private generateFinancialDashboard(
    goalDescription: string, 
    answers: Record<string, any>, 
    userContext: any, 
    feasibilityAnalysis?: any, 
    aiTasks?: Task[]
  ): GoalDashboard {
    const target = answers.amount || feasibilityAnalysis?.estimatedCost?.max || 10000;
    const deadline = answers.deadline;
    const purpose = answers.purpose || 'savings';

    const monthsToDeadline = this.calculateMonthsToDeadline(deadline);
    const monthlyTarget = Math.ceil(target / monthsToDeadline);

    const tasks: Task[] = aiTasks && aiTasks.length > 0 ? aiTasks : [
      { id: 1, task: 'Set up dedicated savings account', completed: false, category: 'setup', priority: 'high' },
      { id: 2, task: 'Create monthly budget plan', completed: false, category: 'planning', priority: 'high' },
      { id: 3, task: 'Set up automatic transfers', completed: false, category: 'automation', priority: 'medium' },
      { id: 4, task: 'Track monthly progress', completed: false, category: 'monitoring', priority: 'medium' },
      { id: 5, task: 'Review and adjust plan quarterly', completed: false, category: 'optimization', priority: 'low' },
    ];

    const financialCalculator: FinancialCalculator = {
      totalBudget: target,
      breakdown: {
        target: { estimated: target, saved: userContext.currentSavings || 0, remaining: target - (userContext.currentSavings || 0) }
      },
      monthlyTarget,
      savingsNeeded: `Save $${monthlyTarget}/month for ${monthsToDeadline} months`
    };

    return {
      goalSummary: {
        title: `Save $${target.toLocaleString()} for ${purpose}`,
        description: `Systematic savings plan with monthly targets`,
        category: 'financial',
        timeline: deadline || 'To be determined'
      },
      tasks,
      financialCalculator,
      contextualInfo: {
        currentSavings: userContext.currentSavings,
        monthlyIncome: userContext.annualIncome / 12,
        purpose
      }
    };
  }

  private generateHealthDashboard(
    goalDescription: string, 
    answers: Record<string, any>, 
    userContext: any, 
    feasibilityAnalysis?: any, 
    aiTasks?: Task[]
  ): GoalDashboard {
    const target = answers.target || goalDescription;
    const timeline = answers.timeline;
    const weeklyTime = answers.time_commitment;

    const tasks: Task[] = [
      { id: 1, task: 'Consult with healthcare provider', completed: false, category: 'health', priority: 'high' },
      { id: 2, task: 'Create workout schedule', completed: false, category: 'planning', priority: 'high' },
      { id: 3, task: 'Set up nutrition tracking', completed: false, category: 'nutrition', priority: 'medium' },
      { id: 4, task: 'Take baseline measurements/photos', completed: false, category: 'tracking', priority: 'medium' },
      { id: 5, task: 'Join gym or set up home workout space', completed: false, category: 'setup', priority: 'medium' },
      { id: 6, task: 'Plan weekly meal prep', completed: false, category: 'nutrition', priority: 'low' },
    ];

    return {
      goalSummary: {
        title: target,
        description: `Health and fitness journey with ${weeklyTime} commitment per week`,
        category: 'health',
        timeline: timeline || 'To be determined'
      },
      tasks,
      contextualInfo: {
        weeklyTimeCommitment: weeklyTime,
        userAge: userContext.ageRange,
        userLocation: userContext.location
      }
    };
  }

  private generateBusinessDashboard(
    goalDescription: string, 
    answers: Record<string, any>, 
    userContext: any, 
    feasibilityAnalysis?: any, 
    aiTasks?: Task[]
  ): GoalDashboard {
    const businessType = answers.business_type || 'business venture';
    const timeline = answers.timeline;
    const targetRevenue = answers.revenue;

    const tasks: Task[] = [
      { id: 1, task: 'Conduct market research', completed: false, category: 'research', priority: 'high' },
      { id: 2, task: 'Create business plan', completed: false, category: 'planning', priority: 'high' },
      { id: 3, task: 'Register business entity', completed: false, category: 'legal', priority: 'medium' },
      { id: 4, task: 'Set up business banking', completed: false, category: 'financial', priority: 'medium' },
      { id: 5, task: 'Build MVP/prototype', completed: false, category: 'development', priority: 'medium' },
      { id: 6, task: 'Launch marketing campaign', completed: false, category: 'marketing', priority: 'low' },
    ];

    return {
      goalSummary: {
        title: businessType,
        description: `Business development with ${targetRevenue ? `$${targetRevenue} revenue target` : 'growth focus'}`,
        category: 'business',
        timeline: timeline || 'To be determined'
      },
      tasks,
      contextualInfo: {
        businessType,
        targetRevenue,
        userLocation: userContext.location
      }
    };
  }

  private generateDefaultDashboard(goalDescription: string, answers: Record<string, any>, userContext: any): GoalDashboard {
    const tasks: Task[] = [
      { id: 1, task: 'Break down goal into smaller steps', completed: false, category: 'planning', priority: 'high' },
      { id: 2, task: 'Research requirements and resources', completed: false, category: 'research', priority: 'high' },
      { id: 3, task: 'Create timeline and milestones', completed: false, category: 'planning', priority: 'medium' },
      { id: 4, task: 'Start taking action', completed: false, category: 'execution', priority: 'medium' },
    ];

    return {
      goalSummary: {
        title: goalDescription,
        description: 'Custom goal with personalized action plan',
        category: 'personal',
        timeline: 'To be determined'
      },
      tasks,
      contextualInfo: {}
    };
  }

  // Helper methods
  private needsMoreContext(goalDescription: string, feasibilityAnalysis: any): boolean {
    // If AI analysis indicates low feasibility or high complexity, ask for more context
    if (feasibilityAnalysis.feasibilityScore < 60) return true;
    if (feasibilityAnalysis.redFlags && feasibilityAnalysis.redFlags.length > 2) return true;
    
    // Check if goal lacks specific details
    const hasSpecifics = goalDescription.match(/\d+|\$|when|where|how much|by|until/gi);
    return !hasSpecifics || hasSpecifics.length < 2;
  }

  private async generateSmartQuestions(goalDescription: string, userContext: any, feasibilityAnalysis: any): Promise<ClarificationQuestion[]> {
    // Use AI insights to generate more intelligent questions
    const questions: ClarificationQuestion[] = [];
    const goalLower = goalDescription.toLowerCase();

    // Add questions based on AI feasibility analysis red flags
    if (feasibilityAnalysis.redFlags) {
      feasibilityAnalysis.redFlags.forEach((flag: string) => {
        if (flag.toLowerCase().includes('timeline') || flag.toLowerCase().includes('time')) {
          questions.push({
            question: "When would you like to achieve this goal?",
            type: 'date',
            required: true,
            category: 'timeline'
          });
        }
        if (flag.toLowerCase().includes('budget') || flag.toLowerCase().includes('cost')) {
          questions.push({
            question: "What's your budget for this goal?",
            type: 'number',
            required: true,
            category: 'financial'
          });
        }
      });
    }

    // Add category-specific questions with AI enhancement
    if (goalLower.includes('travel')) {
      questions.push(
        {
          question: "Where exactly do you want to travel?",
          type: 'text',
          required: true,
          category: 'destination'
        },
        {
          question: "How many people will be traveling?",
          type: 'select',
          options: ['Just me', '2 people', '3-4 people', '5+ people'],
          required: true,
          category: 'logistics'
        },
        {
          question: "What's your approximate budget?",
          type: 'select',
          options: ['Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Above $10,000'],
          required: true,
          category: 'financial'
        }
      );
    }

    // Add financial goal questions
    if (goalLower.includes('save') || goalLower.includes('money') || goalLower.includes('buy')) {
      questions.push(
        {
          question: "How much money do you need?",
          type: 'number',
          required: true,
          category: 'financial'
        },
        {
          question: "When do you need this money by?",
          type: 'date',
          required: true,
          category: 'timeline'
        }
      );
    }

    // Remove duplicates and limit to most important questions
    const uniqueQuestions = questions.filter((q, index, arr) => 
      arr.findIndex(item => item.category === q.category) === index
    );

    return uniqueQuestions.slice(0, 5); // Limit to 5 questions max
  }

  private determineGoalClarity(goalDescription: string): 'clear' | 'partial' | 'vague' {
    const words = goalDescription.toLowerCase().split(' ');
    
    // Very basic logic - in real implementation, this would use NLP
    if (words.length < 3) return 'vague';
    
    const hasSpecifics = goalDescription.match(/\d+|\$|when|where|how much|with/gi);
    if (!hasSpecifics) return 'vague';
    
    return hasSpecifics.length > 2 ? 'clear' : 'partial';
  }

  private determineRequiredAgents(goalDescription: string): string[] {
    const agents: string[] = [];
    const goalLower = goalDescription.toLowerCase();

    if (goalLower.includes('travel') || goalLower.includes('trip')) {
      agents.push('travel', 'weather', 'research');
    }
    if (goalLower.includes('money') || goalLower.includes('save') || goalLower.includes('invest')) {
      agents.push('financial');
    }
    if (goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('skill')) {
      agents.push('learning', 'research');
    }
    if (goalLower.includes('business') || goalLower.includes('startup')) {
      agents.push('research', 'financial');
    }

    return [...new Set(agents)]; // Remove duplicates
  }

  private calculateComplexity(goalDescription: string, requiredAgents: string[]): number {
    let complexity = 20; // Base complexity
    
    complexity += requiredAgents.length * 15; // More agents = more complex
    complexity += goalDescription.split(' ').length > 10 ? 20 : 0; // Longer descriptions might be more complex
    
    return Math.min(complexity, 100);
  }

  private createClarifiedGoal(originalGoal: string, answers: Record<string, any>): string {
    // Simple template - in real implementation, this would be more sophisticated
    let clarified = originalGoal;
    
    Object.entries(answers).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        clarified += ` with ${key}: ${value}`;
      }
    });
    
    return clarified;
  }

  private extractDestination(goalDescription: string): string {
    const commonPatterns = [
      /travel to ([^,.\n]+)/i,
      /visit ([^,.\n]+)/i,
      /trip to ([^,.\n]+)/i,
      /go to ([^,.\n]+)/i
    ];

    for (const pattern of commonPatterns) {
      const match = goalDescription.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'destination';
  }

  private parseBudgetFromAnswer(budgetAnswer: string): number {
    if (!budgetAnswer) return 3000; // Default

    const budgetMap: Record<string, number> = {
      'Under $1,000': 800,
      '$1,000 - $3,000': 2000,
      '$3,000 - $5,000': 4000,
      '$5,000 - $10,000': 7500,
      'Above $10,000': 12000
    };

    return budgetMap[budgetAnswer] || 3000;
  }

  private calculateDeadline(timeframe: string, daysBefore: number): string {
    // Simple calculation - in real implementation, parse timeframe properly
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysBefore + 90); // Assume 3 months from now
    return futureDate.toISOString().split('T')[0];
  }

  private calculateMonthsToDeadline(deadline: string): number {
    if (!deadline) return 12; // Default to 1 year
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return Math.max(1, diffMonths);
  }

  private calculateTaskDeadline(timeframe: string): string {
    const now = new Date();
    let deadline = new Date(now);
    
    // Parse timeframe and calculate deadline
    if (timeframe.includes('week')) {
      const weeks = parseInt(timeframe) || 1;
      deadline.setDate(deadline.getDate() + (weeks * 7));
    } else if (timeframe.includes('month')) {
      const months = parseInt(timeframe) || 1;
      deadline.setMonth(deadline.getMonth() + months);
    } else if (timeframe.includes('day')) {
      const days = parseInt(timeframe) || 7;
      deadline.setDate(deadline.getDate() + days);
    } else {
      // Default to 2 weeks
      deadline.setDate(deadline.getDate() + 14);
    }
    
    return deadline.toISOString().split('T')[0];
  }

  private categorizeTask(taskDescription: string): string {
    const taskLower = taskDescription.toLowerCase();
    
    if (taskLower.includes('research') || taskLower.includes('find') || taskLower.includes('look')) return 'research';
    if (taskLower.includes('book') || taskLower.includes('reserve') || taskLower.includes('schedule')) return 'booking';
    if (taskLower.includes('save') || taskLower.includes('money') || taskLower.includes('budget')) return 'financial';
    if (taskLower.includes('document') || taskLower.includes('visa') || taskLower.includes('passport')) return 'documents';
    if (taskLower.includes('plan') || taskLower.includes('create') || taskLower.includes('design')) return 'planning';
    if (taskLower.includes('contact') || taskLower.includes('call') || taskLower.includes('email')) return 'communication';
    
    return 'general';
  }

  private generateAIEnhancedDashboard(
    goalDescription: string, 
    answers: Record<string, any>, 
    userContext: any, 
    feasibilityAnalysis: any, 
    aiTasks: Task[]
  ): GoalDashboard {
    const estimatedCost = feasibilityAnalysis.estimatedCost?.max || 1000;
    
    return {
      goalSummary: {
        title: goalDescription,
        description: `AI-enhanced goal with ${feasibilityAnalysis.feasibilityScore}% feasibility score`,
        category: feasibilityAnalysis.category || 'personal',
        timeline: feasibilityAnalysis.estimatedTimeframe || 'To be determined'
      },
      tasks: aiTasks.length > 0 ? aiTasks : [
        {
          id: 1,
          task: 'Break down goal into specific, measurable objectives',
          completed: false,
          category: 'planning',
          priority: 'high'
        },
        {
          id: 2,
          task: 'Identify required resources and dependencies',
          completed: false,
          category: 'research',
          priority: 'high'
        },
        {
          id: 3,
          task: 'Create detailed action timeline',
          completed: false,
          category: 'planning',
          priority: 'medium'
        }
      ],
      financialCalculator: estimatedCost > 0 ? {
        totalBudget: estimatedCost,
        breakdown: {
          main: { estimated: estimatedCost * 0.7, saved: 0, remaining: estimatedCost * 0.7 },
          contingency: { estimated: estimatedCost * 0.2, saved: 0, remaining: estimatedCost * 0.2 },
          miscellaneous: { estimated: estimatedCost * 0.1, saved: 0, remaining: estimatedCost * 0.1 }
        }
      } : undefined,
      contextualInfo: {
        aiAnalysis: feasibilityAnalysis.feasibilityScore,
        successFactors: feasibilityAnalysis.successFactors?.slice(0, 3) || [],
        potentialChallenges: feasibilityAnalysis.redFlags?.slice(0, 3) || [],
        userLocation: userContext.location,
        estimatedTimeframe: feasibilityAnalysis.estimatedTimeframe
      }
    };
  }
}