import React from 'react';

// Component types enum
export type ComponentType = 
  | 'financial_calculator'
  | 'task_manager'
  | 'agent_info'
  | 'progress_chart'
  | 'milestone_timeline'
  | 'completion_meter'
  | 'goal_health'
  | 'travel_dashboard'
  | 'learning_dashboard'
  | 'business_dashboard'
  | 'health_dashboard'
  | 'budget_breakdown'
  | 'calendar_widget'
  | 'weather_widget'
  | 'currency_converter'
  | 'document_checklist'
  | 'resource_library'
  | 'market_data';

// Component configuration interface
export interface ComponentConfig {
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  requirements?: {
    goalTypes?: string[];
    agents?: string[];
    minEstimatedCost?: number;
    hasDeadline?: boolean;
  };
}

// Dashboard component interface
export interface DashboardComponent {
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

// Goal dashboard layout interface
export interface GoalDashboardLayout {
  goalId: string;
  goalType: string;
  components: DashboardComponent[];
  layout: 'default' | 'compact' | 'detailed';
  theme?: 'light' | 'dark' | 'auto';
  defaultDeadline: Date;
}

// Layout template interface
export interface LayoutTemplate {
  name: string;
  description: string;
  goalTypes: string[];
  components: DashboardComponent[];
  responsive: {
    mobile: { cols: number; gap: number };
    tablet: { cols: number; gap: number };
    desktop: { cols: number; gap: number };
  };
}

// Default settings constant
export const DEFAULT_GOAL_SETTINGS = {
  DEADLINE_DAYS: 30,
  MIN_ESTIMATED_COST: 0,
  DEFAULT_PRIORITY: 'medium' as const,
  DEFAULT_STATUS: 'planning' as const,
};