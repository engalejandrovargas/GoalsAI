import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  TrendingUp,
  Target
} from 'lucide-react';
import { apiService } from '../services/api';
import ActionPlanGenerator from './ActionPlanGenerator';
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
  initialTab?: 'progress' | 'action-plan';
}

const GoalProgressModal: React.FC<GoalProgressModalProps> = ({
  isOpen,
  onClose,
  goal,
  onGoalUpdated,
  initialTab = 'progress',
}) => {
  const [currentSaved, setCurrentSaved] = useState(goal?.currentSaved || 0);
  const [activeTab, setActiveTab] = useState<'progress' | 'action-plan'>(initialTab);

  useEffect(() => {
    if (isOpen && goal) {
      setCurrentSaved(goal.currentSaved || 0);
      setActiveTab(initialTab);
    }
  }, [isOpen, goal, initialTab]);

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

          {/* Tab Navigation */}
          <div className="px-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Financial Progress
              </button>
              <button
                onClick={() => setActiveTab('action-plan')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'action-plan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Action Plan
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'progress' ? (
              /* Financial Progress Tab */
              <div className="space-y-6">
                {/* Financial Progress */}
                {goal.estimatedCost && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Financial Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Saved</span>
                        <span className="font-medium">
                          ${currentSaved.toLocaleString()} / ${goal.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={currentSaved}
                          onChange={(e) => setCurrentSaved(Number(e.target.value))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          placeholder="Current amount saved"
                        />
                        <button
                          onClick={handleSavingsUpdate}
                          className="px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Update Progress
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>You're {Math.round(getProgressPercentage())}% of the way to your goal!</p>
                        {goal.targetDate && (
                          <p className="mt-1">
                            Target date: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Savings Breakdown */}
                {goal.estimatedCost && goal.targetDate && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Savings Plan
                    </h3>
                    
                    {(() => {
                      const now = new Date();
                      const target = new Date(goal.targetDate);
                      const monthsLeft = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                      const remaining = goal.estimatedCost - currentSaved;
                      const monthlyAmount = Math.max(0, remaining / monthsLeft);
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <p className="text-sm text-blue-600 font-medium">Monthly Target</p>
                              <p className="text-2xl font-bold text-blue-900">${monthlyAmount.toFixed(0)}</p>
                              <p className="text-xs text-blue-600">per month</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-sm text-green-600 font-medium">Remaining</p>
                              <p className="text-2xl font-bold text-green-900">${remaining.toLocaleString()}</p>
                              <p className="text-xs text-green-600">to save</p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                              <p className="text-sm text-orange-600 font-medium">Time Left</p>
                              <p className="text-2xl font-bold text-orange-900">{monthsLeft}</p>
                              <p className="text-xs text-orange-600">months</p>
                            </div>
                          </div>
                          
                          {monthlyAmount > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <Target className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="ml-3">
                                  <h4 className="text-sm font-medium text-yellow-800">Savings Tip</h4>
                                  <p className="text-sm text-yellow-700 mt-1">
                                    Set up an automatic transfer of ${monthlyAmount.toFixed(0)} per month to reach your goal by {target.toLocaleDateString()}.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* Action Plan Tab */
              <ActionPlanGenerator 
                goal={goal} 
                onStepsUpdated={() => {
                  onGoalUpdated?.();
                }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalProgressModal;