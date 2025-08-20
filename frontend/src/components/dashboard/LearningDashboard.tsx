import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Target,
  Calendar,
  Brain,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Book,
  Zap
} from 'lucide-react';

interface LearningDashboardProps {
  goalId: string;
  showProgressChart?: boolean;
  showSkillRadar?: boolean;
  showStudyTime?: boolean;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({
  goalId,
  showProgressChart = true,
  showSkillRadar = true,
  showStudyTime = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'courses' | 'skills' | 'schedule'>('overview');

  // Mock data
  const skillAreas = [
    { name: 'Speaking', level: 6, maxLevel: 10, color: 'bg-blue-500' },
    { name: 'Listening', level: 7, maxLevel: 10, color: 'bg-green-500' },
    { name: 'Reading', level: 8, maxLevel: 10, color: 'bg-purple-500' },
    { name: 'Writing', level: 5, maxLevel: 10, color: 'bg-orange-500' },
    { name: 'Grammar', level: 7, maxLevel: 10, color: 'bg-red-500' },
    { name: 'Vocabulary', level: 8, maxLevel: 10, color: 'bg-teal-500' }
  ];

  const courses = [
    { id: '1', name: 'Spanish Fundamentals', progress: 75, totalLessons: 20, completedLessons: 15, category: 'Core', difficulty: 'Beginner' },
    { id: '2', name: 'Conversational Spanish', progress: 40, totalLessons: 15, completedLessons: 6, category: 'Speaking', difficulty: 'Intermediate' },
    { id: '3', name: 'Spanish Culture', progress: 20, totalLessons: 10, completedLessons: 2, category: 'Cultural', difficulty: 'Beginner' }
  ];

  const recentSessions = [
    { id: '1', subject: 'Spanish Conversation', duration: 45, date: '2025-01-20', completed: true },
    { id: '2', subject: 'Grammar Practice', duration: 30, date: '2025-01-19', completed: true },
    { id: '3', subject: 'Vocabulary Review', duration: 25, date: '2025-01-18', completed: false }
  ];

  const totalStudyTime = 180;
  const averageSkillLevel = skillAreas.reduce((sum, skill) => sum + skill.level, 0) / skillAreas.length;
  const overallProgress = courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learning Journey</h1>
              <p className="text-purple-100">
                Spanish Language • {courses.length} courses • Level {Math.round(averageSkillLevel)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(overallProgress)}%</div>
            <div className="text-purple-100 text-sm">Complete</div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Courses</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Skills</span>
              <span>{Math.round((averageSkillLevel / 10) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(averageSkillLevel / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Study Time</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.9 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Consistency</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1, delay: 1.1 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Study Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</p>
              <p className="text-xs text-green-600">This week</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lessons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.reduce((sum, c) => sum + c.completedLessons, 0)}</p>
              <p className="text-xs text-blue-600">Completed</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
              <p className="text-xs text-orange-600">Days</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageSkillLevel.toFixed(1)}</p>
              <p className="text-xs text-green-600">Average</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'courses', label: 'Courses', icon: Book },
            { id: 'skills', label: 'Skills', icon: Zap },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === id
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Levels */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Skill Levels
                </h3>
                <div className="space-y-3">
                  {skillAreas.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                        <span className="text-gray-500">{skill.level}/{skill.maxLevel}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-2 rounded-full ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${session.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{session.subject}</p>
                          <p className="text-xs text-gray-500">{session.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{session.duration}min</p>
                        {session.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-gray-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'courses' && (
            <div className="space-y-4">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.progress}%</p>
                      <p className="text-sm text-gray-500">{course.completedLessons}/{course.totalLessons} lessons</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Started</span>
                      <span>{course.progress}% Complete</span>
                      <span>Finish Goal</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillAreas.map((skill) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className={`absolute inset-2 rounded-full ${skill.color} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-lg">{skill.level}</span>
                    </motion.div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{skill.name}</h3>
                  <p className="text-sm text-gray-500">Level {skill.level} of {skill.maxLevel}</p>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-2 rounded-full ${skill.color}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedTab === 'schedule' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Study Schedule</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Plan your learning sessions and track your progress</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Set Study Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;