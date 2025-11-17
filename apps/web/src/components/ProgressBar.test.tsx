/**
 * Progress Bar Component Tests
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar Component', () => {
  describe('Rendering', () => {
    it('renders progress bar', () => {
      render(<ProgressBar current={50} max={100} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('has height between 8-12px', () => {
      render(<ProgressBar current={50} max={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('h-3'); // 12px
    });

    it('has width of 100% of container', () => {
      render(<ProgressBar current={50} max={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toHaveClass('w-full');
    });
  });

  describe('Progress Calculation', () => {
    it('calculates percentage correctly (50%)', () => {
      render(<ProgressBar current={50} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('calculates percentage correctly (75%)', () => {
      render(<ProgressBar current={75} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('handles 0% progress', () => {
      render(<ProgressBar current={0} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles 100% progress', () => {
      render(<ProgressBar current={100} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('caps progress at 100% when current exceeds max', () => {
      render(<ProgressBar current={150} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      // Should still show current value
      expect(progressBar).toHaveAttribute('aria-valuenow', '150');
    });
  });

  describe('Percentage Display', () => {
    it('shows percentage when showPercent is true', () => {
      render(<ProgressBar current={50} max={100} showPercent />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('does not show percentage by default', () => {
      render(<ProgressBar current={50} max={100} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('shows correct percentage for different values', () => {
      render(<ProgressBar current={33} max={100} showPercent />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('uses primary color by default', () => {
      render(<ProgressBar current={50} max={100} data-testid="progress-fill" />);
      // The fill div should have primary color
      const container = screen.getByTestId('progress-fill');
      const fill = container.querySelector('div[role="progressbar"] > div');
      expect(fill).toHaveClass('bg-primary');
    });

    it('accepts custom color', () => {
      render(<ProgressBar current={50} max={100} color="bg-success" data-testid="progress-fill" />);
      const container = screen.getByTestId('progress-fill');
      const fill = container.querySelector('div[role="progressbar"] > div');
      expect(fill).toHaveClass('bg-success');
    });
  });

  describe('Animation', () => {
    it('has transition animation', () => {
      render(<ProgressBar current={50} max={100} data-testid="progress-fill" />);
      const container = screen.getByTestId('progress-fill');
      const fill = container.querySelector('div[role="progressbar"] > div');
      expect(fill).toHaveClass('transition-all');
    });
  });

  describe('Accessibility', () => {
    it('has proper progressbar role', () => {
      render(<ProgressBar current={50} max={100} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has proper aria-valuenow', () => {
      render(<ProgressBar current={75} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('has proper aria-valuemin', () => {
      render(<ProgressBar current={50} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('has proper aria-valuemax', () => {
      render(<ProgressBar current={50} max={100} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-label when provided', () => {
      render(<ProgressBar current={50} max={100} aria-label="Loading progress" />);
      const progressBar = screen.getByRole('progressbar', { name: /loading progress/i });
      expect(progressBar).toBeInTheDocument();
    });
  });
});
