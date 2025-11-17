/**
 * AnimalGrid Component Tests
 * TDD tests for animal grid authentication component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnimalGrid from './AnimalGrid';

describe('AnimalGrid', () => {
  it('renders 25 animal buttons', () => {
    render(<AnimalGrid selectedAnimals={[]} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(25);
  });

  it('displays correct animals', () => {
    render(<AnimalGrid selectedAnimals={[]} onSelect={vi.fn()} />);

    // Check for some of the animals
    expect(screen.getByLabelText('dog')).toBeInTheDocument();
    expect(screen.getByLabelText('cat')).toBeInTheDocument();
    expect(screen.getByLabelText('mouse')).toBeInTheDocument();
  });

  it('calls onSelect when animal is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AnimalGrid selectedAnimals={[]} onSelect={onSelect} />);

    const dogButton = screen.getByLabelText('dog');
    await user.click(dogButton);

    expect(onSelect).toHaveBeenCalledWith('🐶');
  });

  it('shows visual feedback for selected animals', () => {
    render(<AnimalGrid selectedAnimals={['🐶', '🐱']} onSelect={vi.fn()} />);

    const dogButton = screen.getByLabelText('dog');
    const catButton = screen.getByLabelText('cat');
    const mouseButton = screen.getByLabelText('mouse');

    // Selected animals should have different styling
    expect(dogButton.className).toContain('ring-4');
    expect(catButton.className).toContain('ring-4');
    expect(mouseButton.className).not.toContain('ring-4');
  });

  it('respects maxSelection limit', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AnimalGrid
        selectedAnimals={['🐶', '🐱', '🐭', '🐹']}
        onSelect={onSelect}
        maxSelection={4}
      />
    );

    const foxButton = screen.getByLabelText('fox');
    await user.click(foxButton);

    // Should not call onSelect when max is reached
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('allows deselecting an already selected animal', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AnimalGrid selectedAnimals={['🐶', '🐱']} onSelect={onSelect} />);

    const dogButton = screen.getByLabelText('dog');
    await user.click(dogButton);

    expect(onSelect).toHaveBeenCalledWith('🐶');
  });

  it('shows selection count', () => {
    render(
      <AnimalGrid
        selectedAnimals={['🐶', '🐱', '🐭']}
        onSelect={vi.fn()}
        maxSelection={4}
        showCount
      />
    );

    expect(screen.getByText(/3 of 4 animals selected/i)).toBeInTheDocument();
  });

  it('supports disabled state', () => {
    render(
      <AnimalGrid
        selectedAnimals={[]}
        onSelect={vi.fn()}
        disabled
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<AnimalGrid selectedAnimals={['🐶']} onSelect={vi.fn()} />);

    const dogButton = screen.getByLabelText('dog');
    expect(dogButton).toHaveAttribute('aria-pressed', 'true');

    const catButton = screen.getByLabelText('cat');
    expect(catButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies sparkle effect to selected animals', () => {
    render(<AnimalGrid selectedAnimals={['🐶', '🐱']} onSelect={vi.fn()} />);

    const dogButton = screen.getByLabelText('dog');
    // Should have animation class
    expect(dogButton.className).toContain('scale-110');
  });

  it('renders in grid layout', () => {
    const { container } = render(<AnimalGrid selectedAnimals={[]} onSelect={vi.fn()} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('grid-cols-5');
  });
});
