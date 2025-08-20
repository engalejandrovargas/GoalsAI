import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Play, Pause, Edit2, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
  dependencies?: string[];
  priority: 'low' | 'medium' | 'high';
  phase: string;
}

interface ProjectTimelineProps {
  goalId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ goalId }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Research Destination',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      progress: 100,
      status: 'completed',
      phase: 'Planning',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Budget Planning',
      startDate: '2024-01-20',
      endDate: '2024-01-30',
      progress: 85,
      status: 'in_progress',
      dependencies: ['1'],
      phase: 'Planning',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Visa Application',
      startDate: '2024-01-25',
      endDate: '2024-02-10',
      progress: 30,
      status: 'in_progress',
      dependencies: ['1'],
      phase: 'Documentation',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Flight Booking',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      progress: 0,
      status: 'not_started',
      dependencies: ['2'],
      phase: 'Booking',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Accommodation Booking',
      startDate: '2024-02-01',
      endDate: '2024-02-08',
      progress: 0,
      status: 'not_started',
      dependencies: ['2'],
      phase: 'Booking',
      priority: 'medium'
    },
    {
      id: '6',
      title: 'Travel Insurance',
      startDate: '2024-02-05',
      endDate: '2024-02-12',
      progress: 0,
      status: 'not_started',
      dependencies: ['4'],
      phase: 'Preparation',
      priority: 'medium'
    },
    {
      id: '7',
      title: 'Packing & Final Preparations',
      startDate: '2024-02-10',
      endDate: '2024-02-15',
      progress: 0,
      status: 'not_started',
      dependencies: ['3', '5', '6'],
      phase: 'Preparation',
      priority: 'low'
    }
  ]);

  const [timelineView, setTimelineView] = useState<'weeks' | 'months'>('weeks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const phases = [...new Set(tasks.map(task => task.phase))];
  const startDate = new Date(Math.min(...tasks.map(task => new Date(task.startDate).getTime())));
  const endDate = new Date(Math.max(...tasks.map(task => new Date(task.endDate).getTime())));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Play;
      case 'blocked': return AlertCircle;
      default: return Pause;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
        return { ...task, progress, status: newStatus };
      }
      return task;
    }));
  };

  const getDaysFromStart = (date: string) => {
    const diffTime = new Date(date).getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalDays = () => {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTaskWidth = (task: Task) => {
    const taskStart = new Date(task.startDate).getTime();
    const taskEnd = new Date(task.endDate).getTime();
    const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24));
    return (taskDuration / getTotalDays()) * 100;
  };

  const getTaskLeft = (task: Task) => {
    const daysFromStart = getDaysFromStart(task.startDate);
    return (daysFromStart / getTotalDays()) * 100;
  };

  const canStartTask = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Timeline</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gantt-style project planning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timelineView}
            onChange={(e) => setTimelineView(e.target.value as 'weeks' | 'months')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="weeks">Weekly View</option>
            <option value="months">Monthly View</option>
          </select>
          <button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Duration</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {getTotalDays()} days
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {overallProgress.toFixed(0)}%
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Active Tasks</span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            {tasks.filter(task => task.status === 'in_progress').length}
          </p>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Phases</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
            {phases.length}
          </p>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="space-y-6">
        {phases.map(phase => (
          <div key={phase} className="space-y-2">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
              {phase}
            </h4>
            {tasks.filter(task => task.phase === phase).map(task => {
              const StatusIcon = getStatusIcon(task.status);
              const taskWidth = getTaskWidth(task);
              const taskLeft = getTaskLeft(task);
              const isBlocked = !canStartTask(task) && task.status === 'not_started';
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative ${selectedTask === task.id ? 'ring-2 ring-purple-500 rounded-lg' : ''}`}
                >
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1 rounded ${getStatusColor(task.status)} ${isBlocked ? 'opacity-50' : ''}`}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium text-gray-900 dark:text-white ${isBlocked ? 'opacity-50' : ''}`}>
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-6 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded ${getStatusColor(task.status)} transition-all duration-500`}
                          style={{ width: `${task.progress}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                          {task.progress}%
                        </span>
                      </div>
                      
                      {isBlocked && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Waiting for dependencies: {task.dependencies?.map(depId => 
                            tasks.find(t => t.id === depId)?.title
                          ).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedTask === task.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Progress
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
                            className="w-full"
                            disabled={isBlocked}
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>0%</span>
                            <span>{task.progress}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <p className={`text-sm px-2 py-1 rounded ${getStatusColor(task.status)} text-white inline-block`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectTimeline;