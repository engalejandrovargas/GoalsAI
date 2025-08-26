import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Settings, Maximize2, Minimize2, RefreshCw, 
  Target, X, Sparkles, TrendingUp, Calendar, DollarSign 
} from 'lucide-react';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import { enhancedGoalService } from '../../services/EnhancedGoalService';
import type { GoalWithDashboard } from '../../services/EnhancedGoalService';
import ErrorBoundary from '../ErrorBoundary';
import toast from 'react-hot-toast';

interface EnhancedGoalDashboardProps {
  goalId: string;
  onGoalUpdate?: (goal: GoalWithDashboard) => void;
  className?: string;
}

interface ComponentLayoutItem {
  id: string;
  component: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  data: any;
  priority: 'required' | 'contextual' | 'optional';
}

const EnhancedGoalDashboard: React.FC<EnhancedGoalDashboardProps> = ({
  goalId,
  onGoalUpdate,
  className = ''
}) => {
  const [goalWithDashboard, setGoalWithDashboard] = useState<GoalWithDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [componentRegistry] = useState(() => ComponentRegistry.getInstance());

  // Load goal and dashboard data
  useEffect(() => {
    loadGoalDashboard();
  }, [goalId]);

  const loadGoalDashboard = async () => {
    if (!goalId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading enhanced goal dashboard for:', goalId);
      const goal = await enhancedGoalService.getGoalWithDashboard(goalId);
      
      if (!goal) {
        setError('Goal not found');
        return;
      }

      setGoalWithDashboard(goal);
      onGoalUpdate?.(goal);
      
    } catch (err) {
      console.error('❌ Error loading goal dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goal dashboard');
      toast.error('Failed to load goal dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    if (!goalId) return;
    
    setRefreshing(true);
    try {
      console.log('🔄 Regenerating goal data...');
      const updatedGoal = await enhancedGoalService.regenerateGoalData(goalId);
      
      if (updatedGoal) {
        setGoalWithDashboard(updatedGoal);
        onGoalUpdate?.(updatedGoal);
        toast.success('🎉 Goal data refreshed with new estimates!');
      }
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      toast.error('Failed to refresh goal data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProgress = async (progress: number) => {
    if (!goalId) return;
    
    try {
      const updatedGoal = await enhancedGoalService.updateGoalProgress(goalId, progress);
      if (updatedGoal) {
        setGoalWithDashboard(updatedGoal);
        onGoalUpdate?.(updatedGoal);
        toast.success('Progress updated!');
      }
    } catch (err) {
      console.error('❌ Error updating progress:', err);
      toast.error('Failed to update progress');
    }
  };

  const organizeComponents = (): ComponentLayoutItem[] => {
    if (!goalWithDashboard) return [];

    const components: ComponentLayoutItem[] = [];
    const { dashboardComponents, componentData, estimation } = goalWithDashboard;

    // Organize components by priority and size
    const componentSizes: Record<string, 'small' | 'medium' | 'large' | 'extra-large'> = {
      // Large specialized dashboards
      'health_dashboard': 'extra-large',
      'learning_dashboard': 'extra-large', 
      'business_dashboard': 'extra-large',
      'career_dashboard': 'extra-large',
      
      // Medium components
      'progress_chart': 'large',
      'investment_tracker': 'large',
      'workout_tracker': 'large',
      'reading_tracker': 'large',
      'project_timeline': 'large',
      'milestone_timeline': 'large',
      'financial_calculator': 'medium',
      'budget_breakdown': 'medium',
      'task_manager': 'medium',
      'smart_action_timeline': 'medium',
      
      // Small components
      'completion_meter': 'small',
      'habit_tracker': 'small',
      'streak_counter': 'small',
      'mood_tracker': 'small',
      'agent_info': 'small',
      'calendar_widget': 'small',
      'weather_widget': 'small',
      'currency_converter': 'small'
    };

    dashboardComponents.forEach((componentId: string, index: number) => {
      const data = componentData[componentId] || {};
      const size = componentSizes[componentId] || 'medium';
      
      let priority: 'required' | 'contextual' | 'optional' = 'optional';
      if (estimation.requiredComponents.includes(componentId)) priority = 'required';
      else if (estimation.contextualComponents.includes(componentId)) priority = 'contextual';

      components.push({
        id: `${componentId}-${index}`,
        component: componentId,
        title: getComponentTitle(componentId),
        size,
        data,
        priority
      });
    });

    // Sort by priority and then by component importance
    return components.sort((a, b) => {
      const priorityOrder = { required: 0, contextual: 1, optional: 2 };
      const sizeOrder = { 'extra-large': 0, large: 1, medium: 2, small: 3 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return sizeOrder[a.size] - sizeOrder[b.size];
    });
  };

  const getComponentTitle = (componentId: string): string => {
    const titleMap: Record<string, string> = {
      'health_dashboard': 'Health & Fitness',
      'learning_dashboard': 'Learning Progress',
      'business_dashboard': 'Business Metrics',
      'career_dashboard': 'Career Development',
      'progress_chart': 'Progress Over Time',
      'financial_calculator': 'Financial Planning',
      'investment_tracker': 'Investment Portfolio',
      'budget_breakdown': 'Budget Overview',
      'task_manager': 'Action Items',
      'completion_meter': 'Completion Status',
      'habit_tracker': 'Daily Habits',
      'streak_counter': 'Current Streak',
      'agent_info': 'AI Assistants',
      'milestone_timeline': 'Key Milestones',
      'smart_action_timeline': 'Smart Actions',
      'workout_tracker': 'Workout Log',
      'reading_tracker': 'Reading Progress',
      'mood_tracker': 'Mood Tracking',
      'calendar_widget': 'Important Dates',
      'weather_widget': 'Weather Updates',
      'project_timeline': 'Project Phases',
      'resource_library': 'Resources',
      'document_checklist': 'Documents',
      'skill_assessment': 'Skill Levels',
      'currency_converter': 'Currency Exchange'
    };

    return titleMap[componentId] || componentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderComponent = (item: ComponentLayoutItem) => {
    const ComponentToRender = componentRegistry.getComponent(item.component);
    
    if (!ComponentToRender) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-sm">Component "{item.component}" not found</p>
        </div>
      );
    }

    const isExpanded = expandedComponent === item.id;
    const sizeClasses = {
      'small': 'col-span-1 row-span-1',
      'medium': 'col-span-1 md:col-span-2 row-span-1',
      'large': 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
      'extra-large': 'col-span-1 md:col-span-2 lg:col-span-4 row-span-3'
    };

    return (
      <motion.div
        key={item.id}
        className={`
          ${sizeClasses[item.size]}
          ${isExpanded ? 'col-span-full row-span-full' : ''}
          ${item.priority === 'required' ? 'ring-2 ring-blue-200' : ''}
          ${className}
        `}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          {/* Component Header */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                item.priority === 'required' ? 'bg-blue-500' :
                item.priority === 'contextual' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpandedComponent(isExpanded ? null : item.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Component Content */}
          <div className="p-4 h-[calc(100%-60px)] overflow-auto">
            <ErrorBoundary>
              <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
                <ComponentToRender 
                  {...item.data}
                  goalId={goalId}
                  expanded={isExpanded}
                  onUpdate={(data: any) => {
                    // Handle component data updates
                    console.log(`Component ${item.component} updated:`, data);
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <X className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadGoalDashboard}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!goalWithDashboard) {
    return (
      <div className="p-6 text-center text-gray-500">
        Goal not found
      </div>
    );
  }

  const components = organizeComponents();
  const currentProgress = Math.round((goalWithDashboard.currentSaved / goalWithDashboard.estimatedCost) * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">{goalWithDashboard.title}</h1>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 font-medium">AI Enhanced</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{goalWithDashboard.description}</p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="font-semibold text-gray-900">{currentProgress}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-gray-900">
                    ${goalWithDashboard.currentSaved.toLocaleString()} / ${goalWithDashboard.estimatedCost.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-semibold text-gray-900">{goalWithDashboard.estimation.timeframe}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleRefreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
              title="Regenerate data with AI"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
        <AnimatePresence>
          {components.map((item) => renderComponent(item))}
        </AnimatePresence>
      </div>

      {/* Empty State for No Components */}
      {components.length === 0 && (
        <div className="p-12 text-center bg-gray-50 rounded-xl">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Dashboard Components</h3>
          <p className="text-gray-500 mb-4">We couldn't generate dashboard components for this goal.</p>
          <button
            onClick={handleRefreshData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Generate Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedGoalDashboard;