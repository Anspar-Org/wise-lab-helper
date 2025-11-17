/**
 * Central export for all pages
 */

export { Landing } from './Landing';

// Auth pages
export { StudentRegistration, StudentLogin, CoachLogin } from './auth';

// Student pages
export { StudentDashboard } from './student/Dashboard';
export { StudentLessons } from './student/Lessons';
export { StudentNotebook } from './student/Notebook';
export { StudentSkills } from './student/Skills';

// Coach pages
export { CoachDashboard } from './coach/Dashboard';
export { CoachTeams } from './coach/Teams';
export { CoachStudents } from './coach/Students';
