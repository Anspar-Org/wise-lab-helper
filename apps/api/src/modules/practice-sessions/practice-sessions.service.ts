import { DatabaseService } from '../../config/database';
import {
  PracticeSession,
  SessionRotation,
  PracticeSessionWithRotations,
  PaginatedResponse,
  CreatePracticeSessionRequest,
  UpdatePracticeSessionRequest,
  CreateSessionRotationRequest,
  UpdateSessionRotationRequest,
  GetPracticeSessionsFilters,
} from '@stemlab/shared-types';

/**
 * Practice Sessions Service
 *
 * Manages practice sessions and rotation tracking for robotics teams.
 * Supports:
 * - Practice session CRUD operations
 * - Rotation management with overlap prevention
 * - Session filtering and pagination
 * - Session statistics and rotation counts
 */
export class PracticeSessionsService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new practice session
   *
   * @param data - Practice session creation data
   * @returns Created practice session
   */
  async createPracticeSession(data: CreatePracticeSessionRequest): Promise<PracticeSession> {
    // Validate duration_minutes
    if (data.duration_minutes <= 0) {
      throw new Error('duration_minutes must be a positive integer');
    }

    const query = `
      INSERT INTO practice_sessions (team_id, session_date, duration_minutes, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const result = await this.db.query<PracticeSession>(query, [
        data.team_id,
        data.session_date,
        data.duration_minutes,
        data.notes || null,
      ]);

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new Error('Team not found');
      }
      throw error;
    }
  }

  /**
   * Get practice sessions with optional filters and pagination
   *
   * @param filters - Query filters (team_id, date_from, date_to, page, limit)
   * @returns Paginated practice sessions with rotation counts
   */
  async getPracticeSessions(
    filters: GetPracticeSessionsFilters
  ): Promise<PaginatedResponse<PracticeSession & { rotation_count?: number }>> {
    const { team_id, date_from, date_to, page = 1, limit = 20 } = filters;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (team_id) {
      whereClauses.push(`ps.team_id = $${paramIndex++}`);
      params.push(team_id);
    }

    if (date_from) {
      whereClauses.push(`ps.session_date >= $${paramIndex++}`);
      params.push(date_from);
    }

    if (date_to) {
      whereClauses.push(`ps.session_date <= $${paramIndex++}`);
      params.push(date_to);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const offset = (page - 1) * limit;

    const query = `
      SELECT
        ps.*,
        COUNT(sr.id)::int as rotation_count
      FROM practice_sessions ps
      LEFT JOIN session_rotations sr ON ps.id = sr.session_id
      ${whereClause}
      GROUP BY ps.id
      ORDER BY ps.session_date DESC, ps.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);

    const result = await this.db.query<PracticeSession & { rotation_count: number }>(
      query,
      params
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT ps.id)::int as total
      FROM practice_sessions ps
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
   * Get practice session by ID with rotations
   *
   * @param sessionId - Session ID
   * @returns Practice session with rotations or null if not found
   */
  async getPracticeSessionById(sessionId: string): Promise<PracticeSessionWithRotations | null> {
    const query = `
      SELECT
        ps.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sr.id,
              'session_id', sr.session_id,
              'student_id', sr.student_id,
              'station', sr.station,
              'start_time', sr.start_time,
              'created_at', sr.created_at
            )
            ORDER BY sr.start_time, sr.created_at
          ) FILTER (WHERE sr.id IS NOT NULL),
          '[]'
        ) as rotations
      FROM practice_sessions ps
      LEFT JOIN session_rotations sr ON ps.id = sr.session_id
      WHERE ps.id = $1
      GROUP BY ps.id
    `;

    const result = await this.db.query<PracticeSessionWithRotations>(query, [sessionId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a practice session
   *
   * @param sessionId - Session ID
   * @param data - Update data
   * @returns Updated practice session
   */
  async updatePracticeSession(
    sessionId: string,
    data: UpdatePracticeSessionRequest
  ): Promise<PracticeSession> {
    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.session_date !== undefined) {
      updates.push(`session_date = $${paramIndex++}`);
      params.push(data.session_date);
    }

    if (data.duration_minutes !== undefined) {
      if (data.duration_minutes <= 0) {
        throw new Error('duration_minutes must be a positive integer');
      }
      updates.push(`duration_minutes = $${paramIndex++}`);
      params.push(data.duration_minutes);
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(data.notes);
    }

    if (updates.length === 0) {
      throw new Error('No update data provided');
    }

    updates.push(`updated_at = NOW()`);
    params.push(sessionId);

    const query = `
      UPDATE practice_sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<PracticeSession>(query, params);

    if (result.rows.length === 0) {
      throw new Error('Practice session not found');
    }

    return result.rows[0];
  }

  /**
   * Delete a practice session
   *
   * @param sessionId - Session ID
   */
  async deletePracticeSession(sessionId: string): Promise<void> {
    const query = `DELETE FROM practice_sessions WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [sessionId]);

    if (result.rows.length === 0) {
      throw new Error('Practice session not found');
    }
  }

  /**
   * Add a rotation to a practice session
   *
   * @param sessionId - Session ID
   * @param data - Rotation data
   * @returns Created rotation
   */
  async addRotation(
    sessionId: string,
    data: CreateSessionRotationRequest
  ): Promise<SessionRotation> {
    // Validate station
    const validStations = ['Building', 'Programming', 'Driving', 'Documentation'];
    if (!validStations.includes(data.station)) {
      throw new Error('Station must be one of: Building, Programming, Driving, Documentation');
    }

    // Check for overlapping rotations (same student in same session)
    const overlapQuery = `
      SELECT id FROM session_rotations
      WHERE session_id = $1 AND student_id = $2
    `;

    const overlapResult = await this.db.query(overlapQuery, [sessionId, data.student_id]);

    if (overlapResult.rows.length > 0) {
      throw new Error('Student already has a rotation in this session');
    }

    // Insert rotation
    const query = `
      INSERT INTO session_rotations (session_id, student_id, station, start_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await this.db.query<SessionRotation>(query, [
      sessionId,
      data.student_id,
      data.station,
      data.start_time,
    ]);

    return result.rows[0];
  }

  /**
   * Get all rotations for a practice session
   *
   * @param sessionId - Session ID
   * @returns Array of rotations
   */
  async getRotations(sessionId: string): Promise<SessionRotation[]> {
    const query = `
      SELECT * FROM session_rotations
      WHERE session_id = $1
      ORDER BY start_time, created_at
    `;

    const result = await this.db.query<SessionRotation>(query, [sessionId]);
    return result.rows;
  }

  /**
   * Update a rotation
   *
   * @param sessionId - Session ID
   * @param rotationId - Rotation ID
   * @param data - Update data
   * @returns Updated rotation
   */
  async updateRotation(
    sessionId: string,
    rotationId: string,
    data: UpdateSessionRotationRequest
  ): Promise<SessionRotation> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.station !== undefined) {
      const validStations = ['Building', 'Programming', 'Driving', 'Documentation'];
      if (!validStations.includes(data.station)) {
        throw new Error('Station must be one of: Building, Programming, Driving, Documentation');
      }
      updates.push(`station = $${paramIndex++}`);
      params.push(data.station);
    }

    if (data.start_time !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      params.push(data.start_time);
    }

    if (updates.length === 0) {
      throw new Error('No update data provided');
    }

    params.push(rotationId, sessionId);

    const query = `
      UPDATE session_rotations
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND session_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query<SessionRotation>(query, params);

    if (result.rows.length === 0) {
      throw new Error('Rotation not found');
    }

    return result.rows[0];
  }

  /**
   * Delete a rotation
   *
   * @param sessionId - Session ID
   * @param rotationId - Rotation ID
   */
  async deleteRotation(sessionId: string, rotationId: string): Promise<void> {
    const query = `
      DELETE FROM session_rotations
      WHERE id = $1 AND session_id = $2
      RETURNING id
    `;

    const result = await this.db.query(query, [rotationId, sessionId]);

    if (result.rows.length === 0) {
      throw new Error('Rotation not found');
    }
  }
}
