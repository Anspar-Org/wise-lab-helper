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
 * @openapi
 * /api/v1/lessons:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get all lessons
 *     description: |
 *       Retrieve all lessons with optional filters.
 *       Students see only published lessons, while coaches/admins see all lessons.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [building, programming, driving, strategy, methodology]
 *         description: Filter by lesson category
 *         example: programming
 *       - in: query
 *         name: grade_level
 *         schema:
 *           type: string
 *           enum: [K, "1", "2", "3", "4", "5"]
 *         description: Filter by grade level
 *         example: "3"
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status (admin/coach only)
 *         example: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *         example: "robot basics"
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *             example:
 *               - id: "550e8400-e29b-41d4-a716-446655440001"
 *                 title: "Building Your First Robot"
 *                 description: "Learn the basics of robot construction"
 *                 category: "building"
 *                 grade_level: "3"
 *                 duration_minutes: 45
 *                 learning_objectives: ["Identify robot parts", "Assemble basic chassis", "Attach wheels"]
 *                 published: true
 *               - id: "550e8400-e29b-41d4-a716-446655440002"
 *                 title: "Introduction to Programming"
 *                 description: "Basic programming concepts with VEXcode IQ"
 *                 category: "programming"
 *                 grade_level: "4"
 *                 duration_minutes: 60
 *                 learning_objectives: ["Understand sequences", "Create simple programs", "Test and debug"]
 *                 published: true
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
lessonsRouter.get(
  '/',
  authenticateToken,
  validateRequest(getLessonsQuerySchema, 'query'),
  lessonsController.getLessons
);

/**
 * @openapi
 * /api/v1/lessons/{id}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson by ID
 *     description: Retrieve detailed information about a specific lesson including all steps
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/Lesson'
 *                 - type: object
 *                   properties:
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           step_number:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           media_url:
 *                             type: string
 *                           media_type:
 *                             type: string
 *                             enum: [image, video, diagram]
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440001"
 *               title: "Building Your First Robot"
 *               description: "Learn the basics of robot construction"
 *               category: "building"
 *               grade_level: "3"
 *               duration_minutes: 45
 *               learning_objectives: ["Identify robot parts", "Assemble basic chassis"]
 *               published: true
 *               steps:
 *                 - id: "660e8400-e29b-41d4-a716-446655440101"
 *                   step_number: 1
 *                   title: "Gather Your Parts"
 *                   content: "First, let's identify all the parts you'll need..."
 *                   media_url: "/media/lessons/parts-overview.jpg"
 *                   media_type: "image"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot access unpublished lesson
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
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
lessonsRouter.get(
  '/:id',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getLessonById
);

/**
 * @openapi
 * /api/v1/lessons:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Create a new lesson
 *     description: |
 *       Create a new lesson in the system.
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
 *               - title
 *               - description
 *               - category
 *               - grade_level
 *               - duration_minutes
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Lesson title
 *                 example: "Advanced Building Techniques"
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Lesson description
 *                 example: "Learn advanced techniques for building stable and efficient robots"
 *               category:
 *                 type: string
 *                 enum: [building, programming, driving, strategy, methodology]
 *                 description: Lesson category
 *                 example: "building"
 *               grade_level:
 *                 type: string
 *                 description: Target grade level(s)
 *                 example: "4-5"
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 180
 *                 description: Estimated duration in minutes
 *                 example: 60
 *               learning_objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of learning objectives
 *                 example: ["Build stable structures", "Use advanced connectors", "Optimize for weight"]
 *               materials_needed:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required materials
 *                 example: ["VEX IQ Super Kit", "Extra beams", "Notebook"]
 *               published:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the lesson is published
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
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
lessonsRouter.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(createLessonSchema, 'body'),
  lessonsController.createLesson
);

/**
 * @openapi
 * /api/v1/lessons/{id}:
 *   put:
 *     tags:
 *       - Lessons
 *     summary: Update a lesson
 *     description: |
 *       Update an existing lesson's information.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               category:
 *                 type: string
 *                 enum: [building, programming, driving, strategy, methodology]
 *               grade_level:
 *                 type: string
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 180
 *               learning_objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *               materials_needed:
 *                 type: array
 *                 items:
 *                   type: string
 *               published:
 *                 type: boolean
 *             example:
 *               title: "Advanced Building Techniques - Updated"
 *               duration_minutes: 75
 *               published: true
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
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
 *         description: Lesson not found
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
lessonsRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(updateLessonSchema, 'body'),
  lessonsController.updateLesson
);

/**
 * @openapi
 * /api/v1/lessons/{id}:
 *   delete:
 *     tags:
 *       - Lessons
 *     summary: Delete a lesson
 *     description: |
 *       Delete a lesson from the system.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
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
 *         description: Lesson not found
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
lessonsRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.deleteLesson
);

/**
 * @openapi
 * /api/v1/lessons/{id}/publish:
 *   patch:
 *     tags:
 *       - Lessons
 *     summary: Publish or unpublish a lesson
 *     description: |
 *       Toggle the published status of a lesson.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - published
 *             properties:
 *               published:
 *                 type: boolean
 *                 description: Whether to publish or unpublish the lesson
 *                 example: true
 *     responses:
 *       200:
 *         description: Lesson publish status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lesson published successfully"
 *                 published:
 *                   type: boolean
 *                   example: true
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
 *         description: Lesson not found
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
 * @openapi
 * /api/v1/lessons/{id}/steps:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson steps
 *     description: Retrieve all steps for a specific lesson in order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Lesson steps retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   lesson_id:
 *                     type: string
 *                     format: uuid
 *                   step_number:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   media_url:
 *                     type: string
 *                   media_type:
 *                     type: string
 *                     enum: [image, video, diagram]
 *             example:
 *               - id: "660e8400-e29b-41d4-a716-446655440101"
 *                 lesson_id: "550e8400-e29b-41d4-a716-446655440001"
 *                 step_number: 1
 *                 title: "Gather Your Parts"
 *                 content: "First, let's identify all the parts you'll need for this build..."
 *                 media_url: "/media/lessons/parts-overview.jpg"
 *                 media_type: "image"
 *               - id: "660e8400-e29b-41d4-a716-446655440102"
 *                 lesson_id: "550e8400-e29b-41d4-a716-446655440001"
 *                 step_number: 2
 *                 title: "Build the Base"
 *                 content: "Start by connecting the base plates..."
 *                 media_url: "/media/lessons/base-assembly.mp4"
 *                 media_type: "video"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
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
lessonsRouter.get(
  '/:id/steps',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getLessonSteps
);

/**
 * @openapi
 * /api/v1/lessons/{id}/steps:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Create lesson step
 *     description: |
 *       Add a new step to a lesson.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - step_number
 *               - title
 *               - content
 *             properties:
 *               step_number:
 *                 type: integer
 *                 minimum: 1
 *                 description: Step order number
 *                 example: 3
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Step title
 *                 example: "Attach the Motors"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 description: Step content (supports markdown)
 *                 example: "Now we'll attach the motors to the chassis..."
 *               media_url:
 *                 type: string
 *                 description: URL to media file
 *                 example: "/media/lessons/motor-attachment.jpg"
 *               media_type:
 *                 type: string
 *                 enum: [image, video, diagram]
 *                 description: Type of media
 *                 example: "image"
 *     responses:
 *       201:
 *         description: Lesson step created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 step_number:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 media_url:
 *                   type: string
 *                 media_type:
 *                   type: string
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
 *         description: Lesson not found
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
lessonsRouter.post(
  '/:id/steps',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(createLessonStepSchema, 'body'),
  lessonsController.createLessonStep
);

/**
 * @openapi
 * /api/v1/lessons/{id}/steps/{stepId}:
 *   put:
 *     tags:
 *       - Lessons
 *     summary: Update lesson step
 *     description: |
 *       Update an existing lesson step.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step unique identifier
 *         example: "660e8400-e29b-41d4-a716-446655440101"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               step_number:
 *                 type: integer
 *                 minimum: 1
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 1
 *               media_url:
 *                 type: string
 *               media_type:
 *                 type: string
 *                 enum: [image, video, diagram]
 *             example:
 *               title: "Attach the Motors - Updated"
 *               content: "Carefully attach the motors to the designated ports..."
 *     responses:
 *       200:
 *         description: Lesson step updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 step_number:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 media_url:
 *                   type: string
 *                 media_type:
 *                   type: string
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
 *         description: Lesson or step not found
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
lessonsRouter.put(
  '/:id/steps/:stepId',
  authenticateToken,
  authorizeRoles(UserRole.COACH, UserRole.ADMIN),
  validateRequest(stepIdParamSchema, 'params'),
  validateRequest(updateLessonStepSchema, 'body'),
  lessonsController.updateLessonStep
);

/**
 * @openapi
 * /api/v1/lessons/{id}/steps/{stepId}:
 *   delete:
 *     tags:
 *       - Lessons
 *     summary: Delete lesson step
 *     description: |
 *       Delete a lesson step.
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
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step unique identifier
 *         example: "660e8400-e29b-41d4-a716-446655440101"
 *     responses:
 *       204:
 *         description: Lesson step deleted successfully
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
 *         description: Lesson or step not found
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
 * @openapi
 * /api/v1/lessons/{id}/start:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Start a lesson
 *     description: |
 *       Start a lesson and create initial progress record for the student.
 *       If progress already exists, returns the existing progress.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       201:
 *         description: Lesson started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 current_step:
 *                   type: integer
 *                   example: 1
 *                 completed_steps:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: []
 *                 completed:
 *                   type: boolean
 *                   example: false
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       200:
 *         description: Lesson already started - returning existing progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 current_step:
 *                   type: integer
 *                 completed_steps:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 completed:
 *                   type: boolean
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found
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
lessonsRouter.post(
  '/:id/start',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.startLesson
);

/**
 * @openapi
 * /api/v1/lessons/{id}/progress:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson progress
 *     description: |
 *       Get the current user's progress for a specific lesson.
 *       Coaches/Admins can optionally specify a student ID via query parameter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student ID (coach/admin only)
 *         example: "456e7890-e89b-41d4-a456-426614174002"
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 current_step:
 *                   type: integer
 *                   example: 3
 *                 completed_steps:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2]
 *                 completed:
 *                   type: boolean
 *                   example: false
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 progress_percentage:
 *                   type: number
 *                   example: 40
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lesson not found or no progress exists
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
lessonsRouter.get(
  '/:id/progress',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  lessonsController.getStudentProgress
);

/**
 * @openapi
 * /api/v1/lessons/{id}/progress:
 *   put:
 *     tags:
 *       - Lessons
 *     summary: Update lesson progress
 *     description: Update the current user's progress for a lesson (mark steps complete, update current step)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_step:
 *                 type: integer
 *                 minimum: 1
 *                 description: Current step number
 *                 example: 4
 *               completed_steps:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of completed step numbers
 *                 example: [1, 2, 3]
 *               notes:
 *                 type: string
 *                 description: Optional notes about progress
 *                 example: "Struggled with motor attachment but figured it out"
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 lesson_id:
 *                   type: string
 *                   format: uuid
 *                 current_step:
 *                   type: integer
 *                 completed_steps:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 completed:
 *                   type: boolean
 *                 progress_percentage:
 *                   type: number
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
 *       404:
 *         description: Lesson not found or no progress exists
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
lessonsRouter.put(
  '/:id/progress',
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(updateProgressSchema, 'body'),
  lessonsController.updateProgress
);

/**
 * @openapi
 * /api/v1/lessons/{id}/complete:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Complete a lesson
 *     description: |
 *       Mark a lesson as complete for the current user.
 *       This will trigger badge checks and skill updates.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lesson unique identifier
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: Optional feedback about the lesson
 *                 example: "Great lesson! The videos were very helpful."
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Optional rating (1-5 stars)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Lesson completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lesson completed successfully"
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                 badges_earned:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Badge'
 *                   description: Any badges earned from completing this lesson
 *                 skills_updated:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Skills that were updated
 *       400:
 *         description: Lesson already completed or invalid request
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
 *       404:
 *         description: Lesson not found or no progress exists
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
 * @openapi
 * /api/v1/students/{studentId}/progress:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get all progress for a student
 *     description: |
 *       Retrieve all lesson progress for a specific student.
 *       - Students can view their own progress
 *       - Coaches/Admins can view any student's progress
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
 *         example: "456e7890-e89b-41d4-a456-426614174002"
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *         example: true
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [building, programming, driving, strategy, methodology]
 *         description: Filter by lesson category
 *         example: programming
 *     responses:
 *       200:
 *         description: Student progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   lesson:
 *                     $ref: '#/components/schemas/Lesson'
 *                   progress:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       current_step:
 *                         type: integer
 *                       completed_steps:
 *                         type: array
 *                         items:
 *                           type: integer
 *                       completed:
 *                         type: boolean
 *                       started_at:
 *                         type: string
 *                         format: date-time
 *                       completed_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       progress_percentage:
 *                         type: number
 *             example:
 *               - lesson:
 *                   id: "550e8400-e29b-41d4-a716-446655440001"
 *                   title: "Building Your First Robot"
 *                   category: "building"
 *                   duration_minutes: 45
 *                 progress:
 *                   id: "770e8400-e29b-41d4-a716-446655440201"
 *                   current_step: 5
 *                   completed_steps: [1, 2, 3, 4, 5]
 *                   completed: true
 *                   started_at: "2024-01-15T10:00:00Z"
 *                   completed_at: "2024-01-15T10:45:00Z"
 *                   progress_percentage: 100
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's progress
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