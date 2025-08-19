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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Timeline & Milestones
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {completedMilestones}/{totalMilestones} completed
          </div>
          {allowEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Milestone Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            />
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

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
        
        {/* Progress line */}
        <motion.div
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: progressPercentage / 100 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ height: `${(completedMilestones / totalMilestones) * 100}%` }}
        ></motion.div>

        {/* Milestones */}
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              {/* Timeline dot */}
              <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                milestone.completed 
                  ? 'bg-green-100 border-green-500 dark:bg-green-900/20' 
                  : isOverdue(milestone.date, milestone.completed)
                  ? 'bg-red-100 border-red-500 dark:bg-red-900/20'
                  : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              }`}>
                {getMilestoneIcon(milestone.type, milestone.completed)}
              </div>

              {/* Milestone content */}
              <div className={`flex-1 p-4 rounded-lg border-l-4 ${getPriorityColor(milestone.priority)} ${
                isOverdue(milestone.date, milestone.completed) ? 'ring-2 ring-red-200' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        milestone.completed 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {milestone.title}
                      </h4>
                      {milestone.value && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs rounded-full">
                          ${milestone.value}
                        </span>
                      )}
                    </div>
                    
                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {milestone.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(milestone.date).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{milestone.type}</span>
                      {isOverdue(milestone.date, milestone.completed) && (
                        <span className="text-red-600 dark:text-red-400 font-medium">Overdue</span>
                      )}
                    </div>
                  </div>

                  {allowEdit && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleMilestone(milestone.id)}
                        className={`p-1 rounded ${
                          milestone.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingMilestone(milestone.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Edit milestone"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
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
    </motion.div>
  );
};

export default MilestoneTimeline;