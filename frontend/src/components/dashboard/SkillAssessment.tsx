import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Book,
  Code,
  Palette,
  Users,
  MessageSquare,
  BarChart3,
  Plus,
  Minus,
  Edit3,
  RefreshCw,
  CheckCircle,
  Circle,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Camera,
  Music,
  Wrench
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'creative' | 'business' | 'personal' | 'language' | 'other';
  currentLevel: number;
  targetLevel: number;
  maxLevel: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  assessmentDate?: string;
  improvements: {
    date: string;
    previousLevel: number;
    newLevel: number;
    note?: string;
  }[];
  resources?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    verified: boolean;
  }[];
  projects?: {
    name: string;
    description: string;
    skillsUsed: number; // 1-10 how much this skill was used
  }[];
}

interface SkillAssessmentProps {
  goalId: string;
  showProgress?: boolean;
  showRecommendations?: boolean;
  allowEdit?: boolean;
  skills?: Skill[];
  onUpdateSkills?: (skills: Skill[]) => void;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  goalId,
  showProgress = true,
  showRecommendations = true,
  allowEdit = true,
  skills = [],
  onUpdateSkills,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assessmentMode, setAssessmentMode] = useState(false);

  // Enhanced mock skills data
  const defaultSkills: Skill[] = [
    {
      id: '1',
      name: 'React Development',
      category: 'technical',
      currentLevel: 7,
      targetLevel: 9,
      maxLevel: 10,
      importance: 'critical',
      assessmentDate: '2025-01-15',
      improvements: [
        { date: '2024-12-01', previousLevel: 6, newLevel: 7, note: 'Completed advanced React course' },
        { date: '2024-09-15', previousLevel: 5, newLevel: 6, note: 'Built complex SPA project' }
      ],
      resources: ['Official React Docs', 'Advanced React Patterns Course'],
      certifications: [
        { name: 'React Developer Certification', issuer: 'Meta', date: '2024-11-15', verified: true }
      ],
      projects: [
        { name: 'E-commerce Dashboard', description: 'Complex React application with hooks and context', skillsUsed: 9 },
        { name: 'Social Media App', description: 'React Native mobile application', skillsUsed: 7 }
      ]
    },
    {
      id: '2',
      name: 'Public Speaking',
      category: 'personal',
      currentLevel: 4,
      targetLevel: 7,
      maxLevel: 10,
      importance: 'high',
      assessmentDate: '2025-01-10',
      improvements: [
        { date: '2024-11-20', previousLevel: 3, newLevel: 4, note: 'Gave presentation at company meeting' }
      ],
      resources: ['Toastmasters International', 'Public Speaking Masterclass'],
      projects: [
        { name: 'Tech Conference Talk', description: 'Presented React best practices to 200+ developers', skillsUsed: 8 }
      ]
    },
    {
      id: '3',
      name: 'UI/UX Design',
      category: 'creative',
      currentLevel: 6,
      targetLevel: 8,
      maxLevel: 10,
      importance: 'high',
      assessmentDate: '2025-01-12',
      improvements: [
        { date: '2024-10-05', previousLevel: 5, newLevel: 6, note: 'Completed Figma advanced course' }
      ],
      resources: ['Figma Academy', 'Design System Guidelines'],
      certifications: [
        { name: 'UX Design Certificate', issuer: 'Google', date: '2024-08-20', verified: true }
      ]
    },
    {
      id: '4',
      name: 'Project Management',
      category: 'business',
      currentLevel: 5,
      targetLevel: 8,
      maxLevel: 10,
      importance: 'high',
      assessmentDate: '2025-01-08',
      improvements: [
        { date: '2024-12-10', previousLevel: 4, newLevel: 5, note: 'Successfully led cross-functional team project' }
      ],
      resources: ['PMI Guidelines', 'Agile Methodology Course']
    },
    {
      id: '5',
      name: 'Spanish',
      category: 'language',
      currentLevel: 6,
      targetLevel: 9,
      maxLevel: 10,
      importance: 'medium',
      assessmentDate: '2025-01-05',
      improvements: [
        { date: '2024-11-01', previousLevel: 5, newLevel: 6, note: '3-month immersion program completed' }
      ],
      resources: ['Duolingo', 'Spanish Conversation Classes'],
      certifications: [
        { name: 'DELE B2 Certificate', issuer: 'Instituto Cervantes', date: '2024-10-15', verified: true }
      ]
    },
    {
      id: '6',
      name: 'Data Analysis',
      category: 'technical',
      currentLevel: 3,
      targetLevel: 6,
      maxLevel: 10,
      importance: 'medium',
      assessmentDate: '2025-01-03',
      improvements: [],
      resources: ['Python for Data Science', 'SQL Bootcamp']
    }
  ];

  const skillsData = skills.length > 0 ? skills : defaultSkills;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="w-4 h-4" />;
      case 'creative': return <Palette className="w-4 h-4" />;
      case 'business': return <BarChart3 className="w-4 h-4" />;
      case 'personal': return <Users className="w-4 h-4" />;
      case 'language': return <Globe className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'from-blue-500 to-indigo-600';
      case 'creative': return 'from-purple-500 to-pink-600';
      case 'business': return 'from-green-500 to-emerald-600';
      case 'personal': return 'from-orange-500 to-red-600';
      case 'language': return 'from-teal-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getSkillGap = (skill: Skill) => {
    return skill.targetLevel - skill.currentLevel;
  };

  const getSkillProgress = (skill: Skill) => {
    return (skill.currentLevel / skill.maxLevel) * 100;
  };

  const filteredSkills = skillsData.filter(skill => 
    selectedCategory === 'all' || skill.category === selectedCategory
  );

  const updateSkillLevel = (skillId: string, newLevel: number) => {
    const updatedSkills = skillsData.map(skill =>
      skill.id === skillId
        ? {
            ...skill,
            currentLevel: Math.max(0, Math.min(skill.maxLevel, newLevel)),
            assessmentDate: new Date().toISOString().split('T')[0]
          }
        : skill
    );
    onUpdateSkills?.(updatedSkills);
  };

  const categories = ['all', 'technical', 'creative', 'business', 'personal', 'language', 'other'];
  const avgCurrentLevel = skillsData.reduce((sum, skill) => sum + skill.currentLevel, 0) / skillsData.length;
  const avgTargetLevel = skillsData.reduce((sum, skill) => sum + skill.targetLevel, 0) / skillsData.length;
  const skillsNeedingWork = skillsData.filter(skill => getSkillGap(skill) > 2).length;
  const totalCertifications = skillsData.reduce((sum, skill) => sum + (skill.certifications?.length || 0), 0);

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
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Skill Assessment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track and improve your professional skills
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {avgCurrentLevel.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Avg Level
            </div>
          </div>
          <button
            onClick={() => setAssessmentMode(!assessmentMode)}
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              assessmentMode 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="font-medium">
              {assessmentMode ? 'Exit Assessment' : 'Start Assessment'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Total Skills</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{skillsData.length}</p>
              <p className="text-xs text-purple-600">Tracked</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Avg Level</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{avgCurrentLevel.toFixed(1)}</p>
              <p className="text-xs text-blue-600">Out of 10</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">Need Work</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{skillsNeedingWork}</p>
              <p className="text-xs text-orange-600">Skills</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">Certifications</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalCertifications}</p>
              <p className="text-xs text-green-600">Verified</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              <span className="capitalize">{category === 'all' ? 'All Skills' : category}</span>
              <span className="bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {category === 'all' ? skillsData.length : skillsData.filter(s => s.category === category).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Skill Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(skill.category)} flex items-center justify-center`}>
                    {getCategoryIcon(skill.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{skill.category}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImportanceColor(skill.importance)}`}>
                        {skill.importance}
                      </span>
                    </div>
                  </div>
                </div>

                {assessmentMode && allowEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => updateSkillLevel(skill.id, skill.currentLevel - 1)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      disabled={skill.currentLevel <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateSkillLevel(skill.id, skill.currentLevel + 1)}
                      className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                      disabled={skill.currentLevel >= skill.maxLevel}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Skill Levels */}
              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{skill.currentLevel}/{skill.maxLevel}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getSkillProgress(skill)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getCategoryColor(skill.category)} relative`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Beginner</span>
                  <span className="text-gray-500">Expert</span>
                </div>
              </div>

              {/* Target vs Current */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Target: {skill.targetLevel}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getSkillGap(skill) > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">+{getSkillGap(skill)} to go</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Target reached!</span>
                    </>
                  )}
                </div>
              </div>

              {/* Certifications */}
              {skill.certifications && skill.certifications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Certifications
                  </h4>
                  <div className="space-y-1">
                    {skill.certifications.slice(0, 2).map((cert, certIndex) => (
                      <div key={certIndex} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">{cert.name}</span>
                        <div className="flex items-center gap-1">
                          {cert.verified && <CheckCircle className="w-3 h-3 text-green-500" />}
                          <span className="text-gray-500">{new Date(cert.date).getFullYear()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Progress */}
              {skill.improvements && skill.improvements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Recent Progress
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {skill.improvements[0].previousLevel} → {skill.improvements[0].newLevel}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {new Date(skill.improvements[0].date).toLocaleDateString()}
                      </span>
                    </div>
                    {skill.improvements[0].note && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {skill.improvements[0].note}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSkill(skill.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
              >
                <Brain className="w-4 h-4" />
                View Details
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No skills in this category
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start tracking your skills to see your professional development.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Skill
            </button>
          </div>
        )}
      </div>

      {/* Recommendations Panel */}
      {showRecommendations && skillsData.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Priority Skills</h4>
              <div className="space-y-2">
                {skillsData
                  .filter(skill => skill.importance === 'critical' && getSkillGap(skill) > 0)
                  .slice(0, 3)
                  .map(skill => (
                    <div key={skill.id} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">{skill.name}</span>
                      <span className="text-blue-600 dark:text-blue-400">+{getSkillGap(skill)} levels</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Quick Wins</h4>
              <div className="space-y-2">
                {skillsData
                  .filter(skill => getSkillGap(skill) === 1)
                  .slice(0, 3)
                  .map(skill => (
                    <div key={skill.id} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">{skill.name}</span>
                      <span className="text-green-600 dark:text-green-400">Almost there!</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SkillAssessment;