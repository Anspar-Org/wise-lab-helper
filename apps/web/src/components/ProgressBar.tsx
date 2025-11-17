/**
 * Progress Bar Component
 * Visual indicator of progress with percentage display
 * Meets WCAG 2.1 AA accessibility standards
 */

import React from 'react';

export interface ProgressBarProps {
  /** Current progress value */
  current: number;
  /** Maximum progress value */
  max: number;
  /** Whether to show percentage text */
  showPercent?: boolean;
  /** Progress bar color (Tailwind class) */
  color?: string;
  /** Aria label for accessibility */
  'aria-label'?: string;
  /** Custom className */
  className?: string;
  /** Data test id */
  'data-testid'?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  showPercent = false,
  color = 'bg-primary',
  'aria-label': ariaLabel,
  className = '',
  'data-testid': dataTestId,
}) => {
  // Calculate percentage (cap at 100% for visual display)
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden w-full"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel}
          data-testid={dataTestId}
        >
          <div
            className={`h-full ${color} transition-all duration-slow rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercent && (
          <span className="text-child-sm font-medium text-text-primary min-w-[3ch]">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
