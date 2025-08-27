// Goal category to component mapping with contextual intelligence

export interface GoalCategoryConfig {
  id: string;
  name: string;
  description: string;
  defaultDeadlineDays: number;
  defaultEstimatedCost: number;
  defaultComponents: string[]; // Max 4 - Always shown by default
  optionalComponents: string[]; // User can choose to add these
  suggestedAgents: string[];
  examples: string[];
}

export const GOAL_CATEGORY_MAPPING: Record<string, GoalCategoryConfig> = {
  // === FINANCIAL GOALS ===
  savings: {
    id: 'savings',
    name: 'Savings & Money',
    description: 'Save money for specific purposes or general financial security',
    defaultDeadlineDays: 180, // 6 months
    defaultEstimatedCost: 5000,
    defaultComponents: ['simple_savings_tracker', 'financial_calculator', 'progress_chart', 'agent_info'], // Max 4
    optionalComponents: ['completion_meter', 'milestone_timeline', 'budget_breakdown', 'expense_tracker', 'habit_tracker', 'task_manager', 'calendar_widget', 'streak_counter', 'smart_action_timeline'],
    suggestedAgents: ['financial'],
    examples: ['Save $5000 for emergency fund', 'Save for vacation', 'Save for down payment']
  },

  investment: {
    id: 'investment',
    name: 'Investment & Wealth Building',
    description: 'Build wealth through investments and financial planning',
    defaultDeadlineDays: 1825, // 5 years
    defaultEstimatedCost: 50000,
    defaultComponents: ['investment_tracker', 'financial_calculator', 'progress_chart', 'agent_info'],
    optionalComponents: ['milestone_timeline', 'budget_breakdown', 'progress_dashboard', 'smart_action_timeline', 'currency_converter', 'task_manager', 'calendar_widget', 'resource_library', 'reading_tracker'],
    suggestedAgents: ['financial', 'research'],
    examples: ['Build $50k investment portfolio', 'Retire by 40', 'Generate passive income']
  },

  debt_payoff: {
    id: 'debt_payoff',
    name: 'Debt Elimination',
    description: 'Pay off debts and achieve financial freedom',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 25000,
    defaultComponents: ['debt_payoff_tracker', 'financial_calculator', 'progress_chart', 'agent_info'],
    optionalComponents: ['milestone_timeline', 'budget_breakdown', 'expense_tracker', 'completion_meter', 'habit_tracker', 'calendar_widget', 'task_manager', 'smart_action_timeline', 'mood_tracker'],
    suggestedAgents: ['financial'],
    examples: ['Pay off credit card debt', 'Eliminate student loans', 'Become debt-free']
  },

  // === LEARNING & EDUCATION ===
  language: {
    id: 'language',
    name: 'Language Learning',
    description: 'Learn a new language or improve language skills',
    defaultDeadlineDays: 730, // 2 years
    defaultEstimatedCost: 500,
    defaultComponents: ['learning_dashboard', 'habit_tracker', 'streak_counter', 'agent_info'],
    optionalComponents: ['skill_assessment', 'progress_chart', 'milestone_timeline', 'reading_tracker', 'resource_library', 'calendar_widget', 'task_manager', 'mood_tracker', 'progress_dashboard'],
    suggestedAgents: ['learning', 'research'],
    examples: ['Learn Spanish fluently', 'Pass TOEFL exam', 'Become conversational in French']
  },

  education: {
    id: 'education',
    name: 'Education & Certification',
    description: 'Complete courses, get certified, or pursue formal education',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 2000,
    defaultComponents: ['learning_dashboard', 'progress_chart', 'resource_library', 'agent_info'],
    optionalComponents: ['project_timeline', 'skill_assessment', 'reading_tracker', 'task_manager', 'calendar_widget', 'document_checklist', 'budget_breakdown', 'completion_meter', 'milestone_timeline'],
    suggestedAgents: ['learning', 'research'],
    examples: ['Get AWS certification', 'Complete MBA', 'Learn data science']
  },

  skill_development: {
    id: 'skill_development',
    name: 'Skill Development',
    description: 'Develop specific professional or personal skills',
    defaultDeadlineDays: 180, // 6 months
    defaultEstimatedCost: 500,
    defaultComponents: ['learning_dashboard', 'skill_assessment', 'progress_chart', 'agent_info'],
    optionalComponents: ['resource_library', 'project_timeline', 'habit_tracker', 'streak_counter', 'reading_tracker', 'task_manager', 'calendar_widget', 'completion_meter', 'progress_dashboard'],
    suggestedAgents: ['learning', 'research'],
    examples: ['Master React development', 'Improve public speaking', 'Learn photography']
  },

  // === HEALTH & FITNESS ===
  weight_loss: {
    id: 'weight_loss',
    name: 'Weight Loss',
    description: 'Lose weight and improve body composition',
    defaultDeadlineDays: 180, // 6 months
    defaultEstimatedCost: 1000,
    defaultComponents: ['health_dashboard', 'weight_tracker', 'habit_tracker', 'agent_info'],
    optionalComponents: ['workout_tracker', 'progress_chart', 'milestone_timeline', 'completion_meter', 'streak_counter', 'mood_tracker', 'calendar_widget', 'task_manager', 'smart_action_timeline', 'budget_breakdown'],
    suggestedAgents: ['health', 'research'],
    examples: ['Lose 30 pounds', 'Reach target BMI', 'Fit into old clothes']
  },

  fitness: {
    id: 'fitness',
    name: 'Fitness & Exercise',
    description: 'Improve fitness level and build healthy exercise habits',
    defaultDeadlineDays: 90, // 3 months
    defaultEstimatedCost: 500,
    defaultComponents: ['health_dashboard', 'workout_tracker', 'habit_tracker', 'agent_info'],
    optionalComponents: ['progress_chart', 'streak_counter', 'milestone_timeline', 'completion_meter', 'calendar_widget', 'task_manager', 'mood_tracker', 'progress_dashboard', 'resource_library'],
    suggestedAgents: ['health'],
    examples: ['Run a 5K', 'Build muscle mass', 'Exercise 5x per week']
  },

  wellness: {
    id: 'wellness',
    name: 'Health & Wellness',
    description: 'Improve overall health and wellbeing',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 1500,
    defaultComponents: ['health_dashboard', 'habit_tracker', 'mood_tracker', 'agent_info'],
    optionalComponents: ['progress_chart', 'milestone_timeline', 'streak_counter', 'completion_meter', 'workout_tracker', 'calendar_widget', 'task_manager', 'reading_tracker', 'resource_library'],
    suggestedAgents: ['health', 'research'],
    examples: ['Improve sleep quality', 'Reduce stress', 'Build healthy routines']
  },

  // === TRAVEL ===
  travel: {
    id: 'travel',
    name: 'Travel & Adventure',
    description: 'Plan and save for travel experiences',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 5000,
    defaultComponents: ['travel_dashboard', 'financial_calculator', 'weather_widget', 'agent_info'],
    optionalComponents: ['smart_action_timeline', 'progress_dashboard', 'budget_breakdown', 'currency_converter', 'document_checklist', 'calendar_widget', 'expense_tracker', 'task_manager', 'milestone_timeline', 'resource_library'],
    suggestedAgents: ['travel', 'financial', 'weather'],
    examples: ['Trip to Japan', 'European backpacking', 'Family vacation to Disney']
  },

  // === IMMIGRATION ===
  immigration: {
    id: 'immigration',
    name: 'Immigration & Legal',
    description: 'Navigate immigration processes and legal requirements',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 5000,
    defaultComponents: ['document_checklist', 'project_timeline', 'task_manager', 'agent_info'],
    optionalComponents: ['financial_calculator', 'calendar_widget', 'milestone_timeline', 'progress_chart', 'budget_breakdown', 'expense_tracker', 'resource_library', 'completion_meter', 'progress_dashboard'],
    suggestedAgents: ['research'],
    examples: ['Get permanent residency', 'Apply for citizenship', 'Work visa application']
  },

  // === CAREER & BUSINESS ===
  career: {
    id: 'career',
    name: 'Career Development',
    description: 'Advance career, change jobs, or develop professionally',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 2000,
    defaultComponents: ['career_dashboard', 'skill_assessment', 'task_manager', 'agent_info'],
    optionalComponents: ['project_timeline', 'learning_dashboard', 'resource_library', 'milestone_timeline', 'document_checklist', 'calendar_widget', 'reading_tracker', 'progress_chart', 'completion_meter'],
    suggestedAgents: ['research', 'learning'],
    examples: ['Get promoted', 'Change careers', 'Find dream job']
  },

  business: {
    id: 'business',
    name: 'Business & Entrepreneurship',
    description: 'Start a business, launch a product, or grow a company',
    defaultDeadlineDays: 730, // 2 years
    defaultEstimatedCost: 10000,
    defaultComponents: ['business_dashboard', 'financial_calculator', 'project_timeline', 'agent_info'],
    optionalComponents: ['budget_breakdown', 'milestone_timeline', 'task_manager', 'progress_chart', 'resource_library', 'document_checklist', 'expense_tracker', 'calendar_widget', 'reading_tracker'],
    suggestedAgents: ['research', 'financial', 'business'],
    examples: ['Launch startup', 'Open restaurant', 'Build SaaS product']
  },

  // === PERSONAL DEVELOPMENT ===
  habits: {
    id: 'habits',
    name: 'Habit Building',
    description: 'Build positive habits and break negative ones',
    defaultDeadlineDays: 90, // 3 months
    defaultEstimatedCost: 100,
    defaultComponents: ['habit_tracker', 'streak_counter', 'completion_meter', 'agent_info'],
    optionalComponents: ['progress_chart', 'mood_tracker', 'milestone_timeline', 'smart_action_timeline', 'calendar_widget', 'task_manager', 'reading_tracker', 'progress_dashboard', 'resource_library'],
    suggestedAgents: ['research'],
    examples: ['Read daily', 'Meditate every morning', 'Quit smoking']
  },

  creative: {
    id: 'creative',
    name: 'Creative Projects',
    description: 'Complete creative endeavors and artistic projects',
    defaultDeadlineDays: 180, // 6 months
    defaultEstimatedCost: 500,
    defaultComponents: ['project_timeline', 'task_manager', 'progress_chart', 'agent_info'],
    optionalComponents: ['milestone_timeline', 'resource_library', 'habit_tracker', 'completion_meter', 'calendar_widget', 'reading_tracker', 'mood_tracker', 'progress_dashboard', 'skill_assessment'],
    suggestedAgents: ['research'],
    examples: ['Write a novel', 'Create art portfolio', 'Compose album']
  },

  relationships: {
    id: 'relationships',
    name: 'Relationships & Social',
    description: 'Improve relationships and social connections',
    defaultDeadlineDays: 180, // 6 months
    defaultEstimatedCost: 200,
    defaultComponents: ['mood_tracker', 'habit_tracker', 'task_manager', 'agent_info'],
    optionalComponents: ['milestone_timeline', 'progress_chart', 'calendar_widget', 'completion_meter', 'resource_library', 'reading_tracker', 'progress_dashboard', 'smart_action_timeline', 'streak_counter'],
    suggestedAgents: ['research'],
    examples: ['Improve marriage', 'Make new friends', 'Better work relationships']
  },

  // === READING GOALS ===
  reading: {
    id: 'reading',
    name: 'Reading & Literature',
    description: 'Read books, improve reading habits, and expand knowledge',
    defaultDeadlineDays: 365, // 1 year
    defaultEstimatedCost: 300,
    defaultComponents: ['reading_tracker', 'habit_tracker', 'streak_counter', 'agent_info'],
    optionalComponents: ['progress_chart', 'milestone_timeline', 'completion_meter', 'resource_library', 'calendar_widget', 'task_manager', 'mood_tracker', 'progress_dashboard', 'skill_assessment'],
    suggestedAgents: ['research'],
    examples: ['Read 52 books this year', 'Read all Shakespeare plays', 'Complete personal library']
  },

  // === SIMPLE CATEGORIES ===
  general: {
    id: 'general',
    name: 'General Goal',
    description: 'Generic goal that doesn\'t fit specific categories',
    defaultDeadlineDays: 90, // 3 months
    defaultEstimatedCost: 500,
    defaultComponents: ['progress_chart', 'task_manager', 'completion_meter', 'agent_info'],
    optionalComponents: ['milestone_timeline', 'calendar_widget', 'smart_action_timeline', 'progress_dashboard', 'financial_calculator', 'budget_breakdown', 'habit_tracker', 'resource_library', 'project_timeline'],
    suggestedAgents: ['research'],
    examples: ['Complete personal project', 'Achieve life goal', 'Finish important task']
  }
};

// Quick access arrays for the UI
export const GOAL_CATEGORIES = Object.values(GOAL_CATEGORY_MAPPING);

export const CATEGORY_NAMES = Object.keys(GOAL_CATEGORY_MAPPING);

// Helper function to get components for a category
export function getComponentsForCategory(categoryId: string, includeOptional: boolean = false): {
  defaultComponents: string[];
  optionalComponents: string[];
} {
  const category = GOAL_CATEGORY_MAPPING[categoryId];
  if (!category) return { defaultComponents: [], optionalComponents: [] };
  
  return {
    defaultComponents: [...category.defaultComponents],
    optionalComponents: includeOptional ? [...category.optionalComponents] : []
  };
}

// Helper function to get default settings for a category
export function getDefaultsForCategory(categoryId: string): {
  deadlineDays: number;
  estimatedCost: number;
  suggestedAgents: string[];
} {
  const category = GOAL_CATEGORY_MAPPING[categoryId] || GOAL_CATEGORY_MAPPING.general;
  return {
    deadlineDays: category.defaultDeadlineDays,
    estimatedCost: category.defaultEstimatedCost,
    suggestedAgents: category.suggestedAgents,
  };
}