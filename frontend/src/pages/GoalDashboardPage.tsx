import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Settings,
  Download,
  Share2,
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import GoalDashboardRenderer from '../components/dashboard/GoalDashboardRenderer';

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
  smartGoalData?: string;
  assignedAgents?: string[];
  createdAt: string;
  updatedAt?: string;
}

const GoalDashboardPage: React.FC = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (goalId) {
      loadGoal();
    }
  }, [goalId]);

  const loadGoal = async () => {
    try {
      const response = await apiService.getGoal(goalId!);
      if (response.success) {
        setGoal(response.goal);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      toast.error('Failed to load goal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      // Update the goal with the new data
      const response = await apiService.updateGoal(goalId, updates);
      if (response.success) {
        setGoal(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Goal updated successfully!');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const handleUpdateTasks = async (goalId: string, tasks: any[]) => {
    try {
      // TODO: Implement task update API
      console.log('Updating tasks for goal:', goalId, tasks);
      toast('Task updates coming soon!');
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Failed to update tasks');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      travel: '✈️', business: '💼', health: '💪', finance: '💰',
      education: '📚', personal: '✨', creative: '🎨', relationships: '❤️'
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goal dashboard...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Goal Not Found</h2>
          <p className="text-gray-600 mb-4">The goal you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 text-2xl bg-gray-100 dark:bg-gray-700 rounded-xl">
                  {getCategoryIcon(goal.category)}
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{goal.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard - Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GoalDashboardRenderer
          goal={goal}
          onUpdateGoal={handleUpdateGoal}
          onUpdateTasks={handleUpdateTasks}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default GoalDashboardPage;