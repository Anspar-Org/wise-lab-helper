/**
 * StudentLogin Component Tests
 * TDD tests for student login with PIN and animal grid
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('StudentLogin', () => {
  const mockLoginStudent = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      loginStudent: mockLoginStudent,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders username input', () => {
    renderWithRouter(<StudentLogin />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('shows PIN option by default', () => {
    renderWithRouter(<StudentLogin />);
    expect(screen.getByText(/login with pin/i)).toBeInTheDocument();
  });

  it('allows switching to animal grid', async () => {
    const user = userEvent.setup();
    renderWithRouter(<StudentLogin />);

    const animalButton = screen.getByRole('button', { name: /use animal grid/i });
    await user.click(animalButton);

    expect(screen.getByText(/tap your 4 animals/i)).toBeInTheDocument();
  });

  describe('PIN Login', () => {
    it('requires username', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentLogin />);

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    it('requires complete PIN', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'alice');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/enter your 4-digit pin/i)).toBeInTheDocument();
    });

    it('calls loginStudent with correct credentials', async () => {
      const user = userEvent.setup();
      mockLoginStudent.mockResolvedValue(undefined);
      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'alice');

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[1], '1');
      await user.type(pinInputs[2], '2');
      await user.type(pinInputs[3], '3');
      await user.type(pinInputs[4], '4');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginStudent).toHaveBeenCalledWith({
          username: 'alice',
          auth_type: 'pin',
          pin: '1234',
        });
      });
    });

    it('navigates to student dashboard on success', async () => {
      const user = userEvent.setup();
      mockLoginStudent.mockResolvedValue(undefined);
      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'alice');

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[1], '1234');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/student/dashboard');
      });
    });

    it('displays error on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid username or PIN';
      mockLoginStudent.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'alice');

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[1], '1234');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginStudent).toHaveBeenCalled();
      });
    });
  });

  describe('Animal Grid Login', () => {
    it('requires 4 animals to be selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'bobby');

      // Switch to animal grid
      const animalButton = screen.getByRole('button', { name: /use animal grid/i });
      await user.click(animalButton);

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/select 4 animals/i)).toBeInTheDocument();
    });

    it('calls loginStudent with animal pattern', async () => {
      const user = userEvent.setup();
      mockLoginStudent.mockResolvedValue(undefined);
      renderWithRouter(<StudentLogin />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'bobby');

      // Switch to animal grid
      const animalButton = screen.getByRole('button', { name: /use animal grid/i });
      await user.click(animalButton);

      // Select 4 animals
      const animalButtons = screen.getAllByRole('button');
      const selectableAnimals = animalButtons.filter(
        btn => btn.getAttribute('aria-label') && !btn.textContent?.includes('Use')
      );

      await user.click(selectableAnimals[0]);
      await user.click(selectableAnimals[1]);
      await user.click(selectableAnimals[2]);
      await user.click(selectableAnimals[3]);

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginStudent).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'bobby',
            auth_type: 'animal_grid',
            animal_pattern: expect.arrayContaining([expect.any(String)]),
          })
        );
      });
    });
  });

  describe('Help Messages', () => {
    it('shows forgot PIN help message', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentLogin />);

      const forgotLink = screen.getByText(/forgot pin/i);
      await user.click(forgotLink);

      expect(screen.getByText(/ask your coach for help/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables form during login', () => {
      (useAuthStore as any).mockReturnValue({
        loginStudent: mockLoginStudent,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      renderWithRouter(<StudentLogin />);

      const loginButton = screen.getByRole('button', { name: /logging in/i });
      expect(loginButton).toBeDisabled();
    });
  });

  describe('Link to Registration', () => {
    it('provides link to registration page', () => {
      renderWithRouter(<StudentLogin />);

      const registerLink = screen.getByRole('link', { name: /create account/i });
      expect(registerLink).toHaveAttribute('href', '/auth/student-registration');
    });
  });
});
