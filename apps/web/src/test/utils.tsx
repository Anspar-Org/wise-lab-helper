/**
 * Test utilities
 * Helper functions for testing React components
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { User } from '@/types/auth';
import { useAuthStore } from '@stores/authStore';

// Mock router wrapper
interface RouterWrapperProps {
  children: React.ReactNode;
}

function RouterWrapper({ children }: RouterWrapperProps) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

// Custom render function that includes router
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: RouterWrapper, ...options });
}

// Helper to set up authenticated state
export function setupAuthenticatedUser(user?: Partial<User>, token = 'test-token') {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...user,
  };

  useAuthStore.setState({
    user: mockUser,
    token,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });

  return mockUser;
}

// Helper to clear auth state
export function clearAuthState() {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
