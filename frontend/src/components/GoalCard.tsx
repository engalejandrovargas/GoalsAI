import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Target, TrendingUp, AlertTriangle, MessageCircle, Edit3 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  estimatedCost?: number;
  currentSaved: number;
  targetDate?: string;
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  redFlags?: any[];
  createdAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onChat?: (goal: Goal) => void;
  onViewDetails?: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onChat, onViewDetails }) => {
  const getFeasibilityColor = (score?: number) => {
    if (!score) return 'text-gray-500 bg-gray-100';
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 35) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const calculateProgress = () => {
    if (!goal.estimatedCost || goal.estimatedCost === 0) return 0;
    return Math.min(100, (goal.currentSaved / goal.estimatedCost) * 100);
  };

  const progress = calculateProgress();
  const hasRedFlags = goal.redFlags && goal.redFlags.length > 0;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {goal.title}
              </h3>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(goal.status)}`} />
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {goal.description}
            </p>
          </div>
          
          {goal.feasibilityScore && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ml-4 ${getFeasibilityColor(goal.feasibilityScore)}`}>
              {goal.feasibilityScore}%
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
            {goal.category}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(goal.priority)}`}>
            {goal.priority} priority
          </span>
        </div>

        {/* Progress Bar */}
        {goal.estimatedCost && goal.estimatedCost > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                ${goal.currentSaved.toLocaleString()} / ${goal.estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {goal.targetDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
            </div>
          )}
          {goal.estimatedCost && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${goal.estimatedCost.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Red Flags Warning */}
        {hasRedFlags && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-red-700 text-sm font-medium">
                Reality Check: {goal.redFlags![0].title}
              </span>
            </div>
            <p className="text-red-600 text-xs mt-1 ml-6">
              {goal.redFlags![0].explanation.substring(0, 100)}...
            </p>
          </motion.div>
        )}

        {/* Feasibility Summary */}
        {goal.feasibilityAnalysis && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">AI Assessment</span>
            </div>
            {goal.feasibilityAnalysis.breakdown && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">{goal.feasibilityAnalysis.breakdown.financial}%</div>
                  <div className="text-gray-500">Financial</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{goal.feasibilityAnalysis.breakdown.timeline}%</div>
                  <div className="text-gray-500">Timeline</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{goal.feasibilityAnalysis.breakdown.skills}%</div>
                  <div className="text-gray-500">Skills</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails?.(goal)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
          >
            <Target className="w-4 h-4 mr-2" />
            View Plan
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Goal"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          
          {onChat && (
            <button
              onClick={() => onChat(goal)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Chat about this goal"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GoalCard;