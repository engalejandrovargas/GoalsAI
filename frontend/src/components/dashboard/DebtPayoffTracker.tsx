import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingDown, Calendar, DollarSign, Plus, Target, Clock } from 'lucide-react';

interface Debt {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: 'credit_card' | 'student_loan' | 'car_loan' | 'mortgage' | 'personal_loan';
}

interface DebtPayoffTrackerProps {
  goalId: string;
}

const DebtPayoffTracker: React.FC<DebtPayoffTrackerProps> = ({ goalId }) => {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: '1',
      name: 'Credit Card',
      balance: 3200,
      originalBalance: 5000,
      interestRate: 18.9,
      minimumPayment: 75,
      dueDate: '2024-02-15',
      type: 'credit_card'
    },
    {
      id: '2',
      name: 'Student Loan',
      balance: 12500,
      originalBalance: 15000,
      interestRate: 6.5,
      minimumPayment: 150,
      dueDate: '2024-02-20',
      type: 'student_loan'
    },
    {
      id: '3',
      name: 'Car Loan',
      balance: 8900,
      originalBalance: 15000,
      interestRate: 4.2,
      minimumPayment: 320,
      dueDate: '2024-02-10',
      type: 'car_loan'
    }
  ]);

  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(200);

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + (debt.originalBalance - debt.balance), 0);
  const totalProgress = debts.reduce((sum, debt) => sum + debt.originalBalance, 0);
  const progressPercentage = totalPaid / totalProgress * 100;

  const getDebtIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return CreditCard;
      case 'student_loan': return Target;
      case 'car_loan': return DollarSign;
      default: return CreditCard;
    }
  };

  const getDebtColor = (type: string) => {
    switch (type) {
      case 'credit_card': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'student_loan': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'car_loan': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
    }
  };

  const calculatePayoffTime = (debt: Debt, extraPayment: number) => {
    const monthlyPayment = debt.minimumPayment + (extraPayment * (debt.balance / totalDebt));
    const monthlyRate = debt.interestRate / 100 / 12;
    
    if (monthlyPayment <= debt.balance * monthlyRate) {
      return 'Never (payment too low)';
    }
    
    const months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / monthlyPayment) / 
      Math.log(1 + monthlyRate)
    );
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years}y ${remainingMonths}m`;
    } else {
      return `${months}m`;
    }
  };

  const getSortedDebts = () => {
    if (payoffStrategy === 'snowball') {
      return [...debts].sort((a, b) => a.balance - b.balance);
    } else {
      return [...debts].sort((a, b) => b.interestRate - a.interestRate);
    }
  };

  const makePayment = (debtId: string, amount: number) => {
    setDebts(debts.map(debt => 
      debt.id === debtId 
        ? { ...debt, balance: Math.max(0, debt.balance - amount) }
        : debt
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Debt Payoff Tracker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your debt elimination progress</p>
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payoff Strategy:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPayoffStrategy('avalanche')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                payoffStrategy === 'avalanche'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Avalanche (High Interest First)
            </button>
            <button
              onClick={() => setPayoffStrategy('snowball')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                payoffStrategy === 'snowball'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Snowball (Low Balance First)
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Extra Payment:</label>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            placeholder="0"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">per month</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Total Debt</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            ${totalDebt.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {progressPercentage.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Min Payments</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            ${totalMinimumPayments}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Payment</span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            ${totalMinimumPayments + extraPayment}
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ${totalPaid.toLocaleString()} paid of ${totalProgress.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Debt List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Debts (Sorted by {payoffStrategy === 'avalanche' ? 'Interest Rate' : 'Balance'})
        </h4>
        {getSortedDebts().map((debt, index) => {
          const Icon = getDebtIcon(debt.type);
          const progress = ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100;
          const payoffTime = calculatePayoffTime(debt, extraPayment);
          
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getDebtColor(debt.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{debt.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {debt.interestRate}% APR • Due: {new Date(debt.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {index === 0 && payoffStrategy && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                    Focus Debt
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Balance: ${debt.balance.toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Payoff: {payoffTime}</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Min Payment: ${debt.minimumPayment}
                  </span>
                  <button
                    onClick={() => makePayment(debt.id, 50)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Pay $50
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DebtPayoffTracker;