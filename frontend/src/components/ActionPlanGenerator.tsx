import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  DollarSign, 
  Clock,
  Brain,
  Target,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface ActionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  estimatedCost?: number;
  estimatedHours?: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  prerequisites?: string[];
  resources?: string[];
  tips?: string[];
}

interface Goal {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  targetDate: string;
  category: string;
}

interface ActionPlanGeneratorProps {
  goal: Goal;
  onStepsUpdated?: () => void;
}

const ActionPlanGenerator: React.FC<ActionPlanGeneratorProps> = ({ goal, onStepsUpdated }) => {
  const [steps, setSteps] = useState<ActionStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedCost: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    loadSteps();
  }, [goal.id]);

  const loadSteps = async () => {
    try {
      const response = await apiService.getGoalSteps(goal.id);
      if (response.success) {
        setSteps(response.steps);
      }
    } catch (error) {
      console.error('Error loading steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIActionPlan = async () => {
    setIsGenerating(true);
    try {
      // Call AI to generate comprehensive action plan
      const response = await apiService.request<{
        success: boolean;
        steps: ActionStep[];
      }>('/planning/generate-action-plan', {
        method: 'POST',
        body: JSON.stringify({
          goalId: goal.id,
          goal: {
            title: goal.title,
            description: goal.description,
            estimatedCost: goal.estimatedCost,
            targetDate: goal.targetDate,
            category: goal.category
          }
        })
      });

      if (response.success) {
        setSteps(response.steps);
        toast.success('AI Action Plan generated successfully!');
        onStepsUpdated?.();
      }
    } catch (error) {
      console.error('Error generating action plan:', error);
      toast.error('Failed to generate action plan');
      
      // Fallback: Generate some realistic steps based on goal
      generateFallbackSteps();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackSteps = async () => {
    // Try to use the backend service first
    try {
      const response = await apiService.request<{
        success: boolean;
        steps: ActionStep[];
      }>('/goals/steps/generate-basic', {
        method: 'POST',
        body: JSON.stringify({
          goalId: goal.id,
          category: goal.category,
          title: goal.title,
          estimatedCost: goal.estimatedCost,
          targetDate: goal.targetDate
        })
      });

      if (response.success && response.steps.length > 0) {
        setSteps(response.steps);
        toast.success('Basic action plan generated!');
        return;
      }
    } catch (error) {
      console.error('Failed to generate basic steps from backend:', error);
    }

    // Absolute fallback - create minimal steps that guide user to create their own
    const basicSteps: ActionStep[] = [
      {
        id: 'step-1',
        title: 'Define Your Goal Details',
        description: 'Break down your goal into specific, measurable components and timeline',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Make it specific and measurable',
          'Set a realistic timeline',
          'Identify success criteria'
        ]
      },
      {
        id: 'step-2',
        title: 'Create Action Steps',
        description: 'Add specific action steps using the "Add Step" button above',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Break down into small, actionable tasks',
          'Set due dates for each step',
          'Prioritize your most important actions'
        ]
      }
    ];

    // Add financial planning step if there's a cost involved
    if (goal.estimatedCost && goal.estimatedCost > 0) {
      const monthsToGoal = goal.targetDate 
        ? Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
        : 12;
      const monthlyAmount = Math.round(goal.estimatedCost / monthsToGoal);
      
      basicSteps.unshift({
        id: 'step-savings',
        title: 'Plan Your Savings Strategy',
        description: `Save approximately $${monthlyAmount.toLocaleString()}/month to reach your financial goal`,
        completed: false,
        estimatedCost: 0,
        priority: 'high',
        category: 'financial',
        tips: [
          'Set up automatic transfers to savings',
          'Review and adjust your budget',
          'Track your progress monthly'
        ]
      });
    }

    setSteps(basicSteps);
    toast.success('Basic plan created - customize it by adding your own steps!');
  };

  const toggleStepCompletion = async (stepId: string) => {
    try {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      await apiService.updateGoalStep(goal.id, stepId, {
        completed: !step.completed
      });

      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ));

      toast.success(step.completed ? 'Step marked incomplete' : 'Step completed! 🎉');
      onStepsUpdated?.();
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const addCustomStep = async () => {
    if (!newStep.title.trim()) {
      toast.error('Step title is required');
      return;
    }

    try {
      const stepData = {
        title: newStep.title,
        description: newStep.description,
        dueDate: newStep.dueDate || undefined,
        estimatedCost: newStep.estimatedCost ? parseFloat(newStep.estimatedCost) : undefined,
        priority: newStep.priority,
        completed: false
      };

      const response = await apiService.createGoalStep(goal.id, stepData);
      
      if (response.success) {
        setSteps(prev => [...prev, response.step]);
        setNewStep({
          title: '',
          description: '',
          dueDate: '',
          estimatedCost: '',
          priority: 'medium'
        });
        setShowAddStep(false);
        toast.success('Step added successfully!');
        onStepsUpdated?.();
      }
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Failed to add step');
    }
  };

  const deleteStep = async (stepId: string) => {
    try {
      await apiService.deleteGoalStep(goal.id, stepId);
      setSteps(prev => prev.filter(s => s.id !== stepId));
      toast.success('Step deleted');
      onStepsUpdated?.();
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading action plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Action Plan</h3>
            <p className="text-gray-600">{steps.length} steps • {completedSteps} completed</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercent)}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-3">
          <motion.div
            className="bg-blue-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Generate AI Plan Button */}
      {steps.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No action plan yet
          </h4>
          <p className="text-gray-600 mb-6">
            Let AI create a comprehensive, step-by-step action plan to achieve your goal.
          </p>
          <button
            onClick={generateAIActionPlan}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating AI Plan...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate AI Action Plan
              </>
            )}
          </button>
        </div>
      )}

      {/* Action Steps */}
      {steps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Action Steps</h4>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddStep(!showAddStep)}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </button>
              <button
                onClick={generateAIActionPlan}
                disabled={isGenerating}
                className="text-purple-600 hover:text-purple-700 flex items-center text-sm font-medium disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Regenerate with AI
              </button>
            </div>
          </div>

          {/* Add Step Form */}
          <AnimatePresence>
            {showAddStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h5 className="font-medium text-gray-900 mb-3">Add Custom Step</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newStep.title}
                      onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Research market trends"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newStep.priority}
                      onChange={(e) => setNewStep(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newStep.description}
                      onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Detailed description of what needs to be done..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newStep.dueDate}
                      onChange={(e) => setNewStep(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                    <input
                      type="number"
                      value={newStep.estimatedCost}
                      onChange={(e) => setNewStep(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomStep}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Step
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                } hover:shadow-sm transition-all`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleStepCompletion(step.id)}
                    className={`mt-1 p-1 rounded-full transition-colors ${
                      step.completed 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className={`font-medium ${
                          step.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h5>
                        {step.description && (
                          <p className={`text-sm mt-1 ${
                            step.completed ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {step.description}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(step.priority)}`}>
                            {step.priority} priority
                          </span>
                          
                          {step.estimatedCost && step.estimatedCost > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${step.estimatedCost.toLocaleString()}
                            </div>
                          )}
                          
                          {step.estimatedHours && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {step.estimatedHours}h
                            </div>
                          )}
                          
                          {step.dueDate && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(step.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Tips */}
                        {step.tips && step.tips.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center text-blue-700 text-xs font-medium mb-2">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Pro Tips
                            </div>
                            <ul className="text-xs text-blue-600 space-y-1">
                              {step.tips.slice(0, 3).map((tip, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlanGenerator;