import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, Target, Brain, DollarSign, Calendar, MapPin } from 'lucide-react';
import { enhancedGoalService } from '../services/EnhancedGoalService';
import type { CreateGoalRequest } from '../services/EnhancedGoalService';
import { GOAL_CATEGORY_MAPPING } from '../config/GoalCategoryMapping';
import toast from 'react-hot-toast';

interface EnhancedGoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (goalId: string) => void;
  initialTitle?: string;
  initialCategory?: string;
}

const EnhancedGoalCreationModal: React.FC<EnhancedGoalCreationModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
  initialTitle = '',
  initialCategory = ''
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: initialTitle,
    description: '',
    category: initialCategory,
    priority: 'medium',
    userLocation: '',
    userBudget: undefined,
    userTimeframe: '',
    userExperience: ''
  });
  
  const [aiEstimation, setAiEstimation] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = Object.values(GOAL_CATEGORY_MAPPING);
  
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAiEstimation(null);
      setShowPreview(false);
      if (initialTitle) setFormData(prev => ({ ...prev, title: initialTitle }));
      if (initialCategory) setFormData(prev => ({ ...prev, category: initialCategory }));
    }
  }, [isOpen, initialTitle, initialCategory]);

  const handleInputChange = (field: keyof CreateGoalRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate basic info
      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Generate AI preview
      await generatePreview();
    } else if (step === 3) {
      // Create goal
      await createGoal();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      console.log('🤖 Generating AI preview for goal...');
      
      // Create a mock goal to get estimation
      const context = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        userLocation: formData.userLocation,
        userBudget: formData.userBudget,
        userTimeframe: formData.userTimeframe,
        userExperience: formData.userExperience
      };

      // Import the estimation service directly for preview
      const { goalEstimationService } = await import('../services/GoalEstimationService');
      const estimation = await goalEstimationService.estimateGoal(context);
      
      setAiEstimation(estimation);
      setShowPreview(true);
      setStep(3);
      
      toast.success('🎉 AI analysis complete! Review your personalized goal plan.');
      
    } catch (error) {
      console.error('❌ Error generating preview:', error);
      toast.error('Failed to generate AI preview');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    setLoading(true);
    try {
      console.log('📝 Creating enhanced goal...');
      
      const goalWithDashboard = await enhancedGoalService.createGoal(formData);
      
      toast.success('🎉 Goal created with personalized dashboard!');
      onGoalCreated(goalWithDashboard.id!);
      onClose();
      
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Goal</h2>
        <p className="text-gray-600">Tell us about your goal and we'll create a personalized dashboard</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Goal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Learn Spanish fluently in 6 months"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your goal in detail..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handleInputChange('priority', priority)}
                className={`py-2 px-4 rounded-lg border transition-all text-sm font-medium ${
                  formData.priority === priority
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Context</h2>
        <p className="text-gray-600">Help us personalize your goal with AI-powered insights</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Your Location (Optional)
          </label>
          <input
            type="text"
            value={formData.userLocation || ''}
            onChange={(e) => handleInputChange('userLocation', e.target.value)}
            placeholder="e.g., San Francisco, CA"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Helps with cost estimates and local resources</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Available Budget (Optional)
          </label>
          <input
            type="number"
            value={formData.userBudget || ''}
            onChange={(e) => handleInputChange('userBudget', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="1000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">AI will adjust recommendations to fit your budget</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Preferred Timeline (Optional)
          </label>
          <input
            type="text"
            value={formData.userTimeframe || ''}
            onChange={(e) => handleInputChange('userTimeframe', e.target.value)}
            placeholder="e.g., 6 months, 1 year"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">How long would you like to achieve this goal?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level (Optional)
          </label>
          <select
            value={formData.userExperience || ''}
            onChange={(e) => handleInputChange('userExperience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select your experience level</option>
            <option value="beginner">Beginner - Just getting started</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Very experienced</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Plan</h2>
        <p className="text-gray-600">Here's your personalized goal plan with smart recommendations</p>
      </div>

      {aiEstimation && (
        <div className="space-y-4">
          {/* Cost & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Estimated Cost</h3>
              </div>
              <p className="text-2xl font-bold text-green-900">${aiEstimation.estimatedCost.toLocaleString()}</p>
              <p className="text-sm text-green-700 mt-1">Based on your goal requirements</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Timeline</h3>
              </div>
              <p className="text-2xl font-bold text-blue-900">{aiEstimation.timeframe}</p>
              <p className="text-sm text-blue-700 mt-1">Target: {aiEstimation.targetDate.toLocaleDateString()}</p>
            </div>
          </div>

          {/* SMART Goal Analysis */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">SMART Goal Analysis</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Specific:</span> {aiEstimation.smartGoalData.specificGoal}</p>
              <p><span className="font-medium">Measurable:</span> {aiEstimation.smartGoalData.measurable}</p>
              <p><span className="font-medium">Achievable:</span> {aiEstimation.smartGoalData.achievable}</p>
              <p><span className="font-medium">Relevant:</span> {aiEstimation.smartGoalData.relevant}</p>
              <p><span className="font-medium">Time-bound:</span> {aiEstimation.smartGoalData.timeBound}</p>
            </div>
          </div>

          {/* Dashboard Components Preview */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3">Your Personalized Dashboard</h3>
            <p className="text-sm text-yellow-700 mb-3">
              We'll create a custom dashboard with {aiEstimation.requiredComponents.length + aiEstimation.contextualComponents.length} specialized components:
            </p>
            <div className="flex flex-wrap gap-2">
              {[...aiEstimation.requiredComponents, ...aiEstimation.contextualComponents].map((component: string) => (
                <span key={component} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>

          {/* AI Agents */}
          {aiEstimation.suggestedAgents.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">AI Assistants</h3>
              <p className="text-sm text-purple-700 mb-2">
                These AI agents will help you achieve your goal:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiEstimation.suggestedAgents.map((agent: string) => (
                  <span key={agent} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {agent.charAt(0).toUpperCase() + agent.slice(1)} AI
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Enhanced Goal Creation
              </h2>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
              <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleNext}
                disabled={loading || (step === 1 && (!formData.title || !formData.description || !formData.category))}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === 1 && 'Continue'}
                {step === 2 && 'Generate Preview'}
                {step === 3 && 'Create Goal'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnhancedGoalCreationModal;