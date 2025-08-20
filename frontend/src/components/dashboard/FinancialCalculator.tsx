import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  PiggyBank,
  Target,
  Plus,
  Minus,
  Zap,
  ArrowUp,
  ArrowDown,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface FinancialCalculatorProps {
  goalId: string;
  estimatedCost?: number;
  currentSaved?: number;
  targetDate?: string;
  onUpdateSavings?: (amount: number) => void;
  onUpdateDeadline?: (date: string) => void;
  showDailyView?: boolean;
  showWeeklyView?: boolean;
  showMonthlyView?: boolean;
  allowManualUpdate?: boolean;
}

type TimeView = 'daily' | 'weekly' | 'monthly';

const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  goalId,
  estimatedCost = 5000,
  currentSaved = 1200,
  targetDate,
  onUpdateSavings,
  onUpdateDeadline,
  allowManualUpdate = true,
}) => {
  const [activeView, setActiveView] = useState<TimeView>('monthly');
  const [currentAmount, setCurrentAmount] = useState(currentSaved);
  const [targetAmount, setTargetAmount] = useState(estimatedCost);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState(currentAmount);
  const [quickAmounts] = useState([50, 100, 250, 500, 1000]);
  const [showCelebration, setShowCelebration] = useState(false);

  const defaultTargetDate = targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const remaining = Math.max(0, targetAmount - currentAmount);
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  
  // Calculate days until deadline
  const today = new Date();
  const deadline = new Date(defaultTargetDate);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate required savings
  const dailyRequired = daysUntilDeadline > 0 ? remaining / daysUntilDeadline : 0;
  const weeklyRequired = dailyRequired * 7;
  const monthlyRequired = dailyRequired * 30;

  useEffect(() => {
    setCurrentAmount(currentSaved);
  }, [currentSaved]);

  const handleQuickAdd = (amount: number) => {
    const newAmount = currentAmount + amount;
    setCurrentAmount(newAmount);
    onUpdateSavings?.(newAmount);
    
    if (newAmount >= targetAmount && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleQuickSubtract = (amount: number) => {
    const newAmount = Math.max(0, currentAmount - amount);
    setCurrentAmount(newAmount);
    onUpdateSavings?.(newAmount);
  };

  const handleAmountEdit = () => {
    setCurrentAmount(tempAmount);
    onUpdateSavings?.(tempAmount);
    setIsEditingAmount(false);
  };

  const getTimeViewData = () => {
    switch (activeView) {
      case 'daily':
        return {
          label: 'Daily',
          amount: dailyRequired,
          period: 'per day',
          icon: Calendar,
          color: 'from-blue-500 to-blue-600',
        };
      case 'weekly':
        return {
          label: 'Weekly',
          amount: weeklyRequired,
          period: 'per week',
          icon: Calendar,
          color: 'from-green-500 to-green-600',
        };
      case 'monthly':
        return {
          label: 'Monthly',
          amount: monthlyRequired,
          period: 'per month',
          icon: Calendar,
          color: 'from-purple-500 to-purple-600',
        };
      default:
        return {
          label: 'Monthly',
          amount: monthlyRequired,
          period: 'per month',
          icon: Calendar,
          color: 'from-purple-500 to-purple-600',
        };
    }
  };

  const timeViewData = getTimeViewData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500 to-purple-600 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-sm rounded-2xl z-10"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                🎉 Goal Achieved! 🎉
              </h3>
              <p className="text-green-600 dark:text-green-400">
                You've reached your savings target!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Calculator</h3>
            <p className="text-gray-600 dark:text-gray-400">Smart savings planning & tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            progress >= 100 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : progress >= 75
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              : progress >= 50
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {progress.toFixed(0)}% Complete
          </span>
        </div>
      </div>

      {/* Main Progress Circle */}
      <div className="flex items-center justify-center mb-8 relative z-10">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <PiggyBank className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${currentAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              of ${targetAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ${remaining.toLocaleString()} remaining
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Current Savings</h4>
          <div className="flex items-center gap-2">
            {isEditingAmount ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempAmount}
                  onChange={(e) => setTempAmount(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleAmountEdit} className="p-1 text-green-600 hover:text-green-700">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingAmount(false)} className="p-1 text-gray-500 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempAmount(currentAmount);
                  setIsEditingAmount(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {quickAmounts.map((amount) => (
            <div key={amount} className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAdd(amount)}
                className="flex items-center justify-center gap-1 p-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 rounded-xl transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium">${amount}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickSubtract(amount)}
                className="flex items-center justify-center gap-1 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-xl transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
                <span className="text-sm">${amount}</span>
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Time View Selector */}
      <div className="mb-6 relative z-10">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {(['daily', 'weekly', 'monthly'] as TimeView[]).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeView === view
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Required Savings Display */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${timeViewData.color} rounded-2xl p-6 text-white relative z-10 overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Save {timeViewData.label}</h4>
              <p className="text-white/80 text-sm">To reach your goal on time</p>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              ${timeViewData.amount.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </span>
            <span className="text-white/80 text-lg">{timeViewData.period}</span>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{daysUntilDeadline} days left</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>${remaining.toLocaleString()} to go</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {progress >= 100 ? 'Complete!' : `${(progress).toFixed(0)}%`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <Calendar className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.max(0, daysUntilDeadline)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Days Left</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${(currentAmount / Math.max(1, 90 - daysUntilDeadline)).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialCalculator;