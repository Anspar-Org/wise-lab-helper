/**
 * Badge Component (UI element, not achievement badge)
 * Small status indicator with color variants
 * Meets WCAG 2.1 AA accessibility standards
 */

import React from 'react';
import { X } from 'lucide-react';

export interface BadgeProps {
  /** Badge variant/color */
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'accent';
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Badge content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Data test id */
  'data-testid'?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'medium',
  onRemove,
  children,
  className = '',
  'data-testid': dataTestId,
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all duration-fast';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white',
    accent: 'bg-accent text-white',
  };

  // Size classes
  const sizeClasses = {
    small: 'text-child-xs px-2',
    medium: 'text-child-sm px-3',
    large: 'text-child-base px-4',
  };

  // Combine all classes
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={badgeClasses} data-testid={dataTestId}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors duration-fast focus:outline-none focus:ring-1 focus:ring-white"
          aria-label="Remove badge"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Badge;
