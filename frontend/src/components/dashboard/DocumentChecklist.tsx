import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Circle,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Search,
  Paperclip,
  Shield,
  Star,
  FileCheck,
  AlertCircle,
  Users,
  Globe
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  required: boolean;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  completedDate?: string;
  fileUrl?: string;
  notes?: string;
  reminders?: {
    date: string;
    message: string;
  }[];
  dependencies?: string[];
  issuingAuthority?: string;
  validUntil?: string;
  cost?: number;
  processingTime?: string;
}

interface DocumentChecklistProps {
  goalId: string;
  goalType?: 'travel' | 'business' | 'immigration' | 'education' | 'legal' | 'medical';
  allowEdit?: boolean;
  showProgress?: boolean;
  showUpload?: boolean;
  documents?: Document[];
  onUpdateDocuments?: (documents: Document[]) => void;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  goalId,
  goalType = 'travel',
  allowEdit = true,
  showProgress = true,
  showUpload = true,
  documents = [],
  onUpdateDocuments,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);

  // Default documents based on goal type
  const getDefaultDocuments = (type: string): Document[] => {
    const baseDocuments: Record<string, Document[]> = {
      travel: [
        {
          id: '1',
          title: 'Valid Passport',
          description: 'Passport must be valid for at least 6 months beyond travel date',
          category: 'Identity',
          required: true,
          completed: true,
          priority: 'critical',
          completedDate: '2025-01-15',
          issuingAuthority: 'Passport Office',
          validUntil: '2030-06-15',
          processingTime: '2-4 weeks'
        },
        {
          id: '2',
          title: 'Travel Visa',
          description: 'Tourist visa for Japan (90-day stay)',
          category: 'Authorization',
          required: true,
          completed: false,
          priority: 'critical',
          dueDate: '2025-03-01',
          issuingAuthority: 'Japanese Consulate',
          cost: 160,
          processingTime: '5-10 business days'
        },
        {
          id: '3',
          title: 'Travel Insurance',
          description: 'Comprehensive travel insurance covering medical emergencies',
          category: 'Insurance',
          required: true,
          completed: false,
          priority: 'high',
          dueDate: '2025-08-01',
          cost: 250,
          processingTime: '1-2 days'
        },
        {
          id: '4',
          title: 'Flight Tickets',
          description: 'Round-trip flight booking confirmation',
          category: 'Travel',
          required: true,
          completed: false,
          priority: 'high',
          dueDate: '2025-07-01'
        },
        {
          id: '5',
          title: 'Hotel Reservations',
          description: 'Confirmed accommodation for entire stay',
          category: 'Accommodation',
          required: true,
          completed: false,
          priority: 'medium',
          dueDate: '2025-07-15'
        },
        {
          id: '6',
          title: 'International Driver\'s License',
          description: 'If planning to rent a car in Japan',
          category: 'License',
          required: false,
          completed: false,
          priority: 'low',
          processingTime: '2-3 weeks'
        }
      ],
      business: [
        {
          id: '1',
          title: 'Business Registration',
          description: 'Register business entity with state/province',
          category: 'Legal',
          required: true,
          completed: false,
          priority: 'critical',
          cost: 300,
          processingTime: '1-2 weeks'
        },
        {
          id: '2',
          title: 'Tax ID Number',
          description: 'Obtain federal tax identification number',
          category: 'Tax',
          required: true,
          completed: false,
          priority: 'critical',
          processingTime: '2-4 weeks'
        },
        {
          id: '3',
          title: 'Business License',
          description: 'Local business operating license',
          category: 'License',
          required: true,
          completed: false,
          priority: 'high',
          cost: 150,
          processingTime: '2-6 weeks'
        },
        {
          id: '4',
          title: 'Business Insurance',
          description: 'General liability and professional insurance',
          category: 'Insurance',
          required: true,
          completed: false,
          priority: 'high',
          cost: 1200,
          processingTime: '1-3 days'
        }
      ]
    };

    return baseDocuments[type] || [];
  };

  const checklistDocuments = documents.length > 0 ? documents : getDefaultDocuments(goalType);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'identity': return <Shield className="w-4 h-4" />;
      case 'authorization': 
      case 'legal': return <FileCheck className="w-4 h-4" />;
      case 'insurance': return <Star className="w-4 h-4" />;
      case 'travel': return <Globe className="w-4 h-4" />;
      case 'license': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const toggleDocument = (docId: string) => {
    const updatedDocs = checklistDocuments.map(doc =>
      doc.id === docId 
        ? { 
            ...doc, 
            completed: !doc.completed,
            completedDate: !doc.completed ? new Date().toISOString().split('T')[0] : undefined
          }
        : doc
    );
    onUpdateDocuments?.(updatedDocs);
  };

  const deleteDocument = (docId: string) => {
    const updatedDocs = checklistDocuments.filter(doc => doc.id !== docId);
    onUpdateDocuments?.(updatedDocs);
  };

  const filteredDocuments = checklistDocuments.filter(doc => {
    const matchesFilter = 
      selectedFilter === 'all' ||
      (selectedFilter === 'pending' && !doc.completed) ||
      (selectedFilter === 'completed' && doc.completed) ||
      (selectedFilter === 'overdue' && !doc.completed && isOverdue(doc.dueDate));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesCategory && matchesSearch;
  });

  const completedCount = checklistDocuments.filter(doc => doc.completed).length;
  const totalCount = checklistDocuments.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const overdueCount = checklistDocuments.filter(doc => !doc.completed && isOverdue(doc.dueDate)).length;

  const categories = [...new Set(checklistDocuments.map(doc => doc.category))];

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
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Checklist
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track required documents and paperwork
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedCount}/{totalCount}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Completed
            </div>
          </div>
          {allowEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Add Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      {showProgress && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Overall Progress
            </span>
            <span className="text-3xl font-bold text-blue-600">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-white dark:bg-gray-700 rounded-full h-3 shadow-inner mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-3 rounded-full shadow-lg relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{completedCount}</div>
              <div className="text-green-700 dark:text-green-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{totalCount - completedCount - overdueCount}</div>
              <div className="text-yellow-700 dark:text-yellow-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-red-700 dark:text-red-300">Overdue</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Documents</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDocuments.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                  document.completed 
                    ? 'border-green-200 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' 
                    : isOverdue(document.dueDate)
                    ? 'border-red-200 dark:border-red-700 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <motion.button
                    onClick={() => toggleDocument(document.id)}
                    className={`mt-1 rounded-full p-1 transition-colors ${
                      document.completed ? 'text-green-600' : 'text-gray-400 hover:text-blue-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {document.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </motion.button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            document.completed 
                              ? 'line-through text-green-700 dark:text-green-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {document.title}
                          </h3>
                          
                          {document.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full">
                              Required
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(document.priority)}`}>
                            {document.priority} priority
                          </span>
                        </div>
                        
                        {document.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                            {document.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {getCategoryIcon(document.category)}
                            <span>{document.category}</span>
                          </div>
                          
                          {document.dueDate && (
                            <div className={`flex items-center gap-2 ${
                              isOverdue(document.dueDate) && !document.completed ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(document.dueDate).toLocaleDateString()}</span>
                              {isOverdue(document.dueDate) && !document.completed && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                          
                          {document.cost && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <span>Cost: ${document.cost}</span>
                            </div>
                          )}
                          
                          {document.processingTime && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{document.processingTime}</span>
                            </div>
                          )}
                          
                          {document.issuingAuthority && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{document.issuingAuthority}</span>
                            </div>
                          )}
                          
                          {document.validUntil && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Valid until: {new Date(document.validUntil).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {document.completedDate && (
                          <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                            ✓ Completed on {new Date(document.completedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {allowEdit && (
                        <div className="flex items-center gap-1 ml-4">
                          {showUpload && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                              title="Upload document"
                            >
                              <Upload className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200"
                            title="Edit document"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => deleteDocument(document.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedFilter !== 'all' ? 
                'Try adjusting your search criteria.' : 
                'Add your first document to get started.'
              }
            </p>
            {allowEdit && !searchQuery && selectedFilter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Document
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentChecklist;