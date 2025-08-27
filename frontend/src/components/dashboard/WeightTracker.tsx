import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Target, Calendar, Award, Activity, Plus, Zap, Trophy, Star } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

interface WeightTrackerProps {
  goalId: string;
  targetWeight?: number;
  initialWeight?: number;
  weightEntries?: WeightEntry[];
  unit?: 'kg' | 'lbs';
  showTrend?: boolean;
  showProgress?: boolean;
  allowEdit?: boolean;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({
  goalId,
  targetWeight = 70,
  initialWeight = 80,
  weightEntries = [],
  unit = 'kg',
  showTrend = true,
  showProgress = true,
  allowEdit = true
}) => {
  const [entries, setEntries] = useState<WeightEntry[]>(weightEntries.length > 0 ? weightEntries : [
    { id: '1', date: '2024-01-01', weight: initialWeight, note: 'Starting strong! 💪' },
    { id: '2', date: '2024-01-15', weight: initialWeight - 1.2, note: 'First milestone reached!' },
    { id: '3', date: '2024-02-01', weight: initialWeight - 2.8, note: 'Feeling great' },
    { id: '4', date: '2024-02-15', weight: initialWeight - 4.1, note: 'Clothes fitting better!' },
    { id: '5', date: '2024-03-01', weight: initialWeight - 5.5, note: 'Amazing progress!' },
    { id: '6', date: '2024-03-15', weight: initialWeight - 6.2, note: 'Almost there!' },
  ]);

  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : initialWeight;
  const weightLost = initialWeight - currentWeight;
  const totalToLose = initialWeight - targetWeight;
  const progressPercentage = Math.max(0, Math.min(100, (weightLost / totalToLose) * 100));
  const remainingWeight = Math.max(0, currentWeight - targetWeight);

  const trend = useMemo(() => {
    if (entries.length < 2) return 'stable';
    const recent = entries.slice(-4);
    const avgChange = recent.reduce((acc, entry, idx) => {
      if (idx === 0) return acc;
      return acc + (entry.weight - recent[idx - 1].weight);
    }, 0) / (recent.length - 1);
    
    if (avgChange < -0.15) return 'losing';
    if (avgChange > 0.15) return 'gaining';
    return 'stable';
  }, [entries]);

  const chartData = entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    target: targetWeight,
    ideal: targetWeight
  }));

  const addEntry = () => {
    if (!newWeight) return;
    
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      note: newNote || undefined
    };
    
    setEntries(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewWeight('');
    setNewNote('');
    setShowAddForm(false);
  };

  const getTrendData = () => {
    switch (trend) {
      case 'losing': 
        return { 
          icon: <TrendingDown className="w-5 h-5" />, 
          text: 'Losing Weight', 
          color: 'from-emerald-500 to-teal-500',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          textColor: 'text-emerald-700',
          description: 'Great progress! Keep it up!'
        };
      case 'gaining': 
        return { 
          icon: <TrendingUp className="w-5 h-5" />, 
          text: 'Weight Gain', 
          color: 'from-rose-500 to-pink-500',
          bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
          textColor: 'text-rose-700',
          description: 'Stay focused on your goals'
        };
      default: 
        return { 
          icon: <Activity className="w-5 h-5" />, 
          text: 'Maintaining', 
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          textColor: 'text-blue-700',
          description: 'Stable weight trend'
        };
    }
  };

  const trendData = getTrendData();

  const getProgressColor = () => {
    if (progressPercentage >= 90) return 'from-emerald-400 via-teal-500 to-cyan-500';
    if (progressPercentage >= 70) return 'from-blue-400 via-purple-500 to-pink-500';
    if (progressPercentage >= 50) return 'from-orange-400 via-red-500 to-pink-500';
    return 'from-purple-400 via-pink-500 to-red-500';
  };

  const getMilestoneIcon = () => {
    if (progressPercentage >= 90) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (progressPercentage >= 75) return <Star className="w-6 h-6 text-purple-500" />;
    if (progressPercentage >= 50) return <Award className="w-6 h-6 text-blue-500" />;
    return <Target className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-white/20 p-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Weight Journey
            </h3>
            <p className="text-gray-600 font-medium">Track your transformation</p>
          </div>
        </div>
        
        {showTrend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${trendData.bgColor} ${trendData.textColor} px-4 py-3 rounded-2xl shadow-sm border border-white/50`}
          >
            <div className="flex items-center space-x-2">
              {trendData.icon}
              <div>
                <div className="font-semibold text-sm">{trendData.text}</div>
                <div className="text-xs opacity-75">{trendData.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress Hero Section */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl border border-purple-200/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getMilestoneIcon()}
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {progressPercentage.toFixed(1)}% Complete
                </div>
                <div className="text-sm text-gray-600">
                  {remainingWeight.toFixed(1)}{unit} to go!
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentWeight}{unit}
              </div>
              <div className="text-sm text-gray-500">Current Weight</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200/50 rounded-full h-4 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressPercentage)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`bg-gradient-to-r ${getProgressColor()} h-4 rounded-full shadow-lg relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 shadow-sm"
        >
          <div className="text-2xl font-bold text-blue-700">{initialWeight}{unit}</div>
          <div className="text-sm text-blue-600 font-medium">Starting</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50 shadow-sm"
        >
          <div className="text-2xl font-bold text-purple-700 flex items-center justify-center">
            <Target className="w-5 h-5 mr-1" />
            {targetWeight}{unit}
          </div>
          <div className="text-sm text-purple-600 font-medium">Target</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 shadow-sm"
        >
          <div className="text-2xl font-bold text-emerald-700">
            {weightLost > 0 ? '-' : ''}{Math.abs(weightLost).toFixed(1)}{unit}
          </div>
          <div className="text-sm text-emerald-600 font-medium">Lost</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 shadow-sm"
        >
          <div className="text-2xl font-bold text-amber-700 flex items-center justify-center">
            <Award className="w-5 h-5 mr-1" />
            {((weightLost / totalToLose) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-amber-600 font-medium">Progress</div>
        </motion.div>
      </div>

      {/* Beautiful Chart */}
      <div className="mb-8 p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100/50 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2" />
          Weight Progress
        </h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  backdropFilter: 'blur(16px)'
                }}
                formatter={(value: any) => [`${value}${unit}`, 'Weight']}
              />
              <ReferenceLine 
                y={targetWeight} 
                stroke="#f59e0b" 
                strokeDasharray="8 4" 
                strokeWidth={2}
                label={{ 
                  value: `Target: ${targetWeight}${unit}`, 
                  position: "topRight", 
                  fill: "#f59e0b", 
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#weightGradient)"
                dot={{ 
                  fill: '#8b5cf6', 
                  strokeWidth: 3, 
                  stroke: 'white',
                  r: 5,
                  filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))'
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: '#8b5cf6', 
                  strokeWidth: 3, 
                  fill: 'white',
                  filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.4))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add New Entry */}
      {allowEdit && (
        <div className="mb-6">
          <AnimatePresence>
            {!showAddForm ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddForm(true)}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Log New Weight</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100/50 shadow-sm"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-4">Add New Entry</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight ({unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        placeholder={`Enter weight in ${unit}`}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (optional)
                      </label>
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="How are you feeling?"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={addEntry}
                      disabled={!newWeight}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                    >
                      Add Entry
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewWeight('');
                        setNewNote('');
                      }}
                      className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Recent Entries */}
      <div className="p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100/50 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-500" />
          Recent Entries
        </h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {entries.slice(-6).reverse().map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-gray-100/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(entry.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </span>
                  {entry.note && (
                    <div className="text-sm text-gray-600 italic">{entry.note}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900">{entry.weight}{unit}</div>
                {index < entries.length - 1 && (
                  <div className={`text-xs font-medium ${
                    entry.weight < entries[entries.length - index - 2].weight 
                      ? 'text-emerald-600' 
                      : entry.weight > entries[entries.length - index - 2].weight
                      ? 'text-rose-600'
                      : 'text-gray-500'
                  }`}>
                    {entry.weight < entries[entries.length - index - 2].weight && '↓ '}
                    {entry.weight > entries[entries.length - index - 2].weight && '↑ '}
                    {entry.weight === entries[entries.length - index - 2].weight && '→ '}
                    {Math.abs(entry.weight - entries[entries.length - index - 2].weight).toFixed(1)}{unit}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;