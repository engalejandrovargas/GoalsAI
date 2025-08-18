import React, { useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: 'delete' | 'logout' | 'clear' | 'warning';
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  resolve?: (confirmed: boolean) => void;
}

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: ''
  });

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        isOpen: true,
        resolve
      });
    });
  };

  const handleClose = () => {
    if (confirmation.resolve) {
      confirmation.resolve(false);
    }
    setConfirmation({ ...confirmation, isOpen: false, resolve: undefined });
  };

  const handleConfirm = () => {
    if (confirmation.resolve) {
      confirmation.resolve(true);
    }
    setConfirmation({ ...confirmation, isOpen: false, resolve: undefined });
  };

  const ConfirmationDialog = () => (
    <ConfirmationModal
      isOpen={confirmation.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={confirmation.title}
      message={confirmation.message}
      confirmText={confirmation.confirmText}
      cancelText={confirmation.cancelText}
      type={confirmation.type}
      icon={confirmation.icon}
    />
  );

  return { confirm, ConfirmationDialog };
};

export default useConfirmation;