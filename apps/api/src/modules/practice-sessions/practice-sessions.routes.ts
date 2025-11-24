import { Router } from 'express';
import { PracticeSessionsController } from './practice-sessions.controller';
import { authenticateToken } from '../auth/auth.middleware';

/**
 * Practice Session Routes
 *
 * Defines all practice session and rotation management endpoints:
 * - Practice session CRUD operations (Coach/Admin)
 * - Rotation management within sessions
 * - Session filtering and pagination
 * - Rotation overlap prevention
 */

const router = Router();
const practiceSessionsController = new PracticeSessionsController();

// =====================================================
// PRACTICE SESSIONS
// =====================================================

/**
 * @openapi
 * /api/v1/practice-sessions:
 *   get:
 *     tags:
 *       - Practice Sessions
 *     summary: Get all practice sessions
 *     description: |
 *       Retrieve practice sessions with optional filters.
 *       Returns sessions with rotation counts for quick overview.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sessions from this date (inclusive)
 *         example: "2024-03-01T00:00:00Z"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter sessions to this date (inclusive)
 *         example: "2024-03-31T23:59:59Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of sessions per page
 *     responses:
 *       200:
 *         description: Practice sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/PracticeSession'
 *                       - type: object
 *                         properties:
 *                           rotation_count:
 *                             type: integer
 *                             description: Number of rotations in this session
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     total_pages:
 *                       type: integer
 *                       example: 3
 *             example:
 *               data:
 *                 - id: "session-uuid-1"
 *                   team_id: "team-uuid-1"
 *                   session_date: "2024-03-15T00:00:00Z"
 *                   duration_minutes: 90
 *                   notes: "Great progress on autonomous routines"
 *                   rotation_count: 4
 *                   created_at: "2024-03-10T14:30:00Z"
 *                   updated_at: "2024-03-10T14:30:00Z"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 total_pages: 3
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
  practiceSessionsController.getPracticeSessions.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}:
 *   get:
 *     tags:
 *       - Practice Sessions
 *     summary: Get practice session by ID
 *     description: Retrieve a specific practice session with all its rotations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *     responses:
 *       200:
 *         description: Practice session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PracticeSession'
 *                 - type: object
 *                   properties:
 *                     rotations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SessionRotation'
 *             example:
 *               id: "session-uuid-1"
 *               team_id: "team-uuid-1"
 *               session_date: "2024-03-15T00:00:00Z"
 *               duration_minutes: 90
 *               notes: "Great progress on autonomous routines"
 *               created_at: "2024-03-10T14:30:00Z"
 *               updated_at: "2024-03-10T14:30:00Z"
 *               rotations:
 *                 - id: "rotation-uuid-1"
 *                   session_id: "session-uuid-1"
 *                   student_id: "student-uuid-1"
 *                   station: "Building"
 *                   start_time: "14:00:00"
 *                   created_at: "2024-03-10T14:30:00Z"
 *                 - id: "rotation-uuid-2"
 *                   session_id: "session-uuid-1"
 *                   student_id: "student-uuid-2"
 *                   station: "Programming"
 *                   start_time: "14:00:00"
 *                   created_at: "2024-03-10T14:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Practice session not found
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
  practiceSessionsController.getPracticeSessionById.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions:
 *   post:
 *     tags:
 *       - Practice Sessions
 *     summary: Create a new practice session
 *     description: |
 *       Create a new practice session for a team.
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
 *               - team_id
 *               - session_date
 *               - duration_minutes
 *             properties:
 *               team_id:
 *                 type: string
 *                 format: uuid
 *                 description: Team ID
 *                 example: "team-uuid-1"
 *               session_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the practice session
 *                 example: "2024-03-15T14:00:00Z"
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duration in minutes
 *                 example: 90
 *               notes:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Optional session notes
 *                 example: "Focus on autonomous programming and driver practice"
 *     responses:
 *       201:
 *         description: Practice session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeSession'
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
 *         description: Team not found
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
  practiceSessionsController.createPracticeSession.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}:
 *   put:
 *     tags:
 *       - Practice Sessions
 *     summary: Update a practice session
 *     description: |
 *       Update an existing practice session.
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
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the practice session
 *                 example: "2024-03-16T14:00:00Z"
 *               duration_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duration in minutes
 *                 example: 120
 *               notes:
 *                 type: string
 *                 maxLength: 5000
 *                 nullable: true
 *                 description: Session notes
 *                 example: "Extended session - worked on game strategy"
 *     responses:
 *       200:
 *         description: Practice session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeSession'
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
 *         description: Practice session not found
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
  practiceSessionsController.updatePracticeSession.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}:
 *   delete:
 *     tags:
 *       - Practice Sessions
 *     summary: Delete a practice session
 *     description: |
 *       Delete a practice session and all its rotations.
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
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *     responses:
 *       204:
 *         description: Practice session deleted successfully
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
 *         description: Practice session not found
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
router.delete(
  '/:id',
  authenticateToken,
  practiceSessionsController.deletePracticeSession.bind(practiceSessionsController)
);

// =====================================================
// SESSION ROTATIONS
// =====================================================

/**
 * @openapi
 * /api/v1/practice-sessions/{id}/rotations:
 *   get:
 *     tags:
 *       - Practice Sessions
 *       - Rotations
 *     summary: Get all rotations for a practice session
 *     description: Retrieve all student rotations for a specific practice session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *     responses:
 *       200:
 *         description: Rotations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessionRotation'
 *             example:
 *               - id: "rotation-uuid-1"
 *                 session_id: "session-uuid-1"
 *                 student_id: "student-uuid-1"
 *                 station: "Building"
 *                 start_time: "14:00:00"
 *                 created_at: "2024-03-10T14:30:00Z"
 *               - id: "rotation-uuid-2"
 *                 session_id: "session-uuid-1"
 *                 student_id: "student-uuid-2"
 *                 station: "Programming"
 *                 start_time: "14:00:00"
 *                 created_at: "2024-03-10T14:30:00Z"
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
  '/:id/rotations',
  authenticateToken,
  practiceSessionsController.getRotations.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}/rotations:
 *   post:
 *     tags:
 *       - Practice Sessions
 *       - Rotations
 *     summary: Add a rotation to a practice session
 *     description: |
 *       Add a student rotation to a practice session.
 *       Prevents duplicate rotations for the same student in the same session.
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
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - station
 *               - start_time
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *                 description: Student ID
 *                 example: "student-uuid-1"
 *               station:
 *                 type: string
 *                 enum: [Building, Programming, Driving, Documentation]
 *                 description: Station assignment
 *                 example: "Building"
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
 *                 description: Rotation start time (HH:MM or HH:MM:SS)
 *                 example: "14:00:00"
 *     responses:
 *       201:
 *         description: Rotation added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionRotation'
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
 *       409:
 *         description: Student already has a rotation in this session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conflict"
 *               message: "Student already has a rotation in this session"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/rotations',
  authenticateToken,
  practiceSessionsController.addRotation.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}/rotations/{rotationId}:
 *   put:
 *     tags:
 *       - Practice Sessions
 *       - Rotations
 *     summary: Update a rotation
 *     description: |
 *       Update an existing rotation's station or start time.
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
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *       - in: path
 *         name: rotationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rotation ID
 *         example: "rotation-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               station:
 *                 type: string
 *                 enum: [Building, Programming, Driving, Documentation]
 *                 description: Station assignment
 *                 example: "Driving"
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
 *                 description: Rotation start time (HH:MM or HH:MM:SS)
 *                 example: "15:00:00"
 *     responses:
 *       200:
 *         description: Rotation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionRotation'
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
 *         description: Rotation not found
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
  '/:id/rotations/:rotationId',
  authenticateToken,
  practiceSessionsController.updateRotation.bind(practiceSessionsController)
);

/**
 * @openapi
 * /api/v1/practice-sessions/{id}/rotations/{rotationId}:
 *   delete:
 *     tags:
 *       - Practice Sessions
 *       - Rotations
 *     summary: Delete a rotation
 *     description: |
 *       Remove a rotation from a practice session.
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
 *         description: Practice session ID
 *         example: "session-uuid-1"
 *       - in: path
 *         name: rotationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Rotation ID
 *         example: "rotation-uuid-1"
 *     responses:
 *       204:
 *         description: Rotation deleted successfully
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
 *         description: Rotation not found
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
router.delete(
  '/:id/rotations/:rotationId',
  authenticateToken,
  practiceSessionsController.deleteRotation.bind(practiceSessionsController)
);

export { router as practiceSessionsRouter };
