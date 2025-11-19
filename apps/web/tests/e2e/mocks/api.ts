import { Page, Route } from '@playwright/test';
import { testData } from '../fixtures';

/**
 * Mock API server for E2E tests
 * Allows tests to run without backend dependency by mocking API responses
 */

const API_BASE = '/api/v1';

/**
 * Setup mock API routes for a page
 * This intercepts all API calls and returns mock data
 */
export async function setupMockApi(page: Page): Promise<void> {
  // Mock auth endpoints
  await mockAuthEndpoints(page);

  // Mock lesson endpoints
  await mockLessonEndpoints(page);

  // Mock skill endpoints
  await mockSkillEndpoints(page);

  // Mock badge endpoints
  await mockBadgeEndpoints(page);

  // Mock notebook endpoints
  await mockNotebookEndpoints(page);

  // Mock student endpoints
  await mockStudentEndpoints(page);
}

/**
 * Mock authentication endpoints
 */
async function mockAuthEndpoints(page: Page): Promise<void> {
  // Student registration
  await page.route(`${API_BASE}/auth/student/register`, async (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'student-' + Math.random().toString(36).substring(7),
            username: postData.username,
            role: 'student',
            grade: postData.grade,
            avatar: postData.avatar,
          },
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
        },
      }),
    });
  });

  // Student login (PIN)
  await page.route(`${API_BASE}/auth/student/login`, async (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    // Simulate validation
    if (postData.username === testData.students.student1.username &&
        postData.pin === testData.students.student1.pin) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'student-1',
              username: postData.username,
              role: 'student',
              grade: '3',
              avatar: 'robot',
            },
            token: 'mock-jwt-token-student-1',
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid credentials',
        }),
      });
    }
  });

  // Coach login
  await page.route(`${API_BASE}/auth/coach/login`, async (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    // Simulate validation
    if (postData.email === testData.coaches.coach1.email &&
        postData.password === testData.coaches.coach1.password) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'coach-1',
              email: postData.email,
              role: 'coach',
              name: testData.coaches.coach1.name,
            },
            token: 'mock-jwt-token-coach-1',
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid credentials',
        }),
      });
    }
  });

  // Logout
  await page.route(`${API_BASE}/auth/logout`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
    });
  });

  // Get current user
  await page.route(`${API_BASE}/auth/me`, async (route: Route) => {
    const authHeader = route.request().headers()['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
      });
      return;
    }

    // Return mock user based on token
    const token = authHeader.replace('Bearer ', '');
    if (token.includes('student')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'student-1',
            username: 'testStudent1',
            role: 'student',
            grade: '3',
            avatar: 'robot',
          },
        }),
      });
    } else if (token.includes('coach')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'coach-1',
            email: 'coach1@test.com',
            role: 'coach',
            name: 'Coach Smith',
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid token',
        }),
      });
    }
  });
}

/**
 * Mock lesson endpoints
 */
async function mockLessonEndpoints(page: Page): Promise<void> {
  // Get all lessons
  await page.route(`${API_BASE}/lessons`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: Object.values(testData.lessons),
      }),
    });
  });

  // Get specific lesson
  await page.route(`${API_BASE}/lessons/*`, async (route: Route) => {
    const lessonId = route.request().url().split('/').pop();
    const lesson = Object.values(testData.lessons).find(l => l.id === lessonId);

    if (lesson) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: lesson,
        }),
      });
    } else {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Lesson not found',
        }),
      });
    }
  });
}

/**
 * Mock skill endpoints
 */
async function mockSkillEndpoints(page: Page): Promise<void> {
  // Get all skills
  await page.route(`${API_BASE}/skills`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: Object.values(testData.skills),
      }),
    });
  });

  // Get student skills/assessments
  await page.route(`${API_BASE}/students/*/skills`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: Object.values(testData.skills).map(skill => ({
          ...skill,
          proficiency: 'developing',
          lastAssessed: '2024-01-15',
        })),
      }),
    });
  });

  // Create/update skill assessment
  await page.route(`${API_BASE}/assessments`, async (route: Route) => {
    if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'assessment-' + Math.random().toString(36).substring(7),
            ...postData,
            createdAt: new Date().toISOString(),
          },
        }),
      });
    }
  });
}

/**
 * Mock badge endpoints
 */
async function mockBadgeEndpoints(page: Page): Promise<void> {
  // Get all badges
  await page.route(`${API_BASE}/badges`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: Object.values(testData.badges),
      }),
    });
  });

  // Get student badges
  await page.route(`${API_BASE}/students/*/badges`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            ...testData.badges.badge1,
            earnedAt: '2024-01-15',
          },
        ],
      }),
    });
  });
}

/**
 * Mock notebook endpoints
 */
async function mockNotebookEndpoints(page: Page): Promise<void> {
  // Get all notebook entries
  await page.route(`${API_BASE}/notebook/entries`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: Object.values(testData.notebookEntries),
      }),
    });
  });

  // Create notebook entry
  await page.route(`${API_BASE}/notebook/entries`, async (route: Route) => {
    if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'entry-' + Math.random().toString(36).substring(7),
            ...postData,
            createdAt: new Date().toISOString(),
          },
        }),
      });
    }
  });

  // Get specific entry
  await page.route(`${API_BASE}/notebook/entries/*`, async (route: Route) => {
    if (route.request().method() === 'GET') {
      const entryId = route.request().url().split('/').pop();
      const entry = Object.values(testData.notebookEntries).find(e => e.id === entryId);

      if (entry) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: entry,
          }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Entry not found',
          }),
        });
      }
    }
  });

  // Delete entry
  await page.route(`${API_BASE}/notebook/entries/*`, async (route: Route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Entry deleted successfully',
        }),
      });
    }
  });
}

/**
 * Mock student endpoints (for coaches)
 */
async function mockStudentEndpoints(page: Page): Promise<void> {
  // Get all students
  await page.route(`${API_BASE}/students`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 'student-1',
            username: testData.students.student1.username,
            grade: testData.students.student1.grade,
            avatar: testData.students.student1.avatar,
          },
          {
            id: 'student-2',
            username: testData.students.student2.username,
            grade: testData.students.student2.grade,
            avatar: testData.students.student2.avatar,
          },
        ],
      }),
    });
  });

  // Get specific student
  await page.route(`${API_BASE}/students/*`, async (route: Route) => {
    const studentId = route.request().url().split('/').pop()?.split('?')[0];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: studentId,
          username: testData.students.student1.username,
          grade: testData.students.student1.grade,
          avatar: testData.students.student1.avatar,
        },
      }),
    });
  });
}

/**
 * Disable API mocking (use real backend)
 */
export async function disableMockApi(page: Page): Promise<void> {
  await page.unroute(`${API_BASE}/**/*`);
}
