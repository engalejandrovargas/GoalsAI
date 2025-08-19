import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin,
  Brain,
  Target,
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus
} from 'lucide-react';

interface SmartGoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    estimatedCost?: number;
    currentSaved?: number;
    targetDate?: string;
    smartGoalData?: string;
    createdAt: string;
  };
  onUpdateProgress?: (goalId: string, amount: number) => void;
  onToggleTask?: (goalId: string, taskId: number) => void;
}

export const SmartGoalCard: React.FC<SmartGoalCardProps> = ({ 
  goal, 
  onUpdateProgress,
  onToggleTask 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [savingsInput, setSavingsInput] = useState(goal.currentSaved || 0);

  let smartData = null;
  try {
    smartData = goal.smartGoalData ? JSON.parse(goal.smartGoalData) : null;
  } catch (e) {
    console.error('Failed to parse smart goal data:', e);
  }

  const progressPercentage = goal.estimatedCost 
    ? Math.min(((goal.currentSaved || 0) / goal.estimatedCost) * 100, 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSavingsUpdate = () => {
    if (onUpdateProgress && savingsInput !== goal.currentSaved) {
      onUpdateProgress(goal.id, savingsInput);
    }
  };

  const handleTaskToggle = (taskId: number) => {
    if (onToggleTask) {
      onToggleTask(goal.id, taskId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {goal.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {goal.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                {goal.priority} priority
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                {goal.category}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {goal.targetDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(goal.targetDate).toLocaleDateString()}
                </div>
              )}
              {smartData?.assignedAgents && (
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  {smartData.assignedAgents.length} AI agents
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Created {new Date(goal.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Progress Bar */}
        {goal.estimatedCost && goal.estimatedCost > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Financial Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ${(goal.currentSaved || 0).toLocaleString()} / ${goal.estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {progressPercentage.toFixed(1)}% complete
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Smart Goal Dashboard */}
          {smartData?.goalDashboard && (
            <>
              {/* Financial Calculator */}
              {smartData.goalDashboard.financialCalculator && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Budget Breakdown
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {Object.entries(smartData.goalDashboard.financialCalculator.breakdown || {}).map(([category, data]: [string, any]) => (
                      <div key={category} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white capitalize text-sm mb-1">
                          {category}
                        </h5>
                        <p className="text-lg font-bold text-green-600">
                          ${data.estimated?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Saved: ${data.saved?.toLocaleString() || 0}
                        </p>
                      </div>
                    ))}
                  </div>

                  {smartData.goalDashboard.financialCalculator.savingsNeeded && (
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        💡 {smartData.goalDashboard.financialCalculator.savingsNeeded}
                      </p>
                    </div>
                  )}

                  {/* Savings Update */}
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Update savings:
                    </label>
                    <input
                      type="number"
                      value={savingsInput}
                      onChange={(e) => setSavingsInput(parseFloat(e.target.value) || 0)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-32 dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                    <button
                      onClick={handleSavingsUpdate}
                      disabled={savingsInput === goal.currentSaved}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* Task Checklist */}
              {smartData.goalDashboard.tasks && smartData.goalDashboard.tasks.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Action Checklist
                  </h4>
                  
                  <div className="space-y-2">
                    {smartData.goalDashboard.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleTaskToggle(task.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {task.task}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {task.category}
                            </span>
                            {task.deadline && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual Information */}
              {smartData.goalDashboard.contextualInfo && Object.keys(smartData.goalDashboard.contextualInfo).length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Contextual Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(smartData.goalDashboard.contextualInfo).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white capitalize text-sm mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Agents */}
              {smartData.assignedAgents && smartData.assignedAgents.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Agents Working on This Goal
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {smartData.assignedAgents.map((agent: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium capitalize"
                      >
                        {agent} Agent
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Basic Goal Information (fallback for non-smart goals) */}
          {!smartData?.goalDashboard && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Goal Details
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This goal hasn't been processed with our smart AI system yet. 
                Use the smart goal creation to get personalized dashboards, task lists, and financial calculators.
              </p>
              
              {goal.estimatedCost && goal.estimatedCost > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Update savings:
                  </label>
                  <input
                    type="number"
                    value={savingsInput}
                    onChange={(e) => setSavingsInput(parseFloat(e.target.value) || 0)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-32 dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                  <button
                    onClick={handleSavingsUpdate}
                    disabled={savingsInput === goal.currentSaved}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};