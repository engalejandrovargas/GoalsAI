import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  Clock,
  Flame,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface ProgressMetrics {
  goalProgress: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    pausedGoals: number;
    completionRate: number;
  };
  stepProgress: {
    totalSteps: number;
    completedSteps: number;
    completionRate: number;
  };
  financialProgress: {
    totalTargetAmount: number;
    totalSavedAmount: number;
    savingsRate: number;
    monthlyAverageSavings: number;
  };
  timeProgress: {
    onTrackGoals: number;
    behindScheduleGoals: number;
    aheadOfScheduleGoals: number;
    upcomingDeadlines: Array<{
      goalId: string;
      title: string;
      deadline: Date;
      daysRemaining: number;
    }>;
  };
}

interface GoalInsight {
  goalId: string;
  title: string;
  overallProgress: number;
  stepCompletion: number;
  savingsProgress: number;
  timeProgress: number;
  status: 'on_track' | 'at_risk' | 'behind_schedule' | 'completed';
  insights: string[];
  recommendations: string[];
  nextActions: string[];
}

interface UserAnalytics {
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastActivity: Date;
  };
  productivity: {
    averageGoalCompletionTime: number;
    mostProductiveCategory: string;
    goalsCompletedThisMonth: number;
    goalsCompletedLastMonth: number;
  };
  patterns: {
    preferredGoalTypes: string[];
    averageGoalCost: number;
    successFactors: string[];
  };
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  estimatedCost?: number;
  currentSaved?: number;
  targetDate?: string;
  feasibilityScore?: number;
}

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [insights, setInsights] = useState<GoalInsight[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      
      const [metricsResponse, insightsResponse, analyticsResponse] = await Promise.all([
        apiService.getProgressMetrics(),
        apiService.getProgressInsights(),
        apiService.getProgressAnalytics()
      ]);

      if (metricsResponse.success) {
        setMetrics(metricsResponse.metrics);
      }

      if (insightsResponse.success) {
        setInsights(insightsResponse.insights);
      }

      if (analyticsResponse.success) {
        const analyticsData = analyticsResponse.analytics;
        setAnalytics(analyticsData);
      }

    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold ${colors.textPrimary} mb-2`}>Progress Dashboard</h1>
        <p className={colors.textSecondary}>
          Track your journey to achieving your dreams with detailed analytics and insights
        </p>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Total Progress */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Financial Progress</p>
              <p className="text-3xl font-bold">
                {metrics?.financialProgress?.savingsRate || 0}%
              </p>
              <p className="text-blue-100 text-sm">
                ${(metrics?.financialProgress?.totalSavedAmount || 0).toLocaleString()} / ${(metrics?.financialProgress?.totalTargetAmount || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        {/* Active Goals */}
        <div className={`${colors.cardBackground} p-6 rounded-xl border ${colors.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${colors.textSecondary} text-sm font-medium`}>Goals Progress</p>
              <p className={`text-3xl font-bold ${colors.textPrimary}`}>{metrics?.goalProgress.activeGoals || 0}</p>
              <p className="text-sm text-gray-500">
                {metrics?.goalProgress.completedGoals || 0} completed
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Current Streak */}
        <div className={`${colors.cardBackground} p-6 rounded-xl border ${colors.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${colors.textSecondary} text-sm font-medium`}>Current Streak</p>
              <p className={`text-3xl font-bold ${colors.textPrimary}`}>{analytics?.streaks.currentStreak || 0}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUp className="w-4 h-4 mr-1" />
                Best: {analytics?.streaks.longestStreak || 0} days
              </p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className={`${colors.cardBackground} p-6 rounded-xl border ${colors.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${colors.textSecondary} text-sm font-medium`}>Success Rate</p>
              <p className={`text-3xl font-bold ${colors.textPrimary}`}>
                {metrics?.goalProgress ? Math.round(metrics.goalProgress.completionRate) : 0}%
              </p>
              <p className="text-sm text-gray-500">Goal completion</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`${colors.cardBackground} p-6 rounded-xl border ${colors.cardBorder}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Timeline Progress</h3>
            <div className="flex items-center space-x-2">
              {(['week', 'month', 'year'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTimeframe === period
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colors.textSecondary}`}>On Track</p>
                <p className="text-2xl font-bold text-green-600">{metrics?.timeProgress.onTrackGoals || 0}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colors.textSecondary}`}>Behind Schedule</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.timeProgress.behindScheduleGoals || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colors.textSecondary}`}>Ahead of Schedule</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.timeProgress.aheadOfScheduleGoals || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </motion.div>

        {/* Productivity Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`${colors.cardBackground} p-6 rounded-xl border ${colors.cardBorder}`}
        >
          <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-6`}>Productivity Insights</h3>
          
          <div className="space-y-4">
            <div className={`${colors.cardBackground} border ${colors.cardBorder} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${colors.textSecondary}`}>Goals This Month</p>
                  <p className={`text-2xl font-bold ${colors.textPrimary}`}>
                    {analytics?.productivity.goalsCompletedThisMonth || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${colors.textTertiary}`}>vs last month</p>
                  <p className={`text-sm font-semibold ${colors.textSecondary}`}>
                    {analytics?.productivity.goalsCompletedLastMonth || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${colors.cardBackground} border ${colors.cardBorder} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${colors.textSecondary}`}>Most Productive</p>
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>
                    {analytics?.productivity.mostProductiveCategory || 'Personal'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`${colors.cardBackground} border ${colors.cardBorder} p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${colors.textSecondary}`}>Avg. Completion Time</p>
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>
                    {analytics?.productivity.averageGoalCompletionTime || 0} days
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goal Insights Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${colors.cardBackground} rounded-xl border ${colors.cardBorder} p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>Goal Performance Analysis</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Goals →
          </button>
        </div>

        <div className="space-y-4">
          {insights.map(insight => (
            <div
              key={insight.goalId}
              className={`border ${colors.cardBorder} rounded-lg p-4 ${colors.cardBackground} hover:opacity-90 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    insight.status === 'completed' ? 'bg-green-500' :
                    insight.status === 'on_track' ? 'bg-blue-500' :
                    insight.status === 'at_risk' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <h4 className={`font-medium ${colors.textPrimary}`}>{insight.title}</h4>
                    <p className={`text-sm ${colors.textSecondary} capitalize`}>{insight.status.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${colors.textPrimary}`}>{Math.round(insight.overallProgress)}%</p>
                  <p className={`text-xs ${colors.textTertiary}`}>overall progress</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className={`text-xs ${colors.textTertiary}`}>Steps</p>
                  <p className="font-semibold text-blue-600">{Math.round(insight.stepCompletion)}%</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${colors.textTertiary}`}>Savings</p>
                  <p className="font-semibold text-green-600">{Math.round(insight.savingsProgress)}%</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${colors.textTertiary}`}>Timeline</p>
                  <p className="font-semibold text-purple-600">{Math.round(insight.timeProgress)}%</p>
                </div>
              </div>

              <div className={`w-full ${colors.backgroundTertiary} rounded-full h-2 mb-3`}>
                <div
                  className={`h-2 rounded-full ${
                    insight.status === 'completed' ? 'bg-green-500' :
                    insight.status === 'on_track' ? 'bg-blue-500' :
                    insight.status === 'at_risk' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, insight.overallProgress)}%` }}
                />
              </div>

              {insight.recommendations.length > 0 && (
                <div className={`mt-3 p-3 ${colors.backgroundTertiary} border ${colors.cardBorder} rounded-lg`}>
                  <p className={`text-sm font-medium ${colors.textPrimary} mb-1`}>AI Recommendations:</p>
                  <ul className={`text-xs ${colors.textSecondary} space-y-1`}>
                    {insight.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className={`text-center py-8 ${colors.textSecondary}`}>
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No goal insights available yet. Start tracking your goals to see analysis here.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-8 ${colors.cardBackground} rounded-xl p-6 border ${colors.cardBorder}`}
      >
        <div className="flex items-start space-x-4">
          <Zap className="w-6 h-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${colors.textPrimary} mb-4`}>AI-Powered Recommendations</h3>
            
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights
                  .filter(insight => insight.nextActions.length > 0)
                  .slice(0, 3)
                  .map(insight => (
                    <div key={insight.goalId} className={`${colors.cardBackground} rounded-lg p-4 border ${colors.cardBorder}`}>
                      <h4 className={`font-medium ${colors.textPrimary} mb-2`}>{insight.title}</h4>
                      <div className="space-y-1">
                        {insight.nextActions.slice(0, 2).map((action, index) => (
                          <p key={index} className={`text-sm ${colors.textSecondary} flex items-start`}>
                            <span className="text-blue-500 mr-2">•</span>
                            {action}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {/* General recommendations based on analytics */}
                {analytics && (
                  <div className={`${colors.cardBackground} rounded-lg p-4 border ${colors.cardBorder}`}>
                    <h4 className={`font-medium ${colors.textPrimary} mb-2`}>Performance Insights</h4>
                    <div className="space-y-1">
                      {analytics.productivity.goalsCompletedThisMonth > analytics.productivity.goalsCompletedLastMonth && (
                        <p className={`text-sm ${colors.textSecondary} flex items-start`}>
                          <span className="text-green-500 mr-2">•</span>
                          Great progress! You've completed more goals this month than last month. Keep up the momentum.
                        </p>
                      )}
                      <p className={`text-sm ${colors.textSecondary} flex items-start`}>
                        <span className="text-blue-500 mr-2">•</span>
                        Focus on {analytics.productivity.mostProductiveCategory} goals - this is your strongest category.
                      </p>
                      {analytics.streaks.currentStreak > 0 && (
                        <p className={`text-sm ${colors.textSecondary} flex items-start`}>
                          <span className="text-purple-500 mr-2">•</span>
                          Maintain your {analytics.streaks.currentStreak}-day streak by logging progress daily.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className={`${colors.textSecondary} mb-4`}>Create some goals to get personalized AI recommendations</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage;