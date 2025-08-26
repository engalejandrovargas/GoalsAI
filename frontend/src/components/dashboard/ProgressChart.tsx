import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Award, 
  Flame,
  ChevronUp,
  ChevronDown,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  TrendingDown
} from 'lucide-react';

interface ProgressChartProps {
  goalId: string;
  chartType?: 'line' | 'area' | 'radial' | 'pie' | 'bar';
  showProjection?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  currentValue?: number;
  targetValue?: number;
  data?: Array<{
    date: string;
    value: number;
    projected?: boolean;
  }>;
  title?: string;
  metric?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  goalId,
  chartType = 'area',
  showProjection = true,
  timeRange = '30d',
  currentValue = 7500,
  targetValue = 10000,
  title = "Goal Progress Analytics",
  metric = "$",
  data = [],
}) => {
  const [activeChart, setActiveChart] = useState(chartType);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Generate beautiful mock data with more realistic patterns
  const chartData = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365;
    const mockData = [];
    const today = new Date();
    
    let baseValue = Math.max(100, currentValue * 0.3);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create more realistic growth curve with occasional dips
      const progress = Math.min(currentValue, baseValue + ((currentValue - baseValue) * (days - i) / days));
      const randomVariation = (Math.random() - 0.5) * (currentValue * 0.05);
      const weekdayBoost = [1, 2, 3, 4, 5].includes(date.getDay()) ? 1.05 : 0.95;
      
      const finalValue = Math.max(0, Math.round(progress * weekdayBoost + randomVariation));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: finalValue,
        projected: false,
        growth: i === days ? 0 : Math.random() > 0.6 ? (Math.random() * 10 - 2) : (Math.random() * 5 + 1),
        milestone: Math.random() > 0.8 ? true : false,
      });
    }
    
    // Add beautiful projected data
    if (showProjection && currentValue < targetValue) {
      const projectionDays = Math.min(60, Math.ceil((targetValue - currentValue) / (currentValue * 0.02)));
      const projectionCurve = (targetValue - currentValue) / projectionDays;
      
      for (let i = 1; i <= projectionDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Create smooth projection curve with slight randomness
        const projectedValue = currentValue + (projectionCurve * i * (1 + Math.sin(i * 0.1) * 0.1));
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          value: Math.min(targetValue * 1.1, Math.round(projectedValue)),
          projected: true,
          growth: 2.5 + Math.random() * 2,
          milestone: false,
        });
      }
    }
    
    return mockData;
  }, [currentValue, targetValue, selectedTimeRange, showProjection]);

  const progressPercentage = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0;
  const recentGrowth = chartData.length > 7 ? 
    ((chartData[chartData.length - 8].value - chartData[chartData.length - 15]?.value || 0) / 7) : 0;

  // Beautiful gradient definitions
  const gradients = {
    primary: ["#667eea", "#764ba2"],
    success: ["#11998e", "#38ef7d"],
    warning: ["#f093fb", "#f5576c"],
    info: ["#4facfe", "#00f2fe"],
    purple: ["#a855f7", "#3b82f6"],
    sunset: ["#ff9a9e", "#fecfef", "#fecfef"],
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isProjected = data.projected;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-2xl"
      >
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          {new Date(label).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isProjected ? 'bg-purple-400' : 'bg-blue-500'}`} />
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {metric}{payload[0].value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {isProjected ? 'Projected' : 'Actual'} {data.growth > 0 ? '📈' : '📉'} {Math.abs(data.growth).toFixed(1)}%
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#764ba2" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#764ba2" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          tickFormatter={(value) => `${metric}${(value / 1000).toFixed(1)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Actual data area */}
        <Area
          type="monotone"
          dataKey="value"
          stroke="#667eea"
          fill="url(#areaGradient)"
          strokeWidth={3}
          dot={(props: any) => {
            if (props.payload.projected) return null;
            return (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={props.payload.milestone ? 6 : 4}
                fill={props.payload.milestone ? "#f59e0b" : "#667eea"}
                stroke="white"
                strokeWidth={2}
                className="drop-shadow-lg"
              />
            );
          }}
          connectNulls={false}
        />
        
        {/* Projected data area */}
        <Area
          type="monotone"
          dataKey={(entry: any) => entry.projected ? entry.value : null}
          stroke="#a855f7"
          fill="url(#projectionGradient)"
          strokeWidth={2}
          strokeDasharray="8,8"
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderRadialChart = () => {
    const radialData = [
      { name: 'Progress', value: progressPercentage, fill: '#667eea' },
    ];

    return (
      <div className="flex items-center justify-center h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            data={radialData}
            startAngle={90}
            endAngle={450}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={20}
              fill="url(#radialGradient)"
            />
            <defs>
              <linearGradient id="radialGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </RadialBarChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              {progressPercentage.toFixed(1)}%
            </motion.div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Complete</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData.slice(-12)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#764ba2" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          tickFormatter={(value) => `${metric}${(value / 1000).toFixed(1)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill="url(#barGradient)"
          radius={[8, 8, 0, 0]}
          className="drop-shadow-sm"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const chartOptions = [
    { id: 'area', label: 'Area Chart', icon: Activity },
    { id: 'radial', label: 'Radial', icon: Target },
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Beautiful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl" />
      
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Track your progress with beautiful insights
              </p>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-1 border border-white/50">
            {chartOptions.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveChart(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeChart === id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 opacity-80" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Current</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metric}{currentValue.toLocaleString()}
              </div>
              <div className="text-xs opacity-80">
                {progressPercentage.toFixed(1)}% of target
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 opacity-80" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Target</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metric}{targetValue.toLocaleString()}
              </div>
              <div className="text-xs opacity-80">
                {((targetValue - currentValue) / targetValue * 100).toFixed(1)}% remaining
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                {recentGrowth > 0 ? 
                  <TrendingUp className="w-6 h-6 opacity-80" /> : 
                  <TrendingDown className="w-6 h-6 opacity-80" />
                }
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Growth</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {recentGrowth > 0 ? '+' : ''}{metric}{Math.abs(recentGrowth).toFixed(0)}
              </div>
              <div className="text-xs opacity-80">
                Weekly average
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6 opacity-80" />
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Streak</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {Math.floor(Math.random() * 15) + 5} days
              </div>
              <div className="text-xs opacity-80">
                Keep it up!
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
          </motion.div>
        </div>

        {/* Chart Container */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-gray-700/50 p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-gray-800 dark:text-gray-200"
            >
              {activeChart === 'area' && renderAreaChart()}
              {activeChart === 'radial' && renderRadialChart()}
              {activeChart === 'bar' && renderBarChart()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Time Range Selector & Legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeRange === range
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-600/80'
                }`}
              >
                {range.toUpperCase()}
              </motion.button>
            ))}
          </div>

          {activeChart !== 'radial' && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Actual Progress</span>
              </div>
              {showProjection && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-purple-400 rounded-full opacity-60" style={{ background: 'repeating-linear-gradient(90deg, #a855f7, #a855f7 4px, transparent 4px, transparent 8px)' }} />
                  <span className="text-gray-600 dark:text-gray-400">Projected</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projection Insight */}
        {showProjection && activeChart !== 'radial' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Smart Projection
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  At your current pace, you'll reach {metric}{targetValue.toLocaleString()} in approximately{' '}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {Math.ceil((targetValue - currentValue) / (recentGrowth || 1))} days
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressChart;