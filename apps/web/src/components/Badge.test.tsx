/**
 * Badge Component Tests (UI element, not achievement badge)
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Badge from './Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText(/new/i)).toBeInTheDocument();
    });

    it('renders with number content', () => {
      render(<Badge>5</Badge>);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Badge data-testid="badge">Primary</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary');
    });

    it('renders success variant', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-success');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-warning');
    });

    it('renders info variant', () => {
      render(<Badge variant="info" data-testid="badge">Info</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-info');
    });

    it('renders accent variant', () => {
      render(<Badge variant="accent" data-testid="badge">Accent</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-accent');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Badge size="small" data-testid="badge">Small</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-child-xs');
    });

    it('renders medium size by default', () => {
      render(<Badge data-testid="badge">Medium</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-child-sm');
    });

    it('renders large size', () => {
      render(<Badge size="large" data-testid="badge">Large</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-child-base');
    });
  });

  describe('Removable Badge', () => {
    it('shows remove button when onRemove is provided', () => {
      render(<Badge onRemove={() => {}}>Removable</Badge>);
      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
    });

    it('calls onRemove when remove button is clicked', async () => {
      const handleRemove = vi.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);

      const removeButton = screen.getByRole('button');
      await userEvent.click(removeButton);

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('does not show remove button when onRemove is not provided', () => {
      render(<Badge>Not Removable</Badge>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
