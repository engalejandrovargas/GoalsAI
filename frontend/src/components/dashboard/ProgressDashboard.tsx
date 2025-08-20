import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressDashboardProps {
  goalId: string;
  currentProgress?: number;
  targetValue?: number;
  currentValue?: number;
  showChart?: boolean;
  showMeter?: boolean;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  goalId,
  currentProgress = 67,
  targetValue = 5000,
  currentValue = 3350,
  showChart = true,
  showMeter = true,
}) => {
  const [viewMode, setViewMode] = useState<'circular' | 'chart' | 'combined'>('combined');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock progress data
  const progressData = [
    { date: '2024-01-01', value: 500, target: 5000 },
    { date: '2024-01-03', value: 750, target: 5000 },
    { date: '2024-01-05', value: 1200, target: 5000 },
    { date: '2024-01-07', value: 1450, target: 5000 },
    { date: '2024-01-10', value: 1800, target: 5000 },
    { date: '2024-01-12', value: 2100, target: 5000 },
    { date: '2024-01-15', value: 2450, target: 5000 },
    { date: '2024-01-17', value: 2700, target: 5000 },
    { date: '2024-01-20', value: 3350, target: 5000 },
  ];

  const milestones = [
    { name: '25%', value: 25, achieved: true, date: '2024-01-07' },
    { name: '50%', value: 50, achieved: true, date: '2024-01-15' },
    { name: '75%', value: 75, achieved: false, date: '2024-01-25' },
    { name: '100%', value: 100, achieved: false, date: '2024-02-01' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressGradient = (progress: number) => {
    if (progress >= 100) return 'from-green-500 to-green-600';
    if (progress >= 75) return 'from-blue-500 to-blue-600';
    if (progress >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const remaining = targetValue - currentValue;
  const daysLeft = 12; // Mock days left
  const dailyRequired = remaining / Math.max(1, daysLeft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500 to-blue-600 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Track your journey to success</p>
          </div>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {(['circular', 'chart', 'combined'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Current</span>
          </div>
          <div className="text-2xl font-bold">{currentProgress}%</div>
          <div className="text-sm opacity-80">Complete</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Value</span>
          </div>
          <div className="text-2xl font-bold">${currentValue.toLocaleString()}</div>
          <div className="text-sm opacity-80">of ${targetValue.toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Days Left</span>
          </div>
          <div className="text-2xl font-bold">{daysLeft}</div>
          <div className="text-sm opacity-80">Until deadline</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Daily Need</span>
          </div>
          <div className="text-2xl font-bold">${Math.round(dailyRequired)}</div>
          <div className="text-sm opacity-80">To stay on track</div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'circular' && (
          <motion.div
            key="circular"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center mb-8 relative z-10"
          >
            <div className="relative w-64 h-64">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r="85"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - currentProgress / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Award className="w-12 h-12 text-purple-600 mb-3" />
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {currentProgress}%
                </div>
                <div className="text-gray-500 dark:text-gray-400 mb-2">Complete</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  ${currentValue.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'chart' && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Over Time</h4>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Progress']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#E5E7EB" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {viewMode === 'combined' && (
          <motion.div
            key="combined"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10"
          >
            {/* Circular Progress */}
            <div className="flex items-center justify-center">
              <div className="relative w-56 h-56">
                <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="url(#combinedGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 85}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - currentProgress / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="combinedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {currentProgress}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Complete</div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    ${currentValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of ${targetValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Progress</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Progress']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones */}
      <div className="mt-8 relative z-10">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Milestones</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                milestone.achieved
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : currentProgress >= milestone.value * 0.8
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {milestone.achieved ? (
                  <Award className="w-5 h-5 text-green-600" />
                ) : (
                  <Target className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {milestone.name}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {milestone.achieved ? 'Achieved' : `Target: ${milestone.date}`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressDashboard;