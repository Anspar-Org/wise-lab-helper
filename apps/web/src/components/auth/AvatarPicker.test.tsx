/**
 * AvatarPicker Component Tests
 * TDD tests for avatar selection component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvatarPicker from './AvatarPicker';

describe('AvatarPicker', () => {
  const mockUsername = 'testuser';

  it('renders multiple avatar options', () => {
    render(<AvatarPicker username={mockUsername} onSelect={vi.fn()} />);

    // Should render avatar images
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('calls onSelect when an avatar is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AvatarPicker username={mockUsername} onSelect={onSelect} />);

    const avatarButtons = screen.getAllByRole('button');
    await user.click(avatarButtons[0]);

    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0]).toHaveProperty('style');
    expect(onSelect.mock.calls[0][0]).toHaveProperty('seed');
  });

  it('shows selected avatar with visual feedback', () => {
    const selectedStyle = 'adventurer';
    render(
      <AvatarPicker
        username={mockUsername}
        onSelect={vi.fn()}
        selectedStyle={selectedStyle}
      />
    );

    const selectedButton = screen.getByRole('button', { pressed: true });
    expect(selectedButton).toBeInTheDocument();
    expect(selectedButton.className).toContain('ring-4');
  });

  it('supports randomize functionality', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(
      <AvatarPicker username={mockUsername} onSelect={onSelect} />
    );

    const randomizeButton = screen.getByRole('button', { name: /randomize/i });
    await user.click(randomizeButton);

    // Should have called onSelect with a random style
    expect(onSelect).toHaveBeenCalled();
  });

  it('uses username as seed for consistency', () => {
    const { container } = render(
      <AvatarPicker username={mockUsername} onSelect={vi.fn()} />
    );

    const avatarImages = container.querySelectorAll('img');
    avatarImages.forEach(img => {
      expect(img.src).toContain(encodeURIComponent(mockUsername));
    });
  });

  it('displays different avatar styles', () => {
    const { container } = render(
      <AvatarPicker username={mockUsername} onSelect={vi.fn()} />
    );

    const avatarImages = container.querySelectorAll('img');

    // Should have different styles in the URLs
    const styles = Array.from(avatarImages).map(img => {
      const match = img.src.match(/\/7\.x\/([^/]+)\//);
      return match ? match[1] : null;
    });

    const uniqueStyles = new Set(styles);
    expect(uniqueStyles.size).toBeGreaterThan(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <AvatarPicker
        username={mockUsername}
        onSelect={vi.fn()}
        selectedStyle="adventurer"
      />
    );

    const avatarButtons = screen.getAllByRole('button');
    avatarButtons.forEach(button => {
      if (button.getAttribute('aria-label')?.includes('Randomize')) return;
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  it('displays avatars in a grid layout', () => {
    const { container } = render(
      <AvatarPicker username={mockUsername} onSelect={vi.fn()} />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('shows selected avatar preview when provided', () => {
    const selectedStyle = 'adventurer';
    render(
      <AvatarPicker
        username={mockUsername}
        onSelect={vi.fn()}
        selectedStyle={selectedStyle}
      />
    );

    // Should indicate which one is selected
    const selectedButton = screen.getByRole('button', { pressed: true });
    expect(selectedButton).toBeInTheDocument();
  });
});
