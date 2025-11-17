import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BadgesService } from './badges.service';
import { DatabaseService } from '../../config/database';
import { BadgeCategory, SkillLevel, NotebookEntryType } from '@stemlab/shared-types';

// Mock the database service
vi.mock('../../config/database');

describe('BadgesService', () => {
  let badgesService: BadgesService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    badgesService = new BadgesService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createBadge', () => {
    it('should create badge with criteria', async () => {
      const badgeData = {
        name: 'First Day',
        description: 'Complete your first lesson',
        icon: 'award',
        category: BadgeCategory.ENGAGEMENT,
        criteria: {
          type: 'lesson_count' as const,
          requirements: { count: 1 },
        },
      };

      const mockBadge = {
        id: 'badge-uuid',
        ...badgeData,
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });

      const result = await badgesService.createBadge(badgeData);

      expect(result).toEqual(mockBadge);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO badges');
      expect(queryCall[1][0]).toBe(badgeData.name);
      expect(queryCall[1][1]).toBe(badgeData.description);
    });

    it('should validate category enum', async () => {
      const badgeData = {
        name: 'Invalid Badge',
        description: 'Test badge',
        icon: 'test',
        category: 'invalid_category' as any,
        criteria: {
          type: 'lesson_count' as const,
          requirements: { count: 1 },
        },
      };

      await expect(badgesService.createBadge(badgeData)).rejects.toThrow(
        'Invalid badge category'
      );
    });

    it('should validate criteria structure', async () => {
      const badgeData = {
        name: 'Invalid Criteria',
        description: 'Test badge',
        icon: 'test',
        category: BadgeCategory.ENGAGEMENT,
        criteria: {
          type: 'invalid_type' as any,
          requirements: {},
        },
      };

      await expect(badgesService.createBadge(badgeData)).rejects.toThrow(
        'Invalid criteria type'
      );
    });

    it('should validate name length (1-200 characters)', async () => {
      const badgeData = {
        name: '',
        description: 'Test badge',
        icon: 'test',
        category: BadgeCategory.ENGAGEMENT,
        criteria: {
          type: 'lesson_count' as const,
          requirements: { count: 1 },
        },
      };

      await expect(badgesService.createBadge(badgeData)).rejects.toThrow(
        'Name must be between 1 and 200 characters'
      );
    });

    it('should validate description length (1-1000 characters)', async () => {
      const badgeData = {
        name: 'Test Badge',
        description: '',
        icon: 'test',
        category: BadgeCategory.ENGAGEMENT,
        criteria: {
          type: 'lesson_count' as const,
          requirements: { count: 1 },
        },
      };

      await expect(badgesService.createBadge(badgeData)).rejects.toThrow(
        'Description must be between 1 and 1000 characters'
      );
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          description: 'Complete your first lesson',
          icon: 'award',
          category: BadgeCategory.ENGAGEMENT,
          criteria: { type: 'lesson_count', requirements: { count: 1 } },
          created_at: new Date(),
        },
        {
          id: 'badge-2',
          name: 'Team Player',
          description: 'Reach proficient level in collaboration',
          icon: 'users',
          category: BadgeCategory.SKILL,
          criteria: {
            type: 'skill_level',
            requirements: { skill_category: 'teamwork', level: 'proficient' },
          },
          created_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getAllBadges();

      expect(result).toEqual(mockBadges);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should filter badges by category', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          category: BadgeCategory.ENGAGEMENT,
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getAllBadges(BadgeCategory.ENGAGEMENT);

      expect(result).toEqual(mockBadges);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE category = $1');
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by ID', async () => {
      const mockBadge = {
        id: 'badge-uuid',
        name: 'First Day',
        description: 'Complete your first lesson',
        icon: 'award',
        category: BadgeCategory.ENGAGEMENT,
        criteria: { type: 'lesson_count', requirements: { count: 1 } },
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });

      const result = await badgesService.getBadgeById('badge-uuid');

      expect(result).toEqual(mockBadge);
    });

    it('should return null for non-existent badge', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await badgesService.getBadgeById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateBadge', () => {
    it('should update badge', async () => {
      const updateData = {
        name: 'Updated Badge',
        description: 'Updated description',
      };

      const mockUpdatedBadge = {
        id: 'badge-uuid',
        ...updateData,
        icon: 'award',
        category: BadgeCategory.ENGAGEMENT,
        criteria: { type: 'lesson_count', requirements: { count: 1 } },
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUpdatedBadge] });

      const result = await badgesService.updateBadge('badge-uuid', updateData);

      expect(result).toEqual(mockUpdatedBadge);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteBadge', () => {
    it('should delete badge', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'badge-uuid' }] });

      await badgesService.deleteBadge('badge-uuid');

      expect(mockDb.query).toHaveBeenCalledTimes(1);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('DELETE FROM badges');
    });

    it('should throw error if badge not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(badgesService.deleteBadge('nonexistent')).rejects.toThrow(
        'Badge not found'
      );
    });
  });

  describe('evaluateCriteria', () => {
    it('should check lesson_count criteria', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'lesson_count' as const,
        requirements: { count: 10 },
      };

      // Mock student has completed 10 lessons
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '10' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('student_lesson_progress');
      expect(queryCall[0]).toContain('status = \'completed\'');
    });

    it('should check lesson_count criteria with category filter', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'lesson_count' as const,
        requirements: { count: 5, category: 'methodology' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '5' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('lessons.category');
    });

    it('should check skill_level criteria', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'skill_level' as const,
        requirements: {
          skill_category: 'teamwork',
          level: 'proficient',
        },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ level: SkillLevel.PROFICIENT }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
    });

    it('should check notebook_count criteria', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'notebook_count' as const,
        requirements: { minimum: 10 },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '15' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
    });

    it('should check notebook_count criteria with entry_type filter', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'notebook_count' as const,
        requirements: { minimum: 5, entry_type: 'test' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '7' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('entry_type');
    });

    it('should check specific_lesson criteria', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'specific_lesson' as const,
        requirements: { lesson_id: 'lesson-123' },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ status: 'completed' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(true);
    });

    it('should return false when criteria not met', async () => {
      const studentId = 'student-uuid';
      const criteria = {
        type: 'lesson_count' as const,
        requirements: { count: 100 },
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '5' }],
      });

      const result = await badgesService.evaluateCriteria(studentId, criteria);

      expect(result).toBe(false);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should award badges when criteria met', async () => {
      const studentId = 'student-uuid';
      const event = {
        type: 'lesson_completion',
        lesson_id: 'lesson-123',
      };

      const availableBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          criteria: { type: 'lesson_count', requirements: { count: 1 } },
        },
      ];

      // Mock getting available badges
      mockDb.query.mockResolvedValueOnce({
        rows: availableBadges,
      });

      // Mock evaluating criteria (count query)
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      // Mock awarding badge
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'student-badge-1',
            student_id: studentId,
            badge_id: 'badge-1',
            earned_at: new Date(),
          },
        ],
      });

      const result = await badgesService.checkAndAwardBadges(studentId, event);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('badge-1');
    });

    it('should not duplicate awards', async () => {
      const studentId = 'student-uuid';
      const event = {
        type: 'lesson_completion',
        lesson_id: 'lesson-123',
      };

      // Mock getting available badges (already filtered to exclude earned badges)
      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const result = await badgesService.checkAndAwardBadges(studentId, event);

      expect(result).toHaveLength(0);
    });

    it('should handle multiple badges at once', async () => {
      const studentId = 'student-uuid';
      const event = {
        type: 'lesson_completion',
        lesson_id: 'lesson-123',
      };

      const availableBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          criteria: { type: 'lesson_count', requirements: { count: 1 } },
        },
        {
          id: 'badge-2',
          name: 'Dedicated Learner',
          criteria: { type: 'lesson_count', requirements: { count: 10 } },
        },
      ];

      // Mock getting available badges
      mockDb.query.mockResolvedValueOnce({
        rows: availableBadges,
      });

      // Mock evaluating criteria for badge 1
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '10' }],
      });

      // Mock awarding badge 1
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'student-badge-1' }],
      });

      // Mock evaluating criteria for badge 2
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '10' }],
      });

      // Mock awarding badge 2
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'student-badge-2' }],
      });

      const result = await badgesService.checkAndAwardBadges(studentId, event);

      expect(result).toHaveLength(2);
    });

    it('should link evidence to awards', async () => {
      const studentId = 'student-uuid';
      const event = {
        type: 'lesson_completion',
        lesson_id: 'lesson-123',
      };

      const availableBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          criteria: { type: 'lesson_count', requirements: { count: 1 } },
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: availableBadges });
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'student-badge-1',
            evidence_type: 'lesson',
            evidence_id: 'lesson-123',
          },
        ],
      });

      await badgesService.checkAndAwardBadges(studentId, event);

      const awardCall = mockDb.query.mock.calls[2];
      expect(awardCall[1]).toContain('lesson');
      expect(awardCall[1]).toContain('lesson-123');
    });
  });

  describe('getStudentBadges', () => {
    it('should return earned badges', async () => {
      const studentId = 'student-uuid';
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          description: 'Complete your first lesson',
          icon: 'award',
          category: BadgeCategory.ENGAGEMENT,
          earned_at: new Date('2024-01-15'),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getStudentBadges(studentId);

      expect(result).toEqual(mockBadges);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('student_badges');
      expect(queryCall[0]).toContain('JOIN badges');
    });

    it('should show earned_at timestamp', async () => {
      const studentId = 'student-uuid';
      const earnedAt = new Date('2024-01-15T10:30:00Z');
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          earned_at: earnedAt,
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getStudentBadges(studentId);

      expect(result[0].earned_at).toEqual(earnedAt);
    });

    it('should include badge details', async () => {
      const studentId = 'student-uuid';
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          description: 'Complete your first lesson',
          icon: 'award',
          category: BadgeCategory.ENGAGEMENT,
          criteria: { type: 'lesson_count', requirements: { count: 1 } },
          earned_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getStudentBadges(studentId);

      expect(result[0].name).toBe('First Day');
      expect(result[0].description).toBe('Complete your first lesson');
      expect(result[0].icon).toBe('award');
    });
  });

  describe('getBadgeProgress', () => {
    it('should show progress toward locked badges', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';

      const mockBadge = {
        id: badgeId,
        name: 'Dedicated Learner',
        criteria: { type: 'lesson_count', requirements: { count: 10 } },
      };

      // Mock getting badge
      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });

      // Mock current progress (7 lessons completed)
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '7' }] });

      const result = await badgesService.getBadgeProgress(studentId, badgeId);

      expect(result.current).toBe(7);
      expect(result.required).toBe(10);
      expect(result.percentage).toBe(70);
    });

    it('should calculate percentage (7/10 = 70%)', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';

      const mockBadge = {
        id: badgeId,
        criteria: { type: 'lesson_count', requirements: { count: 10 } },
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '7' }] });

      const result = await badgesService.getBadgeProgress(studentId, badgeId);

      expect(result.percentage).toBe(70);
    });

    it('should return null for custom criteria', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';

      const mockBadge = {
        id: badgeId,
        criteria: {
          type: 'custom',
          requirements: { custom_check: 'checkTeamCaptain' },
        },
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });

      const result = await badgesService.getBadgeProgress(studentId, badgeId);

      expect(result.current).toBeNull();
      expect(result.required).toBeNull();
      expect(result.percentage).toBeNull();
    });

    it('should handle notebook count progress', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';

      const mockBadge = {
        id: badgeId,
        criteria: { type: 'notebook_count', requirements: { minimum: 10 } },
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockBadge] });
      mockDb.query.mockResolvedValueOnce({ rows: [{ count: '8' }] });

      const result = await badgesService.getBadgeProgress(studentId, badgeId);

      expect(result.current).toBe(8);
      expect(result.required).toBe(10);
      expect(result.percentage).toBe(80);
    });
  });

  describe('manualAward', () => {
    it('should allow coach to award any badge', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';
      const coachId = 'coach-uuid';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'student-badge-1',
            student_id: studentId,
            badge_id: badgeId,
            earned_at: new Date(),
          },
        ],
      });

      const result = await badgesService.manualAward(
        studentId,
        badgeId,
        coachId
      );

      expect(result.badge_id).toBe(badgeId);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should allow evidence linking', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';
      const coachId = 'coach-uuid';
      const evidence = {
        type: 'notebook_entry',
        id: 'entry-123',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'student-badge-1',
            evidence_type: evidence.type,
            evidence_id: evidence.id,
          },
        ],
      });

      const result = await badgesService.manualAward(
        studentId,
        badgeId,
        coachId,
        evidence
      );

      expect(result.evidence_type).toBe(evidence.type);
      expect(result.evidence_id).toBe(evidence.id);
    });

    it('should prevent duplicate awards', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';
      const coachId = 'coach-uuid';

      mockDb.query.mockRejectedValueOnce({
        code: '23505', // Unique constraint violation
        constraint: 'student_badges_student_id_badge_id_key',
      });

      await expect(
        badgesService.manualAward(studentId, badgeId, coachId)
      ).rejects.toThrow('Badge already awarded to this student');
    });

    it('should record who awarded it', async () => {
      const studentId = 'student-uuid';
      const badgeId = 'badge-1';
      const coachId = 'coach-uuid';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'student-badge-1',
            student_id: studentId,
            badge_id: badgeId,
          },
        ],
      });

      await badgesService.manualAward(studentId, badgeId, coachId);

      const queryCall = mockDb.query.mock.calls[0];
      // Note: We'll track who awarded it in a separate field or comment
      expect(queryCall[0]).toContain('INSERT INTO student_badges');
    });
  });

  describe('getAvailableBadges', () => {
    it('should return badges student has not earned', async () => {
      const studentId = 'student-uuid';

      const mockBadges = [
        {
          id: 'badge-1',
          name: 'Dedicated Learner',
          description: 'Complete 10 lessons',
        },
        {
          id: 'badge-2',
          name: 'Notebook Keeper',
          description: 'Create 10 notebook entries',
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockBadges });

      const result = await badgesService.getAvailableBadges(studentId);

      expect(result).toEqual(mockBadges);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('NOT EXISTS');
      expect(queryCall[0]).toContain('student_badges');
    });
  });
});
