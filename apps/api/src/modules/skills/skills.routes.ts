import { Router } from 'express';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { getDatabase } from '../../config/database';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';
import { validateRequest } from '../auth/auth.middleware';
import { UserRole } from '@stemlab/shared-types';
import {
  createSkillSchema,
  updateSkillSchema,
  assessStudentSkillSchema,
  updateStudentSkillAssessmentSchema,
  listSkillsQuerySchema,
  uuidParamSchema,
  studentIdParamSchema,
  skillIdParamSchema,
  studentSkillParamsSchema,
} from './skills.validation';

/**
 * Skills Routes
 *
 * Defines all API endpoints for skills and assessments
 */

const router = Router();

// Initialize service and controller
const db = getDatabase();
const skillsService = new SkillsService(db);
const skillsController = new SkillsController(skillsService);

// =====================================================
// SKILLS LIBRARY ROUTES (Coach/Admin Management)
// =====================================================

/**
 * GET /api/v1/skills
 * List all skills with optional filters
 * Auth: Any authenticated user
 */
router.get(
  '/',
  authenticateToken,
  validateRequest(listSkillsQuerySchema, 'query'),
  (req, res) => skillsController.listSkills(req, res)
);

/**
 * GET /api/v1/skills/:id
 * Get skill details by ID
 * Auth: Any authenticated user
 */
router.get(
  '/:id',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  (req, res) => skillsController.getSkill(req, res)
);

/**
 * POST /api/v1/skills
 * Create a new skill
 * Auth: Coach or Admin only
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(createSkillSchema, 'body'),
  (req, res) => skillsController.createSkill(req, res)
);

/**
 * PUT /api/v1/skills/:id
 * Update an existing skill
 * Auth: Coach or Admin only
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(updateSkillSchema, 'body'),
  (req, res) => skillsController.updateSkill(req, res)
);

/**
 * DELETE /api/v1/skills/:id
 * Delete a skill
 * Auth: Admin only
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  (req, res) => skillsController.deleteSkill(req, res)
);

/**
 * GET /api/v1/skills/:skillId/students
 * Get all students assessed for a skill
 * Auth: Coach or Admin only
 */
router.get(
  '/:skillId/students',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(skillIdParamSchema, 'params'),
  (req, res) => skillsController.getSkillStudents(req, res)
);

// =====================================================
// STUDENT ASSESSMENT ROUTES (Coach Functions)
// =====================================================

/**
 * GET /api/v1/students/:studentId/skills
 * Get student's skill profile
 * Auth: Student (own profile), Coach, or Admin
 */
router.get(
  '/students/:studentId',
  authenticateToken,
  validateRequest(studentIdParamSchema, 'params'),
  (req, res) => skillsController.getStudentSkillProfile(req, res)
);

/**
 * POST /api/v1/students/:studentId/skills
 * Assess a student's skill
 * Auth: Coach or Admin only
 */
router.post(
  '/students/:studentId',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(studentIdParamSchema, 'params'),
  validateRequest(assessStudentSkillSchema, 'body'),
  (req, res) => skillsController.assessStudentSkill(req, res)
);

/**
 * PUT /api/v1/students/:studentId/skills/:skillId
 * Update student's skill assessment
 * Auth: Coach or Admin only
 */
router.put(
  '/students/:studentId/:skillId',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(studentSkillParamsSchema, 'params'),
  validateRequest(updateStudentSkillAssessmentSchema, 'body'),
  (req, res) => skillsController.updateStudentSkillAssessment(req, res)
);

/**
 * GET /api/v1/students/:studentId/skills/:skillId/history
 * Get skill progress history for a student
 * Auth: Student (own history), Coach, or Admin
 */
router.get(
  '/students/:studentId/:skillId/history',
  authenticateToken,
  validateRequest(studentSkillParamsSchema, 'params'),
  (req, res) => skillsController.getSkillProgressHistory(req, res)
);

// =====================================================
// SELF-VIEW ROUTES (Student Access)
// =====================================================

/**
 * GET /api/v1/me/skills
 * Get current user's skill assessments
 * Auth: Any authenticated user
 */
router.get(
  '/me/skills',
  authenticateToken,
  (req, res) => skillsController.getMySkills(req, res)
);

export { router as skillsRouter };
