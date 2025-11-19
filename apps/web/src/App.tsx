/**
 * App component
 * Root component with routing configuration
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@components/routing';
import { MainLayout } from '@components/layout';
import {
  Landing,
  StudentDashboard,
  StudentLessons,
  StudentNotebook,
  StudentSkills,
  CoachDashboard,
  CoachTeams,
  CoachStudents,
  StudentRegistration,
  StudentLogin,
  CoachLogin,
} from '@pages/index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/student-registration" element={<StudentRegistration />} />
        <Route path="/auth/student-login" element={<StudentLogin />} />
        <Route path="/auth/coach-login" element={<CoachLogin />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <MainLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lessons" element={<StudentLessons />} />
          <Route path="notebook" element={<StudentNotebook />} />
          <Route path="skills" element={<StudentSkills />} />
        </Route>

        {/* Coach routes */}
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['coach']}>
                <MainLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="teams" element={<CoachTeams />} />
          <Route path="students" element={<CoachStudents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
