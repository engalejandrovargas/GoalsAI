import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'milestone' | 'task' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface CalendarWidgetProps {
  goalId: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ goalId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Goal Deadline',
      date: '2024-02-15',
      type: 'deadline',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Research Phase Complete',
      date: '2024-01-25',
      type: 'milestone',
      priority: 'high',
      completed: true
    },
    {
      id: '3',
      title: 'Review Progress',
      date: '2024-01-30',
      type: 'task',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Book Flight',
      date: '2024-02-05',
      type: 'task',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Submit Visa Application',
      date: '2024-02-01',
      type: 'reminder',
      priority: 'high'
    },
    {
      id: '6',
      title: 'Hotel Reservation',
      date: '2024-02-08',
      type: 'task',
      priority: 'medium'
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventColor = (type: string, priority: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-500';
      case 'milestone':
        return 'bg-green-500';
      case 'task':
        return priority === 'high' ? 'bg-orange-500' : 'bg-blue-500';
      case 'reminder':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string, completed?: boolean) => {
    if (completed) return CheckCircle;
    switch (type) {
      case 'deadline': return AlertCircle;
      case 'milestone': return CheckCircle;
      case 'task': return Clock;
      case 'reminder': return AlertCircle;
      default: return Clock;
    }
  };

  const toggleEventCompletion = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  const today = new Date();
  const todayString = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
  const days = getDaysInMonth(currentDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Calendar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Important dates and deadlines</p>
          </div>
        </div>
        <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2 h-12"></div>;
          }

          const dateString = formatDateString(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayEvents = getEventsForDate(dateString);
          const isToday = dateString === todayString;
          const isSelected = dateString === selectedDate;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateString)}
              className={`relative p-2 h-12 rounded-lg border transition-all ${
                isToday
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isSelected
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
              }`}
            >
              <span className={`text-sm font-medium ${
                isToday ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {day}
              </span>
              
              {/* Event Indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type, event.priority)} ${
                        event.completed ? 'opacity-60' : ''
                      }`}
                    ></div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-gray-500">+</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <h5 className="font-medium text-gray-900 dark:text-white mb-3">
            Events for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h5>
          
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map(event => {
                const Icon = getEventIcon(event.type, event.completed);
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      event.completed 
                        ? 'bg-gray-50 dark:bg-gray-700 opacity-75' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className={`p-1 rounded ${getEventColor(event.type, event.priority)}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        event.completed 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {event.type} • {event.priority} priority
                      </p>
                    </div>
                    {event.type !== 'deadline' && (
                      <button
                        onClick={() => toggleEventCompletion(event.id)}
                        className={`p-1 rounded transition-colors ${
                          event.completed
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No events scheduled for this date
            </p>
          )}
        </motion.div>
      )}

      {/* Upcoming Events Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Upcoming Events</h5>
        <div className="space-y-2">
          {events
            .filter(event => !event.completed && new Date(event.date) >= new Date(todayString))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
            .map(event => {
              const Icon = getEventIcon(event.type);
              const daysUntil = Math.ceil(
                (new Date(event.date).getTime() - new Date(todayString).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className={`p-1 rounded ${getEventColor(event.type, event.priority)}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarWidget;