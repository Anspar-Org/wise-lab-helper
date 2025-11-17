/**
 * Tests for App component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { clearAuthState } from '@/test/utils';

describe('App', () => {
  beforeEach(() => {
    clearAuthState();
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('STEM Lab Assistant')).toBeInTheDocument();
  });

  it('should show landing page by default', () => {
    render(<App />);
    expect(screen.getByText('Landing/Login Page')).toBeInTheDocument();
  });

  it('should render app with BrowserRouter', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
