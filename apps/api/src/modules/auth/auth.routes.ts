import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateToken, validateRequest } from './auth.middleware';
import {
  registerStudentSchema,
  registerStaffSchema,
  loginSchema,
  generateAvatarSchema,
} from './auth.validation';

/**
 * Authentication Routes
 *
 * Defines all authentication-related endpoints:
 * - Student registration
 * - Staff registration
 * - Login
 * - Logout
 * - Token refresh
 * - Current user profile
 * - Avatar generation
 */

const router = Router();

/**
 * @route   POST /api/v1/auth/register/student
 * @desc    Register a new student with PIN or Animal Grid authentication
 * @access  Public
 *
 * Request body:
 * {
 *   username: string,
 *   display_name: string,
 *   grade_level: GradeLevel,
 *   auth_type: 'pin' | 'animal_grid',
 *   pin?: string,              // Required if auth_type is 'pin'
 *   animal_pattern?: string[], // Required if auth_type is 'animal_grid'
 *   avatar_config?: AvatarConfig
 * }
 */
router.post(
  '/register/student',
  validateRequest(registerStudentSchema),
  authController.registerStudent.bind(authController)
);

/**
 * @route   POST /api/v1/auth/register/staff
 * @desc    Register a new staff member with password authentication
 * @access  Public (should be restricted in production - see notes)
 *
 * NOTE: In production, this endpoint should be protected and only accessible
 * to administrators. Consider adding authorizeRoles([UserRole.ADMIN]) middleware.
 *
 * Request body:
 * {
 *   username: string,
 *   display_name: string,
 *   email: string,
 *   password: string,
 *   role: 'coach' | 'admin'
 * }
 */
router.post(
  '/register/staff',
  validateRequest(registerStaffSchema),
  authController.registerStaff.bind(authController)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with username and appropriate credentials
 * @access  Public
 *
 * Request body:
 * {
 *   username: string,
 *   auth_type: 'pin' | 'animal_grid' | 'password',
 *   pin?: string,              // Required if auth_type is 'pin'
 *   animal_pattern?: string[], // Required if auth_type is 'animal_grid'
 *   password?: string          // Required if auth_type is 'password'
 * }
 *
 * Response:
 * {
 *   token: string,
 *   user: User,
 *   expires_at: Date
 * }
 *
 * RATE LIMITING RECOMMENDATION:
 * This endpoint should be rate limited to prevent brute force attacks.
 * Suggested: 5 failed attempts per username per 15 minutes.
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and revoke current token
 * @access  Private (requires authentication)
 *
 * Headers:
 * Authorization: Bearer <token>
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh authentication token
 * @access  Private (requires valid token)
 *
 * Headers:
 * Authorization: Bearer <token>
 *
 * Response:
 * {
 *   token: string,
 *   user: User,
 *   expires_at: Date
 * }
 */
router.post(
  '/refresh',
  authenticateToken,
  authController.refreshToken.bind(authController)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Private (requires authentication)
 *
 * Headers:
 * Authorization: Bearer <token>
 *
 * Response:
 * User object without sensitive fields
 */
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser.bind(authController)
);

/**
 * @route   POST /api/v1/auth/avatar/generate
 * @desc    Generate avatar configuration and preview
 * @access  Public
 *
 * Request body:
 * {
 *   seed: string,
 *   style?: string,
 *   backgroundColor?: string
 * }
 *
 * Response:
 * {
 *   seed: string,
 *   style: string,
 *   backgroundColor: string,
 *   url: string  // Data URL of generated avatar SVG
 * }
 */
router.post(
  '/avatar/generate',
  validateRequest(generateAvatarSchema),
  authController.generateAvatar.bind(authController)
);

/**
 * @route   GET /api/v1/auth/avatar/styles
 * @desc    Get list of available avatar styles
 * @access  Public
 *
 * Response:
 * {
 *   all: string[],            // All available styles
 *   studentFriendly: string[] // Curated list for students
 * }
 */
router.get(
  '/avatar/styles',
  authController.getAvatarStyles.bind(authController)
);

export { router as authRouter };
