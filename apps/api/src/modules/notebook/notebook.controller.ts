import { Response } from 'express';
import { NotebookService } from './notebook.service';
import { getDatabase } from '../../config/database';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { NotebookEntryType } from '@stemlab/shared-types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Notebook Controller
 *
 * Handles HTTP requests for engineering notebook endpoints.
 * All business logic is delegated to NotebookService.
 */
export class NotebookController {
  private notebookService: NotebookService;

  constructor() {
    const db = getDatabase();
    this.notebookService = new NotebookService(db);
  }

  /**
   * Create a new notebook entry
   *
   * POST /api/v1/notebook
   *
   * @param req - Express request with validated entry data
   * @param res - Express response
   */
  async createEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const data = {
        ...req.body,
        author_id: req.user.userId,
      };

      const entry = await this.notebookService.createEntry(data);

      res.status(201).json(entry);
    } catch (error: any) {
      if (
        error.message.includes('required') ||
        error.message.includes('Invalid') ||
        error.message.includes('cannot be in the future')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      console.error('Create entry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create entry',
      });
    }
  }

  /**
   * Get a single notebook entry by ID
   *
   * GET /api/v1/notebook/:id
   *
   * @param req - Express request with entry ID
   * @param res - Express response
   */
  async getEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const entry = await this.notebookService.getEntryById(id);

      if (!entry) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Entry not found',
        });
        return;
      }

      res.status(200).json(entry);
    } catch (error: any) {
      console.error('Get entry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve entry',
      });
    }
  }

  /**
   * List notebook entries with filters
   *
   * GET /api/v1/notebook
   *
   * @param req - Express request with query filters
   * @param res - Express response
   */
  async listEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const {
        type,
        tags,
        team_id,
        date_from,
        date_to,
        page,
        limit,
      } = req.query;

      // Build filters
      const filters: any = {};

      if (type) {
        filters.entry_type = type as NotebookEntryType;
      }

      if (tags) {
        filters.tags = (tags as string).split(',').map((t) => t.trim());
      }

      if (team_id) {
        filters.team_id = team_id as string;
      }

      if (date_from) {
        filters.date_from = new Date(date_from as string);
      }

      if (date_to) {
        filters.date_to = new Date(date_to as string);
      }

      // Check if pagination is requested
      if (page || limit) {
        filters.page = page ? parseInt(page as string, 10) : 1;
        filters.limit = limit ? parseInt(limit as string, 10) : 20;

        const result = await this.notebookService.getEntriesPaginated(filters);
        res.status(200).json(result);
        return;
      }

      // If specific filters are provided, use getEntries
      if (type || tags || team_id || date_from || date_to) {
        const entries = await this.notebookService.getEntries(filters);
        res.status(200).json(entries);
        return;
      }

      // Otherwise, get entries based on user role
      const entries = await this.notebookService.getEntriesForUser(
        req.user.userId,
        req.user.role,
        team_id as string | undefined
      );

      res.status(200).json(entries);
    } catch (error: any) {
      console.error('List entries error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve entries',
      });
    }
  }

  /**
   * Update a notebook entry
   *
   * PUT /api/v1/notebook/:id
   *
   * @param req - Express request with entry ID and update data
   * @param res - Express response
   */
  async updateEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const entry = await this.notebookService.updateEntry(id, updateData);

      if (!entry) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Entry not found',
        });
        return;
      }

      res.status(200).json(entry);
    } catch (error: any) {
      console.error('Update entry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update entry',
      });
    }
  }

  /**
   * Delete a notebook entry
   *
   * DELETE /api/v1/notebook/:id
   *
   * @param req - Express request with entry ID
   * @param res - Express response
   */
  async deleteEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      const deleted = await this.notebookService.deleteEntry(
        id,
        req.user.userId,
        req.user.role
      );

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Entry not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Entry deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('Not authorized')) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message,
        });
        return;
      }

      console.error('Delete entry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete entry',
      });
    }
  }

  /**
   * Upload media file(s) to an entry
   *
   * POST /api/v1/notebook/:id/media
   *
   * @param req - Express request with uploaded files
   * @param res - Express response
   */
  async uploadMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if files were uploaded
      if (!req.file && !req.files) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No files uploaded',
        });
        return;
      }

      let entry;

      if (req.file) {
        // Single file upload
        const mediaUrl = `/uploads/notebook/${req.file.filename}`;
        entry = await this.notebookService.addMediaUrl(id, mediaUrl);
      } else if (req.files && Array.isArray(req.files)) {
        // Multiple files upload
        const mediaUrls = req.files.map(
          (file: any) => `/uploads/notebook/${file.filename}`
        );
        entry = await this.notebookService.addMediaUrls(id, mediaUrls);
      }

      res.status(200).json(entry);
    } catch (error: any) {
      console.error('Upload media error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload media',
      });
    }
  }

  /**
   * Delete a media file from an entry
   *
   * DELETE /api/v1/notebook/:id/media/:filename
   *
   * @param req - Express request with entry ID and filename
   * @param res - Express response
   */
  async deleteMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, filename } = req.params;

      // Delete from database
      const entry = await this.notebookService.removeMediaUrl(id, filename);

      // Delete physical file
      const filePath = path.join(
        process.cwd(),
        'uploads',
        'notebook',
        filename
      );

      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Failed to delete physical file:', fileError);
        // Continue even if physical file deletion fails
      }

      res.status(200).json({
        message: 'Media file deleted successfully',
        entry,
      });
    } catch (error: any) {
      console.error('Delete media error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete media file',
      });
    }
  }

  /**
   * Search notebook entries
   *
   * GET /api/v1/notebook/search?q=query
   *
   * @param req - Express request with search query
   * @param res - Express response
   */
  async searchEntries(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { q, type, author_id, team_id } = req.query;

      if (!q) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Search query (q) is required',
        });
        return;
      }

      const filters: any = {};

      if (type) {
        filters.entry_type = type as NotebookEntryType;
      }

      if (author_id) {
        filters.author_id = author_id as string;
      }

      if (team_id) {
        filters.team_id = team_id as string;
      }

      const entries = await this.notebookService.searchEntries(
        q as string,
        filters
      );

      res.status(200).json(entries);
    } catch (error: any) {
      console.error('Search entries error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search entries',
      });
    }
  }
}

// Export singleton instance
export const notebookController = new NotebookController();
