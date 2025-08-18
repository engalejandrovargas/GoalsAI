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
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import GoalCreationModal from '../components/GoalCreationModal';
import GoalProgressModal from '../components/GoalProgressModal';
import GoalCard from '../components/GoalCard';
import { apiService } from '../services/api';
import { useConfirmation } from '../hooks/useConfirmation';
import toast from 'react-hot-toast';

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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
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
          <div className="flex items-center space-x-2">
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
              onClick={() => setIsGoalModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </button>
          </div>
        </div>

      </motion.div>

      {/* Dashboard Insights - Only show in dashboard view */}
      {view === 'dashboard' && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >


          {/* Priority Goals */}
          <div className={`${colors.cardBackground} rounded-xl shadow-sm border ${colors.cardBorder} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${colors.textPrimary} flex items-center`}>
                <Zap className="w-5 h-5 text-orange-600 mr-2" />
                Priority Tasks
              </h3>
            </div>
            <div className="space-y-3">
              {goals
                .filter(g => g.priority === 'high' && g.status !== 'completed')
                .slice(0, 3)
                .map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        High Priority • {getStatusInfo(goal.status).label}
                      </p>
                    </div>
                    <button
                      onClick={() => handleShowProgress(goal)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              {goals.filter(g => g.priority === 'high' && g.status !== 'completed').length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No high priority tasks pending!</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className={`${colors.cardBackground} rounded-xl shadow-sm border ${colors.cardBorder} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${colors.textPrimary} flex items-center`}>
                <Timer className="w-5 h-5 text-purple-600 mr-2" />
                Upcoming Deadlines
              </h3>
            </div>
            <div className="space-y-3">
              {goals
                .filter(g => g.targetDate && g.status !== 'completed')
                .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())
                .slice(0, 3)
                .map((goal) => {
                  const daysLeft = Math.ceil((new Date(goal.targetDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0;
                  const isUrgent = daysLeft <= 7 && daysLeft >= 0;
                  
                  return (
                    <div key={goal.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      isOverdue ? 'bg-red-50 border-red-100' : 
                      isUrgent ? 'bg-yellow-50 border-yellow-100' : 
                      'bg-blue-50 border-blue-100'
                    }`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                        <p className={`text-xs flex items-center mt-1 ${
                          isOverdue ? 'text-red-600' : 
                          isUrgent ? 'text-yellow-600' : 
                          'text-blue-600'
                        }`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {isOverdue ? 
                            `Overdue by ${Math.abs(daysLeft)} days` :
                            daysLeft === 0 ? 'Due today' :
                            `${daysLeft} days left`
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => handleShowProgress(goal)}
                        className={`text-xs px-2 py-1 rounded-md hover:opacity-80 transition-colors ${
                          isOverdue ? 'bg-red-100 text-red-700' : 
                          isUrgent ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              {goals.filter(g => g.targetDate && g.status !== 'completed').length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
                    onClick={() => setIsGoalModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(view === 'dashboard' ? filteredGoals.slice(0, 6) : filteredGoals).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={selectedGoals.has(goal.id)}
                  onSelect={() => toggleGoalSelection(goal.id)}
                  onEdit={(updateData) => handleEditGoal(goal.id, updateData)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onDuplicate={() => handleDuplicateGoal(goal.id)}
                  onArchive={() => handleArchiveGoal(goal.id)}
                  onAnalyze={() => handleAnalyzeGoal(goal.id)}
                  onShowProgress={() => handleShowProgress(goal)}
                  onShowActionPlan={() => handleShowActionPlan(goal)}
                  getCategoryInfo={getCategoryInfo}
                  getStatusInfo={getStatusInfo}
                  getPriorityInfo={getPriorityInfo}
                  getProgressPercentage={getProgressPercentage}
                />
              ))}
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

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
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