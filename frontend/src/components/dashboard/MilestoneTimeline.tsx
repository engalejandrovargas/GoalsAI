import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Plus,
  Edit3,
  Trash2,
  Star,
  MapPin,
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  type: 'financial' | 'task' | 'deadline' | 'achievement';
  value?: number;
  priority?: 'low' | 'medium' | 'high';
}

interface MilestoneTimelineProps {
  goalId: string;
  showProgress?: boolean;
  allowEdit?: boolean;
  milestones?: Milestone[];
  onUpdateMilestones?: (milestones: Milestone[]) => void;
  targetDate?: string;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  goalId,
  showProgress = true,
  allowEdit = true,
  milestones = [],
  onUpdateMilestones,
  targetDate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    date: '',
    type: 'task' as const,
    value: 0,
    priority: 'medium' as const,
  });

  // Generate default milestones if none provided
  const generateDefaultMilestones = (): Milestone[] => {
    const now = new Date();
    const goalDate = targetDate ? new Date(targetDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const timeSpan = goalDate.getTime() - now.getTime();
    const quarterTime = timeSpan / 4;

    return [
      {
        id: '1',
        title: 'Goal Planning Complete',
        description: 'Research, analysis, and initial setup',
        date: new Date(now.getTime() + quarterTime * 0.2).toISOString().split('T')[0],
        completed: true,
        type: 'task',
        priority: 'high',
      },
      {
        id: '2',
        title: '25% Financial Target',
        description: 'First quarter of savings goal reached',
        date: new Date(now.getTime() + quarterTime * 0.8).toISOString().split('T')[0],
        completed: false,
        type: 'financial',
        value: 250,
        priority: 'high',
      },
      {
        id: '3',
        title: 'Mid-point Review',
        description: 'Assess progress and adjust strategy if needed',
        date: new Date(now.getTime() + quarterTime * 2).toISOString().split('T')[0],
        completed: false,
        type: 'task',
        priority: 'medium',
      },
      {
        id: '4',
        title: '75% Financial Target',
        description: 'Three quarters of savings goal reached',
        date: new Date(now.getTime() + quarterTime * 3).toISOString().split('T')[0],
        completed: false,
        type: 'financial',
        value: 750,
        priority: 'high',
      },
      {
        id: '5',
        title: 'Goal Achievement',
        description: 'Target reached and goal completed',
        date: goalDate.toISOString().split('T')[0],
        completed: false,
        type: 'achievement',
        priority: 'high',
      },
    ];
  };

  const timelineMilestones = milestones.length > 0 ? milestones : generateDefaultMilestones();
  const sortedMilestones = [...timelineMilestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const toggleMilestone = (id: string) => {
    const updatedMilestones = timelineMilestones.map(milestone =>
      milestone.id === id 
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );
    onUpdateMilestones?.(updatedMilestones);
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim()) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      date: newMilestone.date,
      completed: false,
      type: newMilestone.type,
      value: newMilestone.value || undefined,
      priority: newMilestone.priority,
    };

    const updatedMilestones = [...timelineMilestones, milestone];
    onUpdateMilestones?.(updatedMilestones);
    
    setNewMilestone({
      title: '',
      description: '',
      date: '',
      type: 'task',
      value: 0,
      priority: 'medium',
    });
    setShowAddForm(false);
  };

  const deleteMilestone = (id: string) => {
    const updatedMilestones = timelineMilestones.filter(milestone => milestone.id !== id);
    onUpdateMilestones?.(updatedMilestones);
  };

  const getMilestoneIcon = (type: string, completed: boolean) => {
    const iconClass = `w-5 h-5 ${completed ? 'text-green-600' : 'text-gray-400'}`;
    
    switch (type) {
      case 'financial':
        return <Star className={iconClass} />;
      case 'task':
        return <CheckCircle className={iconClass} />;
      case 'deadline':
        return <Clock className={iconClass} />;
      case 'achievement':
        return <Flag className={iconClass} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const isOverdue = (date: string, completed: boolean) => {
    return !completed && new Date(date) < new Date();
  };

  const completedMilestones = sortedMilestones.filter(m => m.completed).length;
  const totalMilestones = sortedMilestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

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
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timeline & Milestones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your journey to success
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {completedMilestones}/{totalMilestones}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Completed
            </div>
          </div>
          {allowEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Add Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {showProgress && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Overall Progress
            </span>
            <span className="text-3xl font-bold text-purple-600">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 h-3 rounded-full shadow-lg relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-purple-700 dark:text-purple-300">
            <span>Started</span>
            <span>Goal Achieved!</span>
          </div>
        </div>
      )}

      {/* Add Milestone Form */}
      {showAddForm && allowEdit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Milestone</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Milestone title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            />
            
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
              />
              
              <select
                value={newMilestone.type}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="task">Task</option>
                <option value="financial">Financial</option>
                <option value="deadline">Deadline</option>
                <option value="achievement">Achievement</option>
              </select>
              
              <select
                value={newMilestone.priority}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, priority: e.target.value as any }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              {newMilestone.type === 'financial' && (
                <input
                  type="number"
                  value={newMilestone.value}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder="Value"
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addMilestone}
                className="px-4 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Beautiful Timeline */}
      <div className="flex-1 relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"></div>
        
        {/* Progress line */}
        <motion.div
          className="absolute left-8 top-0 w-1 bg-gradient-to-b from-purple-400 via-indigo-500 to-purple-600 rounded-full shadow-lg origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: completedMilestones / totalMilestones }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ 
            height: `${Math.min(completedMilestones / totalMilestones * 100, 100)}%`,
            maxHeight: `${sortedMilestones.length * 140}px`
          }}
        />

        {/* Milestones */}
        <div className="space-y-8">
          {sortedMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5, ease: "easeOut" }}
              className="relative flex items-start gap-6"
            >
              {/* Timeline dot */}
              <div className="relative z-10">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center shadow-xl ${
                    milestone.completed 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-600 border-emerald-300' 
                      : isOverdue(milestone.date, milestone.completed)
                      ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300'
                      : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 dark:from-gray-700 dark:to-gray-600 dark:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getMilestoneIcon(milestone.type, milestone.completed)}
                </motion.div>
                {milestone.completed && (
                  <motion.div
                    className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-400 to-green-500 opacity-20"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0.3 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>

              {/* Milestone content */}
              <motion.div 
                className={`flex-1 p-6 rounded-2xl backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  milestone.completed 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-700' 
                    : isOverdue(milestone.date, milestone.completed)
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700'
                    : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className={`text-xl font-bold ${
                        milestone.completed 
                          ? 'line-through text-emerald-700 dark:text-emerald-300' 
                          : isOverdue(milestone.date, milestone.completed)
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {milestone.title}
                      </h4>
                      {milestone.value && (
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-full font-medium shadow-md">
                          ${milestone.value}
                        </span>
                      )}
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                        milestone.priority === 'high' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : milestone.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {milestone.priority} priority
                      </div>
                    </div>
                    
                    {milestone.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(milestone.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                        {milestone.type}
                      </span>
                      {isOverdue(milestone.date, milestone.completed) && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-bold animate-pulse">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {allowEdit && (
                    <div className="flex items-center gap-1 ml-4">
                      <motion.button
                        onClick={() => toggleMilestone(milestone.id)}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          milestone.completed 
                            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingMilestone(milestone.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit milestone"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div>
        {sortedMilestones.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No milestones yet.</p>
            {allowEdit && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
              >
                Add your first milestone
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MilestoneTimeline;