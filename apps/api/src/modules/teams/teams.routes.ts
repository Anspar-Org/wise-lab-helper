import { Router } from 'express';
import { TeamsController } from './teams.controller';
import { authenticateToken } from '../auth/auth.middleware';

/**
 * Team Management Routes
 *
 * Defines all team and team member management endpoints:
 * - Team CRUD operations (Coach/Admin)
 * - Team member management
 * - Team filtering and pagination
 * - Team statistics
 */

const router = Router();
const teamsController = new TeamsController();

// =====================================================
// TEAMS
// =====================================================

/**
 * @openapi
 * /api/v1/teams:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get all teams
 *     description: |
 *       Retrieve teams with optional filters.
 *       Returns teams with active member counts for quick overview.
 *       Students can see their teams, Coaches/Admins can see all teams.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season_year
 *         schema:
 *           type: string
 *           pattern: '^20[0-9]{2}-20[0-9]{2}$'
 *         description: Filter by season year (e.g., "2024-2025")
 *         example: "2024-2025"
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
 *         description: Number of teams per page
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Team'
 *                       - type: object
 *                         properties:
 *                           member_count:
 *                             type: integer
 *                             description: Number of active members in this team
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
 *                       example: 5
 *                     total_pages:
 *                       type: integer
 *                       example: 1
 *             example:
 *               data:
 *                 - id: "team-uuid-1"
 *                   team_number: "6502A"
 *                   season_year: "2024-2025"
 *                   member_count: 5
 *                   created_at: "2024-08-01T10:00:00Z"
 *                   updated_at: "2024-08-01T10:00:00Z"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 5
 *                 total_pages: 1
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
router.get('/', authenticateToken, teamsController.getTeams.bind(teamsController));

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get team by ID
 *     description: Retrieve a specific team with all its active members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Team ID
 *         example: "team-uuid-1"
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeamMember'
 *             example:
 *               id: "team-uuid-1"
 *               team_number: "6502A"
 *               season_year: "2024-2025"
 *               created_at: "2024-08-01T10:00:00Z"
 *               updated_at: "2024-08-01T10:00:00Z"
 *               members:
 *                 - id: "member-uuid-1"
 *                   team_id: "team-uuid-1"
 *                   user_id: "user-uuid-1"
 *                   role: "Driver"
 *                   joined_at: "2024-08-01T10:00:00Z"
 *                   left_at: null
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/:id', authenticateToken, teamsController.getTeamById.bind(teamsController));

/**
 * @openapi
 * /api/v1/teams:
 *   post:
 *     tags:
 *       - Teams
 *     summary: Create a new team
 *     description: |
 *       Create a new VEX IQ robotics team.
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
 *               - team_number
 *               - season_year
 *             properties:
 *               team_number:
 *                 type: string
 *                 pattern: '^[0-9]{3,5}[A-Z]$'
 *                 description: Team number (3-5 digits followed by a letter)
 *                 example: "6502A"
 *               season_year:
 *                 type: string
 *                 pattern: '^20[0-9]{2}-20[0-9]{2}$'
 *                 description: Competition season year (consecutive years)
 *                 example: "2024-2025"
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
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
 *         description: Team number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conflict"
 *               message: "Team number already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, teamsController.createTeam.bind(teamsController));

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   put:
 *     tags:
 *       - Teams
 *     summary: Update a team
 *     description: |
 *       Update an existing team's information.
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
 *         description: Team ID
 *         example: "team-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_number:
 *                 type: string
 *                 pattern: '^[0-9]{3,5}[A-Z]$'
 *                 description: Team number (3-5 digits followed by a letter)
 *                 example: "6502B"
 *               season_year:
 *                 type: string
 *                 pattern: '^20[0-9]{2}-20[0-9]{2}$'
 *                 description: Competition season year (consecutive years)
 *                 example: "2025-2026"
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
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
 *       409:
 *         description: Team number already exists
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
router.put('/:id', authenticateToken, teamsController.updateTeam.bind(teamsController));

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   delete:
 *     tags:
 *       - Teams
 *     summary: Archive a team
 *     description: |
 *       Archive a team by setting left_at for all active members (soft delete).
 *       Team record and historical data are preserved.
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
 *         description: Team ID
 *         example: "team-uuid-1"
 *     responses:
 *       204:
 *         description: Team archived successfully
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
router.delete('/:id', authenticateToken, teamsController.deleteTeam.bind(teamsController));

// =====================================================
// TEAM MEMBERS
// =====================================================

/**
 * @openapi
 * /api/v1/teams/{id}/members:
 *   post:
 *     tags:
 *       - Teams
 *       - Team Members
 *     summary: Add a member to a team
 *     description: |
 *       Add a student or coach to a team with a specific role.
 *       Users can be on multiple teams simultaneously.
 *       Users who previously left a team can be re-added.
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
 *         description: Team ID
 *         example: "team-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: User ID
 *                 example: "user-uuid-1"
 *               role:
 *                 type: string
 *                 enum: [Driver, Builder, Programmer, Scout, Coach]
 *                 description: Team role
 *                 example: "Driver"
 *     responses:
 *       201:
 *         description: Team member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User is already an active member of this team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conflict"
 *               message: "User is already an active member of this team"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/members',
  authenticateToken,
  teamsController.addTeamMember.bind(teamsController)
);

/**
 * @openapi
 * /api/v1/teams/{id}/members/{userId}:
 *   put:
 *     tags:
 *       - Teams
 *       - Team Members
 *     summary: Update team member role
 *     description: |
 *       Update an existing team member's role.
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
 *         description: Team ID
 *         example: "team-uuid-1"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "user-uuid-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Driver, Builder, Programmer, Scout, Coach]
 *                 description: New team role
 *                 example: "Builder"
 *     responses:
 *       200:
 *         description: Team member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
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
 *         description: Team member not found or already removed
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
  '/:id/members/:userId',
  authenticateToken,
  teamsController.updateTeamMemberRole.bind(teamsController)
);

/**
 * @openapi
 * /api/v1/teams/{id}/members/{userId}:
 *   delete:
 *     tags:
 *       - Teams
 *       - Team Members
 *     summary: Remove a member from a team
 *     description: |
 *       Remove a member from a team by setting their left_at timestamp (soft delete).
 *       Historical membership record is preserved.
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
 *         description: Team ID
 *         example: "team-uuid-1"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "user-uuid-1"
 *     responses:
 *       204:
 *         description: Team member removed successfully
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
 *         description: Team member not found or already removed
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
  '/:id/members/:userId',
  authenticateToken,
  teamsController.removeTeamMember.bind(teamsController)
);

// =====================================================
// TEAM STATISTICS
// =====================================================

/**
 * @openapi
 * /api/v1/teams/{id}/stats:
 *   get:
 *     tags:
 *       - Teams
 *       - Statistics
 *     summary: Get team statistics
 *     description: |
 *       Retrieve comprehensive statistics for a team including:
 *       - Active member count
 *       - Practice session count
 *       - Competition count
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Team ID
 *         example: "team-uuid-1"
 *     responses:
 *       200:
 *         description: Team statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team_id:
 *                   type: string
 *                   format: uuid
 *                   description: Team ID
 *                 member_count:
 *                   type: integer
 *                   description: Number of active team members
 *                 practice_session_count:
 *                   type: integer
 *                   description: Total number of practice sessions
 *                 competition_count:
 *                   type: integer
 *                   description: Total number of competitions
 *             example:
 *               team_id: "team-uuid-1"
 *               member_count: 5
 *               practice_session_count: 12
 *               competition_count: 3
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get(
  '/:id/stats',
  authenticateToken,
  teamsController.getTeamStats.bind(teamsController)
);

export { router as teamsRouter };
