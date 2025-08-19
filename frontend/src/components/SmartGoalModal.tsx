import React, { useState } from 'react';
import { X, Brain, CheckCircle, Clock, Users, DollarSign, MapPin, Calendar } from 'lucide-react';

interface SmartGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

interface ClarificationQuestion {
  question: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: string[];
  required: boolean;
  category: string;
}

interface GoalAnalysis {
  needsClirification: boolean;
  clarity: 'clear' | 'partial' | 'vague';
  requiredAgents: string[];
  estimatedComplexity: number;
  questions?: ClarificationQuestion[];
}

interface ProcessedGoal {
  originalGoal: string;
  clarifiedGoal: string;
  goalDashboard: any;
  assignedAgents: string[];
  analysis: GoalAnalysis;
}

export const SmartGoalModal: React.FC<SmartGoalModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
}) => {
  const [step, setStep] = useState<'input' | 'questions' | 'dashboard'>('input');
  const [goalDescription, setGoalDescription] = useState('');
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [processedGoal, setProcessedGoal] = useState<ProcessedGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialAnalysis = async () => {
    if (!goalDescription.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals/smart-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          goalDescription: goalDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze goal');
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      if (data.needsClirification && data.questions) {
        setStep('questions');
      } else {
        // Goal is clear, process immediately
        await processGoalWithoutQuestions();
      }
    } catch (err) {
      setError('Failed to analyze goal. Please try again.');
      console.error('Error analyzing goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const processGoalWithoutQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/goals/smart-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          goalDescription: goalDescription.trim(),
          answers: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process goal');
      }

      const data = await response.json();
      setProcessedGoal(data.processedGoal);
      setStep('dashboard');
    } catch (err) {
      setError('Failed to process goal. Please try again.');
      console.error('Error processing goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, value: any) => {
    const question = analysis?.questions?.[questionIndex];
    if (question) {
      setAnswers(prev => ({
        ...prev,
        [question.category]: value,
      }));
    }
  };

  const handleQuestionsSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals/smart-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          goalDescription: goalDescription.trim(),
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process goal with answers');
      }

      const data = await response.json();
      setProcessedGoal(data.processedGoal);
      setStep('dashboard');
    } catch (err) {
      setError('Failed to process goal. Please try again.');
      console.error('Error processing goal with answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!processedGoal) return;

    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: processedGoal.goalDashboard.goalSummary.title,
          description: processedGoal.clarifiedGoal,
          category: processedGoal.goalDashboard.goalSummary.category,
          estimatedCost: processedGoal.goalDashboard.financialCalculator?.totalBudget || 0,
          smartGoalData: JSON.stringify(processedGoal),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      onGoalCreated();
      onClose();
      resetModal();
    } catch (err) {
      setError('Failed to create goal. Please try again.');
      console.error('Error creating goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('input');
    setGoalDescription('');
    setAnalysis(null);
    setAnswers({});
    setProcessedGoal(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Smart Goal Creation
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What's your goal?
                </label>
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="e.g., Travel to Japan, Save $10,000, Start a business, Learn Spanish..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitialAnalysis}
                  disabled={!goalDescription.trim() || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Analyze Goal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'questions' && analysis?.questions && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Let's clarify your goal
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Answer these questions to create your personalized action plan
                </p>
              </div>

              <div className="space-y-4">
                {analysis.questions.map((question, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'text' && (
                      <input
                        type="text"
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Your answer..."
                      />
                    )}

                    {question.type === 'select' && question.options && (
                      <select
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select an option...</option>
                        {question.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {question.type === 'date' && (
                      <input
                        type="date"
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    )}

                    {question.type === 'number' && (
                      <input
                        type="number"
                        onChange={(e) => handleAnswerChange(index, parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter amount..."
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleQuestionsSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'dashboard' && processedGoal && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your Smart Goal Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's your personalized action plan
                </p>
              </div>

              {/* Goal Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {processedGoal.goalDashboard.goalSummary.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {processedGoal.goalDashboard.goalSummary.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {processedGoal.goalDashboard.goalSummary.timeline}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    Category: {processedGoal.goalDashboard.goalSummary.category}
                  </div>
                </div>
              </div>

              {/* Financial Calculator */}
              {processedGoal.goalDashboard.financialCalculator && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Budget Breakdown
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(processedGoal.goalDashboard.financialCalculator.breakdown).map(([category, data]: [string, any]) => (
                      <div key={category} className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                        <h6 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                          {category}
                        </h6>
                        <p className="text-2xl font-bold text-green-600">
                          ${data.estimated?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Remaining: ${data.remaining?.toLocaleString() || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                  {processedGoal.goalDashboard.financialCalculator.savingsNeeded && (
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        💡 {processedGoal.goalDashboard.financialCalculator.savingsNeeded}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Task Checklist */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Action Checklist
                </h5>
                <div className="space-y-3">
                  {processedGoal.goalDashboard.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {task.task}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {task.priority} priority
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {task.category}
                          </span>
                          {task.deadline && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('questions')}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Goal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};