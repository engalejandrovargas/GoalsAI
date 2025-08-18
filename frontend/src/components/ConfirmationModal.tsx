import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, LogOut, MessageSquareX } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'delete' | 'logout' | 'clear' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon = 'warning'
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'logout':
        return <LogOut className="w-6 h-6 text-orange-600" />;
      case 'clear':
        return <MessageSquareX className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full max-w-md ${colors.cardBackground} ${colors.cardBorder} border rounded-2xl shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  type === 'danger' ? 'bg-red-100' : 
                  type === 'warning' ? 'bg-amber-100' : 
                  'bg-blue-100'
                }`}>
                  {getIcon()}
                </div>
                <h3 className={`text-lg font-semibold ${colors.textPrimary}`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${colors.textSecondary} hover:${colors.backgroundTertiary} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className={`${colors.textSecondary} text-sm leading-relaxed mb-6`}>
                {message}
              </p>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${colors.buttonSecondary} ${colors.buttonSecondaryText} hover:opacity-80`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${getConfirmButtonStyle()}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;