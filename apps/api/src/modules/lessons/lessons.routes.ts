import { Router } from 'express';
import { lessonsController } from './lessons.controller';
import {
  authenticateToken,
  authorizeRoles,
  validateRequest,
} from '../auth/auth.middleware';
import {
  createLessonSchema,
  updateLessonSchema,
  getLessonsQuerySchema,
  createLessonStepSchema,
  updateLessonStepSchema,
  updateProgressSchema,
  uuidParamSchema,
  stepIdParamSchema,
  studentIdParamSchema,
} from './lessons.validation';
import { UserRole } from '@stemlab/shared-types';

/**
 * Lessons Routes
 * All endpoints require authentication
 */
export const lessonsRouter = Router();

// =====================================================
// LESSON MANAGEMENT (Coach/Admin)
// =====================================================

/**
 * GET /api/v1/lessons
 * List all lessons (with filters)
 * Access: All authenticated users
 */
lessonsRouter.get(
  '/',
  authenticateToken,
  validateRequest(getLessonsQuerySchema, 'query'),
  lessonsController.getLessons
);

/**
 * GET /api/v1/lessons/:id
 * Get lesson details
 * Access: All authenticated users
 */
lessonsRouter.get(
  '/:id',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getLessonById
);

/**
 * POST /api/v1/lessons
 * Create new lesson
 * Access: Coach, Admin
 */
lessonsRouter.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(createLessonSchema, 'body'),
  lessonsController.createLesson
);

/**
 * PUT /api/v1/lessons/:id
 * Update lesson
 * Access: Coach, Admin
 */
lessonsRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(updateLessonSchema, 'body'),
  lessonsController.updateLesson
);

/**
 * DELETE /api/v1/lessons/:id
 * Delete lesson
 * Access: Coach, Admin
 */
lessonsRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.deleteLesson
);

/**
 * PATCH /api/v1/lessons/:id/publish
 * Publish or unpublish lesson
 * Access: Coach, Admin
 */
lessonsRouter.patch(
  '/:id/publish',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.publishLesson
);

// =====================================================
// LESSON STEPS (Coach/Admin for create/update/delete)
// =====================================================

/**
 * GET /api/v1/lessons/:id/steps
 * Get all steps for a lesson
 * Access: All authenticated users
 */
lessonsRouter.get(
  '/:id/steps',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getLessonSteps
);

/**
 * POST /api/v1/lessons/:id/steps
 * Create new lesson step
 * Access: Coach, Admin
 */
lessonsRouter.post(
  '/:id/steps',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(createLessonStepSchema, 'body'),
  lessonsController.createLessonStep
);

/**
 * PUT /api/v1/lessons/:id/steps/:stepId
 * Update lesson step
 * Access: Coach, Admin
 */
lessonsRouter.put(
  '/:id/steps/:stepId',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(stepIdParamSchema, 'params'),
  validateRequest(updateLessonStepSchema, 'body'),
  lessonsController.updateLessonStep
);

/**
 * DELETE /api/v1/lessons/:id/steps/:stepId
 * Delete lesson step
 * Access: Coach, Admin
 */
lessonsRouter.delete(
  '/:id/steps/:stepId',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(stepIdParamSchema, 'params'),
  lessonsController.deleteLessonStep
);

// =====================================================
// STUDENT PROGRESS
// =====================================================

/**
 * POST /api/v1/lessons/:id/start
 * Start a lesson (create progress record)
 * Access: All authenticated users (primarily students)
 */
lessonsRouter.post(
  '/:id/start',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.startLesson
);

/**
 * GET /api/v1/lessons/:id/progress
 * Get student's progress for this lesson
 * Access: Students (own), Coaches/Admins (any)
 */
lessonsRouter.get(
  '/:id/progress',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getStudentProgress
);

/**
 * PUT /api/v1/lessons/:id/progress
 * Update progress for a lesson
 * Access: Students (own progress)
 */
lessonsRouter.put(
  '/:id/progress',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(updateProgressSchema, 'body'),
  lessonsController.updateProgress
);

/**
 * POST /api/v1/lessons/:id/complete
 * Mark lesson as complete
 * Access: Students (own progress)
 */
lessonsRouter.post(
  '/:id/complete',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.completeLesson
);

// =====================================================
// STUDENT PROGRESS VIEW (Coach/Admin)
// =====================================================

/**
 * GET /api/v1/students/:studentId/progress
 * Get all progress for a specific student
 * Access: Students (own), Coaches/Admins (any)
 *
 * Note: This route is defined here but could also be in a students module
 */
lessonsRouter.get(
  '/students/:studentId/progress',
  authenticateToken,
  validateRequest(studentIdParamSchema, 'params'),
  lessonsController.getAllStudentProgress
);

export default lessonsRouter;
