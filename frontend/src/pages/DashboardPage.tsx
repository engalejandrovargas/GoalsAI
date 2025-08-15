import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, MessageCircle, BarChart3, Settings, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoalCreationModal from '../components/GoalCreationModal';
import { apiService } from '../services/api';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

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
            onClick={() => navigate('/goals')}
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
            /* Goals List */
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="capitalize">{goal.category}</span>
                        {goal.targetDate && (
                          <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {goal.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        goal.status === 'completed' ? 'bg-green-500' :
                        goal.status === 'active' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}></span>
                    </div>
                  </div>
                </div>
              ))}
              {goals.length > 3 && (
                <button 
                  onClick={() => navigate('/goals')}
                  className="w-full text-center py-3 text-blue-600 hover:text-blue-700 font-medium text-sm border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
                >
                  View {goals.length - 3} more goals
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Goal Creation Modal */}
        <GoalCreationModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onGoalCreated={handleGoalCreated}
        />
    </div>
  );
};

export default DashboardPage;