import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { LessonsPage } from '../pages/LessonsPage';
import { NotebookPage } from '../pages/NotebookPage';
import { CoachDashboardPage } from '../pages/CoachDashboardPage';
import {
  loginAsStudent,
  loginAsCoach,
  setAuthToken,
  clearAuth,
} from '../helpers/auth';

/**
 * Test fixtures for E2E tests
 * Provides pre-configured page objects and authenticated contexts
 */

// Extend base test with page objects and fixtures
type TestFixtures = {
  loginPage: LoginPage;
  studentDashboard: StudentDashboardPage;
  lessonsPage: LessonsPage;
  notebookPage: NotebookPage;
  coachDashboard: CoachDashboardPage;
  authenticatedStudentPage: Page;
  authenticatedCoachPage: Page;
};

export const test = base.extend<TestFixtures>({
  // Page Object fixtures - always available
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  studentDashboard: async ({ page }, use) => {
    await use(new StudentDashboardPage(page));
  },

  lessonsPage: async ({ page }, use) => {
    await use(new LessonsPage(page));
  },

  notebookPage: async ({ page }, use) => {
    await use(new NotebookPage(page));
  },

  coachDashboard: async ({ page }, use) => {
    await use(new CoachDashboardPage(page));
  },

  // Authenticated student context
  authenticatedStudentPage: async ({ page }, use) => {
    // Clear any existing auth
    await clearAuth(page);

    // Login as test student
    await loginAsStudent(page, testData.students.student1.username, testData.students.student1.pin);

    // Use the authenticated page
    await use(page);

    // Cleanup - logout after test
    await clearAuth(page);
  },

  // Authenticated coach context
  authenticatedCoachPage: async ({ page }, use) => {
    // Clear any existing auth
    await clearAuth(page);

    // Login as test coach
    await loginAsCoach(page, testData.coaches.coach1.email, testData.coaches.coach1.password);

    // Use the authenticated page
    await use(page);

    // Cleanup - logout after test
    await clearAuth(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Mock test data generators
 */
export const testData = {
  students: {
    student1: {
      username: 'testStudent1',
      pin: '1234',
      grade: '3',
      avatar: 'robot',
    },
    student2: {
      username: 'testStudent2',
      pin: '5678',
      grade: '4',
      avatar: 'astronaut',
    },
    kindergarten: {
      username: 'youngLearner',
      animals: ['cat', 'dog', 'bird', 'fish'],
      grade: 'K',
      avatar: 'unicorn',
    },
  },
  coaches: {
    coach1: {
      email: 'coach1@test.com',
      password: 'TestPassword123!',
      name: 'Coach Smith',
    },
    coach2: {
      email: 'coach2@test.com',
      password: 'TestPassword456!',
      name: 'Coach Johnson',
    },
  },
  lessons: {
    lesson1: {
      id: 'lesson-1',
      title: 'Introduction to Robotics',
      description: 'Learn the basics of robotics',
      difficulty: 'beginner',
      estimatedTime: 30,
    },
    lesson2: {
      id: 'lesson-2',
      title: 'Building Your First Robot',
      description: 'Build a simple robot using VEX IQ',
      difficulty: 'beginner',
      estimatedTime: 45,
    },
    lesson3: {
      id: 'lesson-3',
      title: 'Programming Basics',
      description: 'Learn to program your robot',
      difficulty: 'intermediate',
      estimatedTime: 60,
    },
  },
  skills: {
    skill1: {
      id: 'skill-1',
      name: 'Problem Solving',
      category: 'Engineering Process',
      description: 'Ability to identify and solve problems',
    },
    skill2: {
      id: 'skill-2',
      name: 'Collaboration',
      category: 'Teamwork',
      description: 'Working effectively with others',
    },
    skill3: {
      id: 'skill-3',
      name: 'Building Techniques',
      category: 'Technical Skills',
      description: 'Understanding of construction methods',
    },
  },
  badges: {
    badge1: {
      id: 'badge-1',
      name: 'First Steps',
      description: 'Complete your first lesson',
      imageUrl: '/badges/first-steps.svg',
    },
    badge2: {
      id: 'badge-2',
      name: 'Robot Builder',
      description: 'Build your first robot',
      imageUrl: '/badges/robot-builder.svg',
    },
    badge3: {
      id: 'badge-3',
      name: 'Programmer',
      description: 'Write your first program',
      imageUrl: '/badges/programmer.svg',
    },
  },
  notebookEntries: {
    entry1: {
      id: 'entry-1',
      title: 'My First Robot',
      content: 'Today I built my first robot! It was really fun.',
      date: '2024-01-15',
    },
    entry2: {
      id: 'entry-2',
      title: 'Learning to Program',
      content: 'I learned how to make my robot move forward and turn.',
      date: '2024-01-20',
    },
  },
};

/**
 * Helper function to generate a random student
 */
export function generateRandomStudent() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    username: `student_${randomId}`,
    pin: Math.floor(1000 + Math.random() * 9000).toString(),
    grade: Math.floor(Math.random() * 3 + 3).toString(), // Grades 3-5
    avatar: ['robot', 'astronaut', 'scientist', 'engineer'][Math.floor(Math.random() * 4)],
  };
}

/**
 * Helper function to generate a random coach
 */
export function generateRandomCoach() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    email: `coach_${randomId}@test.com`,
    password: 'TestPassword123!',
    name: `Coach ${randomId}`,
  };
}

/**
 * Helper function to generate a random lesson
 */
export function generateRandomLesson() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    id: `lesson-${randomId}`,
    title: `Test Lesson ${randomId}`,
    description: 'This is a test lesson',
    difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
    estimatedTime: Math.floor(Math.random() * 60 + 15),
  };
}

/**
 * Helper function to generate a random notebook entry
 */
export function generateRandomNotebookEntry() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    id: `entry-${randomId}`,
    title: `Test Entry ${randomId}`,
    content: 'This is a test notebook entry',
    date: new Date().toISOString().split('T')[0],
  };
}
