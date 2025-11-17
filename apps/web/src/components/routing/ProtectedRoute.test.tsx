/**
 * Tests for ProtectedRoute component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithRouter, setupAuthenticatedUser, clearAuthState } from '@/test/utils';
import { ProtectedRoute } from './ProtectedRoute';
import { screen } from '@testing-library/react';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    clearAuthState();
  });

  it('should redirect to landing page when user is not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    setupAuthenticatedUser();

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should render protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children for authenticated student', () => {
    setupAuthenticatedUser({ role: 'student' });

    renderWithRouter(
      <ProtectedRoute>
        <div>Student Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Student Content')).toBeInTheDocument();
  });

  it('should render children for authenticated coach', () => {
    setupAuthenticatedUser({ role: 'coach' });

    renderWithRouter(
      <ProtectedRoute>
        <div>Coach Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Coach Content')).toBeInTheDocument();
  });
});
