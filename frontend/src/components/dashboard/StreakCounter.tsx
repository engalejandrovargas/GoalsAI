import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Calendar, TrendingUp, Award, Target } from 'lucide-react';

interface StreakCounterProps {
  goalId: string;
  currentStreak?: number;
  longestStreak?: number;
  streakType?: string;
  unit?: string;
  lastActivityDate?: string;
  streakHistory?: { date: string; streak: number }[];
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  goalId,
  currentStreak = 23,
  longestStreak = 45,
  streakType = 'Daily Progress',
  unit = 'days',
  lastActivityDate = new Date().toISOString().split('T')[0],
  streakHistory = [
    { date: '2024-11-01', streak: 15 },
    { date: '2024-11-15', streak: 28 },
    { date: '2024-12-01', streak: 35 },
    { date: '2024-12-15', streak: 23 }
  ]
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStreak(currentStreak);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  useEffect(() => {
    // Show celebration for milestone streaks
    if (currentStreak > 0 && (currentStreak % 7 === 0 || currentStreak % 10 === 0)) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  const getStreakLevel = () => {
    if (currentStreak >= 100) return { level: 'Legendary', color: 'purple', icon: '🏆' };
    if (currentStreak >= 50) return { level: 'Master', color: 'gold', icon: '👑' };
    if (currentStreak >= 30) return { level: 'Expert', color: 'blue', icon: '💎' };
    if (currentStreak >= 14) return { level: 'Pro', color: 'green', icon: '🌟' };
    if (currentStreak >= 7) return { level: 'Strong', color: 'orange', icon: '🔥' };
    return { level: 'Building', color: 'gray', icon: '💪' };
  };

  const getStreakColor = () => {
    const level = getStreakLevel();
    const colors = {
      purple: 'from-purple-500 to-pink-500',
      gold: 'from-yellow-400 to-orange-500',
      blue: 'from-blue-500 to-indigo-500',
      green: 'from-green-500 to-emerald-500',
      orange: 'from-orange-500 to-red-500',
      gray: 'from-gray-500 to-gray-600'
    };
    return colors[level.color as keyof typeof colors];
  };

  const streakLevel = getStreakLevel();
  const progressToNext = currentStreak >= 100 ? 100 : 
                        currentStreak >= 50 ? ((currentStreak - 50) / 50) * 100 :
                        currentStreak >= 30 ? ((currentStreak - 30) / 20) * 100 :
                        currentStreak >= 14 ? ((currentStreak - 14) / 16) * 100 :
                        currentStreak >= 7 ? ((currentStreak - 7) / 7) * 100 :
                        (currentStreak / 7) * 100;

  const nextMilestone = currentStreak >= 100 ? 'Max Level!' :
                       currentStreak >= 50 ? '100 days' :
                       currentStreak >= 30 ? '50 days' :
                       currentStreak >= 14 ? '30 days' :
                       currentStreak >= 7 ? '14 days' :
                       '7 days';

  const getMotivationalMessage = () => {
    if (currentStreak === 0) return "Ready to start your streak? Every expert was once a beginner!";
    if (currentStreak === 1) return "Great start! The journey of a thousand miles begins with a single step.";
    if (currentStreak < 7) return `${currentStreak} ${unit} down! You're building momentum.`;
    if (currentStreak < 14) return `One week strong! 💪 You're developing a real habit.`;
    if (currentStreak < 30) return `Two weeks! 🔥 This is becoming second nature.`;
    if (currentStreak < 50) return `A full month! 🌟 You're in the expert zone now.`;
    if (currentStreak < 100) return `${currentStreak} ${unit}! 👑 You're a true master of consistency.`;
    return `${currentStreak} ${unit}! 🏆 Absolutely legendary dedication!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStreakColor()} opacity-5`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <div className={`p-2 bg-gradient-to-r ${getStreakColor()} rounded-lg mr-3`}>
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Streak Counter</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{streakType}</p>
          </div>
        </div>
        <div className={`px-3 py-1 bg-gradient-to-r ${getStreakColor()} text-white rounded-full text-xs font-medium flex items-center`}>
          <span className="mr-1">{streakLevel.icon}</span>
          {streakLevel.level}
        </div>
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-6 relative z-10">
        <motion.div
          className="relative inline-block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getStreakColor()} flex items-center justify-center shadow-lg`}>
            <div className="bg-white dark:bg-gray-800 w-28 h-28 rounded-full flex flex-col items-center justify-center">
              <motion.span
                className={`text-3xl font-bold bg-gradient-to-r ${getStreakColor()} bg-clip-text text-transparent`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {animatedStreak}
              </motion.span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {unit}
              </span>
            </div>
          </div>
          
          {/* Celebration Animation */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                className="absolute -top-4 -right-4"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1.2, rotate: 360 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-2xl">🎉</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-xs mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {getMotivationalMessage()}
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {longestStreak}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {unit}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Next Goal</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {nextMilestone}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            milestone
          </div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress to {nextMilestone}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progressToNext)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
          <motion.div
            className={`h-3 rounded-full bg-gradient-to-r ${getStreakColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 relative z-10">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Last activity</span>
        </div>
        <span className="font-medium">
          {new Date(lastActivityDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>

      {/* Achievement Badges */}
      <div className="mt-4 relative z-10">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Award className="w-4 h-4 mr-2" />
          Achievement Milestones
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { threshold: 7, name: '1 Week', icon: '🔥' },
            { threshold: 14, name: '2 Weeks', icon: '💪' },
            { threshold: 30, name: '1 Month', icon: '🌟' },
            { threshold: 50, name: '50 Days', icon: '💎' },
            { threshold: 100, name: '100 Days', icon: '👑' }
          ].map((badge) => (
            <div
              key={badge.threshold}
              className={`px-2 py-1 rounded-full text-xs flex items-center ${
                currentStreak >= badge.threshold
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="mr-1">{badge.icon}</span>
              {badge.name}
            </div>
          ))}
        </div>
      </div>

      {/* Streak Recovery Mode */}
      {currentStreak === 0 && longestStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 relative z-10"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Comeback Time!</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Your best was {longestStreak} {unit}. Time to beat that record! 💪
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakCounter;