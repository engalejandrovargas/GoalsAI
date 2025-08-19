import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  PiggyBank,
  Target,
  Plus,
  Minus,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface FinancialCalculatorProps {
  goalId: string;
  estimatedCost: number;
  currentSaved: number;
  targetDate?: string;
  onUpdateSavings: (amount: number) => void;
  onUpdateDeadline: (date: string) => void;
  showDailyView?: boolean;
  showWeeklyView?: boolean;
  showMonthlyView?: boolean;
  allowManualUpdate?: boolean;
}

type TimeView = 'daily' | 'weekly' | 'monthly';

const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  goalId,
  estimatedCost,
  currentSaved = 0,
  targetDate,
  onUpdateSavings,
  onUpdateDeadline,
  showDailyView = true,
  showWeeklyView = true,
  showMonthlyView = true,
  allowManualUpdate = true,
}) => {
  const [activeView, setActiveView] = useState<TimeView>('monthly');
  const [savingsInput, setSavingsInput] = useState(currentSaved);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempDeadline, setTempDeadline] = useState('');
  const [quickAmounts] = useState([50, 100, 250, 500, 1000]);

  // Set default deadline to 1 month from now if not provided
  const defaultDeadline = targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const [currentDeadline, setCurrentDeadline] = useState(defaultDeadline);

  useEffect(() => {
    setSavingsInput(currentSaved);
  }, [currentSaved]);

  useEffect(() => {
    if (targetDate) {
      setCurrentDeadline(targetDate);
    }
  }, [targetDate]);

  const calculateTimeRemaining = () => {
    const deadline = new Date(currentDeadline);
    const now = new Date();
    const diffTime = Math.abs(deadline.getTime() - now.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    return {
      days: diffDays,
      weeks: Math.ceil(diffDays / 7),
      months: Math.ceil(diffDays / 30),
    };
  };

  const calculateSavingsNeeded = () => {
    const remaining = Math.max(0, estimatedCost - currentSaved);
    const timeRemaining = calculateTimeRemaining();
    
    return {
      total: remaining,
      daily: Math.ceil(remaining / timeRemaining.days),
      weekly: Math.ceil(remaining / timeRemaining.weeks),
      monthly: Math.ceil(remaining / timeRemaining.months),
    };
  };

  const getProgressPercentage = () => {
    if (estimatedCost === 0) return 0;
    return Math.min(100, (currentSaved / estimatedCost) * 100);
  };

  const handleSavingsUpdate = () => {
    if (savingsInput !== currentSaved && allowManualUpdate) {
      onUpdateSavings(savingsInput);
    }
  };

  const handleQuickAdd = (amount: number) => {
    const newAmount = currentSaved + amount;
    setSavingsInput(newAmount);
    if (allowManualUpdate) {
      onUpdateSavings(newAmount);
    }
  };

  const handleQuickSubtract = (amount: number) => {
    const newAmount = Math.max(0, currentSaved - amount);
    setSavingsInput(newAmount);
    if (allowManualUpdate) {
      onUpdateSavings(newAmount);
    }
  };

  const handleDeadlineEdit = () => {
    setTempDeadline(currentDeadline.split('T')[0]);
    setIsEditingDeadline(true);
  };

  const handleDeadlineSave = () => {
    if (tempDeadline) {
      const newDeadline = new Date(tempDeadline).toISOString();
      setCurrentDeadline(newDeadline);
      onUpdateDeadline(newDeadline);
    }
    setIsEditingDeadline(false);
  };

  const handleDeadlineCancel = () => {
    setTempDeadline('');
    setIsEditingDeadline(false);
  };

  const savingsNeeded = calculateSavingsNeeded();
  const progressPercentage = getProgressPercentage();
  const isGoalReached = currentSaved >= estimatedCost;
  const timeRemaining = calculateTimeRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Financial Calculator
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Target className="w-4 h-4" />
          <span>${estimatedCost.toLocaleString()} goal</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress to Goal
          </span>
          <span className="text-lg font-bold text-green-600">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-4 rounded-full ${
              isGoalReached 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>${currentSaved.toLocaleString()} saved</span>
          <span>${savingsNeeded.total.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Deadline Section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Target Deadline
          </span>
          <button
            onClick={handleDeadlineEdit}
            className="p-1 text-gray-500 hover:text-blue-600 rounded"
            title="Edit deadline"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        
        {isEditingDeadline ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={tempDeadline}
              onChange={(e) => setTempDeadline(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={handleDeadlineSave}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeadlineCancel}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(currentDeadline).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {timeRemaining.days} days ({timeRemaining.weeks} weeks)
            </div>
          </div>
        )}
      </div>

      {/* Savings Calculator Tabs */}
      <div className="mb-6">
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-4">
          {[
            { key: 'daily', label: 'Daily', show: showDailyView },
            { key: 'weekly', label: 'Weekly', show: showWeeklyView },
            { key: 'monthly', label: 'Monthly', show: showMonthlyView }
          ].filter(tab => tab.show).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as TimeView)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.key
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Savings Amount Display */}
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">
              Save {activeView === 'daily' ? 'per day' : activeView === 'weekly' ? 'per week' : 'per month'}
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            ${savingsNeeded[activeView].toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            to reach your goal on time
          </div>
        </div>
      </div>

      {/* Current Savings Update */}
      {allowManualUpdate && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Savings
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={savingsInput}
                onChange={(e) => setSavingsInput(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter amount saved..."
                min="0"
                max={estimatedCost * 1.5}
              />
            </div>
            <button
              onClick={handleSavingsUpdate}
              disabled={savingsInput === currentSaved}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <PiggyBank className="w-4 h-4" />
              Update
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Add/Remove
        </label>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <div key={amount} className="flex gap-1">
              <button
                onClick={() => handleQuickAdd(amount)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
              >
                <Plus className="w-3 h-3" />
                ${amount}
              </button>
              <button
                onClick={() => handleQuickSubtract(amount)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
              >
                <Minus className="w-3 h-3" />
                ${amount}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Status */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        isGoalReached 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}>
        {isGoalReached ? (
          <>
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-green-800 dark:text-green-300 font-semibold">
                🎉 Goal Achieved!
              </div>
              <div className="text-green-600 dark:text-green-400 text-sm">
                You've saved enough to reach your goal
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-semibold">
                Keep Saving!
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                ${savingsNeeded.total.toLocaleString()} more to reach your goal
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FinancialCalculator;