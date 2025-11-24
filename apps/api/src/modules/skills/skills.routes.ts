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
 * @openapi
 * /api/v1/skills:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get all skills
 *     description: |
 *       Retrieve all skills with optional filters.
 *       Available to all authenticated users to browse the skill library.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technical, teamwork, engineering_process]
 *         description: Filter by skill category
 *         example: technical
 *       - in: query
 *         name: grade_level
 *         schema:
 *           type: string
 *           enum: [K, "1", "2", "3", "4", "5"]
 *         description: Filter by grade level
 *         example: "3"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *         example: "programming"
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 *             example:
 *               - id: "880e8400-e29b-41d4-a716-446655440011"
 *                 name: "Basic Programming"
 *                 description: "Understanding of basic programming concepts"
 *                 category: "technical"
 *                 grade_level: "3-5"
 *               - id: "880e8400-e29b-41d4-a716-446655440012"
 *                 name: "Team Communication"
 *                 description: "Effective communication within a team"
 *                 category: "teamwork"
 *                 grade_level: "K-5"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  authenticateToken,
  validateRequest(listSkillsQuerySchema, 'query'),
  (req, res) => skillsController.listSkills(req, res)
);

/**
 * @openapi
 * /api/v1/skills/{id}:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get skill by ID
 *     description: Retrieve detailed information about a specific skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill unique identifier
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *     responses:
 *       200:
 *         description: Skill retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *             example:
 *               id: "880e8400-e29b-41d4-a716-446655440011"
 *               name: "Basic Programming"
 *               description: "Understanding of basic programming concepts including sequences, loops, and conditionals"
 *               category: "technical"
 *               grade_level: "3-5"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  (req, res) => skillsController.getSkill(req, res)
);

/**
 * @openapi
 * /api/v1/skills:
 *   post:
 *     tags:
 *       - Skills
 *     summary: Create a new skill
 *     description: |
 *       Create a new skill in the system.
 *       **Requires:** Coach or Admin role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - grade_level
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Skill name
 *                 example: "Advanced Building Techniques"
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Detailed skill description
 *                 example: "Ability to create complex structures using advanced VEX IQ building techniques"
 *               category:
 *                 type: string
 *                 enum: [technical, teamwork, engineering_process]
 *                 description: Skill category
 *                 example: "technical"
 *               grade_level:
 *                 type: string
 *                 description: Target grade level(s)
 *                 example: "4-5"
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs of prerequisite skills
 *                 example: ["880e8400-e29b-41d4-a716-446655440010"]
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Coach/Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(createSkillSchema, 'body'),
  (req, res) => skillsController.createSkill(req, res)
);

/**
 * @openapi
 * /api/v1/skills/{id}:
 *   put:
 *     tags:
 *       - Skills
 *     summary: Update a skill
 *     description: |
 *       Update an existing skill's information.
 *       **Requires:** Coach or Admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill unique identifier
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 enum: [technical, teamwork, engineering_process]
 *               grade_level:
 *                 type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *             example:
 *               name: "Advanced Building Techniques - Updated"
 *               description: "Master-level building techniques for complex VEX IQ structures"
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Coach/Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/skills/{id}:
 *   delete:
 *     tags:
 *       - Skills
 *     summary: Delete a skill
 *     description: |
 *       Delete a skill from the system.
 *       **Requires:** Admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill unique identifier
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *     responses:
 *       204:
 *         description: Skill deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Skill is referenced by assessments or prerequisites
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "CONFLICT"
 *               message: "Cannot delete skill: it is used by 5 student assessments"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  (req, res) => skillsController.deleteSkill(req, res)
);

/**
 * @openapi
 * /api/v1/skills/{skillId}/students:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get students assessed for a skill
 *     description: |
 *       Retrieve all students who have been assessed for a specific skill.
 *       **Requires:** Coach or Admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill unique identifier
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *       - in: query
 *         name: proficiency_level
 *         schema:
 *           type: string
 *           enum: [emerging, developing, proficient, advanced]
 *         description: Filter by proficiency level
 *         example: proficient
 *     responses:
 *       200:
 *         description: Student assessments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   student:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       username:
 *                         type: string
 *                       display_name:
 *                         type: string
 *                   assessment:
 *                     type: object
 *                     properties:
 *                       proficiency_level:
 *                         type: string
 *                         enum: [emerging, developing, proficient, advanced]
 *                       assessed_at:
 *                         type: string
 *                         format: date-time
 *                       assessed_by:
 *                         type: string
 *                       notes:
 *                         type: string
 *             example:
 *               - student:
 *                   id: "456e7890-e89b-12d3-a456-426614174002"
 *                   username: "robot_builder_23"
 *                   display_name: "Alex"
 *                 assessment:
 *                   proficiency_level: "proficient"
 *                   assessed_at: "2024-01-15T14:30:00Z"
 *                   assessed_by: "Coach Smith"
 *                   notes: "Shows excellent understanding of programming concepts"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Coach/Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/students/{studentId}/skills:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get student's skill profile
 *     description: |
 *       Retrieve a complete skill assessment profile for a student.
 *       - Students can view their own profile
 *       - Coaches/Admins can view any student's profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student's user ID
 *         example: "456e7890-e89b-12d3-a456-426614174002"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technical, teamwork, engineering_process]
 *         description: Filter by skill category
 *         example: technical
 *     responses:
 *       200:
 *         description: Student skill profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student_id:
 *                   type: string
 *                   format: uuid
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skill:
 *                         $ref: '#/components/schemas/Skill'
 *                       proficiency_level:
 *                         type: string
 *                         enum: [emerging, developing, proficient, advanced]
 *                       assessed_at:
 *                         type: string
 *                         format: date-time
 *                       assessed_by:
 *                         type: string
 *                       notes:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_skills:
 *                       type: integer
 *                     by_proficiency:
 *                       type: object
 *                       properties:
 *                         emerging:
 *                           type: integer
 *                         developing:
 *                           type: integer
 *                         proficient:
 *                           type: integer
 *                         advanced:
 *                           type: integer
 *             example:
 *               student_id: "456e7890-e89b-12d3-a456-426614174002"
 *               skills:
 *                 - skill:
 *                     id: "880e8400-e29b-41d4-a716-446655440011"
 *                     name: "Basic Programming"
 *                     category: "technical"
 *                   proficiency_level: "proficient"
 *                   assessed_at: "2024-01-15T14:30:00Z"
 *                   assessed_by: "Coach Smith"
 *                   notes: "Excellent progress"
 *               summary:
 *                 total_skills: 5
 *                 by_proficiency:
 *                   emerging: 1
 *                   developing: 1
 *                   proficient: 2
 *                   advanced: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/students/:studentId',
  authenticateToken,
  validateRequest(studentIdParamSchema, 'params'),
  (req, res) => skillsController.getStudentSkillProfile(req, res)
);

/**
 * @openapi
 * /api/v1/students/{studentId}/skills:
 *   post:
 *     tags:
 *       - Skills
 *     summary: Assess student skill
 *     description: |
 *       Create or update a skill assessment for a student.
 *       **Requires:** Coach or Admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student's user ID
 *         example: "456e7890-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skill_id
 *               - proficiency_level
 *             properties:
 *               skill_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the skill being assessed
 *                 example: "880e8400-e29b-41d4-a716-446655440011"
 *               proficiency_level:
 *                 type: string
 *                 enum: [emerging, developing, proficient, advanced]
 *                 description: Assessed proficiency level
 *                 example: "proficient"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional assessment notes
 *                 example: "Student demonstrates strong understanding of loops and conditionals"
 *     responses:
 *       201:
 *         description: Skill assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill assessment recorded successfully"
 *                 assessment:
 *                   type: object
 *                   properties:
 *                     skill_id:
 *                       type: string
 *                       format: uuid
 *                     student_id:
 *                       type: string
 *                       format: uuid
 *                     proficiency_level:
 *                       type: string
 *                     assessed_at:
 *                       type: string
 *                       format: date-time
 *                     assessed_by:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Coach/Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student or skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/students/{studentId}/skills/{skillId}:
 *   put:
 *     tags:
 *       - Skills
 *     summary: Update student skill assessment
 *     description: |
 *       Update an existing skill assessment for a student.
 *       **Requires:** Coach or Admin role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student's user ID
 *         example: "456e7890-e89b-12d3-a456-426614174002"
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill ID
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proficiency_level
 *             properties:
 *               proficiency_level:
 *                 type: string
 *                 enum: [emerging, developing, proficient, advanced]
 *                 description: Updated proficiency level
 *                 example: "advanced"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Updated assessment notes
 *                 example: "Student has mastered all programming concepts and helps teach others"
 *     responses:
 *       200:
 *         description: Skill assessment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill assessment updated successfully"
 *                 assessment:
 *                   type: object
 *                   properties:
 *                     skill_id:
 *                       type: string
 *                       format: uuid
 *                     student_id:
 *                       type: string
 *                       format: uuid
 *                     proficiency_level:
 *                       type: string
 *                     assessed_at:
 *                       type: string
 *                       format: date-time
 *                     assessed_by:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Coach/Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/students/{studentId}/skills/{skillId}/history:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get skill assessment history
 *     description: |
 *       Retrieve the complete assessment history for a specific skill and student.
 *       - Students can view their own history
 *       - Coaches/Admins can view any student's history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student's user ID
 *         example: "456e7890-e89b-12d3-a456-426614174002"
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Skill ID
 *         example: "880e8400-e29b-41d4-a716-446655440011"
 *     responses:
 *       200:
 *         description: Assessment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skill:
 *                   $ref: '#/components/schemas/Skill'
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       proficiency_level:
 *                         type: string
 *                         enum: [emerging, developing, proficient, advanced]
 *                       assessed_at:
 *                         type: string
 *                         format: date-time
 *                       assessed_by:
 *                         type: string
 *                       notes:
 *                         type: string
 *             example:
 *               skill:
 *                 id: "880e8400-e29b-41d4-a716-446655440011"
 *                 name: "Basic Programming"
 *                 category: "technical"
 *               history:
 *                 - proficiency_level: "advanced"
 *                   assessed_at: "2024-01-20T10:00:00Z"
 *                   assessed_by: "Coach Smith"
 *                   notes: "Mastered all concepts"
 *                 - proficiency_level: "proficient"
 *                   assessed_at: "2024-01-15T14:30:00Z"
 *                   assessed_by: "Coach Smith"
 *                   notes: "Good progress"
 *                 - proficiency_level: "developing"
 *                   assessed_at: "2024-01-10T09:15:00Z"
 *                   assessed_by: "Coach Johnson"
 *                   notes: "Initial assessment"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student, skill, or assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/me/skills:
 *   get:
 *     tags:
 *       - Skills
 *     summary: Get my skill assessments
 *     description: Get all skill assessments for the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technical, teamwork, engineering_process]
 *         description: Filter by skill category
 *         example: technical
 *     responses:
 *       200:
 *         description: Skill assessments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skill:
 *                         $ref: '#/components/schemas/Skill'
 *                       proficiency_level:
 *                         type: string
 *                         enum: [emerging, developing, proficient, advanced]
 *                       assessed_at:
 *                         type: string
 *                         format: date-time
 *                       assessed_by:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_skills:
 *                       type: integer
 *                     by_proficiency:
 *                       type: object
 *                       properties:
 *                         emerging:
 *                           type: integer
 *                         developing:
 *                           type: integer
 *                         proficient:
 *                           type: integer
 *                         advanced:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me/skills',
  authenticateToken,
  (req, res) => skillsController.getMySkills(req, res)
);

export { router as skillsRouter };