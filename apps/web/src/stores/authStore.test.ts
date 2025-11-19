/**
 * Tests for authStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '@/types/auth';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user and token on login', async () => {
    const { login } = useAuthStore.getState();

    await login({ email: 'test@example.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(state.user).toBeDefined();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.token).toBe('mock-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should clear user data on logout', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAuthStore.setState({
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    });

    const { logout } = useAuthStore.getState();
    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user with setUser action', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'coach',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { setUser } = useAuthStore.getState();
    setUser(mockUser, 'new-token');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('new-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear error with clearError action', () => {
    useAuthStore.setState({ error: 'Test error' });

    const { clearError } = useAuthStore.getState();
    clearError();

    const state = useAuthStore.getState();
    expect(state.error).toBeNull();
  });
});
