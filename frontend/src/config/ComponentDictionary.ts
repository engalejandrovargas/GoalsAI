// Comprehensive component dictionary for goal dashboards

export interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'financial' | 'progress' | 'planning' | 'tracking' | 'specialized';
  complexity: 'simple' | 'moderate' | 'complex';
  requiresData?: string[]; // What data this component needs
}

export const COMPONENT_DICTIONARY: Record<string, ComponentInfo> = {
  // === CORE COMPONENTS (Always useful) ===
  financial_calculator: {
    id: 'financial_calculator',
    name: 'Financial Calculator',
    description: 'Calculate daily/weekly/monthly savings needed',
    category: 'core',
    complexity: 'moderate',
    requiresData: ['estimatedCost', 'targetDate']
  },
  
  task_manager: {
    id: 'task_manager',
    name: 'Task Manager',
    description: 'Interactive todo list with priorities and deadlines',
    category: 'core',
    complexity: 'moderate',
    requiresData: ['tasks']
  },
  
  agent_info: {
    id: 'agent_info',
    name: 'AI Agents Panel',
    description: 'Shows active AI agents and API usage transparency',
    category: 'core',
    complexity: 'simple',
    requiresData: ['assignedAgents']
  },

  // === FINANCIAL COMPONENTS ===
  simple_savings_tracker: {
    id: 'simple_savings_tracker',
    name: 'Simple Savings Tracker',
    description: 'Basic savings progress without complex calculations',
    category: 'financial',
    complexity: 'simple',
    requiresData: ['estimatedCost', 'currentSaved']
  },

  budget_breakdown: {
    id: 'budget_breakdown',
    name: 'Budget Breakdown',
    description: 'Visual breakdown of spending categories',
    category: 'financial',
    complexity: 'complex',
    requiresData: ['budgetCategories', 'estimatedCost']
  },

  expense_tracker: {
    id: 'expense_tracker',
    name: 'Expense Tracker',
    description: 'Track daily expenses and spending patterns',
    category: 'financial',
    complexity: 'moderate',
    requiresData: ['expenses', 'budgetCategories']
  },

  investment_tracker: {
    id: 'investment_tracker',
    name: 'Investment Tracker',
    description: 'Track investment portfolio and returns',
    category: 'financial',
    complexity: 'complex',
    requiresData: ['investments', 'marketData']
  },

  debt_payoff_tracker: {
    id: 'debt_payoff_tracker',
    name: 'Debt Payoff Tracker',
    description: 'Track debt reduction progress and strategies',
    category: 'financial',
    complexity: 'moderate',
    requiresData: ['debts', 'paymentPlan']
  },

  // === PROGRESS COMPONENTS ===
  progress_chart: {
    id: 'progress_chart',
    name: 'Progress Chart',
    description: 'Line/area charts showing progress over time',
    category: 'progress',
    complexity: 'moderate',
    requiresData: ['progressHistory']
  },

  completion_meter: {
    id: 'completion_meter',
    name: 'Completion Meter',
    description: 'Circular/linear progress meters with insights',
    category: 'progress',
    complexity: 'simple',
    requiresData: ['currentValue', 'targetValue']
  },

  milestone_timeline: {
    id: 'milestone_timeline',
    name: 'Milestone Timeline',
    description: 'Interactive timeline with key milestones',
    category: 'progress',
    complexity: 'moderate',
    requiresData: ['milestones', 'targetDate']
  },

  habit_tracker: {
    id: 'habit_tracker',
    name: 'Habit Tracker',
    description: 'Daily/weekly habit tracking with streaks',
    category: 'tracking',
    complexity: 'simple',
    requiresData: ['habits', 'completionData']
  },

  streak_counter: {
    id: 'streak_counter',
    name: 'Streak Counter',
    description: 'Track consecutive days/weeks of progress',
    category: 'tracking',
    complexity: 'simple',
    requiresData: ['streakData']
  },

  // === PLANNING COMPONENTS ===
  calendar_widget: {
    id: 'calendar_widget',
    name: 'Calendar Widget',
    description: 'Important dates and deadline management',
    category: 'planning',
    complexity: 'moderate',
    requiresData: ['events', 'deadlines']
  },

  project_timeline: {
    id: 'project_timeline',
    name: 'Project Timeline',
    description: 'Gantt-style project planning and tracking',
    category: 'planning',
    complexity: 'complex',
    requiresData: ['projectPhases', 'dependencies']
  },

  resource_library: {
    id: 'resource_library',
    name: 'Resource Library',
    description: 'Curated resources and learning materials',
    category: 'planning',
    complexity: 'simple',
    requiresData: ['resources', 'categories']
  },

  // === TRACKING COMPONENTS ===
  skill_assessment: {
    id: 'skill_assessment',
    name: 'Skill Assessment',
    description: 'Track skill levels and improvement over time',
    category: 'tracking',
    complexity: 'moderate',
    requiresData: ['skills', 'assessments']
  },

  weight_tracker: {
    id: 'weight_tracker',
    name: 'Weight Tracker',
    description: 'Track weight changes with trends and goals',
    category: 'tracking',
    complexity: 'simple',
    requiresData: ['weightHistory', 'targetWeight']
  },

  workout_tracker: {
    id: 'workout_tracker',
    name: 'Workout Tracker',
    description: 'Exercise logging and fitness progress',
    category: 'tracking',
    complexity: 'moderate',
    requiresData: ['workouts', 'exerciseHistory']
  },

  reading_tracker: {
    id: 'reading_tracker',
    name: 'Reading Tracker',
    description: 'Track books read, pages, and reading goals',
    category: 'tracking',
    complexity: 'simple',
    requiresData: ['books', 'readingProgress']
  },

  mood_tracker: {
    id: 'mood_tracker',
    name: 'Mood Tracker',
    description: 'Daily mood tracking with patterns analysis',
    category: 'tracking',
    complexity: 'simple',
    requiresData: ['moodHistory']
  },

  // === SPECIALIZED COMPONENTS ===
  travel_dashboard: {
    id: 'travel_dashboard',
    name: 'Travel Dashboard',
    description: 'Complete travel planning with flights, hotels, weather',
    category: 'specialized',
    complexity: 'complex',
    requiresData: ['destination', 'travelDates', 'budget']
  },

  learning_dashboard: {
    id: 'learning_dashboard',
    name: 'Learning Dashboard',
    description: 'Course progress, skill development, certifications',
    category: 'specialized',
    complexity: 'complex',
    requiresData: ['courses', 'skills', 'certifications']
  },

  health_dashboard: {
    id: 'health_dashboard',
    name: 'Health Dashboard',
    description: 'Comprehensive health and fitness tracking',
    category: 'specialized',
    complexity: 'complex',
    requiresData: ['healthMetrics', 'workouts', 'nutrition']
  },

  business_dashboard: {
    id: 'business_dashboard',
    name: 'Business Dashboard',
    description: 'Business metrics, revenue, market analysis',
    category: 'specialized',
    complexity: 'complex',
    requiresData: ['businessMetrics', 'revenue', 'marketData']
  },

  career_dashboard: {
    id: 'career_dashboard',
    name: 'Career Dashboard',
    description: 'Job search, networking, skill development tracking',
    category: 'specialized',
    complexity: 'complex',
    requiresData: ['jobApplications', 'networking', 'skills']
  },

  // === UTILITY COMPONENTS ===
  document_checklist: {
    id: 'document_checklist',
    name: 'Document Checklist',
    description: 'Track required documents and paperwork',
    category: 'planning',
    complexity: 'simple',
    requiresData: ['documents', 'requirements']
  },

  weather_widget: {
    id: 'weather_widget',
    name: 'Weather Widget',
    description: 'Weather forecasts for outdoor activities',
    category: 'planning',
    complexity: 'simple',
    requiresData: ['location', 'dates']
  },

  currency_converter: {
    id: 'currency_converter',
    name: 'Currency Converter',
    description: 'Real-time currency conversion for international goals',
    category: 'financial',
    complexity: 'simple',
    requiresData: ['currencies']
  },

  market_data: {
    id: 'market_data',
    name: 'Market Data',
    description: 'Stock prices, crypto, and market trends',
    category: 'financial',
    complexity: 'moderate',
    requiresData: ['symbols', 'markets']
  },

  goal_reflection: {
    id: 'goal_reflection',
    name: 'Goal Reflection',
    description: 'Journaling and reflection on progress',
    category: 'planning',
    complexity: 'simple',
    requiresData: ['reflections']
  },

  motivation_center: {
    id: 'motivation_center',
    name: 'Motivation Center',
    description: 'Inspirational quotes and progress celebrations',
    category: 'progress',
    complexity: 'simple',
    requiresData: ['achievements', 'milestones']
  },

  social_accountability: {
    id: 'social_accountability',
    name: 'Social Accountability',
    description: 'Share progress and get support from others',
    category: 'progress',
    complexity: 'moderate',
    requiresData: ['socialConnections', 'sharePreferences']
  }
};

// Component categories for easier filtering
export const COMPONENT_CATEGORIES = {
  CORE: ['financial_calculator', 'task_manager', 'agent_info'],
  FINANCIAL: ['simple_savings_tracker', 'budget_breakdown', 'expense_tracker', 'investment_tracker', 'debt_payoff_tracker', 'currency_converter', 'market_data'],
  PROGRESS: ['progress_chart', 'completion_meter', 'milestone_timeline', 'motivation_center', 'social_accountability'],
  PLANNING: ['calendar_widget', 'project_timeline', 'resource_library', 'document_checklist', 'weather_widget', 'goal_reflection'],
  TRACKING: ['habit_tracker', 'streak_counter', 'skill_assessment', 'weight_tracker', 'workout_tracker', 'reading_tracker', 'mood_tracker'],
  SPECIALIZED: ['travel_dashboard', 'learning_dashboard', 'health_dashboard', 'business_dashboard', 'career_dashboard']
};