import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, MessageCircle, BarChart3, Settings, LogOut, Brain, Edit3, Trash2, MoreVertical, Archive, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoalCreationModal from '../components/GoalCreationModal';
import GoalProgressModal from '../components/GoalProgressModal';
import GoalCard from '../components/GoalCard';
import { apiService } from '../services/api';
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

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

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
  }, []);

  const loadGoals = async () => {
    try {
      const response = await apiService.getGoals();
      if (response.success) {
        setGoals(response.goals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleGoalCreated = () => {
    loadGoals(); // Refresh goals list
  };

  const handleGoalUpdated = () => {
    loadGoals();
  };

  const handleShowProgress = (goal: Goal) => {
    setSelectedGoal(goal);
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
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
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
    <div className="p-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to turn your dreams into actionable plans?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">New Goal</h3>
            <p className="text-sm text-gray-600">Start planning your next achievement</p>
          </button>

          <button 
            onClick={() => navigate('/analyzer')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Analyzer</h3>
            <p className="text-sm text-gray-600">Analyze goal feasibility with AI</p>
          </button>

          <button 
            onClick={() => navigate('/chat')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Chat</h3>
            <p className="text-sm text-gray-600">Get personalized guidance</p>
          </button>

          <button 
            onClick={() => navigate('/progress')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Progress</h3>
            <p className="text-sm text-gray-600">Track your achievements</p>
          </button>
        </motion.div>

        {/* Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Goals</h3>
            <button 
              onClick={() => navigate('/goals')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </button>
          </div>

          {isLoadingGoals ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No goals yet
              </h4>
              <p className="text-gray-600 mb-6">
                Start by creating your first goal and let AI help you make it achievable.
              </p>
              <button 
                onClick={() => setIsGoalModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </button>
            </div>
          ) : (
            /* Goals Grid with CRUD */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {goals.slice(0, 6).map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isSelected={false}
                    onSelect={() => {}} // No selection in dashboard
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

              {goals.length > 6 && (
                <div className="text-center">
                  <button 
                    onClick={() => navigate('/goals')}
                    className="inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-medium text-sm border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View All {goals.length} Goals
                  </button>
                </div>
              )}
            </>
          )}
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
          />
        )}
    </div>
  );
};

export default DashboardPage;