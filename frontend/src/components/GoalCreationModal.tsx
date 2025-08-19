import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Plus, Loader, Brain, CheckCircle, Info } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { GOAL_CATEGORY_MAPPING, getDefaultsForCategory } from '../config/GoalCategoryMapping';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated?: () => void;
  prefillDescription?: string;
}

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  targetDate: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
}

const GoalCreationModal: React.FC<GoalCreationModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
  prefillDescription = '',
}) => {
  const [step, setStep] = useState<'form' | 'analyzing' | 'analysis' | 'saving'>('form');
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: 'general',
    targetDate: '',
    estimatedCost: 0,
    priority: 'medium',
  });
  const [analysis, setAnalysis] = useState<any>(null);

  const categories = [
    { value: 'savings', label: 'Savings & Money', icon: '💰', duration: '6 months', cost: '$5,000' },
    { value: 'investment', label: 'Investment & Wealth', icon: '📈', duration: '5 years', cost: '$50,000' },
    { value: 'debt_payoff', label: 'Debt Elimination', icon: '💳', duration: '1 year', cost: '$25,000' },
    { value: 'language', label: 'Language Learning', icon: '🗣️', duration: '2 years', cost: '$500' },
    { value: 'education', label: 'Education & Certification', icon: '📚', duration: '1 year', cost: '$2,000' },
    { value: 'skill_development', label: 'Skill Development', icon: '🚀', duration: '6 months', cost: '$500' },
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️', duration: '6 months', cost: '$1,000' },
    { value: 'fitness', label: 'Fitness & Exercise', icon: '💪', duration: '3 months', cost: '$500' },
    { value: 'wellness', label: 'Health & Wellness', icon: '🧘', duration: '1 year', cost: '$1,500' },
    { value: 'travel', label: 'Travel & Adventure', icon: '✈️', duration: '1 year', cost: '$5,000' },
    { value: 'career', label: 'Career Development', icon: '💼', duration: '1 year', cost: '$2,000' },
    { value: 'business', label: 'Business & Entrepreneurship', icon: '🏢', duration: '2 years', cost: '$10,000' },
    { value: 'habits', label: 'Habit Building', icon: '🔄', duration: '3 months', cost: '$100' },
    { value: 'creative', label: 'Creative Projects', icon: '🎨', duration: '6 months', cost: '$500' },
    { value: 'relationships', label: 'Relationships & Social', icon: '❤️', duration: '6 months', cost: '$200' },
    { value: 'general', label: 'General Goal', icon: '🎯', duration: '3 months', cost: '$500' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-100' },
  ];

  const handleInputChange = (field: keyof GoalFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-update defaults when category changes
  const handleCategoryChange = (categoryId: string) => {
    const defaults = getDefaultsForCategory(categoryId);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + defaults.deadlineDays);
    
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      targetDate: defaultDate.toISOString().split('T')[0],
      estimatedCost: defaults.estimatedCost,
    }));
  };

  const analyzeGoal = async () => {
    if (!formData.description.trim()) {
      toast.error('Please provide a goal description');
      return;
    }

    setStep('analyzing');
    try {
      const response = await apiService.analyzeGoal(formData.description);
      if (response.success) {
        setAnalysis(response.analysis);
        setStep('analysis');
      }
    } catch (error) {
      console.error('Error analyzing goal:', error);
      toast.error('Failed to analyze goal');
      setStep('form');
    }
  };

  const createGoal = async () => {
    setStep('saving');
    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        targetDate: formData.targetDate ? formData.targetDate : undefined,
        estimatedCost: formData.estimatedCost || undefined
      };

      const response = await apiService.createGoal(goalData);
      if (response.success) {
        toast.success('🚀 Smart Goal created with AI analysis!');
        onGoalCreated?.();
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
      setStep('analysis');
    }
  };

  const resetModal = () => {
    setStep('form');
    setFormData({
      title: '',
      description: prefillDescription,
      category: 'general',
      targetDate: '',
      estimatedCost: 0,
      priority: 'medium',
    });
    setAnalysis(null);
  };

  // Update description when prefillDescription changes
  useEffect(() => {
    if (isOpen && prefillDescription) {
      setFormData(prev => ({
        ...prev,
        description: prefillDescription,
      }));
    }
  }, [isOpen, prefillDescription]);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'form' && 'Create New Goal'}
                {step === 'analyzing' && 'Analyzing Goal...'}
                {step === 'analysis' && 'AI Analysis Results'}
                {step === 'saving' && 'Creating Goal...'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={step === 'analyzing' || step === 'saving'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Step 1: Goal Form */}
            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Learn Spanish fluently"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your goal in detail. What do you want to achieve? Why is it important to you?"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-xs text-gray-500">(automatically sets realistic deadline & cost)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`p-3 text-left border rounded-lg transition-colors ${
                          formData.category === category.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{category.icon}</span>
                            <div>
                              <span className="text-sm font-medium block">{category.label}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                <div>{category.duration}</div>
                                <div>{category.cost}</div>
                              </div>
                            </div>
                          </div>
                          {formData.category === category.value && (
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => handleInputChange('targetDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Cost ($)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', parseInt(e.target.value) || 0)}
                      min={0}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Info Display */}
                {formData.category !== 'general' && GOAL_CATEGORY_MAPPING[formData.category] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">
                          {GOAL_CATEGORY_MAPPING[formData.category]?.name} Goal
                        </h4>
                        <p className="text-blue-700 text-sm mb-2">
                          {GOAL_CATEGORY_MAPPING[formData.category]?.description}
                        </p>
                        <div className="text-sm text-blue-600">
                          <div className="mb-1">
                            <strong>Typical Timeline:</strong> {Math.round(GOAL_CATEGORY_MAPPING[formData.category]?.defaultDeadlineDays / 30)} months
                          </div>
                          <div className="mb-1">
                            <strong>Average Cost:</strong> ${GOAL_CATEGORY_MAPPING[formData.category]?.defaultEstimatedCost?.toLocaleString()}
                          </div>
                          <div>
                            <strong>Suggested AI Agents:</strong> {GOAL_CATEGORY_MAPPING[formData.category]?.suggestedAgents?.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={analyzeGoal}
                    disabled={!formData.title.trim() || !formData.description.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      formData.title.trim() && formData.description.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Analyzing */}
            {step === 'analyzing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analyzing Your Goal...
                </h3>
                <p className="text-gray-600">
                  AI is evaluating feasibility, creating action plans, and identifying potential obstacles.
                </p>
              </motion.div>
            )}

            {/* Step 3: Analysis Results */}
            {step === 'analysis' && analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">AI Analysis Complete</h4>
                      <p className="text-green-700 text-sm">
                        Your goal has been analyzed and is ready to be created with AI-generated insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Feasibility Score</h4>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${analysis.feasibilityScore || 75}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {analysis.feasibilityScore || 75}%
                    </span>
                  </div>
                </div>

                {analysis.summary && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {analysis.actionPlan && analysis.actionPlan.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Action Plan</h4>
                    <ul className="space-y-2">
                      {analysis.actionPlan.slice(0, 3).map((step: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setStep('form')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={createGoal}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Goal
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Saving */}
            {step === 'saving' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Creating Your Goal...
                </h3>
                <p className="text-gray-600">
                  Saving your goal with AI insights and recommendations.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalCreationModal;