import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  Eye,
  Bookmark,
  BookmarkCheck,
  Award,
  Users,
  Quote,
  BarChart3,
  PieChart,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  Book,
  Library,
  Coffee,
  Heart
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  pages: number;
  currentPage: number;
  status: 'not-started' | 'reading' | 'completed' | 'paused' | 'abandoned';
  rating?: number; // 1-5 stars
  startDate?: string;
  completedDate?: string;
  notes?: string;
  favorite?: boolean;
  coverUrl?: string;
  quotes?: {
    text: string;
    page: number;
    date: string;
  }[];
  readingSessions?: {
    date: string;
    pagesRead: number;
    duration: number; // minutes
    notes?: string;
  }[];
  tags?: string[];
}

interface ReadingGoal {
  type: 'books' | 'pages' | 'time';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  title: string;
}

interface ReadingTrackerProps {
  goalId: string;
  showProgress?: boolean;
  showStatistics?: boolean;
  showRecommendations?: boolean;
  allowEdit?: boolean;
  books?: Book[];
  readingGoals?: ReadingGoal[];
  onUpdateBooks?: (books: Book[]) => void;
  onUpdateGoals?: (goals: ReadingGoal[]) => void;
}

const ReadingTracker: React.FC<ReadingTrackerProps> = ({
  goalId,
  showProgress = true,
  showStatistics = true,
  showRecommendations = true,
  allowEdit = true,
  books = [],
  readingGoals = [],
  onUpdateBooks,
  onUpdateGoals,
}) => {
  const [selectedView, setSelectedView] = useState<'library' | 'progress' | 'statistics'>('library');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Enhanced mock reading data
  const defaultBooks: Book[] = [
    {
      id: '1',
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help',
      pages: 320,
      currentPage: 208,
      status: 'reading',
      rating: 5,
      startDate: '2024-12-15',
      favorite: true,
      tags: ['productivity', 'habits', 'self-improvement'],
      quotes: [
        {
          text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
          page: 27,
          date: '2025-01-15'
        }
      ],
      readingSessions: [
        { date: '2025-01-21', pagesRead: 15, duration: 45, notes: 'Great chapter on habit stacking' },
        { date: '2025-01-20', pagesRead: 12, duration: 30 },
        { date: '2025-01-19', pagesRead: 18, duration: 50 }
      ]
    },
    {
      id: '2',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      genre: 'Business',
      pages: 336,
      currentPage: 336,
      status: 'completed',
      rating: 4,
      startDate: '2024-11-01',
      completedDate: '2024-12-10',
      tags: ['business', 'entrepreneurship', 'innovation'],
      quotes: [
        {
          text: 'The only way to win is to learn faster than anyone else.',
          page: 142,
          date: '2024-11-25'
        }
      ]
    },
    {
      id: '3',
      title: 'Deep Work',
      author: 'Cal Newport',
      genre: 'Productivity',
      pages: 304,
      currentPage: 304,
      status: 'completed',
      rating: 5,
      startDate: '2024-09-15',
      completedDate: '2024-10-20',
      favorite: true,
      tags: ['focus', 'productivity', 'career'],
      notes: 'Excellent insights on focused work and attention management'
    },
    {
      id: '4',
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      genre: 'Psychology',
      pages: 499,
      currentPage: 125,
      status: 'paused',
      rating: 4,
      startDate: '2024-10-01',
      tags: ['psychology', 'decision-making', 'cognitive-bias']
    },
    {
      id: '5',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      genre: 'Fiction',
      pages: 288,
      currentPage: 0,
      status: 'not-started',
      tags: ['fiction', 'philosophy', 'life-choices']
    },
    {
      id: '6',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      genre: 'History',
      pages: 443,
      currentPage: 443,
      status: 'completed',
      rating: 5,
      startDate: '2024-06-01',
      completedDate: '2024-08-15',
      favorite: true,
      tags: ['history', 'anthropology', 'human-evolution']
    }
  ];

  const defaultGoals: ReadingGoal[] = [
    {
      type: 'books',
      target: 25,
      current: 12,
      period: 'yearly',
      title: 'Read 25 Books This Year'
    },
    {
      type: 'pages',
      target: 50,
      current: 35,
      period: 'weekly',
      title: 'Read 50 Pages Per Week'
    },
    {
      type: 'time',
      target: 60,
      current: 45,
      period: 'daily',
      title: 'Read 60 Minutes Daily'
    }
  ];

  const booksData = books.length > 0 ? books : defaultBooks;
  const goalsData = readingGoals.length > 0 ? readingGoals : defaultGoals;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'not-started': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'abandoned': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Clock className="w-4 h-4" />;
      case 'not-started': return <Circle className="w-4 h-4" />;
      case 'abandoned': return <Trash2 className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getReadingProgress = (book: Book) => {
    return (book.currentPage / book.pages) * 100;
  };

  const filteredBooks = booksData.filter(book => {
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const updateBookStatus = (bookId: string, status: Book['status']) => {
    const updatedBooks = booksData.map(book =>
      book.id === bookId 
        ? { 
            ...book, 
            status,
            completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
            currentPage: status === 'completed' ? book.pages : book.currentPage
          }
        : book
    );
    onUpdateBooks?.(updatedBooks);
  };

  const toggleFavorite = (bookId: string) => {
    const updatedBooks = booksData.map(book =>
      book.id === bookId ? { ...book, favorite: !book.favorite } : book
    );
    onUpdateBooks?.(updatedBooks);
  };

  // Calculate statistics
  const completedBooks = booksData.filter(book => book.status === 'completed').length;
  const currentlyReading = booksData.filter(book => book.status === 'reading').length;
  const totalPages = booksData.filter(book => book.status === 'completed').reduce((sum, book) => sum + book.pages, 0);
  const averageRating = booksData
    .filter(book => book.rating)
    .reduce((sum, book, _, arr) => sum + (book.rating || 0) / arr.length, 0);

  const favoriteBooks = booksData.filter(book => book.favorite).length;
  const genreDistribution = booksData.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const thisMonthPages = booksData
    .filter(book => book.readingSessions)
    .flatMap(book => book.readingSessions!)
    .filter(session => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, session) => sum + session.pagesRead, 0);

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
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reading Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your reading journey and discover new books
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              {completedBooks}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Books Read
            </div>
          </div>
          {allowEdit && (
            <button
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Add Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Reading Goals Progress */}
      {showProgress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {goalsData.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    {goal.type === 'books' && <Book className="w-5 h-5 text-white" />}
                    {goal.type === 'pages' && <BookOpen className="w-5 h-5 text-white" />}
                    {goal.type === 'time' && <Clock className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                      {goal.title}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 capitalize">
                      {goal.period}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    {goal.current}/{goal.target}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">Currently Reading</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{currentlyReading}</p>
              <p className="text-xs text-green-600">Books</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
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
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Pages Read</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalPages.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-purple-600">Stars</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-700 dark:text-pink-300 text-sm font-medium">Favorites</p>
              <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{favoriteBooks}</p>
              <p className="text-xs text-pink-600">Books</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title, author, or genre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Books</option>
            <option value="reading">Currently Reading</option>
            <option value="completed">Completed</option>
            <option value="not-started">Not Started</option>
            <option value="paused">Paused</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'library', label: 'My Library', icon: Library },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'statistics', label: 'Statistics', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                selectedView === id
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b-2 border-amber-500'
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
        {selectedView === 'library' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Book Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight mb-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">by {book.author}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {book.genre}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)}
                        {book.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${book.favorite ? 'text-pink-500 fill-current' : ''}`} />
                    </button>
                    {allowEdit && (
                      <button className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reading Progress */}
                {book.status === 'reading' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {book.currentPage}/{book.pages} pages
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getReadingProgress(book)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getReadingProgress(book).toFixed(1)}% complete
                    </div>
                  </div>
                )}

                {/* Book Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Pages</div>
                    <div className="font-medium text-gray-900 dark:text-white">{book.pages.toLocaleString()}</div>
                  </div>
                  {book.rating && (
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Rating</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < book.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Date */}
                {book.completedDate && (
                  <div className="text-xs text-green-600 dark:text-green-400 mb-4">
                    ✓ Completed on {new Date(book.completedDate).toLocaleDateString()}
                  </div>
                )}

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {book.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {book.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{book.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Recent Quote */}
                {book.quotes && book.quotes.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{book.quotes[0].text}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Page {book.quotes[0].page}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {book.status === 'not-started' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateBookStatus(book.id, 'reading')}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors text-sm font-medium"
                    >
                      Start Reading
                    </motion.button>
                  )}
                  
                  {book.status === 'reading' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateBookStatus(book.id, 'completed')}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors text-sm font-medium"
                    >
                      Mark Complete
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedView === 'progress' && showProgress && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Month</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{thisMonthPages}</div>
                  <div className="text-sm text-gray-500">Pages Read</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{currentlyReading}</div>
                  <div className="text-sm text-gray-500">Books in Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{completedBooks}</div>
                  <div className="text-sm text-gray-500">Books Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'statistics' && showStatistics && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genre Distribution</h3>
              <div className="space-y-3">
                {Object.entries(genreDistribution).map(([genre, count]) => (
                  <div key={genre} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{genre}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                          style={{ width: `${(count / booksData.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReadingTracker;