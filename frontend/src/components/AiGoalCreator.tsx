import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Brain,
  MessageCircle,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GOAL_CATEGORY_MAPPING } from '../config/GoalCategoryMapping';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface AiGoalCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated?: (goal: any) => void;
}

interface AiResponse {
  category: string;
  title: string;
  description: string;
  estimatedCost: number;
  targetDate: string;
  smartGoalData: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  };
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  assignedAgents: string[];
}

const LOADING_MESSAGES = [
  { text: "🧠 Analyzing your goal description...", duration: 1500 },
  { text: "🎯 Selecting optimal category from 18 options...", duration: 1200 },
  { text: "📊 Creating SMART goal framework...", duration: 1000 },
  { text: "💰 Calculating realistic budget estimates...", duration: 800 },
  { text: "⏰ Setting achievable timeline...", duration: 600 },
  { text: "🤖 Assigning specialized AI agents...", duration: 500 },
  { text: "✨ Finalizing your personalized goal...", duration: 400 }
];

export const AiGoalCreator: React.FC<AiGoalCreatorProps> = ({
  isOpen,
  onClose,
  onGoalCreated
}) => {
  const [step, setStep] = useState<'input' | 'analysis' | 'review'>('input');
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!userInput.trim()) {
      toast.error('Please describe your goal first');
      return;
    }

    setIsAnalyzing(true);
    setStep('analysis');
    setCurrentLoadingMessage(0);
    setLoadingProgress(0);

    try {
      // Enhanced loading sequence with realistic AI processing steps
      for (let i = 0; i < LOADING_MESSAGES.length; i++) {
        setCurrentLoadingMessage(i);
        setLoadingProgress(((i + 1) / LOADING_MESSAGES.length) * 100);
        await new Promise(resolve => setTimeout(resolve, LOADING_MESSAGES[i].duration));
      }

      // Intelligent goal categorization based on user input
      const detectCategory = (input: string): string => {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('travel') || lowerInput.includes('trip') || lowerInput.includes('vacation') || lowerInput.includes('visit') || lowerInput.includes('japan') || lowerInput.includes('europe') || lowerInput.includes('country')) return 'travel';
        if (lowerInput.includes('learn') || lowerInput.includes('language') || lowerInput.includes('spanish') || lowerInput.includes('french') || lowerInput.includes('study') || lowerInput.includes('course')) return 'language';
        if (lowerInput.includes('business') || lowerInput.includes('startup') || lowerInput.includes('company') || lowerInput.includes('entrepreneur') || lowerInput.includes('saas') || lowerInput.includes('product')) return 'business';
        if (lowerInput.includes('weight') || lowerInput.includes('lose') || lowerInput.includes('diet') || lowerInput.includes('pounds') || lowerInput.includes('kg') || lowerInput.includes('fat')) return 'weight_loss';
        if (lowerInput.includes('fitness') || lowerInput.includes('gym') || lowerInput.includes('exercise') || lowerInput.includes('workout') || lowerInput.includes('run') || lowerInput.includes('marathon')) return 'fitness';
        if (lowerInput.includes('save') || lowerInput.includes('money') || lowerInput.includes('emergency') || lowerInput.includes('fund') || lowerInput.includes('$') || lowerInput.includes('dollar')) return 'savings';
        if (lowerInput.includes('invest') || lowerInput.includes('portfolio') || lowerInput.includes('stock') || lowerInput.includes('retirement') || lowerInput.includes('wealth')) return 'investment';
        if (lowerInput.includes('debt') || lowerInput.includes('loan') || lowerInput.includes('credit') || lowerInput.includes('pay off') || lowerInput.includes('owe')) return 'debt_payoff';
        if (lowerInput.includes('career') || lowerInput.includes('job') || lowerInput.includes('promotion') || lowerInput.includes('manager') || lowerInput.includes('salary')) return 'career';
        if (lowerInput.includes('skill') || lowerInput.includes('coding') || lowerInput.includes('programming') || lowerInput.includes('react') || lowerInput.includes('development')) return 'skill_development';
        if (lowerInput.includes('education') || lowerInput.includes('degree') || lowerInput.includes('certification') || lowerInput.includes('university') || lowerInput.includes('mba')) return 'education';
        if (lowerInput.includes('health') || lowerInput.includes('wellness') || lowerInput.includes('meditation') || lowerInput.includes('sleep') || lowerInput.includes('stress')) return 'wellness';
        if (lowerInput.includes('read') || lowerInput.includes('book') || lowerInput.includes('novel') || lowerInput.includes('library')) return 'reading';
        if (lowerInput.includes('habit') || lowerInput.includes('routine') || lowerInput.includes('daily') || lowerInput.includes('consistent')) return 'habits';
        if (lowerInput.includes('creative') || lowerInput.includes('blog') || lowerInput.includes('youtube') || lowerInput.includes('content') || lowerInput.includes('art')) return 'creative';
        
        return 'general'; // Default fallback
      };

      const detectedCategory = detectCategory(userInput);
      const categoryConfig = GOAL_CATEGORY_MAPPING[detectedCategory];
      
      // Generate smart title and description
      const generateSmartContent = (input: string, category: string) => {
        // This is a simplified version - in production, use actual AI
        const cleanInput = input.trim();
        const firstSentence = cleanInput.split('.')[0].split('!')[0].split('?')[0];
        
        let title = firstSentence.length > 50 ? 
          firstSentence.substring(0, 47) + '...' : 
          firstSentence;
          
        // Enhance title based on category
        if (!title.toLowerCase().includes(categoryConfig?.name.toLowerCase().split(' ')[0] || '')) {
          title = `${categoryConfig?.name}: ${title}`;
        }
        
        return {
          title: title.charAt(0).toUpperCase() + title.slice(1),
          description: cleanInput.length > 100 ? cleanInput : `${cleanInput}. This goal will help you achieve personal growth and success in the ${categoryConfig?.name.toLowerCase()} domain.`
        };
      };

      const { title, description } = generateSmartContent(userInput, detectedCategory);
      const estimatedCost = categoryConfig?.defaultEstimatedCost || 1000;
      const daysToAdd = categoryConfig?.defaultDeadlineDays || 365;

      const mockResponse: AiResponse = {
        category: detectedCategory,
        title: title,
        description: description,
        estimatedCost: estimatedCost,
        priority: 'medium',
        targetDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
        assignedAgents: categoryConfig?.suggestedAgents || ['research'],
        smartGoalData: {
          specific: `Clearly defined ${categoryConfig?.name.toLowerCase()} objective`,
          measurable: 'Track progress with specific metrics and milestones',
          achievable: 'Realistic timeline and resource allocation',
          relevant: `Important for personal development in ${categoryConfig?.name.toLowerCase()}`,
          timeBound: `Complete within ${Math.ceil(daysToAdd / 30)} months`
        },
        reasoning: `Based on your description, I've identified this as a ${categoryConfig?.name.toLowerCase()} goal. I've set up a comprehensive plan with appropriate timeline, budget, and success metrics tailored to this category.`
      };
      
      setAiResponse(mockResponse);
      setStep('review');
    } catch (error) {
      toast.error('Failed to analyze your goal');
      setStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!aiResponse) return;

    setIsCreating(true);
    try {
      const goalData = {
        title: aiResponse.title,
        description: aiResponse.description,
        category: aiResponse.category,
        priority: aiResponse.priority,
        estimatedCost: aiResponse.estimatedCost,
        currentSaved: 0,
        targetDate: aiResponse.targetDate,
        assignedAgents: JSON.stringify(aiResponse.assignedAgents),
        smartGoalData: JSON.stringify(aiResponse.smartGoalData)
      };

      const newGoal = await apiService.createGoal(goalData);
      toast.success('🎉 Goal created with AI-powered dashboard!');
      onGoalCreated?.(newGoal);
      handleClose();
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setUserInput('');
    setAiResponse(null);
    setIsAnalyzing(false);
    setIsCreating(false);
    setCurrentLoadingMessage(0);
    setLoadingProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  const categoryConfig = aiResponse ? GOAL_CATEGORY_MAPPING[aiResponse.category] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Goal Creator
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe your goal and let AI do the rest
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {step === 'input' && (
              <div className="flex w-full">
                {/* Left Side - Input */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      What do you want to achieve?
                    </label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Describe your goal in your own words..."
                      className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed"
                    />
                  </div>

                  {/* AI Features Info */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="flex items-start">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mr-3">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Goal Creation</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="flex items-center">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1.5" />
                            <span>Smart category selection from 18+ options</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1.5" />
                            <span>SMART goal framework & realistic timeline</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mr-1.5" />
                            <span>Specialized dashboard components</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!userInput.trim()}
                    className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Goal with AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                {/* Right Side - Example Cards */}
                <div className="flex-1 p-6 border-l border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quick Examples
                      </p>
                    </div>

                    <div className="space-y-3 flex-1">
                      {[
                        { 
                          icon: "✈️", 
                          text: "Travel to Japan and experience the culture",
                          category: "Travel"
                        },
                        { 
                          icon: "💼", 
                          text: "Get promoted to senior manager",
                          category: "Career"
                        },
                        { 
                          icon: "💰", 
                          text: "Save $10,000 for emergency fund",
                          category: "Finance"
                        },
                        { 
                          icon: "🏃‍♂️", 
                          text: "Lose 20 pounds and get healthy",
                          category: "Health"
                        },
                        { 
                          icon: "🌟", 
                          text: "Learn Spanish fluently",
                          category: "Education"
                        },
                        { 
                          icon: "🚀", 
                          text: "Launch a SaaS business",
                          category: "Business"
                        }
                      ].map((example, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setUserInput(example.text)}
                          className="group w-full p-3 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center">
                            <span className="text-base mr-3 group-hover:scale-110 transition-transform">
                              {example.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                                {example.text}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 opacity-80">
                                {example.category}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'analysis' && (
              <div className="text-center py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(loadingProgress)}% complete
                  </p>
                </div>

                {/* Animated AI Brain */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto animate-ping opacity-20" />
                </div>

                {/* Loading Message */}
                <div className="min-h-[60px] flex items-center justify-center">
                  <motion.div
                    key={currentLoadingMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      AI Goal Intelligence
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                      {LOADING_MESSAGES[currentLoadingMessage]?.text || 'Processing...'}
                    </p>
                  </motion.div>
                </div>

                {/* Feature highlights */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Target className="w-3 h-3 text-purple-500 mr-1" />
                    <span className="text-purple-700 dark:text-purple-300">Smart Categorization</span>
                  </div>
                  <div className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="w-3 h-3 text-blue-500 mr-1" />
                    <span className="text-blue-700 dark:text-blue-300">SMART Framework</span>
                  </div>
                </div>
              </div>
            )}

            {step === 'review' && aiResponse && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Analysis Complete
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        {aiResponse.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {categoryConfig?.name || aiResponse.category}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={aiResponse.title}
                      onChange={(e) => setAiResponse({...aiResponse, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={aiResponse.description}
                      onChange={(e) => setAiResponse({...aiResponse, description: e.target.value})}
                      className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estimated Cost
                      </label>
                      <input
                        type="number"
                        value={aiResponse.estimatedCost}
                        onChange={(e) => setAiResponse({...aiResponse, estimatedCost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={aiResponse.targetDate.split('T')[0]}
                        onChange={(e) => setAiResponse({...aiResponse, targetDate: e.target.value + 'T00:00:00.000Z'})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('input')}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-xl transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Create Goal
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};