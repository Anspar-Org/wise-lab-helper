/**
 * CoachLogin Component Tests
 * TDD tests for coach email/password login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CoachLogin from './CoachLogin';
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

describe('CoachLogin', () => {
  const mockLoginCoach = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      loginCoach: mockLoginCoach,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders email and password inputs', () => {
    renderWithRouter(<CoachLogin />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderWithRouter(<CoachLogin />);

    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  describe('Validation', () => {
    it('requires email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('requires valid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    it('requires password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'coach@example.com');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('requires minimum password length', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'coach@example.com');

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'short');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    it('calls loginCoach with correct credentials', async () => {
      const user = userEvent.setup();
      mockLoginCoach.mockResolvedValue(undefined);
      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'coach@example.com');

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginCoach).toHaveBeenCalledWith({
          email: 'coach@example.com',
          password: 'password123',
        });
      });
    });

    it('navigates to coach dashboard on success', async () => {
      const user = userEvent.setup();
      mockLoginCoach.mockResolvedValue(undefined);
      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'coach@example.com');

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/coach/dashboard');
      });
    });

    it('displays error on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      (useAuthStore as any).mockReturnValue({
        loginCoach: mockLoginCoach,
        isLoading: false,
        error: errorMessage,
        clearError: mockClearError,
      });

      renderWithRouter(<CoachLogin />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Password Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      await user.click(toggleButton);

      expect(passwordInput.type).toBe('text');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Remember Me', () => {
    it('renders remember me checkbox', () => {
      renderWithRouter(<CoachLogin />);

      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('can toggle remember me', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const checkbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Forgot Password', () => {
    it('shows forgot password link', () => {
      renderWithRouter(<CoachLogin />);

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('shows help message when forgot password is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CoachLogin />);

      const forgotLink = screen.getByText(/forgot password/i);
      await user.click(forgotLink);

      expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables form during login', () => {
      (useAuthStore as any).mockReturnValue({
        loginCoach: mockLoginCoach,
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      renderWithRouter(<CoachLogin />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: /logging in/i });

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(loginButton).toBeDisabled();
    });
  });

  describe('Back to Home', () => {
    it('provides link back to landing page', () => {
      renderWithRouter(<CoachLogin />);

      const backLink = screen.getByRole('link', { name: /back to home/i });
      expect(backLink).toHaveAttribute('href', '/');
    });
  });
});
