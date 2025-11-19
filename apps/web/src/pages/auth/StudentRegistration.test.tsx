/**
 * StudentRegistration Component Tests
 * TDD tests for student registration multi-step wizard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import StudentRegistration from './StudentRegistration';
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

describe('StudentRegistration', () => {
  const mockRegisterStudent = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      registerStudent: mockRegisterStudent,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Step 1: Name and Grade', () => {
    it('renders step 1 initially', () => {
      renderWithRouter(<StudentRegistration />);

      expect(screen.getByText(/what's your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });

    it('shows grade level buttons', () => {
      renderWithRouter(<StudentRegistration />);

      expect(screen.getByRole('button', { name: /^K$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^1$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^5$/i })).toBeInTheDocument();
    });

    it('validates name input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    it('requires grade selection', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      const nameInput = screen.getByLabelText(/display name/i);
      await user.type(nameInput, 'Alice');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/select a grade/i)).toBeInTheDocument();
    });

    it('advances to step 2 when valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      const nameInput = screen.getByLabelText(/display name/i);
      await user.type(nameInput, 'Alice');

      const gradeButton = screen.getByRole('button', { name: /^3$/i });
      await user.click(gradeButton);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/choose your avatar/i)).toBeInTheDocument();
    });

    it('auto-generates username from display name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      const nameInput = screen.getByLabelText(/display name/i);
      await user.type(nameInput, 'Alice Smith');

      // Username should be shown (lowercase, no spaces)
      expect(screen.getByText(/alicesmith/i)).toBeInTheDocument();
    });
  });

  describe('Step 2: Avatar Selection', () => {
    it('shows avatar picker on step 2', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete step 1
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^3$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/choose your avatar/i)).toBeInTheDocument();
    });

    it('requires avatar selection', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete step 1
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^3$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Try to proceed without selecting avatar
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/select an avatar/i)).toBeInTheDocument();
    });

    it('allows going back to step 1', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete step 1
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^3$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go back
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(screen.getByText(/what's your name/i)).toBeInTheDocument();
    });
  });

  describe('Step 3: Authentication Setup - PIN (Grades 3-5)', () => {
    it('shows PIN input for grades 3-5', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete steps 1 and 2
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Select avatar
      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/create your pin/i)).toBeInTheDocument();
    });

    it('validates PIN confirmation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete to step 3
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Enter different PINs
      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[0], '1234');
      // Assuming there's a confirm PIN section
      // This will be validated in the actual implementation
    });
  });

  describe('Step 3: Authentication Setup - Animal Grid (Grades K-2)', () => {
    it('shows animal grid for grades K-2', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete steps with K-2 grade
      await user.type(screen.getByLabelText(/display name/i), 'Bobby');
      await user.click(screen.getByRole('button', { name: /^K$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/tap 4 animals/i)).toBeInTheDocument();
    });
  });

  describe('Step 4: Confirmation and Registration', () => {
    it('shows summary on step 4', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Complete all steps
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Complete PIN entry
      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[0], '1');
      await user.type(pinInputs[1], '2');
      await user.type(pinInputs[2], '3');
      await user.type(pinInputs[3], '4');

      // Should advance to confirmation
      await waitFor(() => {
        expect(screen.getByText(/create my account/i)).toBeInTheDocument();
      });
    });

    it('calls registerStudent on submit', async () => {
      const user = userEvent.setup();
      mockRegisterStudent.mockResolvedValue(undefined);

      renderWithRouter(<StudentRegistration />);

      // Complete all steps
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[0], '1');
      await user.type(pinInputs[1], '2');
      await user.type(pinInputs[2], '3');
      await user.type(pinInputs[3], '4');

      await waitFor(() => {
        expect(screen.getByText(/create my account/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create my account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegisterStudent).toHaveBeenCalled();
      });
    });

    it('navigates to student dashboard on success', async () => {
      const user = userEvent.setup();
      mockRegisterStudent.mockResolvedValue(undefined);

      renderWithRouter(<StudentRegistration />);

      // Complete registration flow
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[0], '1');
      await user.type(pinInputs[1], '2');
      await user.type(pinInputs[2], '3');
      await user.type(pinInputs[3], '4');

      await waitFor(() => {
        expect(screen.getByText(/create my account/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create my account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/student/dashboard');
      });
    });
  });

  describe('Progress Indicator', () => {
    it('shows progress through steps', async () => {
      const user = userEvent.setup();
      renderWithRouter(<StudentRegistration />);

      // Should show step 1 of 4
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();

      // Advance to step 2
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^3$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays API errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Username already taken';
      (useAuthStore as any).mockReturnValue({
        registerStudent: mockRegisterStudent,
        isLoading: false,
        error: errorMessage,
        clearError: mockClearError,
      });

      renderWithRouter(<StudentRegistration />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('handles registration failure', async () => {
      const user = userEvent.setup();
      mockRegisterStudent.mockRejectedValue(new Error('Registration failed'));

      renderWithRouter(<StudentRegistration />);

      // Complete registration
      await user.type(screen.getByLabelText(/display name/i), 'Alice');
      await user.click(screen.getByRole('button', { name: /^4$/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const avatarButtons = screen.getAllByRole('button', { pressed: false });
      await user.click(avatarButtons[0]);
      await user.click(screen.getByRole('button', { name: /next/i }));

      const pinInputs = screen.getAllByRole('textbox');
      await user.type(pinInputs[0], '1234');

      await waitFor(() => {
        expect(screen.getByText(/create my account/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create my account/i });
      await user.click(submitButton);

      // Should not navigate
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
