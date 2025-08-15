import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Brain,
  Edit3,
  Trash2,
  MoreVertical,
  Archive,
  Copy,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

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
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  redFlags?: any[];
  createdAt: string;
  updatedAt?: string;
}

interface GoalCardProps {
  goal: Goal;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (updateData: Partial<Goal>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onAnalyze: () => void;
  onShowProgress: () => void;
  getCategoryInfo: (category: string) => { value: string; label: string; color: string };
  getStatusInfo: (status: string) => { value: string; label: string; color: string };
  getPriorityInfo: (priority: string) => { value: string; label: string; color: string };
  getProgressPercentage: (goal: Goal) => number;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onAnalyze,
  onShowProgress,
  getCategoryInfo,
  getStatusInfo,
  getPriorityInfo,
  getProgressPercentage
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: goal.title,
    description: goal.description,
    status: goal.status,
    priority: goal.priority
  });

  const categoryInfo = getCategoryInfo(goal.category);
  const statusInfo = getStatusInfo(goal.status);
  const priorityInfo = getPriorityInfo(goal.priority);
  const progressPercentage = getProgressPercentage(goal);

  const handleSaveEdit = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: goal.title,
      description: goal.description,
      status: goal.status,
      priority: goal.priority
    });
    setIsEditing(false);
  };

  const getDaysUntilTarget = () => {
    if (!goal.targetDate) return null;
    const now = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilTarget();
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isDueSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const hasRedFlags = goal.redFlags && goal.redFlags.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl border-2 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
            />
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="font-semibold text-gray-900 text-lg w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                  {goal.title}
                </h3>
              )}
              
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="text-gray-600 text-sm w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {goal.description}
                </p>
              )}
            </div>
          </div>

          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 w-40">
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
                <button
                  onClick={() => {
                    onShowProgress();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Progress
                </button>
                <button
                  onClick={() => {
                    onAnalyze();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analyze
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onArchive();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="pivoted">Pivoted</option>
            </select>
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
          
          {isEditing ? (
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
          )}

          {goal.feasibilityScore && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              goal.feasibilityScore >= 80 ? 'bg-green-100 text-green-700' :
              goal.feasibilityScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {goal.feasibilityScore}% feasible
            </span>
          )}
        </div>

        {/* Progress Bar (Financial) */}
        {goal.estimatedCost && goal.estimatedCost > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Financial Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>${(goal.currentSaved || 0).toLocaleString()} saved</span>
              <span>${goal.estimatedCost.toLocaleString()} goal</span>
            </div>
          </div>
        )}

        {/* Red Flags Warning */}
        {hasRedFlags && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-red-700 text-sm font-medium">
                Reality Check: {goal.redFlags![0].title}
              </span>
            </div>
            <p className="text-red-600 text-xs mt-1 ml-6">
              {goal.redFlags![0].explanation.substring(0, 80)}...
            </p>
          </motion.div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {goal.targetDate && (
              <div className={`flex items-center ${
                isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3 mr-1" />
                {isOverdue ? (
                  <span>Overdue by {Math.abs(daysLeft!)} days</span>
                ) : daysLeft !== null ? (
                  <span>{daysLeft} days left</span>
                ) : (
                  <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                )}
              </div>
            )}
            
            {goal.estimatedCost && (
              <div className="flex items-center text-gray-500">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>${goal.estimatedCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {goal.status === 'completed' && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {isOverdue && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {isDueSoon && (
              <Clock className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        )}

        {/* Expand Details */}
        {!isEditing && (goal.feasibilityAnalysis || showDetails) && (
          <div className="pt-3 border-t border-gray-200 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-xs text-blue-600 hover:text-blue-700"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show Details
                </>
              )}
            </button>

            {showDetails && goal.feasibilityAnalysis && (
              <div className="mt-2 text-xs text-gray-600">
                {goal.feasibilityAnalysis.challenges && (
                  <div className="mb-2">
                    <strong>Challenges:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {goal.feasibilityAnalysis.challenges.slice(0, 2).map((challenge: string, index: number) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {goal.feasibilityAnalysis.recommendations && (
                  <div>
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {goal.feasibilityAnalysis.recommendations.slice(0, 2).map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GoalCard;