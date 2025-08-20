import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Flag,
  Tag,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  SortAsc,
} from 'lucide-react';

interface Task {
  id: number;
  task: string;
  completed: boolean;
  deadline?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  description?: string;
  subtasks?: Task[];
}

interface TaskManagerProps {
  goalId: string;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  allowEditing?: boolean;
  showPriority?: boolean;
  showDeadlines?: boolean;
  showCategories?: boolean;
}

type SortOption = 'priority' | 'deadline' | 'category' | 'completion';
type FilterOption = 'all' | 'pending' | 'completed' | 'overdue';

const TaskManager: React.FC<TaskManagerProps> = ({
  goalId,
  tasks: initialTasks,
  onUpdateTasks,
  allowEditing = true,
  showPriority = true,
  showDeadlines = true,
  showCategories = true,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({
    task: '',
    category: 'general',
    priority: 'medium' as const,
    deadline: '',
    estimatedTime: '',
    description: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['general', 'planning', 'booking', 'preparation', 'documentation', 'financial'];
  const priorities = ['low', 'medium', 'high'] as const;

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    onUpdateTasks(tasks);
  }, [tasks, onUpdateTasks]);

  const handleToggleTask = (taskId: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleEditTask = (taskId: number, updatedData: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updatedData }
          : task
      )
    );
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleAddTask = () => {
    if (!newTask.task.trim()) return;

    const task: Task = {
      id: Date.now(),
      task: newTask.task,
      completed: false,
      category: newTask.category,
      priority: newTask.priority,
      deadline: newTask.deadline || undefined,
      estimatedTime: newTask.estimatedTime || undefined,
      description: newTask.description || undefined,
    };

    setTasks(prevTasks => [...prevTasks, task]);
    setNewTask({
      task: '',
      category: 'general',
      priority: 'medium',
      deadline: '',
      estimatedTime: '',
      description: '',
    });
    setShowAddForm(false);
  };

  const toggleExpanded = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && !task.completed;
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;

    // Apply filters
    switch (filterBy) {
      case 'pending':
        filteredTasks = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filteredTasks = tasks.filter(task => task.completed);
        break;
      case 'overdue':
        filteredTasks = tasks.filter(task => isTaskOverdue(task));
        break;
    }

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'completion':
          return Number(a.completed) - Number(b.completed);
        default:
          return 0;
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      booking: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      preparation: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      documentation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors.general;
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Beautiful Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Action Plan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Organize and track your tasks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedTasks}/{totalTasks}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Completed
            </div>
          </div>
          {allowEditing && (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Beautiful Progress Overview */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Overall Progress
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {completionPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-blue-500 uppercase tracking-wide">
              Complete
            </div>
          </div>
        </div>
        
        {/* Animated Progress Bar with Shimmer */}
        <div className="relative w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-6 rounded-full relative"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          </motion.div>
          
          {/* Progress text inside bar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white drop-shadow-sm">
              {completedTasks} of {totalTasks} tasks
            </span>
          </div>
        </div>
      </div>

      {/* Beautiful Filters and Sorting */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Filter & Sort Tasks
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Filter by Status
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-full px-4 py-3 text-sm border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-purple-900/20 dark:text-white font-medium bg-white"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-3 text-sm border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-purple-900/20 dark:text-white font-medium bg-white"
                >
                  <option value="priority">Priority</option>
                  <option value="deadline">Deadline</option>
                  <option value="category">Category</option>
                  <option value="completion">Completion</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beautiful Add New Task Form */}
      <AnimatePresence>
        {showAddForm && allowEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Task
              </h4>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newTask.task}
                onChange={(e) => setNewTask(prev => ({ ...prev, task: e.target.value }))}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/20 dark:text-white font-medium text-lg placeholder-green-400"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {showCategories && (
                  <div>
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/20 dark:text-white font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {showPriority && (
                  <div>
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 text-sm border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/20 dark:text-white font-medium"
                    >
                      {priorities.map(pri => (
                        <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {showDeadlines && (
                  <div>
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/20 dark:text-white font-medium"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Est. Time</label>
                  <input
                    type="text"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="2h 30m"
                    className="w-full px-3 py-2 text-sm border-2 border-green-200 dark:border-green-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-green-900/20 dark:text-white font-medium"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddTask}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Add Task
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {getFilteredAndSortedTasks().map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border transition-all ${
                task.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : isTaskOverdue(task)
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className={`font-medium ${
                      task.completed 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.task}
                    </h4>
                    
                    {allowEditing && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {showPriority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {task.priority}
                      </span>
                    )}
                    
                    {showCategories && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        <Tag className="w-3 h-3 inline mr-1" />
                        {task.category}
                      </span>
                    )}
                    
                    {showDeadlines && task.deadline && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        isTaskOverdue(task) 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    
                    {task.estimatedTime && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedTime}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {getFilteredAndSortedTasks().length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found matching your filters.</p>
            {allowEditing && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Add your first task
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskManager;