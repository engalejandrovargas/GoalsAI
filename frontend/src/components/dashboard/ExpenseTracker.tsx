import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, DollarSign, TrendingDown, TrendingUp, Edit2, Trash2 } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

interface ExpenseTrackerProps {
  goalId: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ goalId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', description: 'Coffee', amount: 5, category: 'Food', date: '2024-01-20', type: 'expense' },
    { id: '2', description: 'Lunch', amount: 12, category: 'Food', date: '2024-01-20', type: 'expense' },
    { id: '3', description: 'Gas', amount: 45, category: 'Transport', date: '2024-01-19', type: 'expense' },
    { id: '4', description: 'Freelance Payment', amount: 500, category: 'Income', date: '2024-01-19', type: 'income' },
    { id: '5', description: 'Groceries', amount: 78, category: 'Food', date: '2024-01-18', type: 'expense' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income'
  });

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Income', 'Other'];

  const totalExpenses = expenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalIncome = expenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        type: newExpense.type
      };
      setExpenses([expense, ...expenses]);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
      setShowAddForm(false);
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Tracker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your spending patterns</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Income</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        
        <div className={`rounded-lg p-4 ${netAmount >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className="flex items-center gap-2">
            <DollarSign className={`w-5 h-5 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Net Amount
            </span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${netAmount >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            ${netAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleAddExpense}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={newExpense.type}
                onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'expense' | 'income' })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Entry
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Transactions</h4>
        {expenses.slice(0, 8).map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                expense.type === 'expense' 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                {expense.type === 'expense' ? (
                  <TrendingDown className={`w-4 h-4 ${
                    expense.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`} />
                ) : (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{expense.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                expense.type === 'expense' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        {expenses.length > 8 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
            And {expenses.length - 8} more transactions...
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ExpenseTracker;