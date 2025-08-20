import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  TrendingUp,
  Target,
  Calendar,
  Scale,
  Dumbbell,
  Moon,
  Utensils,
  BarChart3,
  Zap,
  Award,
  Clock,
  Flame,
  Droplets,
  Timer,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';

interface HealthDashboardProps {
  goalId: string;
  showWeightChart?: boolean;
  showWorkoutLog?: boolean;
  showSleepTracker?: boolean;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  color: string;
  icon: any;
  trend: number; // percentage change
}

interface WorkoutSession {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  completed: boolean;
}

interface HealthGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  category: 'weight' | 'fitness' | 'nutrition' | 'sleep';
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({
  goalId,
  showWeightChart = true,
  showWorkoutLog = true,
  showSleepTracker = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'fitness' | 'nutrition' | 'sleep'>('overview');
  const [weight, setWeight] = useState(165);
  const [targetWeight, setTargetWeight] = useState(155);

  // Mock data - replace with real data from API
  const healthMetrics: HealthMetric[] = [
    { id: '1', name: 'Weight', value: weight, unit: 'lbs', target: targetWeight, color: 'bg-blue-500', icon: Scale, trend: -2.1 },
    { id: '2', name: 'Body Fat', value: 18, unit: '%', target: 15, color: 'bg-orange-500', icon: Activity, trend: -1.5 },
    { id: '3', name: 'Sleep', value: 7.5, unit: 'hrs', target: 8, color: 'bg-purple-500', icon: Moon, trend: 0.8 },
    { id: '4', name: 'Water', value: 6, unit: 'cups', target: 8, color: 'bg-cyan-500', icon: Droplets, trend: 2.3 },
  ];

  const recentWorkouts: WorkoutSession[] = [
    { id: '1', type: 'Cardio', duration: 45, calories: 450, date: '2025-01-20', completed: true },
    { id: '2', type: 'Strength', duration: 60, calories: 320, date: '2025-01-19', completed: true },
    { id: '3', type: 'Yoga', duration: 30, calories: 150, date: '2025-01-18', completed: false },
  ];

  const healthGoals: HealthGoal[] = [
    { id: '1', name: 'Lose Weight', current: weight, target: targetWeight, unit: 'lbs', progress: 50, category: 'weight' },
    { id: '2', name: 'Build Muscle', current: 145, target: 155, unit: 'lbs', progress: 75, category: 'fitness' },
    { id: '3', name: 'Daily Steps', current: 8500, target: 10000, unit: 'steps', progress: 85, category: 'fitness' },
    { id: '4', name: 'Sleep Quality', current: 7.5, target: 8, unit: 'hrs', progress: 94, category: 'sleep' },
  ];

  const weeklyStats = {
    totalWorkouts: 5,
    totalCalories: 1850,
    avgSleep: 7.2,
    avgWeight: 164.5,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight': return 'bg-blue-100 text-blue-700';
      case 'fitness': return 'bg-green-100 text-green-700';
      case 'nutrition': return 'bg-orange-100 text-orange-700';
      case 'sleep': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleWeightUpdate = (change: number) => {
    setWeight(prev => Math.max(0, prev + change));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header - Travel Dashboard Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Health Journey</h1>
              <p className="text-green-100">
                Fitness & Wellness • {healthGoals.length} active goals • Week 3
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(healthGoals.reduce((sum, g) => sum + g.progress, 0) / healthGoals.length)}%</div>
            <div className="text-green-100 text-sm">Complete</div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Weight Loss</span>
              <span>{healthGoals.find(g => g.category === 'weight')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthGoals.find(g => g.category === 'weight')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Fitness</span>
              <span>{Math.round(healthGoals.filter(g => g.category === 'fitness').reduce((sum, g) => sum + g.progress, 0) / 2)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(healthGoals.filter(g => g.category === 'fitness').reduce((sum, g) => sum + g.progress, 0) / 2)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Sleep</span>
              <span>{healthGoals.find(g => g.category === 'sleep')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthGoals.find(g => g.category === 'sleep')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.9 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Consistency</span>
              <span>88%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: 1, delay: 1.1 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  metric.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${metric.trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(metric.trend)}%
                </div>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}{metric.unit}</p>
                <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'fitness', label: 'Fitness', icon: Dumbbell },
            { id: 'nutrition', label: 'Nutrition', icon: Utensils },
            { id: 'sleep', label: 'Sleep', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === id
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-b-2 border-green-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Goals Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Health Goals
                </h3>
                {healthGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{goal.name}</h4>
                        <p className="text-sm text-gray-500">{goal.current} / {goal.target} {goal.unit}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Workouts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Workouts
                </h3>
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        workout.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {workout.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{workout.type}</p>
                        <p className="text-sm text-gray-500">{workout.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{workout.duration}min</p>
                      <p className="text-sm text-orange-600 flex items-center">
                        <Flame className="w-3 h-3 mr-1" />
                        {workout.calories} cal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'fitness' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Weight Tracking */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-blue-600" />
                    Weight Tracking
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleWeightUpdate(-0.5)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{weight} lbs</span>
                    <button
                      onClick={() => handleWeightUpdate(0.5)}
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Current: {weight} lbs</span>
                    <span>Target: {targetWeight} lbs</span>
                    <span>To go: {weight - targetWeight} lbs</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((weight - targetWeight) / (165 - targetWeight)) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Workout Summary */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Flame className="w-5 h-5 mr-2" />
                  This Week
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Workouts</span>
                    <span className="font-bold">{weeklyStats.totalWorkouts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-bold">{weeklyStats.totalCalories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Weight</span>
                    <span className="font-bold">{weeklyStats.avgWeight} lbs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'nutrition' && (
            <div className="text-center py-12">
              <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nutrition Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Track your meals, calories, and nutrition goals</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Log Today's Meals
              </button>
            </div>
          )}

          {selectedTab === 'sleep' && (
            <div className="text-center py-12">
              <Moon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sleep Analysis</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Monitor sleep quality, duration, and patterns</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Track Sleep
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;