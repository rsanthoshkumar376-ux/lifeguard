import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div 
        className="relative bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl transform transition-all animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold text-gray-900">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
        
        {/* Safe area padding for mobile */}
        <div className="pb-safe" />
      </div>
    </div>
  );
};

export default Modal;
