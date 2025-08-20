import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import { Loader2, Settings, Maximize2, Minimize2, RefreshCw, Target } from 'lucide-react';

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
  | 'social_accountability';

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

interface GoalDashboardLayout {
  goalId: string;
  goalType: string;
  components: DashboardComponent[];
  layout: 'default' | 'compact' | 'detailed';
  theme?: 'light' | 'dark' | 'auto';
  defaultDeadline: Date;
}

const DEFAULT_GOAL_SETTINGS = {
  DEADLINE_DAYS: 30,
  MIN_ESTIMATED_COST: 0,
  DEFAULT_PRIORITY: 'medium' as const,
  DEFAULT_STATUS: 'planning' as const,
};

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  targetDate?: string;
  estimatedCost?: number;
  currentSaved?: number;
  smartGoalData?: string;
  assignedAgents?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface GoalDashboardRendererProps {
  goal: Goal;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onUpdateTasks: (goalId: string, tasks: any[]) => void;
  className?: string;
}

const GoalDashboardRenderer: React.FC<GoalDashboardRendererProps> = ({
  goal,
  onUpdateGoal,
  onUpdateTasks,
  className = '',
}) => {
  const [dashboardLayout, setDashboardLayout] = useState<GoalDashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [componentRegistry] = useState(() => ComponentRegistry.getInstance());
  const [selectedComponent, setSelectedComponent] = useState<DashboardComponent | null>(null);

  // Parse smart goal data if available
  let smartData = null;
  try {
    smartData = goal.smartGoalData ? JSON.parse(goal.smartGoalData) : null;
  } catch (e) {
    console.error('Failed to parse smart goal data:', e);
  }

  // Set default deadline if not provided (1 month from creation)
  const targetDate = goal.targetDate || new Date(
    new Date(goal.createdAt).getTime() + DEFAULT_GOAL_SETTINGS.DEADLINE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const assignedAgents = goal.assignedAgents || smartData?.assignedAgents || [];
  const tasks = smartData?.goalDashboard?.tasks || [];

  useEffect(() => {
    generateDashboardLayout();
  }, [goal, componentRegistry]);

  const generateDashboardLayout = async () => {
    setLoading(true);
    
    try {
      // Generate components based on goal type and characteristics
      const components = componentRegistry.getComponentsForGoal(
        goal.category,
        assignedAgents,
        goal.estimatedCost || 0,
        !!targetDate
      );

      // Create the dashboard layout
      const layout: GoalDashboardLayout = {
        goalId: goal.id,
        goalType: goal.category,
        components,
        layout: 'default',
        theme: 'auto',
        defaultDeadline: new Date(targetDate),
      };

      setDashboardLayout(layout);
      
      // Set Smart Action Timeline as default selection
      if (components.length > 0 && !selectedComponent) {
        const timelineComponent = components.find(c => c.type === 'smart_action_timeline');
        setSelectedComponent(timelineComponent || components[0]);
      }
    } catch (error) {
      console.error('Failed to generate dashboard layout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshDashboard = async () => {
    setRefreshing(true);
    await generateDashboardLayout();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleComponentToggle = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const handleUpdateSavings = (amount: number) => {
    onUpdateGoal(goal.id, { currentSaved: amount });
  };

  const handleUpdateDeadline = (date: string) => {
    onUpdateGoal(goal.id, { targetDate: date });
  };

  const handleUpdateTasks = (updatedTasks: any[]) => {
    onUpdateTasks(goal.id, updatedTasks);
  };


  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Building Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Creating components...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardLayout) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Dashboard Generation Failed
              </h3>
              <p className="text-red-700 dark:text-red-300 max-w-md mx-auto">
                We couldn't create a dashboard layout for this goal. This might be a temporary issue.
              </p>
            </div>
            <button
              onClick={generateDashboardLayout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coreComponents = dashboardLayout.components.filter(comp => comp.required);
  const optionalComponents = dashboardLayout.components.filter(comp => !comp.required);
  
  // Reorder components to put Timeline & Milestones first
  const timelineComponent = dashboardLayout.components.find(comp => comp.type === 'milestone_timeline');
  const otherComponents = dashboardLayout.components.filter(comp => comp.type !== 'milestone_timeline');
  const orderedComponents = timelineComponent ? [timelineComponent, ...otherComponents] : dashboardLayout.components;

  return (
    <div className={`${className} flex gap-6`}>
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Sidebar Header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Components
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRefreshDashboard}
                  disabled={refreshing}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Component List */}
          <div className="p-3 space-y-2">
            {orderedComponents.map((component, index) => (
              <button
                key={component.id}
                onClick={() => setSelectedComponent(component)}
                className={`w-full text-left p-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedComponent?.id === component.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {component.title}
                  </span>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                    component.required ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {component.required ? 'Core component' : 'Optional component'}
                </div>
              </button>
            ))}
          </div>

          {/* AI Agents Footer */}
          {assignedAgents.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="font-medium mb-1">AI Agents Active:</div>
                <div className="space-y-1">
                  {assignedAgents.map(agent => (
                    <div key={agent} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>{agent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {selectedComponent ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Main Content Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedComponent.title}
                  </h1>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedComponent.required 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {selectedComponent.required ? 'Core' : 'Optional'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Updated {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                      Loading {selectedComponent.title}...
                    </span>
                  </div>
                }
              >
                {(() => {
                  const config = componentRegistry.getComponent(selectedComponent.type);
                  if (!config) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-red-600">Component not found: {selectedComponent.type}</p>
                      </div>
                    );
                  }

                  const Component = config.component;
                  const commonProps = {
                    goalId: goal.id,
                    ...config.defaultProps,
                    ...selectedComponent.props,
                  };

                  // Add specific props based on component type
                  let specificProps = {};
                  
                  switch (selectedComponent.type) {
                    case 'financial_calculator':
                      specificProps = {
                        estimatedCost: goal.estimatedCost || 0,
                        currentSaved: goal.currentSaved || 0,
                        targetDate,
                        onUpdateSavings: handleUpdateSavings,
                        onUpdateDeadline: handleUpdateDeadline,
                      };
                      break;
                    case 'task_manager':
                      specificProps = {
                        tasks,
                        onUpdateTasks: handleUpdateTasks,
                      };
                      break;
                    case 'agent_info':
                      specificProps = {
                        assignedAgents,
                        onRefreshAgents: handleRefreshDashboard,
                      };
                      break;
                  }

                  return <Component {...commonProps} {...specificProps} />;
                })()}
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Component
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a component from the sidebar to view and interact with it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalDashboardRenderer;