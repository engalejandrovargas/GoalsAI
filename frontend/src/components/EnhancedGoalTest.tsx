import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Loader2, Plus, Eye } from 'lucide-react';
import EnhancedGoalCreationModal from './EnhancedGoalCreationModal';
import EnhancedGoalDashboard from './dashboard/EnhancedGoalDashboard';
import toast from 'react-hot-toast';

const EnhancedGoalTest: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [testGoals, setTestGoals] = useState<string[]>([]);

  const handleGoalCreated = (goalId: string) => {
    setTestGoals(prev => [...prev, goalId]);
    setSelectedGoalId(goalId);
    toast.success('🎉 Goal created successfully! View your personalized dashboard below.');
  };

  const createSampleGoal = async () => {
    const sampleGoals = [
      {
        title: "Learn Spanish fluently in 6 months",
        description: "Become conversationally fluent in Spanish through daily practice, online courses, and speaking with native speakers.",
        category: "language",
        priority: "high" as const,
        userLocation: "San Francisco, CA",
        userBudget: 800,
        userTimeframe: "6 months",
        userExperience: "beginner"
      },
      {
        title: "Save $10,000 for emergency fund",
        description: "Build a solid emergency fund to cover 6 months of expenses for financial security.",
        category: "savings",
        priority: "high" as const,
        userLocation: "New York, NY",
        userBudget: 10000,
        userTimeframe: "12 months",
        userExperience: "intermediate"
      },
      {
        title: "Run first marathon in under 4 hours",
        description: "Train systematically to complete a full marathon in under 4 hours while staying injury-free.",
        category: "fitness",
        priority: "medium" as const,
        userLocation: "Austin, TX",
        userBudget: 1200,
        userTimeframe: "8 months",
        userExperience: "intermediate"
      },
      {
        title: "Launch SaaS product and reach $5K MRR",
        description: "Build, launch, and grow a SaaS product to achieve $5,000 in monthly recurring revenue.",
        category: "business",
        priority: "high" as const,
        userLocation: "Seattle, WA",
        userBudget: 15000,
        userTimeframe: "18 months",
        userExperience: "advanced"
      }
    ];

    const randomGoal = sampleGoals[Math.floor(Math.random() * sampleGoals.length)];
    
    try {
      const { enhancedGoalService } = await import('../services/EnhancedGoalService');
      const goalWithDashboard = await enhancedGoalService.createGoal(randomGoal);
      
      handleGoalCreated(goalWithDashboard.id!);
    } catch (error) {
      console.error('Error creating sample goal:', error);
      toast.error('Failed to create sample goal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Enhanced Goal System</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Powered</span>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create goals with AI-driven cost estimation, timeline prediction, and dynamic dashboard components
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Custom Goal
          </button>
          
          <button
            onClick={createSampleGoal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Generate Sample Goal
          </button>
        </div>

        {/* Features Overview */}
        {testGoals.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚀 Production-Ready Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Estimation */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Goal Estimation</h3>
                <p className="text-gray-600 text-sm">
                  Intelligent cost estimation, timeline prediction, and feasibility scoring based on goal content and user context
                </p>
              </div>

              {/* Dynamic Components */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Dashboards</h3>
                <p className="text-gray-600 text-sm">
                  25+ specialized components with realistic mock data tailored to each goal category and user progress
                </p>
              </div>

              {/* Smart Categories */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Category Mapping</h3>
                <p className="text-gray-600 text-sm">
                  13 goal categories with optimized component assignments for fitness, business, learning, and more
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-center text-yellow-800">
                <strong>Try it now:</strong> Create a goal or generate a sample to see the AI-powered estimation and dynamic dashboard in action!
              </p>
            </div>
          </div>
        )}

        {/* Goal List */}
        {testGoals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Created Goals ({testGoals.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testGoals.map((goalId, index) => (
                <motion.button
                  key={goalId}
                  onClick={() => setSelectedGoalId(goalId)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedGoalId === goalId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-gray-900">Goal #{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {goalId}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600 font-medium">AI Enhanced</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Goal Dashboard */}
        {selectedGoalId && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI-Generated Dashboard</h2>
                  <p className="text-blue-100">Personalized components with dynamic data</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-full text-white">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <EnhancedGoalDashboard 
                goalId={selectedGoalId}
                onGoalUpdate={(goal) => {
                  console.log('Goal updated:', goal);
                }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Goal Creation Modal */}
        <EnhancedGoalCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGoalCreated={handleGoalCreated}
        />
      </div>
    </div>
  );
};

export default EnhancedGoalTest;