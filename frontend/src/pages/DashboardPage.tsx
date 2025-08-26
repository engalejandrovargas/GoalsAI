import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  MessageCircle, 
  BarChart3, 
  Sparkles, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Archive, 
  Copy,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Star,
  Award,
  ChevronDown,
  X,
  Timer,
  Zap,
  TrendingDown,
  Activity,
  CheckCircle2,
  PlayCircle,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import GoalCreationModal from '../components/GoalCreationModal';
import GoalProgressModal from '../components/GoalProgressModal';
import GoalCard from '../components/GoalCard';
import { SmartGoalModal } from '../components/SmartGoalModal';
import { SmartGoalCard } from '../components/SmartGoalCard';
import { apiService } from '../services/api';
import { useConfirmation } from '../hooks/useConfirmation';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  targetDate?: string;
  estimatedCost?: number;
  currentSaved?: number;
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  aiPlan?: string;
  assignedAgents?: string;
  smartGoalData?: string;
  progress?: {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
  };
  createdAt: string;
  updatedAt?: string;
}

interface Filters {
  category: string;
  status: string;
  priority: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface Stats {
  totalGoals: number;
  inProgress: number;
  completed: number;
  totalSavings: number;
  averageFeasibility: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmation();
  const [isSmartGoalModalOpen, setIsSmartGoalModalOpen] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [progressModalTab, setProgressModalTab] = useState<'progress' | 'action-plan'>('progress');
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'dashboard' | 'all-goals'>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalGoals: 0,
    inProgress: 0,
    completed: 0,
    totalSavings: 0,
    averageFeasibility: 0
  });

  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    priority: '',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  const categories = [
    { value: 'personal', label: 'Personal Development', color: 'bg-purple-100 text-purple-700', icon: '✨' },
    { value: 'career', label: 'Career & Business', color: 'bg-blue-100 text-blue-700', icon: '💼' },
    { value: 'health', label: 'Health & Fitness', color: 'bg-green-100 text-green-700', icon: '💪' },
    { value: 'finance', label: 'Financial', color: 'bg-yellow-100 text-yellow-700', icon: '💰' },
    { value: 'education', label: 'Education & Learning', color: 'bg-indigo-100 text-indigo-700', icon: '📚' },
    { value: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-700', icon: '❤️' },
    { value: 'creative', label: 'Creative & Hobbies', color: 'bg-orange-100 text-orange-700', icon: '🎨' },
    { value: 'travel', label: 'Travel & Adventure', color: 'bg-teal-100 text-teal-700', icon: '✈️' },
  ];

  const statuses = [
    { value: 'planning', label: 'Planning', color: 'bg-gray-100 text-gray-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'paused', label: 'Paused', color: 'bg-orange-100 text-orange-700' },
    { value: 'pivoted', label: 'Pivoted', color: 'bg-purple-100 text-purple-700' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [goals, filters]);

  const loadGoals = async () => {
    try {
      const response = await apiService.getGoals();
      if (response.success) {
        setGoals(response.goals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...goals];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) ||
        goal.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(goal => goal.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(goal => goal.priority === filters.priority);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof Goal] || '';
      const bVal = b[filters.sortBy as keyof Goal] || '';
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredGoals(filtered);
  };

  const calculateStats = () => {
    const totalGoals = goals.length;
    const inProgress = goals.filter(g => g.status === 'in_progress').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const totalSavings = goals.reduce((sum, g) => sum + (g.currentSaved || 0), 0);
    const goalsWithFeasibility = goals.filter(g => g.feasibilityScore);
    const averageFeasibility = goalsWithFeasibility.length > 0 
      ? goalsWithFeasibility.reduce((sum, g) => sum + (g.feasibilityScore || 0), 0) / goalsWithFeasibility.length 
      : 0;

    setStats({
      totalGoals,
      inProgress,
      completed,
      totalSavings,
      averageFeasibility
    });
  };

  const handleGoalCreated = () => {
    loadGoals();
  };

  const handleGoalUpdated = () => {
    loadGoals();
  };

  const handleShowProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressModalTab('progress');
    setShowProgressModal(true);
  };

  const handleShowActionPlan = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressModalTab('action-plan');
    setShowProgressModal(true);
  };

  const handleEditGoal = async (goalId: string, updateData: Partial<Goal>) => {
    try {
      const response = await apiService.updateGoal(goalId, updateData);
      if (response.success) {
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId ? { ...goal, ...response.goal } : goal
          )
        );
        toast.success('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const confirmed = await confirm({
      title: 'Delete Goal',
      message: 'Are you sure you want to delete this goal? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiService.deleteGoal(goalId);
      if (response.success) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        toast.success('Goal deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleDuplicateGoal = async (goalId: string) => {
    try {
      const response = await apiService.duplicateGoal(goalId);
      if (response.success) {
        loadGoals();
        toast.success('Goal duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating goal:', error);
      toast.error('Failed to duplicate goal');
    }
  };

  const handleArchiveGoal = async (goalId: string) => {
    try {
      const response = await apiService.archiveGoal(goalId);
      if (response.success) {
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId ? { ...goal, ...response.goal } : goal
          )
        );
        toast.success('Goal archived successfully!');
      }
    } catch (error) {
      console.error('Error archiving goal:', error);
      toast.error('Failed to archive goal');
    }
  };

  const handleAnalyzeGoal = async (goalId: string) => {
    try {
      const response = await apiService.analyzeExistingGoal(goalId);
      if (response.success) {
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, ...response.goal, feasibilityAnalysis: response.analysis }
              : goal
          )
        );
        toast.success('Goal analyzed successfully!');
      }
    } catch (error) {
      console.error('Error analyzing goal:', error);
      toast.error('Failed to analyze goal');
    }
  };

  const handleUpdateProgress = async (goalId: string, amount: number) => {
    try {
      const response = await apiService.updateGoalProgress(goalId, amount);
      if (response.success) {
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId ? { ...goal, currentSaved: amount } : goal
          )
        );
        toast.success('Progress updated successfully!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleToggleTask = async (goalId: string, taskId: number) => {
    // This would require backend implementation for task updates
    // For now, just show a placeholder message
    toast('Task toggle functionality coming soon!');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedGoals.size === 0) return;

    const goalIds = Array.from(selectedGoals);
    
    try {
      switch (action) {
        case 'delete':
          const confirmed = await confirm({
            title: 'Delete Multiple Goals',
            message: `Are you sure you want to delete ${goalIds.length} goal${goalIds.length === 1 ? '' : 's'}? This action cannot be undone.`,
            confirmText: 'Delete All',
            cancelText: 'Cancel',
            type: 'danger',
            icon: 'delete'
          });

          if (!confirmed) {
            return;
          }
          await Promise.all(goalIds.map(id => apiService.deleteGoal(id)));
          setGoals(prev => prev.filter(goal => !selectedGoals.has(goal.id)));
          toast.success(`${goalIds.length} goals deleted successfully!`);
          break;
        case 'archive':
          await Promise.all(goalIds.map(id => apiService.archiveGoal(id)));
          loadGoals();
          toast.success(`${goalIds.length} goals archived successfully!`);
          break;
        case 'analyze':
          await Promise.all(goalIds.map(id => apiService.analyzeExistingGoal(id)));
          loadGoals();
          toast.success(`${goalIds.length} goals analyzed successfully!`);
          break;
      }
      setSelectedGoals(new Set());
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Some actions failed to complete');
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.estimatedCost || goal.estimatedCost === 0) return 0;
    return Math.min(100, ((goal.currentSaved || 0) / goal.estimatedCost) * 100);
  };

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      priority: '',
      search: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };

  if (isLoadingGoals) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={colors.textSecondary}>Loading your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${colors.textPrimary} mb-2`}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className={colors.textSecondary}>
              Track your progress and turn dreams into achievable plans
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Beautiful Notification Bell */}
            <NotificationBell 
              goals={goals} 
              onGoalClick={(goal) => {
                setSelectedGoal(goal);
                setProgressModalTab('progress');
                setShowProgressModal(true);
              }} 
            />
            
            <button
              onClick={() => setView(view === 'dashboard' ? 'all-goals' : 'dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : `${colors.buttonSecondary} ${colors.buttonSecondaryText}`
              }`}
            >
              {view === 'dashboard' ? 'View All Goals' : 'Dashboard View'}
            </button>
            <button
              onClick={() => setIsSmartGoalModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Goal
            </button>
            <button
              onClick={() => window.open('/enhanced-test', '_blank')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI System Test
            </button>
          </div>
        </div>

      </motion.div>


      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${colors.cardBackground} rounded-xl shadow-sm border ${colors.cardBorder}`}
      >
        {/* Goals Header with Search and Filters */}
        <div className={`p-6 border-b ${colors.border}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className={`text-xl font-semibold ${colors.textPrimary}`}>
                {view === 'dashboard' ? 'Recent Goals' : 'All Goals'}
              </h3>
              {selectedGoals.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedGoals.size} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('analyze')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Analyze
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Refresh */}
              <button
                onClick={loadGoals}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Priorities</option>
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${colors.textSecondary} mb-2`}>Sort By</label>
                    <div className="flex space-x-2">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="updatedAt">Last Updated</option>
                        <option value="createdAt">Created Date</option>
                        <option value="title">Title</option>
                        <option value="priority">Priority</option>
                        <option value="feasibilityScore">Feasibility</option>
                      </select>
                      <button
                        onClick={() => setFilters({ 
                          ...filters, 
                          sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                        })}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {filters.sortOrder === 'asc' ? 
                          <SortAsc className={`w-4 h-4 ${colors.textSecondary}`} /> : 
                          <SortDesc className={`w-4 h-4 ${colors.textSecondary}`} />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Goals Content */}
        <div className="p-6">
          {filteredGoals.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <Target className={`w-12 h-12 ${colors.textTertiary} mx-auto mb-4`} />
              <h4 className={`text-lg font-medium ${colors.textPrimary} mb-2`}>
                {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
              </h4>
              <p className={`${colors.textSecondary} mb-6`}>
                {goals.length === 0 
                  ? 'Start by creating your first goal and let AI help you make it achievable.'
                  : 'Try adjusting your search or filters to find what you\'re looking for.'
                }
              </p>
              {goals.length === 0 ? (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsSmartGoalModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Create Your First Goal
                  </button>
                </div>
              ) : (
                <button 
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* Goals Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {(view === 'dashboard' ? filteredGoals.slice(0, 6) : filteredGoals).map((goal) => {
                  const categoryInfo = getCategoryInfo(goal.category);
                  const statusInfo = getStatusInfo(goal.status);
                  const progressPercentage = getProgressPercentage(goal);
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => navigate(`/goal/${goal.id}`)}
                      className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] group"
                    >
                      {/* Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{categoryInfo.icon}</div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                {goal.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {goal.description.length > 80 
                                  ? `${goal.description.substring(0, 80)}...` 
                                  : goal.description}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {progressPercentage > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Financial Progress</span>
                              <span className="text-sm text-gray-600">{progressPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Quick Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            {goal.targetDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {goal.estimatedCost && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${goal.estimatedCost.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 font-medium">
                            <span>View Dashboard</span>
                            <Target className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {view === 'dashboard' && filteredGoals.length > 6 && (
            <div className="text-center mt-8">
              <button 
                onClick={() => setView('all-goals')}
                className="inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-medium text-sm border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Target className="w-4 h-4 mr-2" />
                View All {filteredGoals.length} Goals
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI-Powered Goal Creation Modal */}
      <SmartGoalModal
        isOpen={isSmartGoalModalOpen}
        onClose={() => setIsSmartGoalModalOpen(false)}
        onGoalCreated={handleGoalCreated}
      />

      {/* Goal Progress Modal */}
      {selectedGoal && (
        <GoalProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          goal={selectedGoal}
          onGoalUpdated={handleGoalUpdated}
          initialTab={progressModalTab}
        />
      )}

      <ConfirmationDialog />
    </div>
  );
};

export default DashboardPage;