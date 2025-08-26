import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Calendar, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Star,
  Timer
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  targetDate?: string;
  estimatedCost?: number;
  currentSaved?: number;
  feasibilityScore?: number;
  feasibilityAnalysis?: any;
  aiPlan?: string;
  assignedAgents?: string;
  smartGoalData?: string;
  progress?: {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
  };
  createdAt: string;
  updatedAt?: string;
}

interface NotificationBellProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ goals, onGoalClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Priority tasks
  const priorityTasks = goals.filter(g => g.priority === 'high' && g.status !== 'completed');
  
  // Deadlines
  const deadlineTasks = goals
    .filter(g => g.targetDate && g.status !== 'completed')
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime());

  // Calculate urgent counts
  const overdueTasks = deadlineTasks.filter(g => {
    const daysLeft = Math.ceil((new Date(g.targetDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft < 0;
  });

  const urgentTasks = deadlineTasks.filter(g => {
    const daysLeft = Math.ceil((new Date(g.targetDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const totalNotifications = priorityTasks.length + overdueTasks.length + urgentTasks.length;
  const hasUrgentItems = overdueTasks.length > 0 || urgentTasks.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysLeft = (targetDate: string) => {
    return Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDaysLeft = (daysLeft: number) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft === 0) return 'Due today';
    return `${daysLeft}d left`;
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'from-rose-500 to-pink-600';
    if (daysLeft === 0) return 'from-amber-500 to-yellow-500';
    if (daysLeft <= 7) return 'from-orange-500 to-amber-500';
    return 'from-emerald-500 to-teal-600';
  };

  const getUrgencyTextColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-rose-700 dark:text-rose-300';
    if (daysLeft === 0) return 'text-amber-700 dark:text-amber-300';
    if (daysLeft <= 7) return 'text-orange-700 dark:text-orange-300';
    return 'text-emerald-700 dark:text-emerald-300';
  };

  const getUrgencyBgColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-800/80 dark:to-rose-900/20';
    if (daysLeft === 0) return 'bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800/80 dark:to-amber-900/20';
    if (daysLeft <= 7) return 'bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800/80 dark:to-orange-900/20';
    return 'bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800/80 dark:to-emerald-900/20';
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30' 
            : hasUrgentItems
            ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30'
            : 'bg-gradient-to-br from-slate-700 to-gray-800 hover:from-slate-600 hover:to-gray-700 shadow-lg'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className={`w-6 h-6 ${
          isOpen || hasUrgentItems ? 'text-white' : 'text-gray-300'
        }`} />
        
        {/* Notification Badge */}
        {totalNotifications > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold text-white ${
              hasUrgentItems 
                ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
          >
            {totalNotifications > 99 ? '99+' : totalNotifications}
          </motion.div>
        )}

        {/* Pulse animation for urgent items */}
        {hasUrgentItems && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Beautiful Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[480px] bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/30 border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:to-slate-700/80 p-5 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {totalNotifications === 0 ? 'All caught up!' : `${totalNotifications} items need attention`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {totalNotifications === 0 ? (
              /* Empty State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 All caught up!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  No urgent tasks or deadlines right now
                </p>
              </div>
            ) : (
              /* Two Column Layout */
              <div className="grid grid-cols-2 gap-5 p-5">
                
                {/* Left Column - Priority Tasks */}
                <div className="space-y-2 bg-gradient-to-br from-violet-50/40 to-purple-50/40 dark:from-violet-900/10 dark:to-purple-900/10 p-4 rounded-xl border border-violet-200/30 dark:border-violet-700/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      High Priority
                    </h4>
                    <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 dark:from-violet-900/40 dark:to-purple-900/40 dark:text-violet-300 px-3 py-1 rounded-full text-sm font-bold">
                      {priorityTasks.length}
                    </span>
                  </div>
                  
                  {priorityTasks.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-xs text-green-600 dark:text-green-400">All priority tasks complete! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {priorityTasks.slice(0, 3).map((goal, index) => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            onGoalClick(goal);
                            setIsOpen(false);
                          }}
                          className="group relative p-3 bg-white/80 dark:bg-slate-800/60 rounded-lg hover:shadow-md hover:shadow-violet-500/20 dark:hover:shadow-violet-900/30 cursor-pointer transition-all duration-300 border border-violet-200/50 dark:border-violet-700/50 hover:border-violet-300/70 dark:hover:border-violet-600/70 backdrop-blur-sm"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                              <Zap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">
                                {goal.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500 text-white">
                                  ⚡ Critical
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-3.5 h-3.5 text-violet-500" />
                          </div>
                        </motion.div>
                      ))}
                      {priorityTasks.length > 3 && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                            +{priorityTasks.length - 3} more priority tasks
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Deadlines */}
                <div className="space-y-2 bg-gradient-to-br from-cyan-50/40 to-blue-50/40 dark:from-cyan-900/10 dark:to-blue-900/10 p-4 rounded-xl border border-cyan-200/30 dark:border-cyan-700/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <Timer className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      Time Sensitive
                    </h4>
                    <span className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 dark:from-cyan-900/40 dark:to-blue-900/40 dark:text-cyan-300 px-3 py-1 rounded-full text-sm font-bold">
                      {overdueTasks.length + urgentTasks.length}
                    </span>
                  </div>
                  
                  {(overdueTasks.length + urgentTasks.length) === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">No urgent deadlines! 🌟</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...overdueTasks, ...urgentTasks].slice(0, 3).map((goal, index) => {
                        const daysLeft = getDaysLeft(goal.targetDate!);
                        return (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              onGoalClick(goal);
                              setIsOpen(false);
                            }}
                            className={`group relative p-4 ${getUrgencyBgColor(daysLeft)} rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm ${
                              daysLeft < 0 
                                ? 'border-rose-200/50 dark:border-rose-800/30 hover:border-rose-300/70 dark:hover:border-rose-700/60 hover:shadow-rose-500/10 dark:hover:shadow-rose-900/20' 
                                : daysLeft === 0
                                ? 'border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300/70 dark:hover:border-amber-700/60 hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20'
                                : daysLeft <= 7 
                                ? 'border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300/70 dark:hover:border-orange-700/60 hover:shadow-orange-500/10 dark:hover:shadow-orange-900/20'
                                : 'border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300/70 dark:hover:border-emerald-700/60 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-900/20'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-7 h-7 bg-gradient-to-br ${getUrgencyColor(daysLeft)} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
                                <Clock className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">
                                  {goal.title}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    daysLeft < 0 ? 'bg-rose-500 text-white'
                                    : daysLeft === 0 ? 'bg-amber-500 text-white'
                                    : daysLeft <= 7 ? 'bg-orange-500 text-white'
                                    : 'bg-cyan-500 text-white'
                                  }`}>
                                    {daysLeft < 0 ? '🚨 ' : daysLeft === 0 ? '⚡ ' : daysLeft <= 7 ? '⏰ ' : '📅 '}{formatDaysLeft(daysLeft)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className={`w-3.5 h-3.5 ${
                                daysLeft < 0 ? 'text-rose-500' 
                                : daysLeft === 0 ? 'text-amber-500'
                                : daysLeft <= 7 ? 'text-orange-500'
                                : 'text-cyan-500'
                              }`} />
                            </div>
                          </motion.div>
                        );
                      })}
                      {(overdueTasks.length + urgentTasks.length) > 3 && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
                            +{(overdueTasks.length + urgentTasks.length) - 3} more deadlines
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;