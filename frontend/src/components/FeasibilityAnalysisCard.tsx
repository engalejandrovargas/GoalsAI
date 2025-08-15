import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';

interface FeasibilityAnalysisProps {
  analysis: {
    score: number;
    assessment: string;
    redFlags?: Array<{
      title: string;
      explanation: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    alternatives?: Array<{
      title: string;
      description: string;
      feasibilityScore: number;
      estimatedCost: number;
      timeframe: string;
    }>;
    breakdown: {
      financial: number;
      timeline: number;
      skills: number;
      market: number;
      personal: number;
    };
  };
  onSelectAlternative?: (alternative: any) => void;
}

const FeasibilityAnalysisCard: React.FC<FeasibilityAnalysisProps> = ({
  analysis,
  onSelectAlternative
}) => {
  const getFeasibilityIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="text-green-600 w-6 h-6" />;
    if (score >= 60) return <AlertCircle className="text-yellow-600 w-6 h-6" />;
    if (score >= 35) return <AlertTriangle className="text-orange-600 w-6 h-6" />;
    return <XCircle className="text-red-600 w-6 h-6" />;
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 35) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getBreakdownColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getFeasibilityIcon(analysis.score)}
            <div className="ml-3">
              <h3 className="text-xl font-bold text-gray-900">Feasibility Analysis</h3>
              <p className="text-gray-600">AI-powered goal assessment</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-lg ${getFeasibilityColor(analysis.score)}`}>
            {analysis.score}%
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              className={`h-3 rounded-full ${
                analysis.score >= 85 ? 'bg-green-500' :
                analysis.score >= 60 ? 'bg-yellow-500' :
                analysis.score >= 35 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${analysis.score}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* AI Assessment */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">AI Assessment</h4>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.assessment}</p>
        </div>

        {/* Breakdown Chart */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Detailed Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(analysis.breakdown).map(([category, score]) => (
              <div key={category} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 capitalize font-medium">
                  {category}
                </div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getBreakdownColor(score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                  {score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Red Flags */}
        {analysis.redFlags && analysis.redFlags.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-600 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Reality Checks
            </h4>
            <div className="space-y-3">
              {analysis.redFlags.map((flag, index) => (
                <motion.div
                  key={index}
                  className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(flag.severity)}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h5 className="font-medium mb-1">{flag.title}</h5>
                  <p className="text-sm">{flag.explanation}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-white bg-opacity-50 rounded text-xs font-medium uppercase">
                    {flag.severity} severity
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Alternatives */}
        {analysis.alternatives && analysis.alternatives.length > 0 && (
          <div>
            <h4 className="font-semibold text-purple-600 mb-3 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Better Alternatives
            </h4>
            <div className="space-y-3">
              {analysis.alternatives.map((alternative, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-purple-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectAlternative?.(alternative)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{alternative.title}</h5>
                    <div className="flex items-center">
                      <span className="text-green-600 font-semibold text-sm mr-2">
                        {alternative.feasibilityScore}%
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{alternative.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>💰 ${alternative.estimatedCost.toLocaleString()}</span>
                    <span>⏱️ {alternative.timeframe}</span>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-purple-600 text-sm font-medium hover:underline">
                      Switch to this goal →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeasibilityAnalysisCard;