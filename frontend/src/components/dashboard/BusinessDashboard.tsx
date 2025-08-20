import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  ShoppingCart,
  Star,
  Award,
  Clock,
  Activity,
  Zap,
  Building,
  Globe,
  Phone,
  Mail,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface BusinessDashboardProps {
  goalId: string;
  showRevenueChart?: boolean;
  showCustomerMetrics?: boolean;
  showKPIs?: boolean;
}

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: number;
  color: string;
  icon: any;
  period: string;
}

interface Customer {
  id: string;
  name: string;
  value: number;
  status: 'active' | 'potential' | 'closed';
  lastContact: string;
}

interface BusinessGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  goalId,
  showRevenueChart = true,
  showCustomerMetrics = true,
  showKPIs = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'revenue' | 'customers' | 'marketing'>('overview');

  // Mock data - replace with real data from API
  const businessMetrics: BusinessMetric[] = [
    { id: '1', name: 'Revenue', value: 45000, unit: '$', target: 50000, trend: 12.5, color: 'bg-green-500', icon: DollarSign, period: 'This Month' },
    { id: '2', name: 'Customers', value: 142, unit: '', target: 200, trend: 8.2, color: 'bg-blue-500', icon: Users, period: 'Active' },
    { id: '3', name: 'Conversion', value: 3.4, unit: '%', target: 5, trend: -1.2, color: 'bg-purple-500', icon: TrendingUp, period: 'This Week' },
    { id: '4', name: 'Profit Margin', value: 22, unit: '%', target: 25, trend: 2.8, color: 'bg-orange-500', icon: Target, period: 'Current' },
  ];

  const customers: Customer[] = [
    { id: '1', name: 'Acme Corp', value: 12000, status: 'active', lastContact: '2025-01-18' },
    { id: '2', name: 'TechStart Inc', value: 8500, status: 'potential', lastContact: '2025-01-20' },
    { id: '3', name: 'Global Systems', value: 15000, status: 'closed', lastContact: '2025-01-15' },
    { id: '4', name: 'Innovation Ltd', value: 6200, status: 'potential', lastContact: '2025-01-19' },
  ];

  const businessGoals: BusinessGoal[] = [
    { id: '1', name: 'Monthly Revenue', current: 45000, target: 50000, unit: '$', progress: 90, deadline: '2025-01-31', priority: 'high' },
    { id: '2', name: 'New Customers', current: 12, target: 20, unit: 'customers', progress: 60, deadline: '2025-01-31', priority: 'high' },
    { id: '3', name: 'Product Launch', current: 75, target: 100, unit: '%', progress: 75, deadline: '2025-02-15', priority: 'medium' },
    { id: '4', name: 'Market Share', current: 8, target: 12, unit: '%', progress: 67, deadline: '2025-03-01', priority: 'medium' },
  ];

  const monthlyRevenue = [42000, 38000, 45000, 41000, 47000, 45000]; // Last 6 months
  const totalRevenue = 258000;
  const avgMonthlyGrowth = 8.5;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'potential': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header - Travel Dashboard Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Business Growth</h1>
              <p className="text-blue-100">
                SaaS Startup • {customers.length} customers • Month 8
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(businessGoals.reduce((sum, g) => sum + g.progress, 0) / businessGoals.length)}%</div>
            <div className="text-blue-100 text-sm">Goals Complete</div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Revenue</span>
              <span>{businessGoals.find(g => g.name === 'Monthly Revenue')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${businessGoals.find(g => g.name === 'Monthly Revenue')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Customers</span>
              <span>{businessGoals.find(g => g.name === 'New Customers')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${businessGoals.find(g => g.name === 'New Customers')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Product</span>
              <span>{businessGoals.find(g => g.name === 'Product Launch')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${businessGoals.find(g => g.name === 'Product Launch')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.9 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Market Share</span>
              <span>{businessGoals.find(g => g.name === 'Market Share')?.progress || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${businessGoals.find(g => g.name === 'Market Share')?.progress || 0}%` }}
                transition={{ duration: 1, delay: 1.1 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {businessMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  metric.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {metric.trend > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(metric.trend)}%
                </div>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '$' ? '' : metric.unit}
                </p>
                <p className="text-xs text-gray-500">{metric.period}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'marketing', label: 'Marketing', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Goals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Business Goals
                </h3>
                {businessGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{goal.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}</p>
                        <p className="text-xs text-gray-400">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Top Customers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Top Customers
                </h3>
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        customer.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 
                        customer.status === 'potential' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                        'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <Building className={`w-5 h-5 ${
                          customer.status === 'active' ? 'text-green-600' : 
                          customer.status === 'potential' ? 'text-yellow-600' : 
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                          <p className="text-sm text-gray-500">Last: {customer.lastContact}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">${customer.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Value</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'revenue' && (
            <div className="space-y-6">
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                  <p className="text-green-100 text-sm">Year to date</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Monthly Growth
                  </h3>
                  <p className="text-3xl font-bold">{avgMonthlyGrowth}%</p>
                  <p className="text-blue-100 text-sm">Average</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    This Month
                  </h3>
                  <p className="text-3xl font-bold">${businessMetrics[0].value.toLocaleString()}</p>
                  <p className="text-purple-100 text-sm">Current</p>
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {monthlyRevenue.map((revenue, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(revenue / Math.max(...monthlyRevenue)) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="bg-gradient-to-t from-blue-500 to-blue-400 w-full rounded-t-md"
                      />
                      <p className="text-xs text-gray-500 mt-2">{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'customers' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Customer Management</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Manage customer relationships, track interactions, and analyze customer data</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                View All Customers
              </button>
            </div>
          )}

          {selectedTab === 'marketing' && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Marketing Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Track campaigns, analyze conversion rates, and optimize marketing ROI</p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                View Campaigns
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;