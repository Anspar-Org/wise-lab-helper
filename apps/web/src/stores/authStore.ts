/**
 * Authentication store
 * Manages user authentication state and operations
 */

import { create } from 'zustand';
import type { User, LoginCredentials } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement API call
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Mock successful login for testing
      const mockUser: User = {
        id: 1,
        email: credentials.email,
        name: 'Test User',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = 'mock-token';

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User, token: string) => {
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
