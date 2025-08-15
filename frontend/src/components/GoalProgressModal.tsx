import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Circle, 
  Plus, 
  DollarSign, 
  Calendar,
  Clock,
  Trash2,
  Edit3,
  TrendingUp,
  Target
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface GoalStep {
  id: string;
  title: string;
  description?: string;
  stepOrder: number;
  estimatedCost?: number;
  estimatedDuration?: string;
  deadline?: string;
  completed: boolean;
  createdBy: string;
  createdAt: string;
}

interface GoalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: any;
  onGoalUpdated?: () => void;
}

const GoalProgressModal: React.FC<GoalProgressModalProps> = ({
  isOpen,
  onClose,
  goal,
  onGoalUpdated,
}) => {
  const [steps, setSteps] = useState<GoalStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);
  const [showAddStep, setShowAddStep] = useState(false);
  const [currentSaved, setCurrentSaved] = useState(goal?.currentSaved || 0);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    estimatedCost: '',
    estimatedDuration: '',
    deadline: '',
  });

  useEffect(() => {
    if (isOpen && goal) {
      loadSteps();
      setCurrentSaved(goal.currentSaved || 0);
    }
  }, [isOpen, goal]);

  const loadSteps = async () => {
    if (!goal?.id) return;
    
    setIsLoadingSteps(true);
    try {
      const response = await apiService.getGoalSteps(goal.id);
      if (response.success) {
        setSteps(response.steps);
      }
    } catch (error) {
      console.error('Error loading steps:', error);
      toast.error('Failed to load steps');
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStep.title.trim()) {
      toast.error('Step title is required');
      return;
    }

    try {
      const stepData = {
        title: newStep.title,
        description: newStep.description || undefined,
        estimatedCost: newStep.estimatedCost ? parseInt(newStep.estimatedCost) : undefined,
        estimatedDuration: newStep.estimatedDuration || undefined,
        deadline: newStep.deadline || undefined,
      };

      const response = await apiService.createGoalStep(goal.id, stepData);
      if (response.success) {
        setSteps(prev => [...prev, response.step]);
        setNewStep({
          title: '',
          description: '',
          estimatedCost: '',
          estimatedDuration: '',
          deadline: '',
        });
        setShowAddStep(false);
        toast.success('Step added successfully');
      }
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Failed to add step');
    }
  };

  const handleToggleStep = async (stepId: string, completed: boolean) => {
    try {
      const response = await apiService.updateGoalStep(goal.id, stepId, { completed });
      if (response.success) {
        setSteps(prev =>
          prev.map(step =>
            step.id === stepId ? { ...step, completed } : step
          )
        );
        onGoalUpdated?.();
        toast.success(completed ? 'Step completed!' : 'Step marked as incomplete');
      }
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const response = await apiService.deleteGoalStep(goal.id, stepId);
      if (response.success) {
        setSteps(prev => prev.filter(step => step.id !== stepId));
        toast.success('Step deleted');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const handleSavingsUpdate = async () => {
    try {
      const response = await apiService.updateGoalProgress(goal.id, currentSaved);
      if (response.success) {
        onGoalUpdated?.();
        toast.success('Progress updated!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getProgressPercentage = () => {
    if (!goal.estimatedCost) return 0;
    return Math.min(100, (currentSaved / goal.estimatedCost) * 100);
  };

  const getStepProgressPercentage = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{goal.title}</h2>
                <p className="text-sm text-gray-600">Track your progress and manage steps</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Progress */}
              {goal.estimatedCost && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Financial Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Saved</span>
                      <span className="font-medium">
                        ${currentSaved.toLocaleString()} / ${goal.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={currentSaved}
                        onChange={(e) => setCurrentSaved(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                      <button
                        onClick={handleSavingsUpdate}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Progress */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Step Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">
                      {steps.filter(s => s.completed).length} / {steps.length} steps
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getStepProgressPercentage()}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {Math.round(getStepProgressPercentage())}% complete
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Action Steps</h3>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </button>
              </div>

              {isLoadingSteps ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <button
                            onClick={() => handleToggleStep(step.id, !step.completed)}
                            className={`mt-0.5 ${step.completed ? 'text-green-600' : 'text-gray-400'} hover:scale-110 transition-transform`}
                          >
                            {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${step.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                              {step.title}
                            </h4>
                            {step.description && (
                              <p className={`text-sm mt-1 ${step.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                                {step.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {step.estimatedCost && (
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  ${step.estimatedCost.toLocaleString()}
                                </span>
                              )}
                              {step.estimatedDuration && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {step.estimatedDuration}
                                </span>
                              )}
                              {step.deadline && (
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(step.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                            title="Delete step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {steps.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No steps added yet. Break down your goal into actionable steps!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Step Form */}
              <AnimatePresence>
                {showAddStep && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-medium text-gray-900 mb-3">Add New Step</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Step title..."
                        value={newStep.title}
                        onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Step description (optional)..."
                        value={newStep.description}
                        onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="number"
                          placeholder="Cost ($)"
                          value={newStep.estimatedCost}
                          onChange={(e) => setNewStep(prev => ({ ...prev, estimatedCost: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g., 2 weeks)"
                          value={newStep.estimatedDuration}
                          onChange={(e) => setNewStep(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={newStep.deadline}
                          onChange={(e) => setNewStep(prev => ({ ...prev, deadline: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowAddStep(false);
                            setNewStep({
                              title: '',
                              description: '',
                              estimatedCost: '',
                              estimatedDuration: '',
                              deadline: '',
                            });
                          }}
                          className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddStep}
                          disabled={!newStep.title.trim()}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            newStep.title.trim()
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Add Step
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalProgressModal;