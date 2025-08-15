import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Brain,
  Edit3,
  Trash2,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  MoreVertical,
  Archive,
  Copy,
  CheckSquare,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import GoalCreationModal from '../components/GoalCreationModal';
import GoalProgressModal from '../components/GoalProgressModal';
import GoalCard from '../components/GoalCard';
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

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    hasMore: false,
    limit: 20,
    offset: 0
  });

  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    priority: '',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'personal', label: 'Personal Development', color: 'bg-purple-100 text-purple-700' },
    { value: 'career', label: 'Career & Business', color: 'bg-blue-100 text-blue-700' },
    { value: 'health', label: 'Health & Fitness', color: 'bg-green-100 text-green-700' },
    { value: 'finance', label: 'Financial', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'education', label: 'Education & Learning', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-700' },
    { value: 'creative', label: 'Creative & Hobbies', color: 'bg-orange-100 text-orange-700' },
    { value: 'travel', label: 'Travel & Adventure', color: 'bg-teal-100 text-teal-700' },
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
  }, [filters]);

  useEffect(() => {
    applyFilters();
  }, [goals, filters]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGoals({
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      if (response.success) {
        setGoals(response.goals);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...goals];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) ||
        goal.description.toLowerCase().includes(searchTerm) ||
        goal.category.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredGoals(filtered);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
    setPagination(prev => ({ ...prev, offset: 0 }));
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

  const handleGoalCreated = () => {
    loadGoals();
    setShowCreateModal(false);
  };

  const handleShowProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowProgressModal(true);
  };

  const handleGoalUpdated = () => {
    loadGoals();
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
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteGoal(goalId);
      if (response.success) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        setSelectedGoals(prev => {
          const newSet = new Set(prev);
          newSet.delete(goalId);
          return newSet;
        });
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

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedGoals.size === filteredGoals.length) {
      setSelectedGoals(new Set());
    } else {
      setSelectedGoals(new Set(filteredGoals.map(goal => goal.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGoals.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedGoals.size} goals? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiService.bulkDeleteGoals(Array.from(selectedGoals));
      if (response.success) {
        setGoals(prev => prev.filter(goal => !selectedGoals.has(goal.id)));
        setSelectedGoals(new Set());
        toast.success(`${selectedGoals.size} goals deleted successfully!`);
      }
    } catch (error) {
      console.error('Error bulk deleting goals:', error);
      toast.error('Failed to delete goals');
    }
  };

  const handleBulkUpdate = async (updateData: Partial<Goal>) => {
    if (selectedGoals.size === 0) return;

    try {
      const updates = Array.from(selectedGoals).map(id => ({ id, data: updateData }));
      const response = await apiService.bulkUpdateGoals(updates);
      
      if (response.success) {
        loadGoals();
        setSelectedGoals(new Set());
        toast.success(`${selectedGoals.size} goals updated successfully!`);
      }
    } catch (error) {
      console.error('Error bulk updating goals:', error);
      toast.error('Failed to update goals');
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
          <p className="text-gray-600">
            Manage and track your personal and professional goals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search goals..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            {selectedGoals.size > 0 && (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-gray-600">
                  {selectedGoals.size} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Actions
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
            <button
              onClick={loadGoals}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
          >
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Bulk Actions */}
        {showBulkActions && selectedGoals.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 pt-4 border-t border-gray-200"
          >
            <button
              onClick={() => handleBulkUpdate({ status: 'in_progress' })}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkUpdate({ status: 'completed' })}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            >
              Mark Completed
            </button>
            <button
              onClick={() => handleBulkUpdate({ status: 'paused' })}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Delete
            </button>
          </motion.div>
        )}

        {/* Clear Filters */}
        {(filters.category || filters.status || filters.priority || filters.search) && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filters.search || filters.category || filters.status || filters.priority 
              ? 'No goals match your filters' 
              : 'No goals yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.category || filters.status || filters.priority
              ? 'Try adjusting your filters to see more goals'
              : 'Create your first goal and start working towards your dreams'}
          </p>
          {!(filters.search || filters.category || filters.status || filters.priority) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Select All Checkbox */}
          {filteredGoals.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGoals.size === filteredGoals.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Select all {filteredGoals.length} goals
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isSelected={selectedGoals.has(goal.id)}
                onSelect={() => handleSelectGoal(goal.id)}
                onEdit={(updateData) => handleEditGoal(goal.id, updateData)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onDuplicate={() => handleDuplicateGoal(goal.id)}
                onArchive={() => handleArchiveGoal(goal.id)}
                onAnalyze={() => handleAnalyzeGoal(goal.id)}
                onShowProgress={() => handleShowProgress(goal)}
                getCategoryInfo={getCategoryInfo}
                getStatusInfo={getStatusInfo}
                getPriorityInfo={getPriorityInfo}
                getProgressPercentage={getProgressPercentage}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
                  loadGoals();
                }}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Load More Goals
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <GoalCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGoalCreated={handleGoalCreated}
      />

      {selectedGoal && (
        <GoalProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          goal={selectedGoal}
          onGoalUpdated={handleGoalUpdated}
        />
      )}
    </div>
  );
};

export default GoalsPage;