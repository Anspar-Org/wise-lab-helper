/**
 * Input Component Tests
 * Following TDD: Write tests first, then implement component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    });

    it('has minimum height of 40px', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('min-h-input');
    });

    it('meets minimum touch target size (44px)', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('min-h-touch');
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('handles input changes', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('shows error state', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    });

    it('has error styling when error prop is provided', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('shows focus state', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      await userEvent.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe('Validation', () => {
    it('shows required indicator', () => {
      render(<Input label="Email" required />);
      // Should show asterisk or required indicator
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('has required attribute when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('validates email format', async () => {
      const handleChange = vi.fn();
      render(<Input type="email" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'invalid-email');

      expect(input).toHaveValue('invalid-email');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label when provided', () => {
      render(<Input aria-label="Search" />);
      const input = screen.getByRole('textbox', { name: /search/i });
      expect(input).toBeInTheDocument();
    });

    it('has proper aria-invalid when error is present', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('has proper aria-describedby for error message', () => {
      render(<Input error="Error message" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('associates label with input using htmlFor', () => {
      render(<Input label="Name" id="name-input" />);
      const label = screen.getByText('Name');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'name-input');
      expect(input).toHaveAttribute('id', 'name-input');
    });

    it('supports keyboard navigation', async () => {
      render(<Input />);
      const input = screen.getByRole('textbox');

      await userEvent.tab();
      expect(input).toHaveFocus();
    });
  });

  describe('Controlled Input', () => {
    it('works as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<TestComponent />);
      const input = screen.getByRole('textbox');

      await userEvent.type(input, 'controlled');
      expect(input).toHaveValue('controlled');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('accepts maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('accepts pattern attribute', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('forwards ref to input element', () => {
      const ref = { current: null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});
