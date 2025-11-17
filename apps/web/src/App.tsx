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
} from '@pages/index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Landing />} />

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
