import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Calendar, TrendingUp } from 'lucide-react';

interface CompletionMeterProps {
  goalId: string;
  style?: 'circular' | 'linear' | 'semicircle';
  showPercentage?: boolean;
  animated?: boolean;
  currentValue?: number;
  targetValue?: number;
  completedTasks?: number;
  totalTasks?: number;
  daysRemaining?: number;
  size?: 'sm' | 'md' | 'lg';
}

const CompletionMeter: React.FC<CompletionMeterProps> = ({
  goalId,
  style = 'circular',
  showPercentage = true,
  animated = true,
  currentValue = 450,
  targetValue = 1000,
  completedTasks = 7,
  totalTasks = 12,
  daysRemaining = 18,
  size = 'md',
}) => {
  const progressPercentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  const taskProgressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const sizeClasses = {
    sm: { container: 'w-32 h-32', stroke: 6, text: 'text-lg' },
    md: { container: 'w-40 h-40', stroke: 8, text: 'text-xl' },
    lg: { container: 'w-48 h-48', stroke: 10, text: 'text-2xl' },
  };

  const currentSize = sizeClasses[size];
  const radius = size === 'sm' ? 50 : size === 'md' ? 65 : 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const renderCircularMeter = () => (
    <div className="flex items-center justify-center">
      <div className={`relative ${currentSize.container}`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={currentSize.stroke}
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray,
              strokeDashoffset: animated ? strokeDashoffset : 0,
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: animated ? 1.5 : 0, ease: "easeInOut" }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {showPercentage && (
            <motion.div
              className={`font-bold text-gray-900 dark:text-white ${currentSize.text}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animated ? 1 : 0, duration: 0.5 }}
            >
              {Math.round(progressPercentage)}%
            </motion.div>
          )}
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Complete
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinearMeter = () => (
    <div className="space-y-4">
      {/* Financial Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Financial Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: animated ? 1.2 : 0, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>${currentValue.toLocaleString()}</span>
          <span>${targetValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Task Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {taskProgressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${taskProgressPercentage}%` }}
            transition={{ duration: animated ? 1.2 : 0, ease: "easeOut", delay: animated ? 0.3 : 0 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{completedTasks} completed</span>
          <span>{totalTasks} total</span>
        </div>
      </div>
    </div>
  );

  const renderSemicircleMeter = () => {
    const semicircleRadius = 80;
    const semicircleCircumference = Math.PI * semicircleRadius;
    const semicircleOffset = semicircleCircumference - (progressPercentage / 100) * semicircleCircumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-24 mb-4">
          <svg className="w-full h-full" viewBox="0 0 180 90">
            {/* Background arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 160 80"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            
            {/* Progress arc */}
            <motion.path
              d="M 20 80 A 80 80 0 0 1 160 80"
              stroke="url(#semicircleGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: semicircleCircumference,
                strokeDashoffset: animated ? semicircleOffset : 0,
              }}
              initial={{ strokeDashoffset: semicircleCircumference }}
              animate={{ strokeDashoffset: semicircleOffset }}
              transition={{ duration: animated ? 1.5 : 0, ease: "easeInOut" }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="semicircleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-3xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animated ? 1 : 0, duration: 0.5 }}
            >
              {Math.round(progressPercentage)}%
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Goal Progress
        </h3>
      </div>

      {/* Progress Meter */}
      <div className="mb-6">
        {style === 'circular' && renderCircularMeter()}
        {style === 'linear' && renderLinearMeter()}
        {style === 'semicircle' && renderSemicircleMeter()}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-blue-600 text-lg font-bold">
            ${currentValue.toLocaleString()}
          </div>
          <div className="text-blue-600 text-xs">Current Savings</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-green-600 text-lg font-bold">
            {completedTasks}/{totalTasks}
          </div>
          <div className="text-green-600 text-xs">Tasks Done</div>
        </div>
      </div>

      {/* Timeline Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{daysRemaining} days remaining</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              {progressPercentage >= 100 
                ? 'Goal achieved!' 
                : progressPercentage >= 50 
                ? 'On track' 
                : 'Needs attention'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Quick insights */}
      {progressPercentage > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-300">
              <div className="font-medium">Progress Insight</div>
              <div>
                {progressPercentage >= 100 
                  ? '🎉 Congratulations! You\'ve reached your goal!'
                  : progressPercentage >= 75
                  ? '🚀 Great job! You\'re in the final stretch.'
                  : progressPercentage >= 50
                  ? '💪 You\'re halfway there! Keep up the momentum.'
                  : progressPercentage >= 25
                  ? '📈 Good start! Consider increasing your savings rate.'
                  : '🎯 Time to get serious about your goal. Every step counts!'
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompletionMeter;