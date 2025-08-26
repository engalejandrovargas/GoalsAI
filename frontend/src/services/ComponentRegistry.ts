import React from 'react';
import { GOAL_CATEGORY_MAPPING, getComponentsForCategory, getDefaultsForCategory } from '../config/GoalCategoryMapping';
import { COMPONENT_DICTIONARY } from '../config/ComponentDictionary';

// Local type definitions to avoid import issues
type ComponentType = 
  | 'financial_calculator'
  | 'smart_action_timeline'
  | 'progress_dashboard'
  | 'agent_info'
  | 'budget_breakdown'
  | 'expense_tracker'
  | 'debt_payoff_tracker'
  | 'currency_converter'
  | 'calendar_widget'
  | 'project_timeline'
  | 'habit_tracker'
  | 'streak_counter'
  | 'mood_tracker'
  | 'travel_dashboard'
  | 'learning_dashboard'
  | 'business_dashboard'
  | 'health_dashboard'
  | 'weather_widget'
  | 'document_checklist'
  | 'resource_library'
  | 'market_data'
  | 'investment_tracker'
  | 'skill_assessment'
  | 'weight_tracker'
  | 'workout_tracker'
  | 'reading_tracker'
  | 'career_dashboard'
  | 'motivation_center'
  | 'social_accountability'
  | 'milestone_timeline'
  | 'task_manager'
  | 'progress_chart'
  | 'completion_meter'
  | 'simple_savings_tracker'
  | 'learning_dashboard'
  | 'health_dashboard'
  | 'business_dashboard';

interface ComponentConfig {
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  requirements?: {
    goalTypes?: string[];
    agents?: string[];
    minEstimatedCost?: number;
    hasDeadline?: boolean;
  };
}

interface DashboardComponent {
  id: string;
  type: ComponentType;
  title: string;
  required: boolean;
  props?: Record<string, any>;
  gridPosition?: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
}

// Lazy imports for better performance - New Consolidated Components
const FinancialCalculator = React.lazy(() => import('../components/dashboard/FinancialCalculator'));
const SmartActionTimeline = React.lazy(() => import('../components/dashboard/SmartActionTimeline'));
const ProgressDashboard = React.lazy(() => import('../components/dashboard/ProgressDashboard'));
const AgentInfoPanel = React.lazy(() => import('../components/dashboard/AgentInfoPanel'));
const BudgetBreakdown = React.lazy(() => import('../components/dashboard/BudgetBreakdown'));
const HabitTracker = React.lazy(() => import('../components/dashboard/HabitTracker'));
const StreakCounter = React.lazy(() => import('../components/dashboard/StreakCounter'));
const MoodTracker = React.lazy(() => import('../components/dashboard/MoodTracker'));
const ExpenseTracker = React.lazy(() => import('../components/dashboard/ExpenseTracker'));
const DebtPayoffTracker = React.lazy(() => import('../components/dashboard/DebtPayoffTracker'));
const CurrencyConverter = React.lazy(() => import('../components/dashboard/CurrencyConverter'));
const CalendarWidget = React.lazy(() => import('../components/dashboard/CalendarWidget'));
const ProjectTimeline = React.lazy(() => import('../components/dashboard/ProjectTimeline'));
const TravelDashboard = React.lazy(() => import('../components/TravelDashboard'));
const MilestoneTimeline = React.lazy(() => import('../components/dashboard/MilestoneTimeline'));
const TaskManager = React.lazy(() => import('../components/dashboard/TaskManager'));
const ProgressChart = React.lazy(() => import('../components/dashboard/ProgressChart'));
const CompletionMeter = React.lazy(() => import('../components/dashboard/CompletionMeter'));
const SimpleSavingsTracker = React.lazy(() => import('../components/dashboard/SimpleSavingsTracker'));
const LearningDashboard = React.lazy(() => import('../components/dashboard/LearningDashboard'));
const HealthDashboard = React.lazy(() => import('../components/dashboard/HealthDashboard'));
const BusinessDashboard = React.lazy(() => import('../components/dashboard/BusinessDashboard'));

// NEW COMPONENTS - Recently Added
const InvestmentTracker = React.lazy(() => import('../components/dashboard/InvestmentTracker'));
const ResourceLibrary = React.lazy(() => import('../components/dashboard/ResourceLibrary'));
const DocumentChecklist = React.lazy(() => import('../components/dashboard/DocumentChecklist'));
const CareerDashboard = React.lazy(() => import('../components/dashboard/CareerDashboard'));
const WeatherWidget = React.lazy(() => import('../components/dashboard/WeatherWidget'));
const SkillAssessment = React.lazy(() => import('../components/dashboard/SkillAssessment'));
const WorkoutTracker = React.lazy(() => import('../components/dashboard/WorkoutTracker'));
const ReadingTracker = React.lazy(() => import('../components/dashboard/ReadingTracker'));

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<ComponentType, ComponentConfig> = new Map();

  private constructor() {
    this.registerDefaultComponents();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  private registerDefaultComponents(): void {
    // Core consolidated components (always required)
    this.registerComponent('financial_calculator', {
      component: FinancialCalculator,
      defaultProps: {
        showDailyView: true,
        showWeeklyView: true,
        showMonthlyView: true,
        allowManualUpdate: true,
      }
    });

    this.registerComponent('smart_action_timeline', {
      component: SmartActionTimeline,
      defaultProps: {
        showTimeline: true,
        allowEdit: true,
      }
    });

    this.registerComponent('progress_dashboard', {
      component: ProgressDashboard,
      defaultProps: {
        showChart: true,
        showMeter: true,
      }
    });

    this.registerComponent('agent_info', {
      component: AgentInfoPanel,
      defaultProps: {
        showApiUsage: true,
        showAgentStatus: true,
        showRecommendations: true,
      }
    });

    // Additional components
    this.registerComponent('budget_breakdown', {
      component: BudgetBreakdown,
      defaultProps: {
        chartType: 'pie',
        showCategories: true,
        allowEdit: true,
      },
      requirements: {
        minEstimatedCost: 1,
      }
    });

    this.registerComponent('habit_tracker', {
      component: HabitTracker,
      defaultProps: {
        showCalendar: true,
        showStreaks: true,
      }
    });

    this.registerComponent('streak_counter', {
      component: StreakCounter,
      defaultProps: {
        animated: true,
        showCelebration: true,
      }
    });

    this.registerComponent('mood_tracker', {
      component: MoodTracker,
      defaultProps: {
        showCalendar: true,
        showInsights: true,
      }
    });

    // Financial components
    this.registerComponent('expense_tracker', {
      component: ExpenseTracker,
      defaultProps: {
        showCategories: true,
        allowEdit: true,
        showChart: true,
      }
    });

    this.registerComponent('debt_payoff_tracker', {
      component: DebtPayoffTracker,
      defaultProps: {
        strategy: 'avalanche',
        showProgress: true,
      }
    });

    this.registerComponent('currency_converter', {
      component: CurrencyConverter,
      defaultProps: {
        showFavorites: true,
        showChart: true,
      }
    });

    // Planning components
    this.registerComponent('calendar_widget', {
      component: CalendarWidget,
      defaultProps: {
        showUpcoming: true,
        allowEdit: true,
      }
    });

    this.registerComponent('project_timeline', {
      component: ProjectTimeline,
      defaultProps: {
        view: 'weeks',
        showProgress: true,
        allowEdit: true,
      }
    });

    // Additional existing components
    this.registerComponent('milestone_timeline', {
      component: MilestoneTimeline,
      defaultProps: {
        showProgress: true,
        allowEdit: true,
      }
    });

    this.registerComponent('task_manager', {
      component: TaskManager,
      defaultProps: {
        showCompleted: true,
        allowEdit: true,
      }
    });

    this.registerComponent('progress_chart', {
      component: ProgressChart,
      defaultProps: {
        chartType: 'line',
        showGrid: true,
      }
    });

    this.registerComponent('completion_meter', {
      component: CompletionMeter,
      defaultProps: {
        animated: true,
        showPercentage: true,
      }
    });

    this.registerComponent('simple_savings_tracker', {
      component: SimpleSavingsTracker,
      defaultProps: {
        showChart: true,
        allowEdit: true,
      }
    });

    // Goal-specific components
    this.registerComponent('travel_dashboard', {
      component: TravelDashboard,
      requirements: {
        goalTypes: ['travel'],
        agents: ['travel', 'weather'],
      }
    });

    this.registerComponent('learning_dashboard', {
      component: LearningDashboard,
      defaultProps: {
        showProgressChart: true,
        showSkillRadar: true,
        showStudyTime: true,
      },
      requirements: {
        goalTypes: ['language', 'education', 'skill_development'],
      }
    });

    this.registerComponent('health_dashboard', {
      component: HealthDashboard,
      defaultProps: {
        showWeightChart: true,
        showWorkoutLog: true,
        showSleepTracker: true,
      },
      requirements: {
        goalTypes: ['weight_loss', 'fitness', 'wellness'],
      }
    });

    this.registerComponent('business_dashboard', {
      component: BusinessDashboard,
      defaultProps: {
        showRevenueChart: true,
        showCustomerMetrics: true,
        showKPIs: true,
      },
      requirements: {
        goalTypes: ['business', 'career'],
      }
    });

    // NEW COMPONENTS - Register the recently added components
    this.registerComponent('investment_tracker', {
      component: InvestmentTracker,
      defaultProps: {
        showPortfolioBreakdown: true,
        showPerformanceChart: true,
        showRebalancing: true,
        allowTransactions: true,
      },
      requirements: {
        goalTypes: ['investment', 'financial'],
        minEstimatedCost: 1000,
      }
    });

    this.registerComponent('resource_library', {
      component: ResourceLibrary,
      defaultProps: {
        allowAddResources: true,
        showCommunityRatings: true,
        showProgress: true,
      },
      requirements: {
        goalTypes: ['education', 'language', 'skill_development', 'career'],
      }
    });

    this.registerComponent('document_checklist', {
      component: DocumentChecklist,
      defaultProps: {
        allowEdit: true,
        showProgress: true,
        showUpload: true,
      },
      requirements: {
        goalTypes: ['travel', 'business', 'immigration', 'education', 'legal'],
      }
    });

    this.registerComponent('career_dashboard', {
      component: CareerDashboard,
      defaultProps: {
        showApplications: true,
        showNetworking: true,
        showSkills: true,
        showProgress: true,
      },
      requirements: {
        goalTypes: ['career'],
      }
    });

    this.registerComponent('weather_widget', {
      component: WeatherWidget,
      defaultProps: {
        showForecast: true,
        showHourly: true,
        showAlerts: true,
        compact: false,
      },
      requirements: {
        goalTypes: ['travel', 'fitness', 'outdoor'],
        agents: ['weather'],
      }
    });

    this.registerComponent('skill_assessment', {
      component: SkillAssessment,
      defaultProps: {
        showProgress: true,
        showRecommendations: true,
        allowEdit: true,
      },
      requirements: {
        goalTypes: ['career', 'education', 'skill_development'],
      }
    });

    this.registerComponent('workout_tracker', {
      component: WorkoutTracker,
      defaultProps: {
        showTimer: true,
        showHistory: true,
        showProgress: true,
        allowEdit: true,
      },
      requirements: {
        goalTypes: ['fitness', 'weight_loss', 'wellness'],
      }
    });

    this.registerComponent('reading_tracker', {
      component: ReadingTracker,
      defaultProps: {
        showProgress: true,
        showStatistics: true,
        showRecommendations: true,
        allowEdit: true,
      },
      requirements: {
        goalTypes: ['education', 'personal_development', 'reading'],
      }
    });
  }

  public registerComponent(type: ComponentType, config: ComponentConfig): void {
    this.components.set(type, config);
  }

  public getComponent(type: ComponentType): ComponentConfig | undefined {
    return this.components.get(type);
  }

  public getComponentsForGoal(
    goalType: string,
    assignedAgents: string[] = [],
    estimatedCost = 0,
    hasDeadline = true
  ): DashboardComponent[] {
    const components: DashboardComponent[] = [];

    // Get intelligent component selection from category mapping
    let requiredComponentIds = getComponentsForCategory(goalType, false);
    let allComponentIds = getComponentsForCategory(goalType, true);
    
    // Fallback: if no components found for this goal type, use general category or show all
    if (requiredComponentIds.length === 0 && allComponentIds.length === 0) {
      console.log(`No components found for goal type: ${goalType}, using general category`);
      requiredComponentIds = getComponentsForCategory('general', false);
      allComponentIds = getComponentsForCategory('general', true);
      
      // If even general doesn't work, show all registered components
      if (requiredComponentIds.length === 0) {
        console.log('Using fallback: showing all registered components');
        const allRegisteredComponents = Array.from(this.components.keys());
        requiredComponentIds = allRegisteredComponents.slice(0, 4); // First 4 as required
        allComponentIds = allRegisteredComponents;
      }
    }
    
    // Get category defaults for this goal type
    const defaults = getDefaultsForCategory(goalType);

    // Add required components (core + category-specific required)
    requiredComponentIds.forEach((componentId, index) => {
      const config = this.getComponent(componentId as ComponentType);
      if (config) {
        components.push({
          id: `${componentId}_${Date.now()}_${index}`,
          type: componentId as ComponentType,
          title: this.getComponentTitle(componentId as ComponentType),
          required: true,
          props: config.defaultProps,
          gridPosition: {
            row: Math.floor(index / 2),
            col: index % 2,
            colSpan: 1,
          }
        });
      }
    });

    // Add contextual/optional components based on goal characteristics
    const optionalComponentIds = allComponentIds.filter(id => !requiredComponentIds.includes(id));
    
    optionalComponentIds.forEach((componentId, index) => {
      const config = this.getComponent(componentId as ComponentType);
      if (config && this.meetsContextualRequirements(config, goalType, assignedAgents, estimatedCost, hasDeadline)) {
        components.push({
          id: `${componentId}_${Date.now()}_opt_${index}`,
          type: componentId as ComponentType,
          title: this.getComponentTitle(componentId as ComponentType),
          required: false,
          props: config.defaultProps,
        });
      }
    });

    return components;
  }

  private addComponentIfExists(
    components: DashboardComponent[],
    type: ComponentType,
    required: boolean
  ): void {
    const config = this.getComponent(type);
    if (config) {
      components.push({
        id: `${type}_${Date.now()}`,
        type,
        title: this.getComponentTitle(type),
        required,
        props: config.defaultProps,
      });
    }
  }

  private addGoalSpecificComponents(
    components: DashboardComponent[],
    goalType: string,
    assignedAgents: string[]
  ): void {
    // Map goal types to their specific components
    const goalComponentMap: Record<string, ComponentType[]> = {
      travel: ['travel_dashboard', 'weather_widget', 'document_checklist'],
      business: ['business_dashboard', 'market_data'],
      education: ['learning_dashboard', 'resource_library'],
      health: ['health_dashboard'],
      finance: ['market_data', 'currency_converter'],
    };

    const specificComponents = goalComponentMap[goalType] || [];
    
    specificComponents.forEach(componentType => {
      const config = this.getComponent(componentType);
      if (config && this.meetsRequirements(config, goalType, assignedAgents)) {
        components.push({
          id: `${componentType}_${Date.now()}`,
          type: componentType,
          title: this.getComponentTitle(componentType),
          required: false,
          props: config.defaultProps,
        });
      }
    });

    // Add agent-specific utility components
    if (assignedAgents.includes('weather')) {
      this.addComponentIfExists(components, 'weather_widget', false);
    }

    if (assignedAgents.includes('financial')) {
      this.addComponentIfExists(components, 'currency_converter', false);
    }
  }

  private meetsRequirements(
    config: ComponentConfig,
    goalType: string,
    assignedAgents: string[]
  ): boolean {
    const requirements = config.requirements;
    if (!requirements) return true;

    // Check goal type requirements
    if (requirements.goalTypes && !requirements.goalTypes.includes(goalType)) {
      return false;
    }

    // Check agent requirements
    if (requirements.agents && !requirements.agents.some(agent => assignedAgents.includes(agent))) {
      return false;
    }

    return true;
  }

  private meetsContextualRequirements(
    config: ComponentConfig,
    goalType: string,
    assignedAgents: string[],
    estimatedCost: number,
    hasDeadline: boolean
  ): boolean {
    const requirements = config.requirements;
    if (!requirements) return true;

    // Check goal type requirements
    if (requirements.goalTypes && !requirements.goalTypes.includes(goalType)) {
      return false;
    }

    // Check agent requirements
    if (requirements.agents && !requirements.agents.some(agent => assignedAgents.includes(agent))) {
      return false;
    }

    // Check cost requirements
    if (requirements.minEstimatedCost && estimatedCost < requirements.minEstimatedCost) {
      return false;
    }

    // Check deadline requirements
    if (requirements.hasDeadline !== undefined && requirements.hasDeadline !== hasDeadline) {
      return false;
    }

    return true;
  }

  private getComponentTitle(type: ComponentType): string {
    const titles: Record<ComponentType, string> = {
      financial_calculator: 'Financial Calculator',
      smart_action_timeline: 'Smart Action Timeline',
      progress_dashboard: 'Progress Dashboard',
      agent_info: 'AI Agents',
      budget_breakdown: 'Budget Breakdown',
      expense_tracker: 'Expense Tracker',
      debt_payoff_tracker: 'Debt Payoff',
      currency_converter: 'Currency Converter',
      calendar_widget: 'Calendar',
      project_timeline: 'Project Timeline',
      habit_tracker: 'Habit Tracker',
      streak_counter: 'Streak Counter',
      mood_tracker: 'Mood Journal',
      travel_dashboard: 'Travel Planning',
      learning_dashboard: 'Learning Path',
      business_dashboard: 'Business Metrics',
      health_dashboard: 'Health Tracking',
      weather_widget: 'Weather Forecast',
      document_checklist: 'Document Checklist',
      resource_library: 'Resources',
      market_data: 'Market Data',
      investment_tracker: 'Investment Portfolio',
      skill_assessment: 'Skill Assessment',
      weight_tracker: 'Weight Tracker',
      workout_tracker: 'Workout Log',
      reading_tracker: 'Reading Progress',
      career_dashboard: 'Career Progress',
      motivation_center: 'Motivation Hub',
      social_accountability: 'Social Support',
      milestone_timeline: 'Milestone Timeline',
      task_manager: 'Task Manager',
      progress_chart: 'Progress Chart',
      completion_meter: 'Completion Meter',
      simple_savings_tracker: 'Simple Savings Tracker',
    };

    return titles[type] || 'Component';
  }

  public getAllAvailableComponents(): ComponentType[] {
    return Array.from(this.components.keys());
  }
}