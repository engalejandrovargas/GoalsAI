import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, Target, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { mockHabitData } from '../../data/mockData';

interface HabitTrackerProps {
  goalId: string;
  habits?: any[];
}

const HabitTracker: React.FC<HabitTrackerProps> = ({
  goalId,
  habits = mockHabitData.habits,
}) => {
  const [selectedHabit, setSelectedHabit] = useState(habits[0]?.id || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push({ day: null, completed: false, isEmpty: true });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Generate random completion data for demo (in real app, this would come from API)
      const completed = Math.random() > 0.3; // 70% completion rate
      calendar.push({ day, completed, isEmpty: false, isToday: isToday(year, month, day) });
    }

    return calendar;
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const selectedHabitData = habits.find(h => h.id === selectedHabit) || habits[0];
  const calendar = generateCalendar();

  const getStreakColor = (streak: number) => {
    if (streak >= 20) return 'text-purple-600';
    if (streak >= 14) return 'text-green-600';
    if (streak >= 7) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-blue-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Habit Tracker</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Build consistent daily habits</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Habit Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => setSelectedHabit(habit.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedHabit === habit.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {habit.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats for Selected Habit */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getStreakColor(selectedHabitData.currentStreak)}`}>
            {selectedHabitData.currentStreak}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center justify-center mt-1">
            <Flame className="w-3 h-3 mr-1" />
            Current Streak
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {selectedHabitData.longestStreak}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Best Streak
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {selectedHabitData.completionRate}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center justify-center mt-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success Rate
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Progress
          </h4>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Missed</span>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 py-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm relative ${
                day.isEmpty
                  ? ''
                  : day.isToday
                  ? 'bg-blue-100 dark:bg-blue-900 rounded-lg font-medium'
                  : ''
              }`}
            >
              {day.day && (
                <>
                  <span className={`${day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day.day}
                  </span>
                  {day.completed ? (
                    <CheckCircle className="w-3 h-3 text-green-500 absolute -bottom-0.5 -right-0.5" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 absolute -bottom-0.5 -right-0.5" />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Week</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedHabitData.weeklyData.filter((day: boolean) => day).length}/7 days
          </span>
        </div>
        
        <div className="flex gap-1 mb-3">
          {selectedHabitData.weeklyData.map((completed: boolean, index: number) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                completed ? getCompletionColor(selectedHabitData.completionRate) : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      {selectedHabitData.currentStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
        >
          <div className="flex items-center">
            <Flame className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-400">
                {selectedHabitData.currentStreak >= 21 ? '🔥 Amazing streak!' :
                 selectedHabitData.currentStreak >= 14 ? '💪 Two weeks strong!' :
                 '🎯 One week milestone!'}
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-500 mt-1">
                You've been consistent with "{selectedHabitData.name}" for {selectedHabitData.currentStreak} days. Keep it up!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HabitTracker;