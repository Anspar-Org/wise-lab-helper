/**
 * StudentLogin Page
 * Login for students with PIN or Animal Grid authentication
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input, Button, Card, Modal } from '@components/index';
import { PinInput, AnimalGrid } from '@components/auth';
import type { AuthType } from '@/types/auth';

const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, isLoading, error, clearError } = useAuthStore();

  // State
  const [username, setUsername] = useState('');
  const [authType, setAuthType] = useState<AuthType>('pin');
  const [pin, setPin] = useState('');
  const [animalPattern, setAnimalPattern] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Clear errors when inputs change
  React.useEffect(() => {
    clearError();
    setValidationError('');
  }, [username, authType, clearError]);

  const handleAnimalSelect = (animal: string) => {
    setAnimalPattern((prev) => {
      if (prev.includes(animal)) {
        return prev.filter(a => a !== animal);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, animal];
    });
  };

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setValidationError('Username is required');
      return false;
    }

    if (authType === 'pin') {
      if (pin.length !== 4) {
        setValidationError('Please enter your 4-digit PIN');
        return false;
      }
    } else {
      if (animalPattern.length !== 4) {
        setValidationError('Please select 4 animals');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) return;

    try {
      await loginStudent({
        username: username.toLowerCase().trim(),
        auth_type: authType,
        ...(authType === 'pin' ? { pin } : { animal_pattern: animalPattern }),
      });

      navigate('/student/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-success-50 to-accent-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-child-2xl font-bold text-text-primary mb-2">
            Welcome Back!
          </h1>
          <p className="text-child-base text-text-secondary">
            Log in to continue learning
          </p>
        </div>

        {/* Error Display */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-medium">
            <p className="text-child-sm text-red-500">
              {validationError || error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />

          {/* Auth Type Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthType('pin');
                setAnimalPattern([]);
              }}
              className={`
                flex-1 py-3 px-4 rounded-medium font-medium transition-all
                ${authType === 'pin'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }
              `}
            >
              Use PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthType('animal_grid');
                setPin('');
              }}
              className={`
                flex-1 py-3 px-4 rounded-medium font-medium transition-all
                ${authType === 'animal_grid'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }
              `}
            >
              Use Animal Grid
            </button>
          </div>

          {/* PIN Input */}
          {authType === 'pin' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-child-base font-semibold text-text-primary mb-2">
                  Login with PIN
                </h3>
                <p className="text-child-sm text-text-secondary">
                  Enter your 4-digit PIN
                </p>
              </div>

              <PinInput
                value={pin}
                onChange={setPin}
                disabled={isLoading}
                showToggle
              />

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-child-sm text-primary hover:underline mx-auto block"
              >
                Forgot PIN?
              </button>
            </div>
          )}

          {/* Animal Grid */}
          {authType === 'animal_grid' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-child-base font-semibold text-text-primary mb-2">
                  Login with Animals
                </h3>
                <p className="text-child-sm text-text-secondary">
                  Tap your 4 special animals!
                </p>
              </div>

              <AnimalGrid
                selectedAnimals={animalPattern}
                onSelect={handleAnimalSelect}
                maxSelection={4}
                showCount
                disabled={isLoading}
              />
            </div>
          )}

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

        {/* Registration Link */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
          <p className="text-child-sm text-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/auth/student-registration"
              className="text-primary font-medium hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </Card>

      {/* Help Modal */}
      {showHelpModal && (
        <Modal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Need Help?"
        >
          <div className="space-y-4 text-center">
            <HelpCircle size={48} className="mx-auto text-primary" />
            <p className="text-child-base text-text-primary">
              Ask your coach for help!
            </p>
            <p className="text-child-sm text-text-secondary">
              Your coach can help you reset your PIN or animal pattern.
            </p>
            <Button onClick={() => setShowHelpModal(false)}>
              Got it!
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentLogin;
