import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  Users,
  Award,
  Target,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Zap,
  Brain,
  Compass,
  RocketIcon as Rocket,
  Play,
  ChevronRight,
  AlertCircle,
  Trophy,
  LineChart
} from 'lucide-react';
import mockData from '../../data/mockData';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeline: string;
  steps: CareerStep[];
  skills: string[];
  salary: {
    min: number;
    max: number;
  };
  growth: number; // percentage
}

interface CareerStep {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'experience' | 'certification' | 'network' | 'project';
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  completed: boolean;
  aiRecommendation?: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'skill_gap' | 'market_trend' | 'recommendation';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
}

interface CareerDashboardProps {
  goalId: string;
  showProgress?: boolean;
  showAIInsights?: boolean;
  showNextSteps?: boolean;
  showCareerPath?: boolean;
}

const CareerDashboard: React.FC<CareerDashboardProps> = ({
  goalId,
  showProgress = true,
  showAIInsights = true,
  showNextSteps = true,
  showCareerPath = true,
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'path' | 'insights' | 'progress'>('overview');

  // AI-Generated Career Path
  const careerPath: CareerPath = {
    id: '1',
    title: 'Engineering Manager Track',
    description: 'Strategic path from Senior Engineer to Engineering Manager with focus on leadership and technical excellence',
    difficulty: 'intermediate',
    timeline: '18 months',
    salary: { min: 160000, max: 220000 },
    growth: 35,
    skills: ['Leadership', 'System Design', 'Team Management', 'Strategic Planning', 'Mentoring'],
    steps: [
      {
        id: '1',
        title: 'Complete Leadership Fundamentals Course',
        description: 'Build foundational leadership skills through structured learning',
        type: 'skill',
        priority: 'high',
        timeframe: '4 weeks',
        completed: true,
        aiRecommendation: 'Based on your goal, leadership skills are essential. This course will give you the fundamentals.'
      },
      {
        id: '2',
        title: 'Lead Cross-Team Technical Project',
        description: 'Volunteer to lead a project involving multiple teams to demonstrate leadership',
        type: 'experience',
        priority: 'high',
        timeframe: '8 weeks',
        completed: true,
        aiRecommendation: 'Hands-on leadership experience is crucial. This will showcase your ability to coordinate across teams.'
      },
      {
        id: '3',
        title: 'Mentor 2 Junior Developers',
        description: 'Start mentoring junior team members to develop coaching skills',
        type: 'experience',
        priority: 'high',
        timeframe: 'Ongoing',
        completed: false,
        aiRecommendation: 'Mentoring directly translates to management skills. Start with 1-2 junior developers.'
      },
      {
        id: '4',
        title: 'System Design Mastery',
        description: 'Deepen system design knowledge for technical leadership credibility',
        type: 'skill',
        priority: 'medium',
        timeframe: '6 weeks',
        completed: false,
        aiRecommendation: 'Engineering managers need strong technical depth. Focus on distributed systems and scalability.'
      },
      {
        id: '5',
        title: 'Present Technical Vision to Leadership',
        description: 'Prepare and present a technical roadmap or architecture proposal',
        type: 'experience',
        priority: 'medium',
        timeframe: '3 weeks',
        completed: false,
        aiRecommendation: 'Demonstrate strategic thinking by presenting technical vision to senior leadership.'
      }
    ]
  };

  // AI Insights
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Internal Manager Opening',
      description: 'Your current company just posted an Engineering Manager role in the Platform team',
      action: 'Schedule conversation with Platform team lead',
      priority: 'high',
      confidence: 95
    },
    {
      id: '2', 
      type: 'skill_gap',
      title: 'Budget Management Skills',
      description: 'Most Engineering Manager roles require budget oversight experience',
      action: 'Take "Engineering Leadership & Budget Management" course',
      priority: 'medium',
      confidence: 80
    },
    {
      id: '3',
      type: 'market_trend',
      title: 'Remote Management Demand',
      description: 'Remote team management skills are increasingly valuable in current market',
      action: 'Practice with distributed team leadership',
      priority: 'medium',
      confidence: 85
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'skill': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'experience': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'certification': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'network': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'project': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return <BookOpen className="w-4 h-4" />;
      case 'experience': return <Briefcase className="w-4 h-4" />;
      case 'certification': return <Award className="w-4 h-4" />;
      case 'network': return <Users className="w-4 h-4" />;
      case 'project': return <Rocket className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-yellow-400';
      case 'low': return 'border-l-green-400';
      default: return 'border-l-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'skill_gap': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'market_trend': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'recommendation': return <Star className="w-5 h-5 text-purple-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const pathProgress = {
    completed: careerPath.steps.filter(step => step.completed).length,
    total: careerPath.steps.length,
    percentage: Math.round((careerPath.steps.filter(step => step.completed).length / careerPath.steps.length) * 100)
  };

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Beautiful Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Career Advancement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI-guided path to your next career level
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {pathProgress.percentage}%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{careerPath.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{careerPath.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Target Salary</div>
            <div className="text-lg font-bold text-green-600">
              ${careerPath.salary.min.toLocaleString()} - ${careerPath.salary.max.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pathProgress.percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full flex items-center justify-end pr-2"
          >
            <span className="text-white text-xs font-medium">{pathProgress.percentage}%</span>
          </motion.div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{pathProgress.completed} of {pathProgress.total} steps completed</span>
          <span>Timeline: {careerPath.timeline}</span>
        </div>
      </motion.div>

      {/* View Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Next Steps', icon: Play },
            { id: 'path', label: 'Career Path', icon: Compass },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'progress', label: 'Progress', icon: LineChart },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedView === id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Next Priority Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Your Next Steps
              </h3>
              <div className="space-y-4">
                {careerPath.steps
                  .filter(step => !step.completed)
                  .slice(0, 3)
                  .map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-r p-4 rounded-xl border-l-4 ${getPriorityColor(step.priority)} bg-white dark:bg-gray-700 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${getTypeColor(step.type)}`}>
                              {getTypeIcon(step.type)}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{step.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${step.priority === 'high' ? 'bg-red-100 text-red-700' : step.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {step.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🕒 {step.timeframe}</span>
                          </div>
                          {step.aiRecommendation && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span><strong>AI Insight:</strong> {step.aiRecommendation}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          Start
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'path' && (
          <div className="space-y-6">
            {/* Career Path Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Compass className="w-5 h-5 mr-2 text-indigo-600" />
                Complete Career Path
              </h3>
              <div className="space-y-4">
                {careerPath.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-4 rounded-xl border-l-4 ${getPriorityColor(step.priority)} ${
                      step.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400' 
                        : 'bg-white dark:bg-gray-700'
                    } hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${getTypeColor(step.type)}`}>
                          {getTypeIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`font-semibold ${
                              step.completed 
                                ? 'text-green-800 dark:text-green-200' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {step.title}
                            </h4>
                            {step.completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className={`text-sm mb-3 ${
                            step.completed 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🕒 {step.timeframe}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              step.priority === 'high' 
                                ? 'bg-red-100 text-red-700' 
                                : step.priority === 'medium' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {step.priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!step.completed && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Start
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'insights' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Career Insights
              </h3>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-white to-purple-50 dark:from-gray-700 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              insight.priority === 'high' 
                                ? 'bg-red-100 text-red-700' 
                                : insight.priority === 'medium' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {insight.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            💡 {insight.action}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            Act
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                Skills Development
              </h3>
              <div className="space-y-4">
                {careerPath.skills.map((skill, index) => {
                  const progress = Math.floor(Math.random() * 40) + 60; // Mock progress 60-100%
                  return (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{skill}</span>
                        <span className="text-gray-500">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Timeline Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-green-700 dark:text-green-300 font-medium">Completed Steps</span>
                  <span className="text-green-800 dark:text-green-200 font-bold">{pathProgress.completed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Remaining Steps</span>
                  <span className="text-blue-800 dark:text-blue-200 font-bold">{pathProgress.total - pathProgress.completed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Estimated Time Left</span>
                  <span className="text-purple-800 dark:text-purple-200 font-bold">12 months</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CareerDashboard;