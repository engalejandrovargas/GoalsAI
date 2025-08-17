import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import FeasibilityAnalysisCard from '../components/FeasibilityAnalysisCard';
import toast from 'react-hot-toast';

const GoalAnalyzerPage: React.FC = () => {
  const { colors } = useTheme();
  const [goalDescription, setGoalDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!goalDescription.trim()) {
      toast.error('Please enter a goal description');
      return;
    }

    if (goalDescription.length < 10) {
      toast.error('Please provide more details about your goal');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const response = await apiService.analyzeGoal(goalDescription);
      
      if (response.success) {
        setAnalysis(response.analysis);
        toast.success('Goal analyzed successfully!');
      } else {
        toast.error('Failed to analyze goal');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze goal. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeasibilityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="p-6 min-h-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold ${colors.textPrimary} mb-4`}>
            AI Goal Analyzer
          </h1>
          <p className={`text-xl ${colors.textSecondary} max-w-2xl mx-auto`}>
            Get intelligent insights about your goals with AI-powered feasibility analysis
          </p>
        </div>

        {/* Goal Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6`}>
            <label className={`block text-lg font-medium ${colors.textPrimary} mb-4`}>
              Describe your goal in detail
            </label>
            <textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="e.g., I want to learn web development and become a full-stack developer within 12 months. I'm currently working in marketing but want to transition to tech..."
              rows={4}
              className={`w-full px-4 py-3 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
            />
            <div className="flex justify-between items-center mt-4">
              <span className={`text-sm ${goalDescription.length < 10 ? 'text-red-500' : colors.textTertiary}`}>
                {goalDescription.length}/500 characters {goalDescription.length < 10 && '(minimum 10)'}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || goalDescription.length < 10}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
                  isAnalyzing || goalDescription.length < 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Goal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Enhanced Feasibility Analysis */}
            {analysis.detailedAnalysis && (
              <div className="mb-8">
                <FeasibilityAnalysisCard
                  analysis={analysis.detailedAnalysis}
                  onSelectAlternative={(alternative) => {
                    console.log('Selected alternative:', alternative);
                    toast.success('Alternative selected! You can now create this goal.');
                  }}
                />
              </div>
            )}
            {/* Feasibility Score */}
            <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6 mb-6 border ${colors.cardBorder}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${colors.textPrimary}`}>Feasibility Analysis</h2>
                <div className={`px-4 py-2 rounded-full ${getFeasibilityBgColor(analysis.feasibilityScore)}`}>
                  <span className={`text-lg font-bold ${getFeasibilityColor(analysis.feasibilityScore)}`}>
                    {analysis.feasibilityScore}%
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className={`font-semibold ${colors.textPrimary}`}>Timeline</h3>
                  <p className={colors.textSecondary}>{analysis.estimatedTimeframe}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className={`font-semibold ${colors.textPrimary}`}>Est. Cost</h3>
                  <p className={colors.textSecondary}>
                    ${analysis.estimatedCost.min} - ${analysis.estimatedCost.max}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className={`font-semibold ${colors.textPrimary}`}>Category</h3>
                  <p className={`${colors.textSecondary} capitalize`}>{analysis.category}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Success Factors */}
              <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className={`text-xl font-bold ${colors.textPrimary}`}>Success Factors</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.successFactors.map((factor: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className={colors.textSecondary}>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags */}
              <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                  <h3 className={`text-xl font-bold ${colors.textPrimary}`}>Potential Challenges</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.redFlags.map((flag: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className={colors.textSecondary}>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Steps */}
            <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6 mb-6 border ${colors.cardBorder}`}>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className={`text-xl font-bold ${colors.textPrimary}`}>Action Steps</h3>
              </div>
              <div className="space-y-4">
                {analysis.actionSteps.map((step: any, index: number) => (
                  <div key={index} className={`flex items-start p-4 ${colors.backgroundTertiary} border ${colors.cardBorder} rounded-lg`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 flex-shrink-0 ${
                      step.priority === 'high' ? 'bg-red-500' : 
                      step.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>{step.step}</h4>
                      <div className={`flex items-center text-sm ${colors.textSecondary}`}>
                        <span className="mr-4">⏰ {step.timeframe}</span>
                        {step.cost > 0 && <span>💰 ${step.cost}</span>}
                        <span className={`ml-4 px-2 py-1 rounded text-xs ${
                          step.priority === 'high' ? 'bg-red-100 text-red-800' :
                          step.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {step.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-xl font-bold ${colors.textPrimary} mb-4`}>Recommended Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.resources.map((resource: any, index: number) => (
                  <div key={index} className={`border ${colors.cardBorder} rounded-lg p-4 ${colors.backgroundTertiary}`}>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {resource.type}
                      </span>
                      {resource.cost > 0 && (
                        <span className={`text-sm ${colors.textSecondary} ml-2`}>${resource.cost}</span>
                      )}
                    </div>
                    <h4 className={`font-semibold ${colors.textPrimary} mb-1`}>{resource.name}</h4>
                    <p className={`${colors.textSecondary} text-sm`}>{resource.description}</p>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alternatives */}
            {analysis.alternatives.length > 0 && (
              <div className={`${colors.cardBackground} rounded-xl shadow-lg p-6 mt-6 border ${colors.cardBorder}`}>
                <h3 className={`text-xl font-bold ${colors.textPrimary} mb-4`}>Alternative Approaches</h3>
                <div className="space-y-3">
                  {analysis.alternatives.map((alternative: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className={colors.textSecondary}>{alternative}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GoalAnalyzerPage;