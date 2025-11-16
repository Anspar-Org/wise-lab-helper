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
 * @route   GET /api/v1/badges
 * @desc    Get all badges, optionally filtered by category
 * @access  Public
 *
 * Query params:
 * ?category=engagement|methodology|skill|team
 *
 * Response: Array of Badge objects
 */
router.get('/', badgesController.getAllBadges.bind(badgesController));

/**
 * @route   GET /api/v1/badges/:id
 * @desc    Get badge by ID
 * @access  Public
 *
 * Response: Badge object
 */
router.get('/:id', badgesController.getBadgeById.bind(badgesController));

/**
 * @route   POST /api/v1/badges
 * @desc    Create a new badge
 * @access  Private (Admin only)
 *
 * Request body:
 * {
 *   name: string,              // 1-200 characters
 *   description: string,       // 1-1000 characters
 *   icon?: string,             // Icon name or path
 *   category: BadgeCategory,   // methodology|skill|engagement|team
 *   criteria: BadgeCriteria    // See BadgeCriteria interface
 * }
 */
router.post(
  '/',
  authenticateToken,
  badgesController.createBadge.bind(badgesController)
);

/**
 * @route   PUT /api/v1/badges/:id
 * @desc    Update a badge
 * @access  Private (Admin only)
 *
 * Request body: Partial<CreateBadgeRequest>
 */
router.put(
  '/:id',
  authenticateToken,
  badgesController.updateBadge.bind(badgesController)
);

/**
 * @route   DELETE /api/v1/badges/:id
 * @desc    Delete a badge
 * @access  Private (Admin only)
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
 * @route   GET /api/v1/students/:studentId/badges
 * @desc    Get badges earned by a student
 * @access  Private (Student can view own, Coach/Admin can view all)
 *
 * Response: Array of earned badges with earned_at timestamp
 */
router.get(
  '/students/:studentId/badges',
  authenticateToken,
  badgesController.getStudentBadges.bind(badgesController)
);

/**
 * @route   POST /api/v1/students/:studentId/badges
 * @desc    Manually award a badge to a student
 * @access  Private (Coach/Admin only)
 *
 * Request body:
 * {
 *   badge_id: string,
 *   evidence_type?: string,  // 'lesson', 'skill_assessment', 'notebook_entry', 'manual'
 *   evidence_id?: string     // ID of the evidence
 * }
 */
router.post(
  '/students/:studentId/badges',
  authenticateToken,
  badgesController.awardBadge.bind(badgesController)
);

/**
 * @route   GET /api/v1/students/:studentId/badges/:badgeId/progress
 * @desc    Get student's progress toward a specific badge
 * @access  Private (Student can view own, Coach/Admin can view all)
 *
 * Response:
 * {
 *   badge_id: string,
 *   current: number | null,
 *   required: number | null,
 *   percentage: number | null
 * }
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
 * @route   GET /api/v1/me/badges
 * @desc    Get current user's earned badges
 * @access  Private (requires authentication)
 *
 * Response: Array of earned badges with earned_at timestamp
 */
router.get(
  '/me/badges',
  authenticateToken,
  badgesController.getMyBadges.bind(badgesController)
);

/**
 * @route   GET /api/v1/me/badges/progress
 * @desc    Get current user's progress toward all available badges
 * @access  Private (requires authentication)
 *
 * Response: Array of { badge, progress } objects
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
 * @route   POST /api/v1/badges/check-awards
 * @desc    Check and automatically award badges based on event
 * @access  Internal API (called after lesson completion, skill assessment, etc.)
 *
 * Request body:
 * {
 *   student_id: string,
 *   event: {
 *     type: 'lesson_completion' | 'skill_assessment' | 'notebook_entry' | 'achievement',
 *     lesson_id?: string,
 *     skill_id?: string,
 *     notebook_entry_id?: string,
 *     achievement_type?: string
 *   }
 * }
 *
 * Response:
 * {
 *   awarded_badges: Badge[],
 *   count: number
 * }
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
