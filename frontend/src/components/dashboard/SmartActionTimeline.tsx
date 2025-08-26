import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  Flag,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Target,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  estimatedHours?: number;
  dependencies?: string[];
  isMilestone?: boolean;
}

interface SmartActionTimelineProps {
  goalId: string;
  tasks?: Task[];
  onTaskUpdate?: (tasks: Task[]) => void;
  showTimeline?: boolean;
  allowEdit?: boolean;
}

const SmartActionTimeline: React.FC<SmartActionTimelineProps> = ({
  goalId,
  tasks: initialTasks,
  onTaskUpdate,
  showTimeline = true,
  allowEdit = true,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [
    {
      id: '1',
      title: 'Research destinations',
      description: 'Look into flights, hotels, and activities',
      completed: true,
      priority: 'high',
      category: 'Planning',
      dueDate: '2024-01-15',
      estimatedHours: 4,
      isMilestone: true,
    },
    {
      id: '2',
      title: 'Set budget limits',
      completed: true,
      priority: 'high',
      category: 'Financial',
      dueDate: '2024-01-18',
      estimatedHours: 2,
    },
    {
      id: '3',
      title: 'Apply for visa',
      description: 'Submit passport and required documents',
      completed: false,
      priority: 'high',
      category: 'Documentation',
      dueDate: '2024-01-25',
      estimatedHours: 3,
      dependencies: ['1'],
      isMilestone: true,
    },
    {
      id: '4',
      title: 'Book flights',
      completed: false,
      priority: 'high',
      category: 'Booking',
      dueDate: '2024-02-01',
      estimatedHours: 2,
      dependencies: ['3'],
    },
    {
      id: '5',
      title: 'Reserve accommodation',
      completed: false,
      priority: 'medium',
      category: 'Booking',
      dueDate: '2024-02-05',
      estimatedHours: 3,
      dependencies: ['4'],
    },
    {
      id: '6',
      title: 'Plan daily itinerary',
      completed: false,
      priority: 'medium',
      category: 'Planning',
      dueDate: '2024-02-10',
      estimatedHours: 5,
      dependencies: ['5'],
    },
    {
      id: '7',
      title: 'Pack and prepare',
      completed: false,
      priority: 'low',
      category: 'Preparation',
      dueDate: '2024-02-14',
      estimatedHours: 4,
      isMilestone: true,
    },
  ]);

  const [viewMode, setViewMode] = useState<'timeline' | 'kanban' | 'list'>('timeline');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'milestones'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const categories = ['Planning', 'Financial', 'Documentation', 'Booking', 'Preparation'];
  const priorityColors = {
    high: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 border-red-300',
    medium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 border-amber-300',
    low: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 border-emerald-300',
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📌';
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'milestones': return task.isMilestone;
      default: return true;
    }
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    onTaskUpdate?.(updatedTasks);
  };

  const canStartTask = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask?.completed;
    });
  };

  const getTaskStatus = (task: Task) => {
    if (task.completed) return 'completed';
    if (!canStartTask(task)) return 'blocked';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'overdue';
    return 'available';
  };

  const renderTimelineView = () => (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>
      
      <div className="space-y-6">
        {filteredTasks.map((task, index) => {
          const status = getTaskStatus(task);
          const isBlocked = status === 'blocked';
          const isOverdue = status === 'overdue';
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative pl-20 ${isBlocked ? 'opacity-60' : ''}`}
            >
              {/* Timeline Node */}
              <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : task.isMilestone
                  ? 'bg-purple-500 border-purple-500'
                  : isOverdue
                  ? 'bg-red-500 border-red-500'
                  : isBlocked
                  ? 'bg-gray-400 border-gray-400'
                  : 'bg-blue-500 border-blue-500'
              }`}>
                {task.completed && (
                  <CheckCircle className="w-3 h-3 text-white absolute -inset-0.5" />
                )}
                {task.isMilestone && !task.completed && (
                  <Flag className="w-3 h-3 text-white absolute -inset-0.5" />
                )}
              </div>

              {/* Task Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${
                  task.isMilestone ? 'ring-2 ring-purple-200 dark:ring-purple-800' : ''
                } ${task.completed ? 'bg-opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleTask(task.id)}
                        disabled={isBlocked}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className={`w-6 h-6 ${
                            isBlocked ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'
                          }`} />
                        )}
                      </button>
                      
                      <h4 className={`text-lg font-semibold ${
                        task.completed 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                      
                      {task.isMilestone && (
                        <Flag className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3 ml-9">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider ${priorityColors[task.priority]} flex items-center gap-2 transform hover:scale-105 transition-all duration-200`}>
                      <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                      {task.priority}
                    </div>
                    {allowEdit && (
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between ml-9">
                  <div className="flex items-center gap-4 text-sm">
                    {task.dueDate && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium ${
                        isOverdue 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                          : new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      } transform hover:scale-105 transition-all duration-200`}>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue && <span className="text-xs">⚠️ OVERDUE</span>}
                        {!isOverdue && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <span className="text-xs">⏰ DUE SOON</span>
                        )}
                      </div>
                    )}
                    
                    {task.estimatedHours && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-200">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimatedHours}h</span>
                        <span className="text-xs">⏱️</span>
                      </div>
                    )}
                    
                    <div className={`px-3 py-2 rounded-xl text-xs font-medium transform hover:scale-105 transition-all duration-200 ${
                      task.category === 'Planning' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30' :
                      task.category === 'Financial' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' :
                      task.category === 'Documentation' ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30' :
                      task.category === 'Booking' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30' :
                      'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/30'
                    } flex items-center gap-1`}>
                      <span>📂</span>
                      {task.category}
                    </div>
                  </div>
                  
                  {isBlocked && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Blocked</span>
                    </div>
                  )}
                  
                  {isOverdue && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/40 animate-pulse">
                      <Clock className="w-4 h-4" />
                      <span>🚨 OVERDUE</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500 to-blue-600 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500 to-green-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Action Timeline</h3>
            <p className="text-gray-600 dark:text-gray-400">Your roadmap to success</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress Badge */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full">
            <span className="text-sm font-medium">
              {completedTasks}/{totalTasks} Complete ({Math.round(completionPercentage)}%)
            </span>
          </div>
          
          {allowEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {(['all', 'pending', 'completed', 'milestones'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === filterOption
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTasks.length} of {totalTasks} tasks
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {renderTimelineView()}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <PlayCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tasks.filter(task => !task.completed && canStartTask(task)).length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <PauseCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blocked</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tasks.filter(task => !task.completed && !canStartTask(task)).length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tasks.filter(task => task.isMilestone && task.completed).length}/
            {tasks.filter(task => task.isMilestone).length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Est. Hours</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tasks.filter(task => !task.completed).reduce((sum, task) => sum + (task.estimatedHours || 0), 0)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartActionTimeline;