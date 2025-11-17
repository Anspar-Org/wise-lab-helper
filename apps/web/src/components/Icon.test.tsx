/**
 * Icon Component Tests
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Icon from './Icon';

describe('Icon Component', () => {
  describe('Rendering', () => {
    it('renders icon element', () => {
      render(<Icon name="Star" data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with minimum size of 24x24px', () => {
      render(<Icon name="Star" size="min" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-6 h-6'); // 24px = 6 * 4px
    });

    it('renders with touch-friendly size of 44x44px by default', () => {
      render(<Icon name="Star" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-11 h-11'); // 44px = 11 * 4px
    });

    it('renders with custom size', () => {
      render(<Icon name="Star" size="large" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-16 h-16'); // 64px
    });
  });

  describe('Icon Names', () => {
    it('renders Star icon', () => {
      render(<Icon name="Star" data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders Check icon', () => {
      render(<Icon name="Check" data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders X icon', () => {
      render(<Icon name="X" data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders Heart icon', () => {
      render(<Icon name="Heart" data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('renders with custom color', () => {
      render(<Icon name="Star" color="text-primary" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('text-primary');
    });

    it('renders with default color', () => {
      render(<Icon name="Star" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('text-text-primary');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label when provided', () => {
      render(<Icon name="Star" aria-label="Favorite" />);
      expect(screen.getByLabelText(/favorite/i)).toBeInTheDocument();
    });

    it('is hidden from screen readers when decorative', () => {
      render(<Icon name="Star" aria-hidden="true" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Icon name="Star" className="custom-class" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('custom-class');
    });

    it('accepts data attributes', () => {
      render(<Icon name="Star" data-testid="custom-icon" />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});
