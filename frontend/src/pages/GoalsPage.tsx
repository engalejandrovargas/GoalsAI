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
  BarChart3
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
  targetDate?: string;
  estimatedCost?: number;
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  createdAt: string;
}

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
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

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
            <p className="text-gray-600">
              Track and manage your goals with AI-powered insights
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first goal and let AI help you achieve it!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal as any}
                onEdit={() => handleShowProgress(goal)}
                onViewDetails={() => handleShowProgress(goal)}
                onChat={() => {
                  // Handle chat navigation - could navigate to chat page with goal context
                  console.log('Chat about goal:', goal.id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
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
          onClose={() => {
            setShowProgressModal(false);
            setSelectedGoal(null);
          }}
          goal={selectedGoal}
          onGoalUpdated={handleGoalUpdated}
        />
      )}
    </div>
  );
};

export default GoalsPage;