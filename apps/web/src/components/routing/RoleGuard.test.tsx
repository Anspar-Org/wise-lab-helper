/**
 * Tests for RoleGuard component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithRouter, setupAuthenticatedUser, clearAuthState } from '@/test/utils';
import { RoleGuard } from './RoleGuard';
import { screen } from '@testing-library/react';

describe('RoleGuard', () => {
  beforeEach(() => {
    clearAuthState();
  });

  it('should allow access when user has correct role', () => {
    setupAuthenticatedUser({ role: 'student' });

    renderWithRouter(
      <RoleGuard allowedRoles={['student']}>
        <div>Student Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Student Content')).toBeInTheDocument();
  });

  it('should block access when user has incorrect role', () => {
    setupAuthenticatedUser({ role: 'coach' });

    renderWithRouter(
      <RoleGuard allowedRoles={['student']}>
        <div>Student Content</div>
      </RoleGuard>
    );

    // Should not render student content for coach
    expect(screen.queryByText('Student Content')).not.toBeInTheDocument();
  });

  it('should allow coach access to coach routes', () => {
    setupAuthenticatedUser({ role: 'coach' });

    renderWithRouter(
      <RoleGuard allowedRoles={['coach']}>
        <div>Coach Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Coach Content')).toBeInTheDocument();
  });

  it('should block student access to coach routes', () => {
    setupAuthenticatedUser({ role: 'student' });

    renderWithRouter(
      <RoleGuard allowedRoles={['coach']}>
        <div>Coach Content</div>
      </RoleGuard>
    );

    // Should not render coach content for student
    expect(screen.queryByText('Coach Content')).not.toBeInTheDocument();
  });

  it('should allow access when role is in allowedRoles array', () => {
    setupAuthenticatedUser({ role: 'student' });

    renderWithRouter(
      <RoleGuard allowedRoles={['student', 'coach']}>
        <div>Shared Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Shared Content')).toBeInTheDocument();
  });

  it('should redirect when user is not present', () => {
    clearAuthState();

    renderWithRouter(
      <RoleGuard allowedRoles={['student']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    // Should not render when no user is present
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
