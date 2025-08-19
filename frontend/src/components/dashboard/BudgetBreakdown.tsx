import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { PieChart as PieIcon, BarChart3, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetBreakdownProps {
  goalId: string;
  chartType?: 'pie' | 'bar' | 'donut';
  showCategories?: boolean;
  allowEdit?: boolean;
  budgetData?: {
    category: string;
    estimated: number;
    spent: number;
    remaining: number;
    color: string;
  }[];
  totalBudget?: number;
  totalSpent?: number;
}

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  goalId,
  chartType = 'pie',
  showCategories = true,
  allowEdit = true,
  budgetData = [],
  totalBudget = 1000,
  totalSpent = 450,
}) => {
  // Generate default budget data if none provided
  const generateDefaultBudgetData = () => [
    { category: 'Transportation', estimated: 300, spent: 120, remaining: 180, color: '#3B82F6' },
    { category: 'Accommodation', estimated: 400, spent: 200, remaining: 200, color: '#10B981' },
    { category: 'Food & Dining', estimated: 200, spent: 80, remaining: 120, color: '#F59E0B' },
    { category: 'Activities', estimated: 150, spent: 50, remaining: 100, color: '#EF4444' },
    { category: 'Miscellaneous', estimated: 100, spent: 0, remaining: 100, color: '#8B5CF6' },
  ];

  const categories = budgetData.length > 0 ? budgetData : generateDefaultBudgetData();
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Prepare data for charts
  const pieData = categories.map(cat => ({
    name: cat.category,
    value: cat.estimated,
    spent: cat.spent,
    remaining: cat.remaining,
    color: cat.color,
  }));

  const barData = categories.map(cat => ({
    category: cat.category.replace(/\s+/g, '\n'),
    estimated: cat.estimated,
    spent: cat.spent,
    remaining: cat.remaining,
  }));

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={chartType === 'donut' ? 90 : 100}
          innerRadius={chartType === 'donut' ? 60 : 0}
          paddingAngle={2}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `$${value.toLocaleString()}`,
            name
          ]}
          labelFormatter={() => ''}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar dataKey="estimated" fill="#E5E7EB" name="Estimated" />
        <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-green-600" />
          Budget Breakdown
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={() => {}} // Would be connected to state management
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 dark:text-white"
            disabled
          >
            <option value="pie">Pie Chart</option>
            <option value="donut">Donut Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-blue-600 text-xl font-bold">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-blue-600 text-sm">Total Budget</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-green-600 text-xl font-bold">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-green-600 text-sm">Spent</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-gray-600 dark:text-gray-300 text-xl font-bold">
            ${totalRemaining.toLocaleString()}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Remaining</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Budget Usage
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full ${
              spentPercentage > 90 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : spentPercentage > 75 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-green-500 to-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6 text-gray-800 dark:text-gray-200">
        {chartType === 'bar' ? renderBarChart() : renderPieChart()}
      </div>

      {/* Category Details */}
      {showCategories && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Category Breakdown
          </h4>
          {categories.map((category, index) => {
            const categorySpentPercentage = category.estimated > 0 ? (category.spent / category.estimated) * 100 : 0;
            const isOverBudget = category.spent > category.estimated;
            
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isOverBudget ? (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>Over Budget</span>
                      </div>
                    ) : categorySpentPercentage > 75 ? (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>High Usage</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <TrendingDown className="w-3 h-3" />
                        <span>On Track</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar for category */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(categorySpentPercentage, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        isOverBudget 
                          ? 'bg-red-500' 
                          : categorySpentPercentage > 75 
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Estimated:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${category.estimated.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                    <div className={`font-semibold ${
                      isOverBudget 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      ${category.spent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <div className={`font-semibold ${
                      category.remaining < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      ${category.remaining.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quick actions for editing (if enabled) */}
                {allowEdit && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {categorySpentPercentage.toFixed(1)}% of budget used
                      </span>
                      <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        Update Expenses
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Budget Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              Budget Insight
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {spentPercentage > 90 
                ? '⚠️ You\'re close to your budget limit! Consider reviewing your expenses.'
                : spentPercentage > 75 
                ? '📊 You\'ve used most of your budget. Monitor remaining expenses carefully.'
                : spentPercentage > 50 
                ? '👍 You\'re on track with your spending. Keep it up!'
                : '🎯 Great start! You have plenty of budget remaining for your goal.'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetBreakdown;