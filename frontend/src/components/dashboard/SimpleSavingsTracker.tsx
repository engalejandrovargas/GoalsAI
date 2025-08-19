import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Plus, Minus, Target, Calendar } from 'lucide-react';
import { mockFinancialData } from '../../data/mockData';

interface SimpleSavingsTrackerProps {
  goalId: string;
  targetAmount?: number;
  currentSaved?: number;
  targetDate?: string;
  onUpdateSavings?: (amount: number) => void;
}

const SimpleSavingsTracker: React.FC<SimpleSavingsTrackerProps> = ({
  goalId,
  targetAmount = mockFinancialData.targetAmount,
  currentSaved = mockFinancialData.currentSaved,
  targetDate,
  onUpdateSavings
}) => {
  const [savings, setSavings] = useState(currentSaved);
  const [quickAmount, setQuickAmount] = useState(50);

  const progressPercentage = Math.min((savings / targetAmount) * 100, 100);
  const remainingAmount = Math.max(targetAmount - savings, 0);
  const daysUntilTarget = targetDate ? Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const dailySavingsNeeded = daysUntilTarget ? remainingAmount / daysUntilTarget : 0;

  const handleQuickAdd = () => {
    const newAmount = savings + quickAmount;
    setSavings(newAmount);
    onUpdateSavings?.(newAmount);
  };

  const handleQuickSubtract = () => {
    const newAmount = Math.max(0, savings - quickAmount);
    setSavings(newAmount);
    onUpdateSavings?.(newAmount);
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-green-500';
    if (progressPercentage >= 75) return 'bg-blue-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressColorLight = () => {
    if (progressPercentage >= 100) return 'bg-green-100 text-green-800';
    if (progressPercentage >= 75) return 'bg-blue-100 text-blue-800';
    if (progressPercentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simple Savings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColorLight()}`}>
          {progressPercentage.toFixed(1)}% Complete
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
              className={progressPercentage >= 100 ? 'text-green-500' : 'text-blue-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${savings.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">of ${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <Target className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Remaining</span>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${remainingAmount.toLocaleString()}
          </div>
        </div>
        
        {daysUntilTarget && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Daily Need</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${dailySavingsNeeded.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Amount
          </label>
          <input
            type="number"
            value={quickAmount}
            onChange={(e) => setQuickAmount(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="1"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add ${quickAmount}
          </button>
          <button
            onClick={handleQuickSubtract}
            disabled={savings < quickAmount}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4 mr-2" />
            Remove ${quickAmount}
          </button>
        </div>
      </div>

      {/* Motivational Message */}
      {progressPercentage >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-400">Goal Achieved! 🎉</h4>
              <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                Congratulations on reaching your savings target!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SimpleSavingsTracker;