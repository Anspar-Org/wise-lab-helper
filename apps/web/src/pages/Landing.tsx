/**
 * Landing/Login page
 * Entry point for the application with role selection
 */

import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus, Briefcase } from 'lucide-react';
import { Button, Card } from '@components/index';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-success-50 to-accent-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="/robotics-logo.png"
              alt="STEM Lab Logo"
              className="h-32 w-32 object-contain"
            />
          </div>
          <h1 className="text-child-3xl font-bold text-text-primary mb-3">
            STEM Lab Assistant
          </h1>
          <p className="text-child-lg text-text-secondary font-medium">
            Learn, Build, Explore!
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Student Login */}
          <Card
            onClick={() => navigate('/auth/student-login')}
            elevation="2"
            className="cursor-pointer hover:shadow-elevation-3 transition-all text-center"
          >
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap size={40} className="text-white" />
              </div>
              <h2 className="text-child-xl font-bold text-text-primary">
                I'm a Student
              </h2>
              <p className="text-child-sm text-text-secondary">
                Log in to access your lessons and projects
              </p>
              <Button
                variant="primary"
                size="large"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/auth/student-login');
                }}
              >
                Student Login
              </Button>
            </div>
          </Card>

          {/* New Student */}
          <Card
            onClick={() => navigate('/auth/student-registration')}
            elevation="2"
            className="cursor-pointer hover:shadow-elevation-3 transition-all text-center"
          >
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center">
                <UserPlus size={40} className="text-white" />
              </div>
              <h2 className="text-child-xl font-bold text-text-primary">
                New Student?
              </h2>
              <p className="text-child-sm text-text-secondary">
                Create your account and start learning today
              </p>
              <Button
                variant="secondary"
                size="large"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/auth/student-registration');
                }}
              >
                Join Now
              </Button>
            </div>
          </Card>

          {/* Coach Login */}
          <Card
            onClick={() => navigate('/auth/coach-login')}
            elevation="2"
            className="cursor-pointer hover:shadow-elevation-3 transition-all text-center"
          >
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-full bg-accent-purple flex items-center justify-center">
                <Briefcase size={40} className="text-white" />
              </div>
              <h2 className="text-child-xl font-bold text-text-primary">
                Coach Login
              </h2>
              <p className="text-child-sm text-text-secondary">
                Access your dashboard to manage students
              </p>
              <Button
                variant="outline"
                size="large"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/auth/coach-login');
                }}
              >
                Coach Login
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-child-sm text-text-secondary">
            Welcome to the STEM Lab! Choose your role above to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
