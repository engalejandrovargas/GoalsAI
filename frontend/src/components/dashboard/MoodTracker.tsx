import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, TrendingUp, MessageCircle, Smile, Frown, Meh } from 'lucide-react';
import { mockMoodData } from '../../data/mockData';

interface MoodTrackerProps {
  goalId: string;
  currentMood?: number;
  moodHistory?: any[];
  weeklyAverage?: number;
  topTriggers?: string[];
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  goalId,
  currentMood = mockMoodData.currentMood,
  moodHistory = mockMoodData.moodHistory,
  weeklyAverage = mockMoodData.weeklyAverage,
  topTriggers = mockMoodData.topTriggers,
}) => {
  const [selectedMood, setSelectedMood] = useState(currentMood);
  const [moodNote, setMoodNote] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'chart'>('calendar');

  const moodEmojis = {
    1: { emoji: '😭', label: 'Terrible', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' },
    2: { emoji: '😔', label: 'Bad', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900' },
    3: { emoji: '😐', label: 'Okay', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' },
    4: { emoji: '😊', label: 'Good', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
    5: { emoji: '😄', label: 'Excellent', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4.5) return 'text-blue-500';
    if (mood >= 3.5) return 'text-green-500';
    if (mood >= 2.5) return 'text-yellow-500';
    if (mood >= 1.5) return 'text-orange-500';
    return 'text-red-500';
  };

  const generateWeeklyCalendar = () => {
    const calendar = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayData = moodHistory.find(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === date.toDateString();
      });

      calendar.push({
        date: date,
        mood: dayData?.mood || null,
        note: dayData?.note || '',
        isToday: i === 0
      });
    }
    
    return calendar;
  };

  const weeklyCalendar = generateWeeklyCalendar();
  const moodTrend = moodHistory.slice(-7).map(entry => entry.mood);
  const averageMood = moodTrend.reduce((sum, mood) => sum + mood, 0) / moodTrend.length;

  const renderMoodSelector = () => (
    <div className="flex justify-between mb-6">
      {Object.entries(moodEmojis).map(([value, moodData]) => (
        <motion.button
          key={value}
          onClick={() => setSelectedMood(parseInt(value))}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            selectedMood === parseInt(value)
              ? `${moodData.bg} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-300 dark:ring-gray-600`
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl mb-2">{moodData.emoji}</span>
          <span className={`text-xs font-medium ${moodData.color}`}>
            {moodData.label}
          </span>
        </motion.button>
      ))}
    </div>
  );

  const renderCalendarView = () => (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weeklyCalendar.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg border-2 border-dashed ${
              day.isToday ? 'border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'
            } flex flex-col items-center justify-center p-2 relative group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {day.date.getDate()}
            </div>
            
            {day.mood ? (
              <>
                <span className="text-2xl">{moodEmojis[day.mood as keyof typeof moodEmojis].emoji}</span>
                {day.note && (
                  <div className="absolute -top-1 -right-1">
                    <MessageCircle className="w-3 h-3 text-blue-500" />
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  {moodEmojis[day.mood as keyof typeof moodEmojis].label}
                  {day.note && `: ${day.note}`}
                </div>
              </>
            ) : (
              <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-4">
      <div className="h-32 flex items-end justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        {moodTrend.map((mood, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              className={`w-6 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t mb-2 ${getMoodColor(mood)}`}
              style={{ height: `${(mood / 5) * 80}px` }}
              initial={{ height: 0 }}
              animate={{ height: `${(mood / 5) * 80}px` }}
              transition={{ delay: index * 0.1 }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
            </span>
          </div>
        ))}
      </div>

      {/* Mood Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {averageMood.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weekly Average</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.max(...moodTrend)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Best Day</div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg mr-3">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mood Tracker</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">How are you feeling today?</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Calendar className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Current Mood Display */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">
          {moodEmojis[selectedMood as keyof typeof moodEmojis].emoji}
        </div>
        <div className={`text-lg font-semibold ${moodEmojis[selectedMood as keyof typeof moodEmojis].color}`}>
          {moodEmojis[selectedMood as keyof typeof moodEmojis].label}
        </div>
      </div>

      {/* Mood Selector */}
      {renderMoodSelector()}

      {/* Mood Note */}
      <div className="mb-6">
        <textarea
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          placeholder="How are you feeling today? What's affecting your mood?"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none"
          rows={3}
        />
      </div>

      {/* View Toggle Content */}
      <div className="mb-6">
        {viewMode === 'calendar' ? renderCalendarView() : renderChartView()}
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {/* Mood Trends */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <h4 className="font-medium text-blue-800 dark:text-blue-400">Weekly Insight</h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-500">
            {averageMood >= 4 
              ? '🌟 Great week! Your mood has been consistently positive.'
              : averageMood >= 3
              ? '📈 Steady progress! Your mood is trending upward.'
              : averageMood >= 2
              ? '💪 Tough week, but you\'re tracking it. That\'s progress!'
              : '🤗 Remember: tracking your mood is the first step to understanding it.'}
          </p>
        </div>

        {/* Top Triggers */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Common Influences
          </h4>
          <div className="flex flex-wrap gap-2">
            {topTriggers.map((trigger, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {trigger}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {selectedMood <= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-center">
            <Smile className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Remember 🤗</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                It's okay to have difficult days. Every emotion is valid and temporary. Tomorrow is a new opportunity.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodTracker;