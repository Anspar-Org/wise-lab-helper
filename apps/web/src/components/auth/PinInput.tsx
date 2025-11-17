/**
 * PinInput Component
 * Four-digit PIN entry component with auto-advance and show/hide toggle
 * Age-appropriate and touch-friendly for elementary students
 */

import React, { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PinInputProps {
  /** Current PIN value (0-4 digits) */
  value: string;
  /** Called when PIN changes */
  onChange: (value: string) => void;
  /** Called when all 4 digits are entered */
  onComplete?: (pin: string) => void;
  /** Show toggle button to reveal/hide PIN */
  showToggle?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Custom className */
  className?: string;
}

const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  onComplete,
  showToggle = false,
  disabled = false,
  error,
  className = '',
}) => {
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of digits
  const digits = value.padEnd(4, ' ').split('').slice(0, 4);

  // Auto-focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex(d => d === ' ');
    const focusIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  }, []);

  // Check if complete and call onComplete
  useEffect(() => {
    if (value.length === 4 && onComplete) {
      onComplete(value);
    }
  }, [value, onComplete]);

  const handleChange = (index: number, digitValue: string) => {
    // Only allow numeric input
    if (digitValue && !/^\d$/.test(digitValue)) {
      return;
    }

    // Update the value
    const newDigits = [...digits];
    newDigits[index] = digitValue || ' ';
    const newValue = newDigits.join('').trim();
    onChange(newValue);

    // Auto-advance to next input
    if (digitValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!digits[index] || digits[index] === ' ') {
        // If current is empty, move to previous
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current digit
        handleChange(index, '');
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Only accept 4-digit numbers
    if (/^\d{4}$/.test(pastedData)) {
      onChange(pastedData);
      inputRefs.current[3]?.focus();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3 justify-center">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type={showToggle && !showPin ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={1}
            value={digit === ' ' ? '' : digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`PIN digit ${index + 1}`}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-16 h-16 text-center text-child-2xl font-bold
              border-2 rounded-medium transition-all duration-fast
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-primary focus:border-primary focus:ring-primary'
              }
              ${disabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white text-text-primary'
              }
            `}
          />
        ))}

        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            disabled={disabled}
            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            className="ml-2 p-2 text-primary hover:bg-primary-50 rounded-medium transition-colors"
          >
            {showPin ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-child-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PinInput;
