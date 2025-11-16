import { DatabaseService } from '../../config/database';
import {
  NotebookEntry,
  NotebookEntryType,
  UserRole,
  PaginatedResponse,
} from '@stemlab/shared-types';

/**
 * Notebook Service
 *
 * Handles all engineering notebook operations including:
 * - Creating and managing notebook entries
 * - File upload and media management
 * - Search and filtering
 * - Authorization checks
 */
export class NotebookService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new notebook entry
   *
   * @param data - Entry data
   * @returns Created entry
   */
  async createEntry(data: {
    author_id: string;
    title: string;
    content: string;
    entry_type: NotebookEntryType;
    team_id?: string | null;
    tags?: string[];
    entry_date?: Date;
    media_urls?: string[];
  }): Promise<NotebookEntry> {
    // Validate entry_type
    if (!Object.values(NotebookEntryType).includes(data.entry_type)) {
      throw new Error('Invalid entry type');
    }

    // Validate entry_date is not in the future
    if (data.entry_date) {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      if (data.entry_date > now) {
        throw new Error('Entry date cannot be in the future');
      }
    }

    const result = await this.db.query<NotebookEntry>(
      `INSERT INTO notebook_entries (
        author_id,
        title,
        content,
        entry_type,
        team_id,
        tags,
        entry_date,
        media_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8)
      RETURNING *`,
      [
        data.author_id,
        data.title,
        data.content,
        data.entry_type,
        data.team_id || null,
        data.tags || [],
        data.entry_date || null,
        data.media_urls || [],
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an existing notebook entry
   *
   * @param entryId - Entry ID
   * @param data - Updated data (author_id is ignored)
   * @returns Updated entry or null if not found
   */
  async updateEntry(
    entryId: string,
    data: Partial<
      Omit<NotebookEntry, 'id' | 'author_id' | 'created_at' | 'updated_at'>
    >
  ): Promise<NotebookEntry | null> {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }

    if (data.entry_type !== undefined) {
      updates.push(`entry_type = $${paramIndex++}`);
      values.push(data.entry_type);
    }

    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags);
    }

    if (data.team_id !== undefined) {
      updates.push(`team_id = $${paramIndex++}`);
      values.push(data.team_id);
    }

    if (data.entry_date !== undefined) {
      updates.push(`entry_date = $${paramIndex++}`);
      values.push(data.entry_date);
    }

    if (data.media_urls !== undefined) {
      updates.push(`media_urls = $${paramIndex++}`);
      values.push(data.media_urls);
    }

    if (updates.length === 0) {
      // No updates to perform, just fetch the current entry
      return this.getEntryById(entryId);
    }

    values.push(entryId);

    const result = await this.db.query<NotebookEntry>(
      `UPDATE notebook_entries
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get entry by ID
   *
   * @param entryId - Entry ID
   * @returns Entry or null if not found
   */
  async getEntryById(entryId: string): Promise<NotebookEntry | null> {
    const result = await this.db.query<NotebookEntry>(
      `SELECT * FROM notebook_entries WHERE id = $1`,
      [entryId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Add a single media URL to an entry
   *
   * @param entryId - Entry ID
   * @param mediaUrl - Media URL to add
   * @returns Updated entry
   */
  async addMediaUrl(
    entryId: string,
    mediaUrl: string
  ): Promise<NotebookEntry> {
    const result = await this.db.query<NotebookEntry>(
      `UPDATE notebook_entries
       SET media_urls = array_append(media_urls, $1)
       WHERE id = $2
       RETURNING *`,
      [mediaUrl, entryId]
    );

    return result.rows[0];
  }

  /**
   * Add multiple media URLs to an entry
   *
   * @param entryId - Entry ID
   * @param mediaUrls - Array of media URLs to add
   * @returns Updated entry
   */
  async addMediaUrls(
    entryId: string,
    mediaUrls: string[]
  ): Promise<NotebookEntry> {
    const result = await this.db.query<NotebookEntry>(
      `UPDATE notebook_entries
       SET media_urls = media_urls || $1
       WHERE id = $2
       RETURNING *`,
      [mediaUrls, entryId]
    );

    return result.rows[0];
  }

  /**
   * Remove a media URL from an entry
   *
   * @param entryId - Entry ID
   * @param filename - Filename to remove
   * @returns Updated entry
   */
  async removeMediaUrl(
    entryId: string,
    filename: string
  ): Promise<NotebookEntry> {
    const result = await this.db.query<NotebookEntry>(
      `UPDATE notebook_entries
       SET media_urls = array_remove(media_urls, $1)
       WHERE id = $2
       RETURNING *`,
      [`/uploads/notebook/${filename}`, entryId]
    );

    return result.rows[0];
  }

  /**
   * Get entries with filters
   *
   * @param filters - Filter criteria
   * @returns Array of entries
   */
  async getEntries(filters: {
    entry_type?: NotebookEntryType;
    tags?: string[];
    date_from?: Date;
    date_to?: Date;
    team_id?: string;
    author_id?: string;
  }): Promise<NotebookEntry[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.entry_type) {
      conditions.push(`entry_type = $${paramIndex++}`);
      values.push(filters.entry_type);
    }

    if (filters.tags && filters.tags.length > 0) {
      // Tags filter uses AND operation (entry must have all specified tags)
      conditions.push(`tags @> $${paramIndex++}`);
      values.push(filters.tags);
    }

    if (filters.date_from) {
      conditions.push(`entry_date >= $${paramIndex++}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      conditions.push(`entry_date <= $${paramIndex++}`);
      values.push(filters.date_to);
    }

    if (filters.team_id) {
      conditions.push(`team_id = $${paramIndex++}`);
      values.push(filters.team_id);
    }

    if (filters.author_id) {
      conditions.push(`author_id = $${paramIndex++}`);
      values.push(filters.author_id);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query<NotebookEntry>(
      `SELECT * FROM notebook_entries
       ${whereClause}
       ORDER BY entry_date DESC, created_at DESC`,
      values
    );

    return result.rows;
  }

  /**
   * Get entries for a specific user based on their role
   *
   * Students: own entries + team entries
   * Coaches/Admins: all entries
   *
   * @param userId - User ID
   * @param userRole - User role
   * @param teamId - Optional team ID for students
   * @returns Array of entries
   */
  async getEntriesForUser(
    userId: string,
    userRole: UserRole,
    teamId?: string
  ): Promise<NotebookEntry[]> {
    if (userRole === UserRole.COACH || userRole === UserRole.ADMIN) {
      // Coaches and admins see all entries
      return this.getEntries({});
    }

    // Students see their own entries + team entries
    const conditions: string[] = ['author_id = $1'];
    const values: any[] = [userId];

    if (teamId) {
      conditions.push('team_id = $2');
      values.push(teamId);
    }

    const result = await this.db.query<NotebookEntry>(
      `SELECT * FROM notebook_entries
       WHERE ${conditions.join(' OR ')}
       ORDER BY entry_date DESC, created_at DESC`,
      values
    );

    return result.rows;
  }

  /**
   * Get entries with pagination
   *
   * @param filters - Filter criteria including pagination
   * @returns Paginated response
   */
  async getEntriesPaginated(filters: {
    entry_type?: NotebookEntryType;
    tags?: string[];
    date_from?: Date;
    date_to?: Date;
    team_id?: string;
    author_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<NotebookEntry>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.entry_type) {
      conditions.push(`entry_type = $${paramIndex++}`);
      values.push(filters.entry_type);
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags @> $${paramIndex++}`);
      values.push(filters.tags);
    }

    if (filters.date_from) {
      conditions.push(`entry_date >= $${paramIndex++}`);
      values.push(filters.date_from);
    }

    if (filters.date_to) {
      conditions.push(`entry_date <= $${paramIndex++}`);
      values.push(filters.date_to);
    }

    if (filters.team_id) {
      conditions.push(`team_id = $${paramIndex++}`);
      values.push(filters.team_id);
    }

    if (filters.author_id) {
      conditions.push(`author_id = $${paramIndex++}`);
      values.push(filters.author_id);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notebook_entries ${whereClause}`,
      values
    );

    const total = parseInt(countResult.rows[0].count, 10);
    const total_pages = Math.ceil(total / limit);

    // Get paginated results
    values.push(limit, offset);
    const result = await this.db.query<NotebookEntry>(
      `SELECT * FROM notebook_entries
       ${whereClause}
       ORDER BY entry_date DESC, created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
    };
  }

  /**
   * Delete an entry
   *
   * Students can only delete their own entries
   * Coaches/Admins can delete any entry
   *
   * @param entryId - Entry ID
   * @param userId - User requesting deletion
   * @param userRole - User role
   * @returns True if deleted, false if not found
   */
  async deleteEntry(
    entryId: string,
    userId: string,
    userRole: UserRole
  ): Promise<boolean> {
    // First, get the entry to check ownership
    const entry = await this.getEntryById(entryId);

    if (!entry) {
      return false;
    }

    // Check authorization
    if (userRole === UserRole.STUDENT && entry.author_id !== userId) {
      throw new Error('Not authorized to delete this entry');
    }

    // Delete the entry
    const result = await this.db.query(
      `DELETE FROM notebook_entries WHERE id = $1`,
      [entryId]
    );

    return (result.rowCount || 0) > 0;
  }

  /**
   * Search entries by content
   *
   * Case-insensitive, partial matching on title and content
   *
   * @param searchTerm - Search term
   * @param filters - Optional additional filters
   * @returns Array of matching entries
   */
  async searchEntries(
    searchTerm: string,
    filters?: {
      entry_type?: NotebookEntryType;
      author_id?: string;
      team_id?: string;
    }
  ): Promise<NotebookEntry[]> {
    const conditions: string[] = [
      `(LOWER(title) LIKE $1 OR LOWER(content) LIKE $1)`,
    ];
    const values: any[] = [`%${searchTerm.toLowerCase()}%`];
    let paramIndex = 2;

    if (filters?.entry_type) {
      conditions.push(`entry_type = $${paramIndex++}`);
      values.push(filters.entry_type);
    }

    if (filters?.author_id) {
      conditions.push(`author_id = $${paramIndex++}`);
      values.push(filters.author_id);
    }

    if (filters?.team_id) {
      conditions.push(`team_id = $${paramIndex++}`);
      values.push(filters.team_id);
    }

    const result = await this.db.query<NotebookEntry>(
      `SELECT * FROM notebook_entries
       WHERE ${conditions.join(' AND ')}
       ORDER BY entry_date DESC, created_at DESC`,
      values
    );

    return result.rows;
  }
}
