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
 * @openapi
 * /api/v1/notebook/search:
 *   get:
 *     tags:
 *       - Notebook
 *     summary: Search notebook entries
 *     description: |
 *       Search through notebook entries using full-text search.
 *       Returns entries matching the search query in title, content, or tags.
 *       Students see only their own entries, coaches/admins see all.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *         example: "robot design"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [brainstorm, research, design, build, test, reflection, competition]
 *         description: Filter by entry type
 *         example: design
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotebookEntry'
 *             example:
 *               - id: "990e8400-e29b-41d4-a716-446655440021"
 *                 user_id: "456e7890-e89b-12d3-a456-426614174002"
 *                 title: "Robot Design Iteration 3"
 *                 content: "Today we redesigned the claw mechanism..."
 *                 entry_date: "2024-01-15"
 *                 tags: ["design", "claw", "iteration"]
 *                 created_at: "2024-01-15T14:30:00Z"
 *       400:
 *         description: Invalid search query
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * @openapi
 * /api/v1/notebook:
 *   get:
 *     tags:
 *       - Notebook
 *     summary: List notebook entries
 *     description: |
 *       Retrieve notebook entries with optional filters and pagination.
 *       Students see only their own entries, coaches/admins see all entries.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [brainstorm, research, design, build, test, reflection, competition]
 *         description: Filter by entry type
 *         example: design
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter by (AND operation)
 *         example: "design,claw"
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by team ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotebookEntry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *             example:
 *               entries:
 *                 - id: "990e8400-e29b-41d4-a716-446655440021"
 *                   user_id: "456e7890-e89b-12d3-a456-426614174002"
 *                   title: "Robot Design Iteration 3"
 *                   content: "Today we redesigned the claw mechanism..."
 *                   entry_date: "2024-01-15"
 *                   tags: ["design", "claw", "iteration"]
 *                   created_at: "2024-01-15T14:30:00Z"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 totalPages: 3
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
router.get('/', async (req, res) => {
  await notebookController.listEntries(req, res);
});

/**
 * @openapi
 * /api/v1/notebook/{id}:
 *   get:
 *     tags:
 *       - Notebook
 *     summary: Get notebook entry by ID
 *     description: |
 *       Retrieve a specific notebook entry including all media attachments.
 *       Students can only view their own entries, coaches/admins can view any entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entry unique identifier
 *         example: "990e8400-e29b-41d4-a716-446655440021"
 *     responses:
 *       200:
 *         description: Entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/NotebookEntry'
 *                 - type: object
 *                   properties:
 *                     media:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           filename:
 *                             type: string
 *                           media_type:
 *                             type: string
 *                             enum: [image, video, document]
 *                           file_size:
 *                             type: integer
 *                           url:
 *                             type: string
 *                           uploaded_at:
 *                             type: string
 *                             format: date-time
 *             example:
 *               id: "990e8400-e29b-41d4-a716-446655440021"
 *               user_id: "456e7890-e89b-12d3-a456-426614174002"
 *               title: "Robot Design Iteration 3"
 *               content: "Today we redesigned the claw mechanism..."
 *               entry_date: "2024-01-15"
 *               tags: ["design", "claw", "iteration"]
 *               created_at: "2024-01-15T14:30:00Z"
 *               media:
 *                 - id: "880e8400-e29b-41d4-a716-446655440031"
 *                   filename: "claw-design-v3.jpg"
 *                   media_type: "image"
 *                   file_size: 245678
 *                   url: "/uploads/notebook/claw-design-v3.jpg"
 *                   uploaded_at: "2024-01-15T14:35:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other student's entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entry not found
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
  '/:id',
  validateRequest(entryIdParamSchema, 'params'),
  async (req, res) => {
    await notebookController.getEntry(req, res);
  }
);

/**
 * @openapi
 * /api/v1/notebook:
 *   post:
 *     tags:
 *       - Notebook
 *     summary: Create notebook entry
 *     description: |
 *       Create a new notebook entry.
 *       All authenticated users can create entries.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - entry_type
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Entry title
 *                 example: "Competition Strategy Meeting"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50000
 *                 description: Entry content (supports markdown)
 *                 example: "## Meeting Notes\n\nWe discussed our strategy for the upcoming competition..."
 *               entry_type:
 *                 type: string
 *                 enum: [brainstorm, research, design, build, test, reflection, competition]
 *                 description: Type of entry
 *                 example: "design"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   maxLength: 50
 *                 maxItems: 10
 *                 description: Tags for categorization
 *                 example: ["strategy", "competition", "teamwork"]
 *               entry_date:
 *                 type: string
 *                 format: date
 *                 description: Date of the entry (defaults to today, cannot be future)
 *                 example: "2024-01-15"
 *               team_id:
 *                 type: string
 *                 format: uuid
 *                 description: Associated team ID (optional)
 *     responses:
 *       201:
 *         description: Entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotebookEntry'
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateRequest(createNotebookEntrySchema, 'body'),
  async (req, res) => {
    await notebookController.createEntry(req, res);
  }
);

/**
 * @openapi
 * /api/v1/notebook/{id}:
 *   put:
 *     tags:
 *       - Notebook
 *     summary: Update notebook entry
 *     description: |
 *       Update an existing notebook entry.
 *       Students can only update their own entries, coaches/admins can update any entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entry unique identifier
 *         example: "990e8400-e29b-41d4-a716-446655440021"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50000
 *               entry_type:
 *                 type: string
 *                 enum: [brainstorm, research, design, build, test, reflection, competition]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 1
 *                   maxLength: 50
 *                 maxItems: 10
 *               entry_date:
 *                 type: string
 *                 format: date
 *               team_id:
 *                 type: string
 *                 format: uuid
 *             example:
 *               title: "Competition Strategy Meeting - Updated"
 *               tags: ["strategy", "competition", "teamwork", "finals"]
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotebookEntry'
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
 *         description: Forbidden - Cannot update other student's entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entry not found
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
  validateRequest(entryIdParamSchema, 'params'),
  validateRequest(updateNotebookEntrySchema, 'body'),
  async (req, res) => {
    await notebookController.updateEntry(req, res);
  }
);

/**
 * @openapi
 * /api/v1/notebook/{id}:
 *   delete:
 *     tags:
 *       - Notebook
 *     summary: Delete notebook entry
 *     description: |
 *       Delete a notebook entry and all associated media files.
 *       Students can only delete their own entries, coaches/admins can delete any entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entry unique identifier
 *         example: "990e8400-e29b-41d4-a716-446655440021"
 *     responses:
 *       204:
 *         description: Entry deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot delete other student's entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entry not found
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
  validateRequest(entryIdParamSchema, 'params'),
  async (req, res) => {
    await notebookController.deleteEntry(req, res);
  }
);

/**
 * @openapi
 * /api/v1/notebook/{id}/media:
 *   post:
 *     tags:
 *       - Notebook
 *     summary: Upload media to entry
 *     description: |
 *       Upload one or more media files to a notebook entry.
 *       Students can only upload to their own entries, coaches/admins can upload to any entry.
 *
 *       **Supported formats:** JPG, PNG, GIF, MP4, MOV, PDF
 *       **Max file size:** 10MB per file
 *       **Max files:** 5 files per upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entry unique identifier
 *         example: "990e8400-e29b-41d4-a716-446655440021"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Single file upload
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Multiple files upload (max 5)
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Media uploaded successfully"
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       filename:
 *                         type: string
 *                       media_type:
 *                         type: string
 *                         enum: [image, video, document]
 *                       file_size:
 *                         type: integer
 *                       url:
 *                         type: string
 *             example:
 *               message: "Media uploaded successfully"
 *               files:
 *                 - id: "880e8400-e29b-41d4-a716-446655440031"
 *                   filename: "robot-design.jpg"
 *                   media_type: "image"
 *                   file_size: 245678
 *                   url: "/uploads/notebook/robot-design.jpg"
 *       400:
 *         description: Invalid file format or size exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_format:
 *                 value:
 *                   error: "INVALID_FILE_FORMAT"
 *                   message: "File type not supported. Allowed: JPG, PNG, GIF, MP4, MOV, PDF"
 *               size_exceeded:
 *                 value:
 *                   error: "FILE_SIZE_EXCEEDED"
 *                   message: "File size exceeds 10MB limit"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot upload to other student's entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entry not found
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
 * @openapi
 * /api/v1/notebook/{id}/media/{filename}:
 *   delete:
 *     tags:
 *       - Notebook
 *     summary: Delete media from entry
 *     description: |
 *       Remove a media file from a notebook entry.
 *       Deletes both the database record and the physical file.
 *       Students can only delete media from their own entries, coaches/admins can delete from any entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Entry unique identifier
 *         example: "990e8400-e29b-41d4-a716-446655440021"
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename of the media to delete
 *         example: "robot-design.jpg"
 *     responses:
 *       204:
 *         description: Media deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot delete media from other student's entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entry or media file not found
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
  '/:id/media/:filename',
  validateRequest(mediaFilenameParamSchema, 'params'),
  async (req, res) => {
    await notebookController.deleteMedia(req, res);
  }
);

export { router as notebookRouter };