import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Activity,
  Timer,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  Square,
  RotateCcw,
  Award,
  Flame,
  Heart,
  Users,
  MapPin,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  BarChart3
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  sets?: {
    reps?: number;
    weight?: number;
    duration?: number; // in seconds
    distance?: number; // in meters
    notes?: string;
  }[];
  totalDuration?: number; // in minutes
  caloriesBurned?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  targetMuscles?: string[];
  equipment?: string[];
}

interface Workout {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  exercises: Exercise[];
  totalCalories: number;
  completed: boolean;
  notes?: string;
  rating?: number; // 1-5
  mood?: 'energized' | 'tired' | 'normal' | 'amazing';
  location?: string;
}

interface WorkoutTrackerProps {
  goalId: string;
  showTimer?: boolean;
  showHistory?: boolean;
  showProgress?: boolean;
  allowEdit?: boolean;
  workouts?: Workout[];
  onUpdateWorkouts?: (workouts: Workout[]) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  goalId,
  showTimer = true,
  showHistory = true,
  showProgress = true,
  allowEdit = true,
  workouts = [],
  onUpdateWorkouts,
}) => {
  const [selectedView, setSelectedView] = useState<'current' | 'history' | 'progress'>('current');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);

  // Enhanced mock workout data
  const defaultWorkouts: Workout[] = [
    {
      id: '1',
      name: 'Upper Body Strength',
      date: '2025-01-21',
      startTime: '08:00',
      endTime: '09:15',
      duration: 75,
      completed: true,
      totalCalories: 420,
      rating: 5,
      mood: 'energized',
      location: 'Home Gym',
      exercises: [
        {
          id: 'e1',
          name: 'Push-ups',
          category: 'strength',
          difficulty: 'medium',
          targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
          sets: [
            { reps: 15, notes: 'Good form' },
            { reps: 12, notes: 'Getting tired' },
            { reps: 10, notes: 'Pushed through' }
          ]
        },
        {
          id: 'e2',
          name: 'Pull-ups',
          category: 'strength',
          difficulty: 'hard',
          targetMuscles: ['Back', 'Biceps'],
          equipment: ['Pull-up bar'],
          sets: [
            { reps: 8 },
            { reps: 6 },
            { reps: 5 }
          ]
        },
        {
          id: 'e3',
          name: 'Plank',
          category: 'strength',
          difficulty: 'medium',
          targetMuscles: ['Core'],
          sets: [
            { duration: 60, notes: '1 minute hold' },
            { duration: 45, notes: '45 seconds' },
            { duration: 30, notes: 'Final set' }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Morning Run',
      date: '2025-01-20',
      startTime: '06:30',
      endTime: '07:15',
      duration: 45,
      completed: true,
      totalCalories: 380,
      rating: 4,
      mood: 'normal',
      location: 'Park',
      exercises: [
        {
          id: 'e4',
          name: 'Running',
          category: 'cardio',
          difficulty: 'medium',
          caloriesBurned: 380,
          sets: [
            { distance: 5000, duration: 2700, notes: '5K in 45 minutes' }
          ]
        }
      ]
    },
    {
      id: '3',
      name: 'Yoga Session',
      date: '2025-01-19',
      startTime: '18:00',
      endTime: '18:45',
      duration: 45,
      completed: true,
      totalCalories: 150,
      rating: 5,
      mood: 'amazing',
      location: 'Living Room',
      exercises: [
        {
          id: 'e5',
          name: 'Vinyasa Flow',
          category: 'flexibility',
          difficulty: 'easy',
          caloriesBurned: 150,
          sets: [
            { duration: 2700, notes: '45-minute flow sequence' }
          ]
        }
      ]
    },
    {
      id: '4',
      name: 'HIIT Training',
      date: '2025-01-18',
      startTime: '17:00',
      endTime: '17:30',
      duration: 30,
      completed: false,
      totalCalories: 0,
      location: 'Home',
      exercises: []
    }
  ];

  const workoutData = workouts.length > 0 ? workouts : defaultWorkouts;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'from-red-500 to-orange-600';
      case 'cardio': return 'from-blue-500 to-cyan-600';
      case 'flexibility': return 'from-green-500 to-teal-600';
      case 'sports': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Heart className="w-4 h-4" />;
      case 'flexibility': return <Activity className="w-4 h-4" />;
      case 'sports': return <Target className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'extreme': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'amazing': return '🤩';
      case 'energized': return '⚡';
      case 'normal': return '😌';
      case 'tired': return '😴';
      default: return '💪';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startTimer = () => {
    setTimerRunning(true);
    // In a real app, you'd use setInterval to update the timer
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const completedWorkouts = workoutData.filter(w => w.completed).length;
  const totalWorkouts = workoutData.length;
  const totalMinutes = workoutData.filter(w => w.completed).reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workoutData.filter(w => w.completed).reduce((sum, w) => sum + w.totalCalories, 0);
  const averageRating = workoutData.filter(w => w.completed && w.rating).reduce((sum, w, _, arr) => sum + (w.rating || 0) / arr.length, 0);

  const thisWeekWorkouts = workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= weekAgo && workoutDate <= now;
  }).length;

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
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workout Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your fitness journey and progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">
              {completedWorkouts}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">This Week</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{thisWeekWorkouts}</p>
              <p className="text-xs text-red-600">Workouts</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
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
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Total Time</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{Math.floor(totalMinutes / 60)}h</p>
              <p className="text-xs text-blue-600">{totalMinutes % 60}m more</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">Calories</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalCalories.toLocaleString()}</p>
              <p className="text-xs text-orange-600">Burned</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-green-600">Out of 5</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timer Widget */}
      {showTimer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Timer className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Workout Timer</h3>
                <p className="opacity-90">Track your current session</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold font-mono">{formatTime(timerSeconds)}</div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <motion.button
                  onClick={timerRunning ? pauseTimer : startTimer}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  onClick={resetTimer}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'current', label: 'Current Workout', icon: Activity },
            { id: 'history', label: 'History', icon: Calendar },
            { id: 'progress', label: 'Progress', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedView === id
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-b-2 border-red-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {selectedView === 'current' && (
          <div className="space-y-6">
            {currentWorkout ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {currentWorkout.name}
                </h3>
                {/* Current workout content would go here */}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Workout
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start a new workout session to begin tracking your exercises.
                </p>
                <button
                  onClick={() => setCurrentWorkout({
                    id: Date.now().toString(),
                    name: 'New Workout',
                    date: new Date().toISOString().split('T')[0],
                    startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    duration: 0,
                    exercises: [],
                    totalCalories: 0,
                    completed: false
                  })}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors font-medium"
                >
                  Start New Workout
                </button>
              </div>
            )}
          </div>
        )}

        {selectedView === 'history' && showHistory && (
          <div className="space-y-4">
            {workoutData.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 ${
                  !workout.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      workout.exercises[0] ? getCategoryColor(workout.exercises[0].category) : 'from-gray-500 to-gray-600'
                    } flex items-center justify-center shadow-lg`}>
                      {workout.exercises[0] ? getCategoryIcon(workout.exercises[0].category) : <Dumbbell className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workout.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(workout.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(workout.duration)}
                        </div>
                        {workout.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {workout.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {workout.completed ? (
                      <>
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</span>
                        </div>
                        {workout.mood && (
                          <div className="text-lg mb-1">{getMoodEmoji(workout.mood)}</div>
                        )}
                        {workout.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${
                                  i < workout.rating! ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Incomplete</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercise Summary */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-6 flex-1">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Exercises</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {workout.exercises.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {workout.totalCalories}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatDuration(workout.duration)}
                      </div>
                    </div>
                  </div>

                  {allowEdit && (
                    <div className="flex gap-1 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        title="Edit workout"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Delete workout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Exercise List Preview */}
                {workout.exercises.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
                        <span
                          key={exerciseIndex}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}
                        >
                          {exercise.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="px-3 py-1 rounded-full text-sm text-gray-500 bg-gray-100 dark:bg-gray-700">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {selectedView === 'progress' && showProgress && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progress Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Detailed progress charts and insights coming soon</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{completedWorkouts}</div>
                  <div className="text-sm text-gray-500">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatDuration(totalMinutes)}</div>
                  <div className="text-sm text-gray-500">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{totalCalories.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WorkoutTracker;