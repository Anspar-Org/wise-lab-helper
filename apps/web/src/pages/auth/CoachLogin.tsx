/**
 * CoachLogin Page
 * Professional login for coaches with email and password
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input, Button, Card, Modal } from '@components/index';

const CoachLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginCoach, isLoading, error, clearError } = useAuthStore();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Clear errors when inputs change
  React.useEffect(() => {
    clearError();
    setValidationError('');
  }, [email, password, clearError]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) return;

    try {
      await loginCoach({
        email: email.trim(),
        password,
      });

      // Note: rememberMe would be handled by storing token with different expiry
      navigate('/coach/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Coach Login
          </h1>
          <p className="text-base text-text-secondary">
            Sign in to manage your students and teams
          </p>
        </div>

        {/* Error Display */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-medium">
            <p className="text-sm text-red-500">
              {validationError || error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coach@example.com"
            required
            disabled={isLoading}
          />

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-9 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            <LogIn size={20} />
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Back to Home */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </Card>

      {/* Help Modal */}
      {showHelpModal && (
        <Modal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Forgot Your Password?"
        >
          <div className="space-y-4 text-center">
            <HelpCircle size={48} className="mx-auto text-primary" />
            <p className="text-base text-text-primary">
              Please contact your administrator for password reset assistance.
            </p>
            <p className="text-sm text-text-secondary">
              Your administrator can help you regain access to your account securely.
            </p>
            <Button onClick={() => setShowHelpModal(false)}>
              Got it
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CoachLogin;
