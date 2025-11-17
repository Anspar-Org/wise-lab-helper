/**
 * PinInput Component Tests
 * TDD tests for PIN entry component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinInput from './PinInput';

describe('PinInput', () => {
  it('renders four input boxes', () => {
    render(<PinInput value="" onChange={vi.fn()} />);
    const inputs = screen.getAllByLabelText(/PIN digit/i);
    expect(inputs).toHaveLength(4);
  });

  it('displays value correctly across inputs', () => {
    render(<PinInput value="1234" onChange={vi.fn()} />);
    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
    expect(inputs[2].value).toBe('3');
    expect(inputs[3].value).toBe('4');
  });

  it('calls onChange when digit is entered', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PinInput value="" onChange={onChange} />);

    const inputs = screen.getAllByLabelText(/PIN digit/i);
    await user.type(inputs[0], '5');

    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('auto-advances to next input on digit entry', async () => {
    const user = userEvent.setup();
    render(<PinInput value="" onChange={vi.fn()} />);

    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    await user.type(inputs[0], '5');

    expect(document.activeElement).toBe(inputs[1]);
  });

  it('calls onComplete when all 4 digits are entered', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<PinInput value="" onChange={vi.fn()} onComplete={onComplete} />);

    const inputs = screen.getAllByLabelText(/PIN digit/i);
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    await user.type(inputs[2], '3');
    await user.type(inputs[3], '4');

    await screen.findByDisplayValue('4');
    expect(onComplete).toHaveBeenCalled();
  });

  it('only accepts numeric input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PinInput value="" onChange={onChange} />);

    const inputs = screen.getAllByLabelText(/PIN digit/i);
    await user.type(inputs[0], 'a');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles backspace to move to previous input', async () => {
    const user = userEvent.setup();
    render(<PinInput value="12" onChange={vi.fn()} />);

    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    inputs[1].focus();
    await user.keyboard('{Backspace}');

    // After backspace on empty field, should move to previous
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(inputs[0]);
    });
  });

  it('shows/hides PIN when show toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<PinInput value="1234" onChange={vi.fn()} showToggle />);

    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    expect(inputs[0].type).toBe('password');

    const toggleButton = screen.getByRole('button', { name: /show pin/i });
    await user.click(toggleButton);

    expect(inputs[0].type).toBe('text');
  });

  it('displays as password type by default when showToggle is true', () => {
    render(<PinInput value="1234" onChange={vi.fn()} showToggle />);
    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    expect(inputs[0].type).toBe('password');
  });

  it('supports disabled state', () => {
    render(<PinInput value="1234" onChange={vi.fn()} disabled />);
    const inputs = screen.getAllByLabelText(/PIN digit/i) as HTMLInputElement[];
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('supports error state', () => {
    render(<PinInput value="" onChange={vi.fn()} error="Invalid PIN" />);
    expect(screen.getByText('Invalid PIN')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<PinInput value="" onChange={vi.fn()} error="Invalid PIN" />);
    const inputs = screen.getAllByLabelText(/PIN digit/i);
    expect(inputs[0]).toHaveAttribute('aria-invalid', 'true');
  });
});
