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
 * @openapi
 * /api/v1/auth/register/student:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new student
 *     description: Register a student with age-appropriate authentication (PIN for grades 3-5, Animal Grid for K-2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - display_name
 *               - grade_level
 *               - auth_type
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the student
 *                 example: "robot_builder_23"
 *               display_name:
 *                 type: string
 *                 description: Student's display name
 *                 example: "Alex"
 *               grade_level:
 *                 type: string
 *                 description: Grade level (K, 1, 2, 3, 4, 5)
 *                 enum: [K, "1", "2", "3", "4", "5"]
 *               auth_type:
 *                 type: string
 *                 description: Authentication method (PIN for 3-5, Animal Grid for K-2)
 *                 enum: [pin, animal_grid]
 *               pin:
 *                 type: string
 *                 description: 4-digit PIN (required if auth_type is 'pin')
 *                 pattern: '^[0-9]{4}$'
 *                 example: "1234"
 *               animal_pattern:
 *                 type: array
 *                 description: Array of 4 animal names (required if auth_type is 'animal_grid')
 *                 items:
 *                   type: string
 *                 minItems: 4
 *                 maxItems: 4
 *                 example: ["lion", "elephant", "giraffe", "monkey"]
 *               avatar_config:
 *                 type: object
 *                 description: DiceBear avatar configuration
 *                 properties:
 *                   seed:
 *                     type: string
 *                   style:
 *                     type: string
 *                   backgroundColor:
 *                     type: string
 *     responses:
 *       201:
 *         description: Student registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or username already exists
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
  '/register/student',
  validateRequest(registerStudentSchema),
  authController.registerStudent.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/register/staff:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new staff member
 *     description: |
 *       Register a coach or admin with email/password authentication.
 *       **Note:** In production, this endpoint should be restricted to administrators only.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - display_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the staff member
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "coach_smith"
 *               display_name:
 *                 type: string
 *                 description: Display name
 *                 example: "Coach Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for login and communications
 *                 example: "coach.smith@school.edu"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Secure password (minimum 8 characters)
 *                 minLength: 8
 *                 example: "SecureP@ssw0rd123"
 *               role:
 *                 type: string
 *                 enum: [coach, admin]
 *                 description: Staff role (coach or admin)
 *                 example: "coach"
 *               avatar_config:
 *                 type: object
 *                 description: Optional DiceBear avatar configuration
 *                 properties:
 *                   seed:
 *                     type: string
 *                   style:
 *                     type: string
 *                   backgroundColor:
 *                     type: string
 *     responses:
 *       201:
 *         description: Staff member registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or username/email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 value:
 *                   error: "VALIDATION_ERROR"
 *                   message: "Password must be at least 8 characters"
 *               duplicate:
 *                 value:
 *                   error: "DUPLICATE_USER"
 *                   message: "Username or email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register/staff',
  validateRequest(registerStaffSchema),
  authController.registerStaff.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: |
 *       Authenticate a user with their username and appropriate credentials based on their authentication method.
 *       - **PIN**: For grades 3-5 students (4-digit PIN)
 *       - **Animal Grid**: For grades K-2 students (4 animals from grid)
 *       - **Password**: For staff members (email/password)
 *
 *       **Security Note:** This endpoint should be rate limited to prevent brute force attacks (5 attempts per 15 minutes recommended).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - auth_type
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email (for staff)
 *                 example: "robot_builder_23"
 *               auth_type:
 *                 type: string
 *                 enum: [pin, animal_grid, password]
 *                 description: Authentication method to use
 *                 example: "pin"
 *               pin:
 *                 type: string
 *                 description: 4-digit PIN (required if auth_type is 'pin')
 *                 pattern: '^[0-9]{4}$'
 *                 example: "1234"
 *               animal_pattern:
 *                 type: array
 *                 description: Array of 4 animal names (required if auth_type is 'animal_grid')
 *                 items:
 *                   type: string
 *                 minItems: 4
 *                 maxItems: 4
 *                 example: ["lion", "elephant", "giraffe", "monkey"]
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (required if auth_type is 'password')
 *                 example: "SecureP@ssw0rd123"
 *           examples:
 *             student_pin:
 *               summary: Student login with PIN
 *               value:
 *                 username: "robot_builder_23"
 *                 auth_type: "pin"
 *                 pin: "1234"
 *             student_animals:
 *               summary: Young student login with Animal Grid
 *               value:
 *                 username: "little_engineer"
 *                 auth_type: "animal_grid"
 *                 animal_pattern: ["lion", "elephant", "giraffe", "monkey"]
 *             staff_password:
 *               summary: Staff login with password
 *               value:
 *                 username: "coach.smith@school.edu"
 *                 auth_type: "password"
 *                 password: "SecureP@ssw0rd123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration timestamp
 *                   example: "2024-01-20T12:00:00Z"
 *       400:
 *         description: Invalid request or missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "INVALID_CREDENTIALS"
 *               message: "Invalid username or password"
 *       429:
 *         description: Too many failed login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "RATE_LIMIT_EXCEEDED"
 *               message: "Too many failed login attempts. Please try again later."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logout the current user and invalidate their authentication token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "UNAUTHORIZED"
 *               message: "Invalid or expired token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: |
 *       Exchange a valid token for a new one with extended expiration.
 *       This allows users to stay logged in without re-entering credentials.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   description: New token expiration timestamp
 *                   example: "2024-01-21T12:00:00Z"
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "UNAUTHORIZED"
 *               message: "Token has expired or is invalid"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh',
  authenticateToken,
  authController.refreshToken.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information (excludes sensitive fields like password hashes)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               username: "robot_builder_23"
 *               role: "student"
 *               auth_method: "pin"
 *               avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=robot_builder_23"
 *               created_at: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "UNAUTHORIZED"
 *               message: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/avatar/generate:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Generate avatar preview
 *     description: |
 *       Generate a DiceBear avatar configuration and preview SVG.
 *       This endpoint is used during registration to preview avatars before saving.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seed
 *             properties:
 *               seed:
 *                 type: string
 *                 description: Seed string for avatar generation (typically username)
 *                 example: "robot_builder_23"
 *               style:
 *                 type: string
 *                 description: DiceBear avatar style
 *                 enum: [adventurer, avataaars, bottts, fun-emoji, lorelei, micah, miniavs, pixel-art]
 *                 default: "bottts"
 *                 example: "bottts"
 *               backgroundColor:
 *                 type: string
 *                 description: Background color (hex or color name)
 *                 default: "transparent"
 *                 example: "#4CAF50"
 *     responses:
 *       200:
 *         description: Avatar generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seed:
 *                   type: string
 *                   description: Seed used for generation
 *                   example: "robot_builder_23"
 *                 style:
 *                   type: string
 *                   description: Avatar style used
 *                   example: "bottts"
 *                 backgroundColor:
 *                   type: string
 *                   description: Background color used
 *                   example: "#4CAF50"
 *                 url:
 *                   type: string
 *                   description: Data URL of the generated SVG avatar
 *                   example: "data:image/svg+xml;base64,..."
 *       400:
 *         description: Invalid request parameters
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
  '/avatar/generate',
  validateRequest(generateAvatarSchema),
  authController.generateAvatar.bind(authController)
);

/**
 * @openapi
 * /api/v1/auth/avatar/styles:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get available avatar styles
 *     description: Retrieve a list of available DiceBear avatar styles, including a curated list suitable for elementary students
 *     responses:
 *       200:
 *         description: Avatar styles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 all:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: All available avatar styles
 *                   example: ["adventurer", "avataaars", "bottts", "fun-emoji", "lorelei", "micah", "miniavs", "pixel-art"]
 *                 studentFriendly:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Curated list of styles appropriate for K-5 students
 *                   example: ["bottts", "fun-emoji", "miniavs", "pixel-art"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/avatar/styles',
  authController.getAvatarStyles.bind(authController)
);

export { router as authRouter };
