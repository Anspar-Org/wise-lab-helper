/**
 * Tabs Component Tests
 * Following TDD: Write tests first, then implement component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from './Tabs';

describe('Tabs Component', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
    { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
  ];

  describe('Rendering', () => {
    it('renders all tab labels', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('renders active tab content', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('does not render inactive tab content', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('highlights active tab', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      const tab1Button = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1Button).toHaveAttribute('aria-selected', 'true');
    });

    it('does not highlight inactive tabs', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      const tab2Button = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2Button).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Tab Switching', () => {
    it('calls onTabChange when tab is clicked', async () => {
      const handleTabChange = vi.fn();
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={handleTabChange} />);

      const tab2Button = screen.getByRole('tab', { name: 'Tab 2' });
      await userEvent.click(tab2Button);

      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    it('switches content when different tab is active', () => {
      const { rerender } = render(
        <Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />
      );
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(<Tabs tabs={mockTabs} activeTab="tab2" onTabChange={() => {}} />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper tablist role', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has proper tab roles', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('has proper tabpanel role for content', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('supports keyboard navigation with arrows', async () => {
      const handleTabChange = vi.fn();
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={handleTabChange} />);

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await userEvent.keyboard('{ArrowRight}');
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    it('has minimum touch target size', () => {
      render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('min-h-touch');
      });
    });
  });

  describe('Limit', () => {
    it('handles up to 7 tabs', () => {
      const manyTabs = Array.from({ length: 7 }, (_, i) => ({
        id: `tab${i + 1}`,
        label: `Tab ${i + 1}`,
        content: `Content ${i + 1}`,
      }));

      render(<Tabs tabs={manyTabs} activeTab="tab1" onTabChange={() => {}} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(7);
    });
  });
});
