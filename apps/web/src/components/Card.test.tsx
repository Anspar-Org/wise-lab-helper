/**
 * Card Component Tests
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByText(/card title/i)).toBeInTheDocument();
    });

    it('has border radius of 8px (medium)', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-medium');
    });

    it('has padding between 16-24px', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-6'); // 24px
    });
  });

  describe('Elevation', () => {
    it('renders with elevation-1 shadow by default', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-elevation-1');
    });

    it('renders with elevation-2 shadow', () => {
      render(<Card elevation="2" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-elevation-2');
    });

    it('renders with elevation-3 shadow', () => {
      render(<Card elevation="3" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-elevation-3');
    });
  });

  describe('Hover Effects', () => {
    it('has hover effect when clickable', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Clickable content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:shadow-elevation-2');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(
        <Card onClick={handleClick} data-testid="card">
          Clickable
        </Card>
      );

      const card = screen.getByTestId('card');
      await userEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor pointer when clickable', () => {
      render(
        <Card onClick={() => {}} data-testid="card">
          Clickable
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('does not have hover effects when not clickable', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('has proper role when clickable', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports keyboard navigation when clickable', async () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable</Card>);

      const card = screen.getByRole('button');
      card.focus();
      await userEvent.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });

    it('has tabIndex 0 when clickable', () => {
      render(<Card onClick={() => {}} data-testid="card">Clickable</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('renders with custom background color', () => {
      render(
        <Card className="bg-primary-50" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-primary-50');
    });
  });
});
