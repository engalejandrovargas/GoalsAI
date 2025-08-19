import React from 'react';
import { motion } from 'framer-motion';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, Target } from 'lucide-react';

interface ProgressChartProps {
  goalId: string;
  chartType?: 'line' | 'area' | 'pie';
  showProjection?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  currentValue?: number;
  targetValue?: number;
  data?: Array<{
    date: string;
    value: number;
    projected?: boolean;
  }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  goalId,
  chartType = 'line',
  showProjection = true,
  timeRange = '30d',
  currentValue = 0,
  targetValue = 1000,
  data = [],
}) => {
  // Generate mock data if none provided
  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const mockData = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const progress = Math.max(0, (days - i) / days * currentValue + (Math.random() - 0.5) * (currentValue * 0.1));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(progress),
        projected: false,
      });
    }
    
    // Add projected data if enabled
    if (showProjection && currentValue < targetValue) {
      const projectionDays = 30;
      const dailyIncrease = (targetValue - currentValue) / projectionDays;
      
      for (let i = 1; i <= projectionDays; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        const projectedValue = currentValue + (dailyIncrease * i);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(projectedValue),
          projected: true,
        });
      }
    }
    
    return mockData;
  };

  const chartData = data.length > 0 ? data : generateMockData();
  const progressPercentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
          }}
          formatter={(value: number, name: string, props: any) => [
            `$${value.toLocaleString()}`,
            props.payload.projected ? 'Projected' : 'Actual'
          ]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={(props: any) => {
            if (props.payload.projected) {
              return <circle cx={props.cx} cy={props.cy} r={3} fill="#94A3B8" />;
            }
            return <circle cx={props.cx} cy={props.cy} r={4} fill="#3B82F6" />;
          }}
          strokeDasharray={(props: any) => props.payload?.projected ? "5,5" : "0"}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          labelFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
          }}
          formatter={(value: number, name: string, props: any) => [
            `$${value.toLocaleString()}`,
            props.payload.projected ? 'Projected' : 'Actual'
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          fill="url(#colorGradient)"
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = [
      { name: 'Achieved', value: currentValue, color: '#10B981' },
      { name: 'Remaining', value: Math.max(0, targetValue - currentValue), color: '#E5E7EB' },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
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
          <TrendingUp className="w-5 h-5 text-green-600" />
          Progress Over Time
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={() => {}} // Would be connected to state management
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 dark:text-white"
            disabled
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-green-600 text-2xl font-bold">
            ${currentValue.toLocaleString()}
          </div>
          <div className="text-green-600 text-sm">Current</div>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-blue-600 text-2xl font-bold">
            ${targetValue.toLocaleString()}
          </div>
          <div className="text-blue-600 text-sm">Target</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-purple-600 text-2xl font-bold">
            {progressPercentage.toFixed(1)}%
          </div>
          <div className="text-purple-600 text-sm">Complete</div>
        </div>
      </div>

      {/* Chart */}
      <div className="text-gray-800 dark:text-gray-200">
        {chartType === 'line' && renderLineChart()}
        {chartType === 'area' && renderAreaChart()}
        {chartType === 'pie' && renderPieChart()}
      </div>

      {/* Progress Indicators */}
      {chartType !== 'pie' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Actual Progress</span>
            </div>
            {showProjection && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Projected</span>
              </div>
            )}
          </div>
          
          {showProjection && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  At current pace, you'll reach your goal in approximately{' '}
                  {Math.ceil((targetValue - currentValue) / ((currentValue / 30) || 1))} days
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              className={`px-2 py-1 rounded ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        
        <div className="text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressChart;