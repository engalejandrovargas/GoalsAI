import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Edit3,
  Check,
  X,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';

interface BudgetCategory {
  category: string;
  estimated: number;
  spent: number;
  color: string;
}

interface BudgetBreakdownProps {
  goalId: string;
  chartType?: 'pie' | 'bar' | 'donut';
  showCategories?: boolean;
  allowEdit?: boolean;
}

const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  goalId,
  chartType = 'pie',
  showCategories = true,
  allowEdit = true,
}) => {
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { category: 'Transportation', estimated: 1200, spent: 800, color: '#3B82F6' },
    { category: 'Accommodation', estimated: 2000, spent: 1500, color: '#10B981' },
    { category: 'Food & Dining', estimated: 800, spent: 450, color: '#F59E0B' },
    { category: 'Activities', estimated: 600, spent: 200, color: '#EF4444' },
    { category: 'Shopping', estimated: 400, spent: 150, color: '#8B5CF6' },
    { category: 'Miscellaneous', estimated: 300, spent: 80, color: '#06B6D4' },
  ]);

  const totalBudget = categories.reduce((sum, cat) => sum + cat.estimated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const updateCategorySpending = (categoryName: string, amount: number) => {
    setCategories(categories.map(cat => 
      cat.category === categoryName 
        ? { ...cat, spent: Math.max(0, Math.min(cat.estimated, cat.spent + amount)) }
        : cat
    ));
  };

  const pieData = categories.map(cat => ({
    name: cat.category,
    value: cat.estimated,
    spent: cat.spent,
    remaining: cat.estimated - cat.spent,
    color: cat.color,
    percentage: totalBudget > 0 ? (cat.estimated / totalBudget) * 100 : 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Budget: ${data.value.toLocaleString()}</p>
          <p className="text-sm">Spent: ${data.spent.toLocaleString()}</p>
          <p className="text-sm">Remaining: ${data.remaining.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500 to-red-600 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <PieIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Breakdown</h3>
            <p className="text-gray-600 dark:text-gray-400">Track spending by category</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            onClick={() => setViewType('pie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewType === 'pie'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            Pie
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewType === 'bar'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Total Budget</span>
          </div>
          <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
        </div>
        
        <div className={`rounded-2xl p-6 text-white ${
          totalSpent > totalBudget 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {totalSpent > totalBudget ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <TrendingDown className="w-6 h-6" />
            )}
            <span className="text-sm font-medium opacity-90">Total Spent</span>
          </div>
          <div className="text-3xl font-bold">${totalSpent.toLocaleString()}</div>
          <div className="text-sm opacity-80">
            {spentPercentage.toFixed(1)}% of budget
            {totalSpent > totalBudget && ' (Over budget!)'}
          </div>
        </div>
        
        <div className={`rounded-2xl p-6 text-white ${
          totalRemaining < 0 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-green-500 to-green-600'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {totalRemaining < 0 ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <TrendingUp className="w-6 h-6" />
            )}
            <span className="text-sm font-medium opacity-90">Remaining</span>
          </div>
          <div className="text-3xl font-bold">
            ${Math.abs(totalRemaining).toLocaleString()}
          </div>
          <div className="text-sm opacity-80">
            {totalRemaining < 0 ? 'Over budget' : 'Available to spend'}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6 relative z-10">
        <AnimatePresence mode="wait">
          {viewType === 'pie' ? (
            <motion.div
              key="pie"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3B82F6" name="Budget" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="#EF4444" name="Spent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Details */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Details</h4>
        {categories.map((category, index) => {
          const percentSpent = category.estimated > 0 ? (category.spent / category.estimated) * 100 : 0;
          const isOverBudget = category.spent > category.estimated;
          
          return (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {category.category}
                  </h5>
                  {isOverBudget && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${category.spent.toLocaleString()} / ${category.estimated.toLocaleString()}
                    </div>
                    <div className={`text-xs ${
                      isOverBudget ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {percentSpent.toFixed(1)}% used
                      {isOverBudget && ' (Over budget!)'}
                    </div>
                  </div>
                  
                  {allowEdit && (
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCategorySpending(category.category, -50)}
                        className="p-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-600 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateCategorySpending(category.category, 50)}
                        className="p-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-600 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isOverBudget 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentSpent)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BudgetBreakdown;