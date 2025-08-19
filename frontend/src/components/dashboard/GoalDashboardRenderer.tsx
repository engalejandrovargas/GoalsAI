import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import { Loader2, Settings, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

// Local type definitions to avoid import issues
type ComponentType = 
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

  const renderComponent = (dashboardComponent: DashboardComponent) => {
    const config = componentRegistry.getComponent(dashboardComponent.type);
    if (!config) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Component "{dashboardComponent.type}" not found
          </p>
        </div>
      );
    }

    const Component = config.component;
    const isExpanded = expandedComponents.has(dashboardComponent.id);

    // Prepare common props for all components
    const commonProps = {
      goalId: goal.id,
      ...config.defaultProps,
      ...dashboardComponent.props,
    };

    // Add specific props based on component type
    let specificProps = {};
    
    switch (dashboardComponent.type) {
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
      case 'travel_dashboard':
        specificProps = {
          goalId: goal.id,
        };
        break;
    }

    const finalProps = { ...commonProps, ...specificProps };

    return (
      <motion.div
        key={dashboardComponent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative ${
          dashboardComponent.required ? 'ring-2 ring-blue-200' : ''
        }`}
      >
        {/* Component Header - Always show component title */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {dashboardComponent.title}
          </span>
          {!dashboardComponent.required && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Optional
            </span>
          )}
          {dashboardComponent.required && (
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              Required
            </span>
          )}
        </div>

        {/* Component Content - Always show all components */}
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading {dashboardComponent.title}...
                </span>
              </div>
            </div>
          }
        >
          <Component {...finalProps} />
        </Suspense>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
              Building your personalized dashboard...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardLayout) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Generate Dashboard
            </h3>
            <p className="text-red-700 mb-4">
              Unable to create a dashboard layout for this goal.
            </p>
            <button
              onClick={generateDashboardLayout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coreComponents = dashboardLayout.components.filter(comp => comp.required);
  const optionalComponents = dashboardLayout.components.filter(comp => !comp.required);

  return (
    <div className={`${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Goal Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized for your {goal.category} goal
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshDashboard}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Core Components (Always visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {coreComponents.map(renderComponent)}
        </div>

        {/* Optional Components (Expandable) */}
        {optionalComponents.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Additional Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {optionalComponents.map(renderComponent)}
            </div>
          </div>
        )}

        {/* Dashboard Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <div>
              Dashboard generated with {dashboardLayout.components.length} components
              {assignedAgents.length > 0 && (
                <span> • {assignedAgents.length} AI agent{assignedAgents.length !== 1 ? 's' : ''} assigned</span>
              )}
            </div>
            <div className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDashboardRenderer;