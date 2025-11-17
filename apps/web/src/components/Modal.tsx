/**
 * Modal/Dialog Component
 * Accessible modal with overlay and keyboard support
 * Meets WCAG 2.1 AA accessibility standards
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Max width (default: 600px) */
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px',
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="bg-surface rounded-large shadow-elevation-3 animate-slide-up"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {title && (
            <h2
              id="modal-title"
              className="text-child-xl font-semibold text-text-primary"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 rounded-medium hover:bg-gray-100 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
