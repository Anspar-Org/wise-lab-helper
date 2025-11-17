/**
 * Card Component
 * Container component with elevation and hover effects
 * Meets WCAG 2.1 AA accessibility standards
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title (optional header) */
  title?: string;
  /** Shadow elevation level */
  elevation?: '1' | '2' | '3';
  /** Click handler - makes card interactive */
  onClick?: () => void;
  /** Card content */
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  elevation = '1',
  onClick,
  children,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'bg-surface rounded-medium p-6 transition-all duration-fast';

  // Elevation classes
  const elevationClasses = {
    '1': 'shadow-elevation-1',
    '2': 'shadow-elevation-2',
    '3': 'shadow-elevation-3',
  };

  // Interactive classes (when clickable)
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:shadow-elevation-2 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : '';

  // Combine all classes
  const cardClasses = `${baseClasses} ${elevationClasses[elevation]} ${interactiveClasses} ${className}`;

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {title && (
        <h3 className="text-child-lg font-semibold text-text-primary mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
