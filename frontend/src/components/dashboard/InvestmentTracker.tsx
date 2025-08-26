import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Star,
  Settings
} from 'lucide-react';
import mockData from '../../data/mockData';

interface InvestmentTrackerProps {
  goalId: string;
  showPortfolioBreakdown?: boolean;
  showPerformanceChart?: boolean;
  showRebalancing?: boolean;
  allowTransactions?: boolean;
}

const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({
  goalId,
  showPortfolioBreakdown = true,
  showPerformanceChart = true,
  showRebalancing = true,
  allowTransactions = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'portfolio' | 'performance' | 'analysis'>('overview');
  const [showValues, setShowValues] = useState(true);

  const investmentData = mockData.investment;
  const totalGainLoss = investmentData.totalValue - investmentData.totalInvested;
  const gainLossPercentage = (totalGainLoss / investmentData.totalInvested) * 100;

  const getPortfolioColors = () => [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-yellow-500 to-yellow-600',
    'from-red-500 to-red-600',
    'from-purple-500 to-purple-600'
  ];

  const formatCurrency = (amount: number) => {
    return showValues ? `$${amount.toLocaleString()}` : '****';
  };

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Beautiful Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Investment Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your wealth building journey
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowValues(!showValues)}
            className="group flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(investmentData.totalValue)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Total Value
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">Portfolio Value</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(investmentData.totalValue)}
              </p>
              <p className={`text-xs flex items-center gap-1 ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalGainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {formatCurrency(Math.abs(totalGainLoss))} ({gainLossPercentage.toFixed(1)}%)
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Invested</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(investmentData.totalInvested)}
              </p>
              <p className="text-xs text-blue-600">Principal amount</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Total Return</p>
              <p className={`text-2xl font-bold ${
                gainLossPercentage >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600">All time</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">Holdings</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {investmentData.portfolio.length}
              </p>
              <p className="text-xs text-orange-600">Assets</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'portfolio', label: 'Holdings', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'analysis', label: 'Analysis', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === id
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-b-2 border-green-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Portfolio Growth
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Last 10 months
                </div>
              </div>
              
              {/* Simple chart representation */}
              <div className="space-y-3">
                {investmentData.performance.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">{data.month}</span>
                    <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.value / 50000) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      {formatCurrency(data.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Holdings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Top Holdings
              </h3>
              
              <div className="space-y-4">
                {investmentData.portfolio.slice(0, 3).map((holding, index) => (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPortfolioColors()[index % getPortfolioColors().length]} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{holding.symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{holding.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(holding.value)}
                      </p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${
                        holding.gain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.gain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {holding.gain >= 0 ? '+' : ''}{holding.gain.toFixed(1)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'portfolio' && (
          <div className="space-y-4">
            {investmentData.portfolio.map((holding, index) => (
              <motion.div
                key={holding.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPortfolioColors()[index % getPortfolioColors().length]} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold">{holding.symbol}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{holding.symbol}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</p>
                      <p className="text-xs text-gray-400">{holding.shares} shares @ ${holding.price}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(holding.value)}
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 justify-end ${
                      holding.gain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {holding.gain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {holding.gain >= 0 ? '+' : ''}{holding.gain.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {((holding.value / investmentData.totalValue) * 100).toFixed(1)}% of portfolio
                    </div>
                  </div>
                </div>
                
                {/* Portfolio allocation bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(holding.value / investmentData.totalValue) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${getPortfolioColors()[index % getPortfolioColors().length]}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Detailed performance metrics and comparisons</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{gainLossPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Total Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">7.2%</div>
                  <div className="text-sm text-gray-500">Annual Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12.5%</div>
                  <div className="text-sm text-gray-500">Volatility</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Asset Allocation
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Large Cap Stocks</span>
                  <span className="font-medium text-gray-900 dark:text-white">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ETFs</span>
                  <span className="font-medium text-gray-900 dark:text-white">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Growth Stocks</span>
                  <span className="font-medium text-gray-900 dark:text-white">10%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                Risk Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Diversification</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rebalancing</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">On Track</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {allowTransactions && (
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Investment
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <Settings className="w-4 h-4" />
            Rebalance
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default InvestmentTracker;