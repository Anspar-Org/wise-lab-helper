/**
 * Button Component Tests
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with default variant (primary)', () => {
      render(<Button>Primary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-success');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('bg-transparent');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('renders small size (40px height)', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10'); // 40px = h-10
    });

    it('renders medium size (48px height) by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-button'); // 48px
    });

    it('renders large size (56px height)', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-14'); // 56px = h-14
    });

    it('has minimum width of 120px', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-button'); // 120px
    });
  });

  describe('States', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Should show loading indicator
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Loading</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(<Button icon={<Icon />}>With Icon</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders icon-only button', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(<Button icon={<Icon />} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation with Enter', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });

    it('supports keyboard navigation with Space', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');

      expect(handleClick).toHaveBeenCalled();
    });

    it('has proper aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has proper aria-label when provided', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });

    it('meets minimum touch target size (44x44px)', () => {
      render(<Button>Touch</Button>);
      const button = screen.getByRole('button');
      // Should have min-h-touch class (44px)
      expect(button).toHaveClass('min-h-touch');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('accepts custom type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('forwards ref to button element', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
