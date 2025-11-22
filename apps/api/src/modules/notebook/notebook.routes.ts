import { Router } from 'express';
import { notebookController } from './notebook.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { validateRequest } from '../auth/auth.middleware';
import {
  createNotebookEntrySchema,
  updateNotebookEntrySchema,
  searchQuerySchema,
  entryIdParamSchema,
  mediaFilenameParamSchema,
} from './notebook.validation';
import {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} from './file-upload.middleware';

/**
 * Notebook Routes
 *
 * All routes require authentication.
 * Authorization checks are performed in the service layer.
 */

const router = Router();

// Apply authentication to all notebook routes
router.use(authenticateToken);

/**
 * Search entries
 * GET /api/v1/notebook/search?q=query
 *
 * Must be defined before /:id route to avoid conflicts
 */
router.get(
  '/search',
  validateRequest(searchQuerySchema, 'query'),
  async (req, res) => {
    await notebookController.searchEntries(req, res);
  }
);

/**
 * List entries (with filters and pagination)
 * GET /api/v1/notebook
 *
 * Query params:
 * - type: Entry type filter (brainstorm, research, design, build, test, reflection, competition)
 * - tags: Comma-separated tags (AND operation)
 * - team_id: Filter by team
 * - date_from: Start date (YYYY-MM-DD)
 * - date_to: End date (YYYY-MM-DD)
 * - page: Page number (for pagination)
 * - limit: Items per page (for pagination)
 */
router.get('/', async (req, res) => {
  await notebookController.listEntries(req, res);
});

/**
 * Get single entry by ID
 * GET /api/v1/notebook/:id
 */
router.get(
  '/:id',
  validateRequest(entryIdParamSchema, 'params'),
  async (req, res) => {
    await notebookController.getEntry(req, res);
  }
);

/**
 * Create new entry
 * POST /api/v1/notebook
 *
 * Body:
 * - title: Entry title (required, 1-500 chars)
 * - content: Entry content (required, 1-50000 chars)
 * - entry_type: Type of entry (required, enum)
 * - tags: Array of tags (optional, each 1-50 chars)
 * - entry_date: Date of entry (optional, defaults to today, cannot be future)
 * - team_id: Team ID (optional, UUID)
 */
router.post(
  '/',
  validateRequest(createNotebookEntrySchema, 'body'),
  async (req, res) => {
    await notebookController.createEntry(req, res);
  }
);

/**
 * Update entry
 * PUT /api/v1/notebook/:id
 *
 * Body: Same as create, but all fields optional
 */
router.put(
  '/:id',
  validateRequest(entryIdParamSchema, 'params'),
  validateRequest(updateNotebookEntrySchema, 'body'),
  async (req, res) => {
    await notebookController.updateEntry(req, res);
  }
);

/**
 * Delete entry
 * DELETE /api/v1/notebook/:id
 *
 * Students can only delete their own entries.
 * Coaches/Admins can delete any entry.
 */
router.delete(
  '/:id',
  validateRequest(entryIdParamSchema, 'params'),
  async (req, res) => {
    await notebookController.deleteEntry(req, res);
  }
);

/**
 * Upload media file(s)
 * POST /api/v1/notebook/:id/media
 *
 * Supports:
 * - Single file: multipart/form-data with 'file' field
 * - Multiple files: multipart/form-data with 'files' field (max 5 files)
 *
 * Accepted formats: JPG, PNG, GIF, MP4, MOV, PDF
 * Max file size: 10MB per file
 */
router.post(
  '/:id/media',
  validateRequest(entryIdParamSchema, 'params'),
  (req, res, next) => {
    // Try multiple files first, fall back to single
    uploadMultiple(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }

      // If no files in array, try single file upload
      if (!req.files || (req.files as any[]).length === 0) {
        uploadSingle(req, res, (singleErr) => {
          if (singleErr) {
            return handleUploadError(singleErr, req, res, next);
          }
          next();
        });
      } else {
        next();
      }
    });
  },
  async (req, res) => {
    await notebookController.uploadMedia(req, res);
  }
);

/**
 * Delete media file
 * DELETE /api/v1/notebook/:id/media/:filename
 *
 * Removes the media file from both database and filesystem.
 */
router.delete(
  '/:id/media/:filename',
  validateRequest(mediaFilenameParamSchema, 'params'),
  async (req, res) => {
    await notebookController.deleteMedia(req, res);
  }
);

export { router as notebookRouter };
