/**
 * Button Component
 * Age-appropriate button with multiple variants, sizes, and states
 * Meets WCAG 2.1 AA accessibility standards
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  /** Icon to display (on left side of text) */
  icon?: React.ReactNode;
  /** Button content */
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      icon,
      children,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    // Base classes - meets minimum touch target and button size requirements
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-medium transition-all duration-fast min-h-touch min-w-button focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Variant classes
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500',
      secondary: 'bg-success text-white hover:bg-green-600 active:bg-green-700 focus:ring-success disabled:bg-gray-300 disabled:text-gray-500',
      outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary-50 active:bg-primary-100 focus:ring-primary disabled:border-gray-300 disabled:text-gray-400',
      ghost: 'bg-transparent text-primary hover:bg-primary-50 active:bg-primary-100 focus:ring-primary disabled:text-gray-400',
    };

    // Size classes
    const sizeClasses = {
      small: 'h-10 px-4 text-child-sm',
      medium: 'min-h-button px-6 text-child-base',
      large: 'h-14 px-8 text-child-lg',
    };

    // Combine all classes
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Handle click event
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin-slow" />
        ) : (
          icon && <span className="inline-flex">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
