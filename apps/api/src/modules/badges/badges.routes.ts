import { Router } from 'express';
import { BadgesController } from './badges.controller';
import { authenticateToken } from '../auth/auth.middleware';

/**
 * Badge Routes
 *
 * Defines all badge-related endpoints:
 * - Badge library management (admin)
 * - Student badge viewing
 * - Manual badge awards (coach)
 * - Auto-award checking (internal)
 * - Badge progress tracking
 */

const router = Router();
const badgesController = new BadgesController();

// =====================================================
// BADGE LIBRARY (Admin)
// =====================================================

/**
 * @openapi
 * /api/v1/badges:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get all badges
 *     description: Retrieve all available badges, optionally filtered by category
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [skill, achievement, team, methodology, engagement]
 *         description: Filter badges by category
 *         example: engagement
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Badge'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "First Robot"
 *                 description: "Build your first robot"
 *                 category: "achievement"
 *                 criteria: "Complete first build lesson"
 *                 points: 100
 *                 icon_url: "/badges/first-robot.svg"
 *               - id: "234e5678-e89b-12d3-a456-426614174001"
 *                 name: "Team Player"
 *                 description: "Great collaboration with teammates"
 *                 category: "team"
 *                 criteria: "Participate in 5 team sessions"
 *                 points: 50
 *                 icon_url: "/badges/team-player.svg"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', badgesController.getAllBadges.bind(badgesController));

/**
 * @openapi
 * /api/v1/badges/{id}:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get badge by ID
 *     description: Retrieve a specific badge by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Badge unique identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Badge retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Badge'
 *       404:
 *         description: Badge not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "NOT_FOUND"
 *               message: "Badge not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', badgesController.getBadgeById.bind(badgesController));

/**
 * @openapi
 * /api/v1/badges:
 *   post:
 *     tags:
 *       - Badges
 *     summary: Create a new badge
 *     description: |
 *       Create a new badge in the system.
 *       **Requires:** Admin role
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
 *               - criteria
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Badge name
 *                 example: "Code Master"
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Badge description
 *                 example: "Master the basics of programming with VEXcode IQ"
 *               icon:
 *                 type: string
 *                 description: Icon name or path
 *                 example: "code-master.svg"
 *               category:
 *                 type: string
 *                 enum: [skill, achievement, team, methodology, engagement]
 *                 description: Badge category
 *                 example: "skill"
 *               criteria:
 *                 type: object
 *                 description: Criteria for earning the badge
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [lessons_completed, skills_mastered, notebook_entries, manual, achievement]
 *                   count:
 *                     type: integer
 *                     minimum: 1
 *                   lesson_ids:
 *                     type: array
 *                     items:
 *                       type: string
 *                   skill_ids:
 *                     type: array
 *                     items:
 *                       type: string
 *                 example:
 *                   type: "lessons_completed"
 *                   count: 5
 *                   lesson_ids: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5"]
 *               points:
 *                 type: integer
 *                 minimum: 0
 *                 description: Points awarded for earning this badge
 *                 example: 100
 *     responses:
 *       201:
 *         description: Badge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Badge'
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "FORBIDDEN"
 *               message: "Admin access required"
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
  badgesController.createBadge.bind(badgesController)
);

/**
 * @openapi
 * /api/v1/badges/{id}:
 *   put:
 *     tags:
 *       - Badges
 *     summary: Update a badge
 *     description: |
 *       Update an existing badge's information.
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
 *         description: Badge unique identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
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
 *                 maxLength: 200
 *                 description: Badge name
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Badge description
 *               icon:
 *                 type: string
 *                 description: Icon name or path
 *               category:
 *                 type: string
 *                 enum: [skill, achievement, team, methodology, engagement]
 *               criteria:
 *                 type: object
 *                 description: Criteria for earning the badge
 *               points:
 *                 type: integer
 *                 minimum: 0
 *             example:
 *               name: "Code Master Pro"
 *               description: "Advanced programming skills with VEXcode IQ"
 *               points: 150
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Badge'
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Badge not found
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
  badgesController.updateBadge.bind(badgesController)
);

/**
 * @openapi
 * /api/v1/badges/{id}:
 *   delete:
 *     tags:
 *       - Badges
 *     summary: Delete a badge
 *     description: |
 *       Delete a badge from the system.
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
 *         description: Badge unique identifier
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Badge deleted successfully
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
 *         description: Badge not found
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
  badgesController.deleteBadge.bind(badgesController)
);

// =====================================================
// STUDENT BADGES
// =====================================================

/**
 * @openapi
 * /api/v1/students/{studentId}/badges:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get student's earned badges
 *     description: |
 *       Retrieve all badges earned by a specific student.
 *       - Students can view their own badges
 *       - Coaches/Admins can view any student's badges
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
 *     responses:
 *       200:
 *         description: Student badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   badge:
 *                     $ref: '#/components/schemas/Badge'
 *                   earned_at:
 *                     type: string
 *                     format: date-time
 *                     description: When the badge was earned
 *                   evidence_type:
 *                     type: string
 *                     enum: [lesson, skill_assessment, notebook_entry, manual]
 *                   evidence_id:
 *                     type: string
 *                     description: ID of the evidence that earned the badge
 *             example:
 *               - badge:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "First Robot"
 *                   description: "Build your first robot"
 *                   category: "achievement"
 *                   points: 100
 *                 earned_at: "2024-01-15T14:30:00Z"
 *                 evidence_type: "lesson"
 *                 evidence_id: "lesson-build-101"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's badges
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
  '/students/:studentId/badges',
  authenticateToken,
  badgesController.getStudentBadges.bind(badgesController)
);

/**
 * @openapi
 * /api/v1/students/{studentId}/badges:
 *   post:
 *     tags:
 *       - Badges
 *     summary: Award badge to student
 *     description: |
 *       Manually award a badge to a student.
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
 *               - badge_id
 *             properties:
 *               badge_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the badge to award
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               evidence_type:
 *                 type: string
 *                 enum: [lesson, skill_assessment, notebook_entry, manual]
 *                 description: Type of evidence for the award
 *                 example: "manual"
 *               evidence_id:
 *                 type: string
 *                 description: ID of the evidence (if applicable)
 *                 example: "coach-observation-001"
 *     responses:
 *       201:
 *         description: Badge awarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Badge awarded successfully"
 *                 badge:
 *                   $ref: '#/components/schemas/Badge'
 *                 earned_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request or badge already earned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "DUPLICATE_AWARD"
 *               message: "Student has already earned this badge"
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
 *         description: Student or badge not found
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
  '/students/:studentId/badges',
  authenticateToken,
  badgesController.awardBadge.bind(badgesController)
);

/**
 * @openapi
 * /api/v1/students/{studentId}/badges/{badgeId}/progress:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get student's badge progress
 *     description: |
 *       Get a student's progress toward earning a specific badge.
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
 *         example: "456e7890-e89b-12d3-a456-426614174002"
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Badge ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Badge progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badge_id:
 *                   type: string
 *                   format: uuid
 *                 badge_name:
 *                   type: string
 *                 current:
 *                   type: integer
 *                   nullable: true
 *                   description: Current progress value
 *                 required:
 *                   type: integer
 *                   nullable: true
 *                   description: Required value to earn badge
 *                 percentage:
 *                   type: number
 *                   nullable: true
 *                   description: Progress percentage (0-100)
 *                 earned:
 *                   type: boolean
 *                   description: Whether the badge has been earned
 *             example:
 *               badge_id: "123e4567-e89b-12d3-a456-426614174000"
 *               badge_name: "Code Master"
 *               current: 3
 *               required: 5
 *               percentage: 60
 *               earned: false
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
 *         description: Student or badge not found
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
  '/students/:studentId/badges/:badgeId/progress',
  authenticateToken,
  badgesController.getBadgeProgress.bind(badgesController)
);

// =====================================================
// MY BADGES (Current User)
// =====================================================

/**
 * @openapi
 * /api/v1/me/badges:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get my earned badges
 *     description: Get all badges earned by the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   badge:
 *                     $ref: '#/components/schemas/Badge'
 *                   earned_at:
 *                     type: string
 *                     format: date-time
 *                   evidence_type:
 *                     type: string
 *                   evidence_id:
 *                     type: string
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
  '/me/badges',
  authenticateToken,
  badgesController.getMyBadges.bind(badgesController)
);

/**
 * @openapi
 * /api/v1/me/badges/progress:
 *   get:
 *     tags:
 *       - Badges
 *     summary: Get my badge progress
 *     description: Get progress toward all available badges for the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   badge:
 *                     $ref: '#/components/schemas/Badge'
 *                   progress:
 *                     type: object
 *                     properties:
 *                       current:
 *                         type: integer
 *                         nullable: true
 *                       required:
 *                         type: integer
 *                         nullable: true
 *                       percentage:
 *                         type: number
 *                         nullable: true
 *                       earned:
 *                         type: boolean
 *             example:
 *               - badge:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Code Master"
 *                   description: "Master programming basics"
 *                   category: "skill"
 *                 progress:
 *                   current: 3
 *                   required: 5
 *                   percentage: 60
 *                   earned: false
 *               - badge:
 *                   id: "234e5678-e89b-12d3-a456-426614174001"
 *                   name: "First Robot"
 *                   description: "Build your first robot"
 *                   category: "achievement"
 *                 progress:
 *                   current: 1
 *                   required: 1
 *                   percentage: 100
 *                   earned: true
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
  '/me/badges/progress',
  authenticateToken,
  badgesController.getMyBadgeProgress.bind(badgesController)
);

// =====================================================
// AUTO-AWARD (Internal API)
// =====================================================

/**
 * @openapi
 * /api/v1/badges/check-awards:
 *   post:
 *     tags:
 *       - Badges
 *     summary: Check and auto-award badges
 *     description: |
 *       Internal API endpoint to check and automatically award badges based on events.
 *       This should be called after:
 *       - Lesson completion
 *       - Skill assessment
 *       - Notebook entry creation
 *       - Specific achievements
 *
 *       **Note:** This is typically called internally by other services, not directly by clients.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - event
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *                 description: Student's user ID
 *                 example: "456e7890-e89b-12d3-a456-426614174002"
 *               event:
 *                 type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [lesson_completion, skill_assessment, notebook_entry, achievement]
 *                     description: Type of event that occurred
 *                   lesson_id:
 *                     type: string
 *                     description: ID of completed lesson (if type is lesson_completion)
 *                   skill_id:
 *                     type: string
 *                     description: ID of assessed skill (if type is skill_assessment)
 *                   notebook_entry_id:
 *                     type: string
 *                     description: ID of created notebook entry (if type is notebook_entry)
 *                   achievement_type:
 *                     type: string
 *                     description: Type of achievement (if type is achievement)
 *           examples:
 *             lesson_completion:
 *               summary: After lesson completion
 *               value:
 *                 student_id: "456e7890-e89b-12d3-a456-426614174002"
 *                 event:
 *                   type: "lesson_completion"
 *                   lesson_id: "lesson-build-101"
 *             skill_assessment:
 *               summary: After skill assessment
 *               value:
 *                 student_id: "456e7890-e89b-12d3-a456-426614174002"
 *                 event:
 *                   type: "skill_assessment"
 *                   skill_id: "skill-programming-basics"
 *     responses:
 *       200:
 *         description: Badge check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 awarded_badges:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Badge'
 *                   description: Badges that were awarded
 *                 count:
 *                   type: integer
 *                   description: Number of badges awarded
 *             example:
 *               awarded_badges:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "First Robot"
 *                   description: "Build your first robot"
 *                   category: "achievement"
 *                   points: 100
 *               count: 1
 *       400:
 *         description: Invalid request data
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
 * NOTE: This endpoint should be called internally after events that may trigger badges:
 * - After lesson completion
 * - After skill assessment
 * - After notebook entry creation
 * - After specific achievements
 */
router.post(
  '/check-awards',
  badgesController.checkAndAwardBadges.bind(badgesController)
);

export { router as badgesRouter };