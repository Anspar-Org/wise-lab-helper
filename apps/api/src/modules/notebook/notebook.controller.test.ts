import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';
import { NotebookEntryType, UserRole } from '@stemlab/shared-types';

// Mock the database and service
vi.mock('../../config/database');
vi.mock('./notebook.service');

describe('NotebookController', () => {
  let controller: NotebookController;
  let mockService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;

  beforeEach(() => {
    // Mock NotebookService
    mockService = {
      createEntry: vi.fn(),
      updateEntry: vi.fn(),
      getEntryById: vi.fn(),
      getEntriesForUser: vi.fn(),
      getEntriesPaginated: vi.fn(),
      deleteEntry: vi.fn(),
      addMediaUrl: vi.fn(),
      addMediaUrls: vi.fn(),
      removeMediaUrl: vi.fn(),
      searchEntries: vi.fn(),
      getEntries: vi.fn(),
    };

    // Create controller with mocked service
    controller = new NotebookController();
    (controller as any).notebookService = mockService;

    // Mock Express request and response
    responseData = null;
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'user-123',
        username: 'testuser',
        role: UserRole.STUDENT,
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createEntry', () => {
    it('should create entry successfully', async () => {
      const entryData = {
        title: 'Robot Design',
        content: 'We designed our robot today.',
        entry_type: NotebookEntryType.DESIGN,
        tags: ['robot', 'chassis'],
      };

      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        ...entryData,
        entry_date: new Date(),
        media_urls: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.body = entryData;
      mockService.createEntry.mockResolvedValueOnce(mockEntry);

      await controller.createEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntry);
      expect(mockService.createEntry).toHaveBeenCalledWith({
        ...entryData,
        author_id: 'user-123',
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        title: 'Test',
        // Missing required fields
      };

      mockService.createEntry.mockRejectedValueOnce(
        new Error('Content is required')
      );

      await controller.createEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.error).toBe('Bad Request');
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BRAINSTORM,
      };

      mockService.createEntry.mockRejectedValueOnce(
        new Error('Database error')
      );

      await controller.createEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData.error).toBe('Internal Server Error');
    });
  });

  describe('getEntry', () => {
    it('should return entry by ID', async () => {
      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.DESIGN,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.params = { id: 'entry-123' };
      mockService.getEntryById.mockResolvedValueOnce(mockEntry);

      await controller.getEntry(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntry);
    });

    it('should return 404 if entry not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockService.getEntryById.mockResolvedValueOnce(null);

      await controller.getEntry(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseData.error).toBe('Not Found');
    });
  });

  describe('listEntries', () => {
    it('should list entries for student (own + team)', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'My Entry',
          content: 'Content',
          entry_type: NotebookEntryType.BRAINSTORM,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockRequest.query = {};
      mockService.getEntriesForUser.mockResolvedValueOnce(mockEntries);

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntries);
    });

    it('should filter by entry_type', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Design Entry',
          content: 'Content',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockRequest.query = { type: 'design' };
      mockService.getEntries.mockResolvedValueOnce(mockEntries);

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          entry_type: NotebookEntryType.DESIGN,
        })
      );
    });

    it('should filter by tags', async () => {
      mockRequest.query = { tags: 'robot,autonomous' };
      mockService.getEntries.mockResolvedValueOnce([]);

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['robot', 'autonomous'],
        })
      );
    });

    it('should filter by date range', async () => {
      mockRequest.query = {
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };
      mockService.getEntries.mockResolvedValueOnce([]);

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          date_from: expect.any(Date),
          date_to: expect.any(Date),
        })
      );
    });

    it('should paginate results', async () => {
      mockRequest.query = { page: '2', limit: '10' };

      const mockPaginatedResponse = {
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          total_pages: 3,
        },
      };

      mockService.getEntriesPaginated.mockResolvedValueOnce(
        mockPaginatedResponse
      );

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockPaginatedResponse);
    });
  });

  describe('updateEntry', () => {
    it('should update entry successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        ...updateData,
        entry_type: NotebookEntryType.DESIGN,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.params = { id: 'entry-123' };
      mockRequest.body = updateData;
      mockService.updateEntry.mockResolvedValueOnce(mockEntry);

      await controller.updateEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntry);
    });

    it('should return 404 if entry not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { title: 'Updated' };
      mockService.updateEntry.mockResolvedValueOnce(null);

      await controller.updateEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry successfully', async () => {
      mockRequest.params = { id: 'entry-123' };
      mockService.deleteEntry.mockResolvedValueOnce(true);

      await controller.deleteEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.message).toContain('deleted');
    });

    it('should return 404 if entry not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockService.deleteEntry.mockResolvedValueOnce(false);

      await controller.deleteEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not authorized', async () => {
      mockRequest.params = { id: 'entry-123' };
      mockService.deleteEntry.mockRejectedValueOnce(
        new Error('Not authorized to delete this entry')
      );

      await controller.deleteEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('uploadMedia', () => {
    it('should upload single file', async () => {
      mockRequest.params = { id: 'entry-123' };
      mockRequest.file = {
        filename: 'abc123-image.jpg',
        path: '/uploads/notebook/abc123-image.jpg',
      } as any;

      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: ['/uploads/notebook/abc123-image.jpg'],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.addMediaUrl.mockResolvedValueOnce(mockEntry);

      await controller.uploadMedia(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntry);
    });

    it('should upload multiple files', async () => {
      mockRequest.params = { id: 'entry-123' };
      mockRequest.files = [
        { filename: 'file1.jpg' },
        { filename: 'file2.mp4' },
      ] as any;

      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: [
          '/uploads/notebook/file1.jpg',
          '/uploads/notebook/file2.mp4',
        ],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.addMediaUrls.mockResolvedValueOnce(mockEntry);

      await controller.uploadMedia(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if no files uploaded', async () => {
      mockRequest.params = { id: 'entry-123' };
      // No files

      await controller.uploadMedia(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteMedia', () => {
    it('should delete media file successfully', async () => {
      mockRequest.params = { id: 'entry-123', filename: 'abc123-image.jpg' };

      const mockEntry = {
        id: 'entry-123',
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.removeMediaUrl.mockResolvedValueOnce(mockEntry);

      await controller.deleteMedia(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.message).toContain('deleted');
    });
  });

  describe('searchEntries', () => {
    it('should search entries by query', async () => {
      mockRequest.query = { q: 'robot' };

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Robot Design',
          content: 'We designed our robot.',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockService.searchEntries.mockResolvedValueOnce(mockEntries);

      await controller.searchEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEntries);
      expect(mockService.searchEntries).toHaveBeenCalledWith('robot', {});
    });

    it('should return 400 if query is missing', async () => {
      mockRequest.query = {};

      await controller.searchEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should search with additional filters', async () => {
      mockRequest.query = { q: 'robot', type: 'design' };
      mockService.searchEntries.mockResolvedValueOnce([]);

      await controller.searchEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockService.searchEntries).toHaveBeenCalledWith('robot', {
        entry_type: NotebookEntryType.DESIGN,
      });
    });
  });

  describe('Authorization', () => {
    it('should require authentication', async () => {
      mockRequest.user = undefined;

      await controller.createEntry(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should allow coaches to access all entries', async () => {
      mockRequest.user = {
        userId: 'coach-123',
        username: 'coach',
        role: UserRole.COACH,
      };

      mockService.getEntriesForUser.mockResolvedValueOnce([]);

      await controller.listEntries(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockService.getEntriesForUser).toHaveBeenCalledWith(
        'coach-123',
        UserRole.COACH,
        undefined
      );
    });
  });
});
