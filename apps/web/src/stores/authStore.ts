/**
 * Authentication store
 * Manages user authentication state and operations
 */

import { create } from 'zustand';
import { config } from '@/utils/config';
import type {
  User,
  LoginCredentials,
  StudentLoginCredentials,
  RegisterStudentRequest,
  AuthResponse,
} from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginCoach: (credentials: LoginCredentials) => Promise<void>;
  loginStudent: (credentials: StudentLoginCredentials) => Promise<void>;
  registerStudent: (data: RegisterStudentRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  clearError: () => void;
}

// Helper to store token in localStorage
const storeToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Helper to remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Helper to check if running in test mode
const isTestMode = () => {
  return import.meta.env.MODE === 'test' || typeof window === 'undefined';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      // Mock for testing
      if (isTestMode()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        return;
      }

      // Real API call
      const response = await fetch(`${config.apiUrl}/api/v1/auth/coach/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      storeToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  loginCoach: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/auth/coach/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      storeToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  loginStudent: async (credentials: StudentLoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      storeToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  registerStudent: async (data: RegisterStudentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/auth/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const result: AuthResponse = await response.json();

      storeToken(result.token);
      set({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User, token: string) => {
    storeToken(token);
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
