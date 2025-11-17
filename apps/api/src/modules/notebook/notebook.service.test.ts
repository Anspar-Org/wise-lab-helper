import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NotebookService } from './notebook.service';
import { DatabaseService } from '../../config/database';
import { NotebookEntryType, UserRole } from '@stemlab/shared-types';

// Mock the database service
vi.mock('../../config/database');

describe('NotebookService', () => {
  let notebookService: NotebookService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    notebookService = new NotebookService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createEntry', () => {
    it('should create entry with valid data', async () => {
      const entryData = {
        author_id: 'user-123',
        title: 'Robot Design Session',
        content: 'Today we designed the chassis for our robot.',
        entry_type: NotebookEntryType.DESIGN,
        tags: ['robot', 'chassis'],
        team_id: 'team-456',
      };

      const mockEntry = {
        id: 'entry-789',
        ...entryData,
        entry_date: new Date('2024-01-15'),
        media_urls: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.createEntry(entryData);

      expect(result).toEqual(mockEntry);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO notebook_entries');
      expect(queryCall[1]).toContain(entryData.author_id);
      expect(queryCall[1]).toContain(entryData.title);
      expect(queryCall[1]).toContain(entryData.content);
    });

    it('should set entry_date to current date if not provided', async () => {
      const entryData = {
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BRAINSTORM,
      };

      const mockEntry = {
        id: 'entry-123',
        ...entryData,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      await notebookService.createEntry(entryData);

      const queryCall = mockDb.query.mock.calls[0];
      // Verify CURRENT_DATE is used in query or entry_date is set
      expect(queryCall[0]).toContain('INSERT INTO notebook_entries');
    });

    it('should validate entry_type enum', async () => {
      const entryData = {
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: 'invalid_type' as any,
      };

      await expect(notebookService.createEntry(entryData)).rejects.toThrow();
    });

    it('should store tags as array', async () => {
      const entryData = {
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BUILD,
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const mockEntry = {
        id: 'entry-123',
        ...entryData,
        entry_date: new Date(),
        media_urls: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      await notebookService.createEntry(entryData);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[1]).toContainEqual(entryData.tags);
    });

    it('should allow team_id to be null', async () => {
      const entryData = {
        author_id: 'user-123',
        title: 'Personal Entry',
        content: 'My individual notes',
        entry_type: NotebookEntryType.REFLECTION,
        team_id: null,
      };

      const mockEntry = {
        id: 'entry-123',
        ...entryData,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.createEntry(entryData);

      expect(result.team_id).toBeNull();
    });

    it('should accept custom entry_date', async () => {
      const customDate = new Date('2024-01-10');
      const entryData = {
        author_id: 'user-123',
        title: 'Past Entry',
        content: 'Entry from last week',
        entry_type: NotebookEntryType.TEST,
        entry_date: customDate,
      };

      const mockEntry = {
        id: 'entry-123',
        ...entryData,
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.createEntry(entryData);

      expect(result.entry_date).toEqual(customDate);
    });

    it('should reject future entry_date', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days in future
      const entryData = {
        author_id: 'user-123',
        title: 'Future Entry',
        content: 'This should fail',
        entry_type: NotebookEntryType.BRAINSTORM,
        entry_date: futureDate,
      };

      await expect(notebookService.createEntry(entryData)).rejects.toThrow(
        'Entry date cannot be in the future'
      );
    });
  });

  describe('updateEntry', () => {
    it('should update entry content', async () => {
      const entryId = 'entry-123';
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        ...updateData,
        entry_type: NotebookEntryType.DESIGN,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.updateEntry(entryId, updateData);

      expect(result.title).toBe(updateData.title);
      expect(result.content).toBe(updateData.content);
    });

    it('should update tags', async () => {
      const entryId = 'entry-123';
      const updateData = {
        tags: ['new-tag1', 'new-tag2'],
      };

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: [],
        ...updateData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.updateEntry(entryId, updateData);

      expect(result.tags).toEqual(updateData.tags);
    });

    it('should not allow changing author_id', async () => {
      const entryId = 'entry-123';
      const updateData = {
        author_id: 'different-user',
        title: 'Updated Title',
      } as any;

      // The service should ignore author_id in updates
      const mockEntry = {
        id: entryId,
        author_id: 'user-123', // Original author
        title: updateData.title,
        content: 'Test content',
        entry_type: NotebookEntryType.DESIGN,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.updateEntry(entryId, updateData);

      expect(result.author_id).toBe('user-123'); // Should remain original author
    });

    it('should update updated_at timestamp', async () => {
      const entryId = 'entry-123';
      const updateData = {
        content: 'Updated content',
      };

      const now = new Date();
      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: updateData.content,
        entry_type: NotebookEntryType.RESEARCH,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(Date.now() - 86400000),
        updated_at: now,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.updateEntry(entryId, updateData);

      expect(result.updated_at.getTime()).toBeGreaterThan(
        result.created_at.getTime()
      );
    });

    it('should return null if entry not found', async () => {
      const entryId = 'nonexistent';
      const updateData = {
        title: 'Updated Title',
      };

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await notebookService.updateEntry(entryId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('uploadMedia', () => {
    it('should add media URL to media_urls array', async () => {
      const entryId = 'entry-123';
      const mediaUrl = '/uploads/notebook/abc123-image.jpg';

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: [mediaUrl],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.addMediaUrl(entryId, mediaUrl);

      expect(result.media_urls).toContain(mediaUrl);
    });

    it('should support multiple media files', async () => {
      const entryId = 'entry-123';
      const mediaUrls = [
        '/uploads/notebook/file1.jpg',
        '/uploads/notebook/file2.mp4',
        '/uploads/notebook/file3.pdf',
      ];

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.COMPETITION,
        entry_date: new Date(),
        media_urls: mediaUrls,
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.addMediaUrls(entryId, mediaUrls);

      expect(result.media_urls).toEqual(mediaUrls);
      expect(result.media_urls.length).toBe(3);
    });

    it('should generate accessible URLs', async () => {
      const entryId = 'entry-123';
      const mediaUrl = '/uploads/notebook/test-file.jpg';

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.DESIGN,
        entry_date: new Date(),
        media_urls: [mediaUrl],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.addMediaUrl(entryId, mediaUrl);

      expect(result.media_urls[0]).toMatch(/^\/uploads\/notebook\/.+/);
    });
  });

  describe('getEntries', () => {
    it('should filter by entry_type', async () => {
      const filters = {
        entry_type: NotebookEntryType.DESIGN,
      };

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Design 1',
          content: 'Design content 1',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'entry-2',
          author_id: 'user-123',
          title: 'Design 2',
          content: 'Design content 2',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntries(filters);

      expect(result.every((e) => e.entry_type === NotebookEntryType.DESIGN)).toBe(
        true
      );
    });

    it('should filter by tags (AND operation)', async () => {
      const filters = {
        tags: ['robot', 'autonomous'],
      };

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Robot Entry',
          content: 'Content',
          entry_type: NotebookEntryType.BUILD,
          entry_date: new Date(),
          media_urls: [],
          tags: ['robot', 'autonomous', 'programming'],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntries(filters);

      expect(result.length).toBeGreaterThanOrEqual(0);
      // All results should contain ALL specified tags
      result.forEach((entry) => {
        filters.tags.forEach((tag) => {
          expect(entry.tags).toContain(tag);
        });
      });
    });

    it('should filter by date range', async () => {
      const filters = {
        date_from: new Date('2024-01-01'),
        date_to: new Date('2024-01-31'),
      };

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'January Entry',
          content: 'Content',
          entry_type: NotebookEntryType.RESEARCH,
          entry_date: new Date('2024-01-15'),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntries(filters);

      result.forEach((entry) => {
        expect(entry.entry_date.getTime()).toBeGreaterThanOrEqual(
          filters.date_from.getTime()
        );
        expect(entry.entry_date.getTime()).toBeLessThanOrEqual(
          filters.date_to.getTime()
        );
      });
    });

    it('should filter by team_id', async () => {
      const filters = {
        team_id: 'team-456',
      };

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          team_id: 'team-456',
          title: 'Team Entry',
          content: 'Content',
          entry_type: NotebookEntryType.BUILD,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntries(filters);

      expect(result.every((e) => e.team_id === 'team-456')).toBe(true);
    });

    it('should return own + team entries for students', async () => {
      const userId = 'user-123';
      const teamId = 'team-456';
      const userRole = UserRole.STUDENT;

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          team_id: null,
          title: 'My Entry',
          content: 'Content',
          entry_type: NotebookEntryType.BRAINSTORM,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'entry-2',
          author_id: 'user-456',
          team_id: 'team-456',
          title: 'Team Entry',
          content: 'Content',
          entry_type: NotebookEntryType.BUILD,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntriesForUser(
        userId,
        userRole,
        teamId
      );

      expect(result.length).toBe(2);
      // Should include both own entries and team entries
      expect(
        result.some((e) => e.author_id === userId && e.team_id === null)
      ).toBe(true);
      expect(result.some((e) => e.team_id === teamId)).toBe(true);
    });

    it('should return all entries for coaches', async () => {
      const userId = 'coach-123';
      const userRole = UserRole.COACH;

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          team_id: null,
          title: 'Student Entry 1',
          content: 'Content',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'entry-2',
          author_id: 'user-456',
          team_id: 'team-456',
          title: 'Student Entry 2',
          content: 'Content',
          entry_type: NotebookEntryType.BUILD,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntriesForUser(userId, userRole);

      expect(result.length).toBe(2);
      // Coaches should see all entries
    });

    it('should paginate results', async () => {
      const filters = {
        page: 2,
        limit: 10,
      };

      const mockEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `entry-${i}`,
        author_id: 'user-123',
        title: `Entry ${i}`,
        content: 'Content',
        entry_type: NotebookEntryType.BRAINSTORM,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      }));

      // First query gets the count, second query gets the paginated results
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '25' }] });
      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.getEntriesPaginated(filters);

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.total_pages).toBe(3);
    });
  });

  describe('deleteEntry', () => {
    it('should allow author to delete own entry', async () => {
      const entryId = 'entry-123';
      const userId = 'user-123';

      // First query: get entry to verify ownership
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: entryId,
            author_id: userId,
            title: 'My Entry',
            content: 'Content',
            entry_type: NotebookEntryType.BRAINSTORM,
            entry_date: new Date(),
            media_urls: [],
            tags: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Second query: delete entry
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await notebookService.deleteEntry(
        entryId,
        userId,
        UserRole.STUDENT
      );

      expect(result).toBe(true);
    });

    it('should allow coach to delete any entry', async () => {
      const entryId = 'entry-123';
      const coachId = 'coach-456';

      // First query: get entry
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: entryId,
            author_id: 'user-123',
            title: 'Student Entry',
            content: 'Content',
            entry_type: NotebookEntryType.BUILD,
            entry_date: new Date(),
            media_urls: [],
            tags: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Second query: delete entry
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await notebookService.deleteEntry(
        entryId,
        coachId,
        UserRole.COACH
      );

      expect(result).toBe(true);
    });

    it('should not allow students to delete others entries', async () => {
      const entryId = 'entry-123';
      const differentUserId = 'user-456';

      // First query: get entry
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: entryId,
            author_id: 'user-123', // Different from requester
            title: 'Other Student Entry',
            content: 'Content',
            entry_type: NotebookEntryType.DESIGN,
            entry_date: new Date(),
            media_urls: [],
            tags: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      await expect(
        notebookService.deleteEntry(entryId, differentUserId, UserRole.STUDENT)
      ).rejects.toThrow('Not authorized to delete this entry');
    });

    it('should return false if entry not found', async () => {
      const entryId = 'nonexistent';
      const userId = 'user-123';

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await notebookService.deleteEntry(
        entryId,
        userId,
        UserRole.STUDENT
      );

      expect(result).toBe(false);
    });
  });

  describe('searchContent', () => {
    it('should search in title and content', async () => {
      const searchTerm = 'robot';

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Robot Design',
          content: 'We designed our robot today.',
          entry_type: NotebookEntryType.DESIGN,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.searchEntries(searchTerm);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((entry) => {
        const hasInTitle = entry.title.toLowerCase().includes(searchTerm);
        const hasInContent = entry.content.toLowerCase().includes(searchTerm);
        expect(hasInTitle || hasInContent).toBe(true);
      });
    });

    it('should be case-insensitive', async () => {
      const searchTerm = 'ROBOT';

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'robot design',
          content: 'Our robot is awesome.',
          entry_type: NotebookEntryType.BUILD,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.searchEntries(searchTerm);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should support partial matching', async () => {
      const searchTerm = 'rob';

      const mockEntries = [
        {
          id: 'entry-1',
          author_id: 'user-123',
          title: 'Robot Testing',
          content: 'We tested our robot.',
          entry_type: NotebookEntryType.TEST,
          entry_date: new Date(),
          media_urls: [],
          tags: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockEntries });

      const result = await notebookService.searchEntries(searchTerm);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array if no matches', async () => {
      const searchTerm = 'nonexistent';

      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await notebookService.searchEntries(searchTerm);

      expect(result).toEqual([]);
    });
  });

  describe('getEntryById', () => {
    it('should return entry by ID', async () => {
      const entryId = 'entry-123';

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BRAINSTORM,
        entry_date: new Date(),
        media_urls: [],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.getEntryById(entryId);

      expect(result).toEqual(mockEntry);
    });

    it('should return null if entry not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await notebookService.getEntryById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('removeMediaUrl', () => {
    it('should remove specific media URL from entry', async () => {
      const entryId = 'entry-123';
      const filename = 'abc123-image.jpg';

      const mockEntry = {
        id: entryId,
        author_id: 'user-123',
        title: 'Test Entry',
        content: 'Test content',
        entry_type: NotebookEntryType.BUILD,
        entry_date: new Date(),
        media_urls: ['/uploads/notebook/xyz456-video.mp4'],
        tags: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockEntry] });

      const result = await notebookService.removeMediaUrl(entryId, filename);

      expect(result.media_urls).not.toContain(
        `/uploads/notebook/${filename}`
      );
    });
  });
});
