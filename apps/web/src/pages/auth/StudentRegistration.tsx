/**
 * StudentRegistration Page
 * Multi-step wizard for student self-registration
 * Steps: 1) Name & Grade, 2) Avatar, 3) Authentication, 4) Confirmation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input, Button, Card, ProgressBar } from '@components/index';
import { PinInput, AnimalGrid, AvatarPicker } from '@components/auth';
import type { GradeLevel, AvatarConfig, AuthType } from '@/types/auth';

type Step = 1 | 2 | 3 | 4;

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudent, isLoading, error, clearError } = useAuthStore();

  // State management
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [animalPattern, setAnimalPattern] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  // Derived state
  const username = displayName.toLowerCase().replace(/\s+/g, '');
  const authType: AuthType = gradeLevel && ['K', '1', '2'].includes(gradeLevel)
    ? 'animal_grid'
    : 'pin';

  // Clear errors when navigating
  React.useEffect(() => {
    clearError();
    setValidationError('');
  }, [currentStep, clearError]);

  // Validation functions
  const validateStep1 = (): boolean => {
    if (!displayName.trim()) {
      setValidationError('Name is required');
      return false;
    }
    if (displayName.length < 2 || displayName.length > 20) {
      setValidationError('Name must be 2-20 characters');
      return false;
    }
    if (!gradeLevel) {
      setValidationError('Please select a grade level');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!avatarConfig) {
      setValidationError('Please select an avatar');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (authType === 'pin') {
      if (pin.length !== 4) {
        setValidationError('Please enter a 4-digit PIN');
        return false;
      }
      if (confirmPin.length !== 4) {
        setValidationError('Please confirm your PIN');
        return false;
      }
      if (pin !== confirmPin) {
        setValidationError('PINs do not match');
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

  // Navigation handlers
  const handleNext = () => {
    setValidationError('');

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    setCurrentStep((prev) => Math.min(4, prev + 1) as Step);
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

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

  const handleSubmit = async () => {
    if (!avatarConfig) return;

    try {
      await registerStudent({
        username,
        display_name: displayName,
        grade_level: gradeLevel!,
        avatar_config: avatarConfig,
        auth_type: authType,
        ...(authType === 'pin' ? { pin } : { animal_pattern: animalPattern }),
      });

      navigate('/student/dashboard');
    } catch (err) {
      // Error is handled by the store
      console.error('Registration failed:', err);
    }
  };

  // Grade buttons
  const grades: GradeLevel[] = ['K', '1', '2', '3', '4', '5'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-success-50 to-accent-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-child-2xl font-bold text-text-primary">
              Create Your Account
            </h2>
            <span className="text-child-sm text-text-secondary">
              Step {currentStep} of 4
            </span>
          </div>
          <ProgressBar progress={(currentStep / 4) * 100} />
        </div>

        {/* Error Display */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-medium">
            <p className="text-child-sm text-red-500">
              {validationError || error}
            </p>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-child-lg font-semibold text-text-primary text-center">
              What's your name?
            </h3>

            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
            />

            {username && (
              <p className="text-child-sm text-text-secondary text-center">
                Your username will be: <strong>{username}</strong>
              </p>
            )}

            <div className="space-y-3">
              <label className="block text-child-sm font-medium text-text-primary">
                Select your grade level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {grades.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setGradeLevel(grade)}
                    className={`
                      py-6 text-child-2xl font-bold rounded-medium transition-all
                      ${gradeLevel === grade
                        ? 'bg-primary text-white ring-4 ring-primary ring-offset-2'
                        : 'bg-white border-2 border-gray-300 hover:border-primary text-text-primary'
                      }
                    `}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <AvatarPicker
            username={username}
            onSelect={setAvatarConfig}
            selectedStyle={avatarConfig?.style}
          />
        )}

        {currentStep === 3 && authType === 'pin' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-child-lg font-semibold text-text-primary mb-2">
                Create your PIN
              </h3>
              <p className="text-child-sm text-text-secondary">
                Choose a 4-digit PIN you'll remember
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-child-sm font-medium text-text-primary mb-3 text-center">
                  Enter your PIN
                </label>
                <PinInput
                  value={pin}
                  onChange={setPin}
                  onComplete={(completed) => {
                    setPin(completed);
                    if (confirmPin && completed !== confirmPin) {
                      setValidationError('PINs do not match');
                    } else {
                      setValidationError('');
                    }
                  }}
                  showToggle
                />
              </div>

              <div>
                <label className="block text-child-sm font-medium text-text-primary mb-3 text-center">
                  Confirm your PIN
                </label>
                <PinInput
                  value={confirmPin}
                  onChange={setConfirmPin}
                  onComplete={(completed) => {
                    setConfirmPin(completed);
                    if (pin && completed !== pin) {
                      setValidationError('PINs do not match');
                    } else {
                      setValidationError('');
                    }
                  }}
                  showToggle
                />
              </div>

              {pin.length === 4 && confirmPin.length === 4 && pin === confirmPin && (
                <p className="text-center text-success font-medium">
                  PINs match! ✓
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && authType === 'animal_grid' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-child-lg font-semibold text-text-primary mb-2">
                Choose your animals
              </h3>
              <p className="text-child-sm text-text-secondary">
                Tap 4 animals you'll remember!
              </p>
            </div>

            <AnimalGrid
              selectedAnimals={animalPattern}
              onSelect={handleAnimalSelect}
              maxSelection={4}
              showCount
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-child-lg font-semibold text-text-primary text-center">
              Ready to create your account?
            </h3>

            <div className="bg-primary-50 rounded-medium p-6 space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                {avatarConfig && (
                  <img
                    src={`https://api.dicebear.com/7.x/${avatarConfig.style}/svg?seed=${encodeURIComponent(username)}`}
                    alt="Your avatar"
                    className="w-24 h-24 rounded-full border-4 border-primary"
                  />
                )}
              </div>

              {/* Details */}
              <div className="text-center space-y-2">
                <p className="text-child-base">
                  <strong>Name:</strong> {displayName}
                </p>
                <p className="text-child-base">
                  <strong>Username:</strong> {username}
                </p>
                <p className="text-child-base">
                  <strong>Grade:</strong> {gradeLevel}
                </p>
                <p className="text-child-base">
                  <strong>Login with:</strong> {authType === 'pin' ? '4-digit PIN' : '4 animals'}
                </p>
              </div>

              {authType === 'animal_grid' && (
                <div className="flex justify-center gap-2">
                  <p className="text-child-sm font-medium">Your animals:</p>
                  <div className="flex gap-2 text-2xl">
                    {animalPattern.map((animal, i) => (
                      <span key={i}>{animal}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="large"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              <Check size={24} />
              Create My Account
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            <ArrowLeft size={20} />
            Back
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
              <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudentRegistration;
