import { DatabaseService } from '../../config/database';
import {
  Team,
  TeamMember,
  TeamWithMembers,
  TeamStats,
  PaginatedResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
  GetTeamsFilters,
} from '@stemlab/shared-types';

/**
 * Teams Service
 *
 * Manages VEX IQ robotics teams and team membership.
 * Supports:
 * - Team CRUD operations
 * - Team member management with soft delete
 * - Multi-team membership support
 * - Team statistics aggregation
 */
export class TeamsService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new team
   *
   * @param data - Team creation data
   * @returns Created team
   */
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const query = `
      INSERT INTO teams (team_number, season_year)
      VALUES ($1, $2)
      RETURNING *
    `;

    try {
      const result = await this.db.query<Team>(query, [
        data.team_number,
        data.season_year,
      ]);

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'teams_team_number_key') {
        throw new Error('Team number already exists');
      }
      throw error;
    }
  }

  /**
   * Get teams with optional filters and pagination
   *
   * @param filters - Query filters (season_year, page, limit)
   * @returns Paginated teams with member counts
   */
  async getTeams(
    filters: GetTeamsFilters
  ): Promise<PaginatedResponse<Team & { member_count?: number }>> {
    const { season_year, page = 1, limit = 20 } = filters;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (season_year) {
      whereClauses.push(`t.season_year = $${paramIndex++}`);
      params.push(season_year);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const offset = (page - 1) * limit;

    const query = `
      SELECT
        t.*,
        COUNT(tm.id) FILTER (WHERE tm.left_at IS NULL)::int as member_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.season_year DESC, t.team_number ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);

    const result = await this.db.query<Team & { member_count: number }>(
      query,
      params
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT t.id)::int as total
      FROM teams t
      ${whereClause}
    `;

    const countResult = await this.db.query<{ total: number }>(
      countQuery,
      params.slice(0, -2) // Remove limit and offset params
    );

    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Get team by ID with active members
   *
   * @param teamId - Team ID
   * @returns Team with members or null if not found
   */
  async getTeamById(teamId: string): Promise<TeamWithMembers | null> {
    const query = `
      SELECT
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tm.id,
              'team_id', tm.team_id,
              'user_id', tm.user_id,
              'role', tm.role,
              'joined_at', tm.joined_at,
              'left_at', tm.left_at
            )
            ORDER BY tm.joined_at DESC
          ) FILTER (WHERE tm.id IS NOT NULL AND tm.left_at IS NULL),
          '[]'
        ) as members
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.id = $1
      GROUP BY t.id
    `;

    const result = await this.db.query<TeamWithMembers>(query, [teamId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a team
   *
   * @param teamId - Team ID
   * @param data - Update data
   * @returns Updated team
   */
  async updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.team_number !== undefined) {
      updates.push(`team_number = $${paramIndex++}`);
      params.push(data.team_number);
    }

    if (data.season_year !== undefined) {
      updates.push(`season_year = $${paramIndex++}`);
      params.push(data.season_year);
    }

    if (updates.length === 0) {
      throw new Error('No update data provided');
    }

    updates.push(`updated_at = NOW()`);
    params.push(teamId);

    const query = `
      UPDATE teams
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.db.query<Team>(query, params);

      if (result.rows.length === 0) {
        throw new Error('Team not found');
      }

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'teams_team_number_key') {
        throw new Error('Team number already exists');
      }
      throw error;
    }
  }

  /**
   * Delete a team (soft delete - sets left_at for all members)
   *
   * @param teamId - Team ID
   */
  async deleteTeam(teamId: string): Promise<void> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Soft delete all team members (set left_at)
      const updateMembersQuery = `
        UPDATE team_members
        SET left_at = NOW()
        WHERE team_id = $1 AND left_at IS NULL
      `;
      await client.query(updateMembersQuery, [teamId]);

      // Verify team exists
      const verifyQuery = `SELECT id FROM teams WHERE id = $1`;
      const verifyResult = await client.query(verifyQuery, [teamId]);

      if (verifyResult.rows.length === 0) {
        throw new Error('Team not found');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add a member to a team
   *
   * @param teamId - Team ID
   * @param data - Member data
   * @returns Created team member
   */
  async addTeamMember(teamId: string, data: AddTeamMemberRequest): Promise<TeamMember> {
    // Validate role
    const validRoles = ['Driver', 'Builder', 'Programmer', 'Scout', 'Coach'];
    if (!validRoles.includes(data.role)) {
      throw new Error('Role must be one of: Driver, Builder, Programmer, Scout, Coach');
    }

    // Check for existing active membership
    const checkQuery = `
      SELECT id, left_at FROM team_members
      WHERE team_id = $1 AND user_id = $2
      ORDER BY joined_at DESC
      LIMIT 1
    `;

    const checkResult = await this.db.query(checkQuery, [teamId, data.user_id]);

    if (checkResult.rows.length > 0 && checkResult.rows[0].left_at === null) {
      throw new Error('User is already an active member of this team');
    }

    // Verify user exists
    const userQuery = `SELECT id FROM users WHERE id = $1`;
    const userResult = await this.db.query(userQuery, [data.user_id]);

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    // Insert team member
    const query = `
      INSERT INTO team_members (team_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await this.db.query<TeamMember>(query, [
      teamId,
      data.user_id,
      data.role,
    ]);

    return result.rows[0];
  }

  /**
   * Remove a team member (soft delete - sets left_at)
   *
   * @param teamId - Team ID
   * @param userId - User ID
   * @returns Updated team member
   */
  async removeTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const query = `
      UPDATE team_members
      SET left_at = NOW()
      WHERE team_id = $1 AND user_id = $2 AND left_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query<TeamMember>(query, [teamId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Team member not found or already removed');
    }

    return result.rows[0];
  }

  /**
   * Update a team member's role
   *
   * @param teamId - Team ID
   * @param userId - User ID
   * @param data - Update data
   * @returns Updated team member
   */
  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    data: UpdateTeamMemberRoleRequest
  ): Promise<TeamMember> {
    // Validate role
    const validRoles = ['Driver', 'Builder', 'Programmer', 'Scout', 'Coach'];
    if (!validRoles.includes(data.role)) {
      throw new Error('Role must be one of: Driver, Builder, Programmer, Scout, Coach');
    }

    const query = `
      UPDATE team_members
      SET role = $1
      WHERE team_id = $2 AND user_id = $3 AND left_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query<TeamMember>(query, [
      data.role,
      teamId,
      userId,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Team member not found or already removed');
    }

    return result.rows[0];
  }

  /**
   * Get team statistics
   *
   * @param teamId - Team ID
   * @returns Team statistics or null if team not found
   */
  async getTeamStats(teamId: string): Promise<TeamStats | null> {
    const query = `
      SELECT
        t.id as team_id,
        COUNT(DISTINCT tm.id) FILTER (WHERE tm.left_at IS NULL)::int as member_count,
        COUNT(DISTINCT ps.id)::int as practice_session_count,
        COUNT(DISTINCT cr.id)::int as competition_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN practice_sessions ps ON t.id = ps.team_id
      LEFT JOIN competition_results cr ON t.id = cr.team_id
      WHERE t.id = $1
      GROUP BY t.id
    `;

    const result = await this.db.query<TeamStats>(query, [teamId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
