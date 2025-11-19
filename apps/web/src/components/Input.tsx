/**
 * Input Component
 * Age-appropriate input field with validation and error states
 * Meets WCAG 2.1 AA accessibility standards
 */

import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = 'text',
      required = false,
      disabled = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;

    // Base classes - meets minimum input height and touch target requirements
    const baseClasses = 'w-full min-h-input min-h-touch px-4 py-2 text-child-sm font-sans rounded-medium border-2 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-1';

    // State classes
    const stateClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-primary focus:ring-primary';

    const disabledClasses = disabled
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'bg-white text-text-primary';

    // Combine all classes
    const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-child-sm font-medium text-text-primary mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="mt-2 text-child-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
