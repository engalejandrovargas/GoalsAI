import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Video,
  Globe,
  Search,
  Filter,
  Star,
  Download,
  ExternalLink,
  Plus,
  Clock,
  Tag,
  Users,
  TrendingUp,
  Award,
  Bookmark,
  BookmarkCheck,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import mockData from '../../data/mockData';

interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'book' | 'article' | 'video' | 'course' | 'docs' | 'tool' | 'website';
  category: string;
  url?: string;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  author?: string;
  tags?: string[];
  bookmarked?: boolean;
  views?: number;
  likes?: number;
  comments?: number;
  dateAdded?: string;
}

interface ResourceLibraryProps {
  goalId: string;
  allowAddResources?: boolean;
  showCommunityRatings?: boolean;
  showProgress?: boolean;
  categories?: string[];
}

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  goalId,
  allowAddResources = true,
  showCommunityRatings = true,
  showProgress = true,
  categories = ['Programming', 'Design', 'Business', 'Health', 'Finance', 'Learning'],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'popular'>('recent');

  // Enhanced mock resources
  const resources: Resource[] = [
    {
      id: '1',
      title: 'React Documentation',
      description: 'Official React documentation with comprehensive guides and API reference.',
      type: 'docs',
      category: 'Programming',
      url: 'https://react.dev',
      rating: 4.9,
      difficulty: 'intermediate',
      author: 'React Team',
      tags: ['React', 'JavaScript', 'Frontend'],
      bookmarked: true,
      views: 1248,
      likes: 92,
      comments: 15,
      dateAdded: '2025-01-15'
    },
    {
      id: '2',
      title: 'JavaScript: The Good Parts',
      description: 'A classic book that focuses on the elegant parts of JavaScript.',
      type: 'book',
      category: 'Programming',
      rating: 4.7,
      difficulty: 'intermediate',
      author: 'Douglas Crockford',
      tags: ['JavaScript', 'Best Practices', 'Fundamentals'],
      bookmarked: false,
      views: 892,
      likes: 67,
      comments: 8,
      dateAdded: '2025-01-12'
    },
    {
      id: '3',
      title: 'Advanced React Patterns',
      description: 'Learn advanced React patterns and techniques for scalable applications.',
      type: 'course',
      category: 'Programming',
      rating: 4.8,
      difficulty: 'advanced',
      duration: '8 hours',
      author: 'Kent C. Dodds',
      tags: ['React', 'Patterns', 'Advanced'],
      bookmarked: true,
      views: 2341,
      likes: 178,
      comments: 23,
      dateAdded: '2025-01-10'
    },
    {
      id: '4',
      title: 'System Design Primer',
      description: 'Learn how to design large-scale distributed systems.',
      type: 'article',
      category: 'Programming',
      url: 'https://github.com/donnemartin/system-design-primer',
      rating: 4.9,
      difficulty: 'advanced',
      author: 'Donne Martin',
      tags: ['System Design', 'Architecture', 'Scalability'],
      bookmarked: false,
      views: 3456,
      likes: 234,
      comments: 42,
      dateAdded: '2025-01-08'
    },
    {
      id: '5',
      title: 'Figma UI Design Course',
      description: 'Complete course on UI/UX design using Figma.',
      type: 'video',
      category: 'Design',
      rating: 4.6,
      difficulty: 'beginner',
      duration: '12 hours',
      author: 'Design Course',
      tags: ['Figma', 'UI Design', 'UX'],
      bookmarked: true,
      views: 1823,
      likes: 156,
      comments: 28,
      dateAdded: '2025-01-05'
    },
    {
      id: '6',
      title: 'Financial Planning Toolkit',
      description: 'Excel templates and calculators for personal finance management.',
      type: 'tool',
      category: 'Finance',
      rating: 4.5,
      difficulty: 'beginner',
      author: 'Financial Gurus',
      tags: ['Excel', 'Budgeting', 'Planning'],
      bookmarked: false,
      views: 678,
      likes: 45,
      comments: 12,
      dateAdded: '2025-01-03'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'course': return <Award className="w-4 h-4" />;
      case 'docs': return <FileText className="w-4 h-4" />;
      case 'tool': return <Download className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'article': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'video': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'course': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'docs': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'tool': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'website': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'recent':
      default:
        return new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime();
    }
  });

  const toggleBookmark = (resourceId: string) => {
    // In a real app, this would update the resource in the backend
    console.log('Toggle bookmark for resource:', resourceId);
  };

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
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resource Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Curated resources to accelerate your learning
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {resources.length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Resources
            </div>
          </div>
          {allowAddResources && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {resources.filter(r => r.type === 'book').length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Books</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4"
        >
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {resources.filter(r => r.type === 'course').length}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Courses</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4"
        >
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                {resources.filter(r => r.bookmarked).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Saved</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">85%</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Progress</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="book">Books</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="course">Courses</option>
              <option value="docs">Documentation</option>
              <option value="tool">Tools</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">
                      {resource.title}
                    </h3>
                    {resource.author && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        by {resource.author}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => toggleBookmark(resource.id)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  {resource.bookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Description */}
              {resource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {resource.description}
                </p>
              )}

              {/* Tags */}
              {resource.tags && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {resource.difficulty && (
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  )}
                  {resource.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                  )}
                </div>
                
                {resource.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {resource.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Community Stats */}
              {showCommunityRatings && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {resource.views?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {resource.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {resource.comments}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => resource.url && window.open(resource.url, '_blank')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
              >
                {resource.url ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Open Resource
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No resources found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or add some resources to get started.
            </p>
            {allowAddResources && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Your First Resource
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResourceLibrary;