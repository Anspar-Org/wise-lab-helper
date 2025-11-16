import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BadgeCategory, UserRole } from '@stemlab/shared-types';

// Mock dependencies
vi.mock('./badges.service');
vi.mock('../../config/database', () => ({
  getDatabase: vi.fn(() => ({})),
}));

describe('BadgesController', () => {
  let badgesController: BadgesController;
  let mockBadgesService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  let statusCode: number;

  beforeEach(() => {
    // Reset response data
    responseData = null;
    statusCode = 200;

    // Create mock response object
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn((data) => {
        responseData = data;
        return mockResponse;
      }),
    };

    // Mock the status method to capture the status code
    (mockResponse.status as any).mockImplementation((code: number) => {
      statusCode = code;
      return mockResponse;
    });

    // Create mock request object
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: undefined,
    };

    // Create mock badges service
    mockBadgesService = {
      createBadge: vi.fn(),
      getAllBadges: vi.fn(),
      getBadgeById: vi.fn(),
      updateBadge: vi.fn(),
      deleteBadge: vi.fn(),
      checkAndAwardBadges: vi.fn(),
      getStudentBadges: vi.fn(),
      getBadgeProgress: vi.fn(),
      manualAward: vi.fn(),
      getAvailableBadges: vi.fn(),
    };

    // Mock BadgesService constructor
    vi.mocked(BadgesService).mockImplementation(() => mockBadgesService);

    badgesController = new BadgesController();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createBadge', () => {
    it('should create badge (admin only)', async () => {
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

      mockBadgesService.createBadge.mockResolvedValue(mockBadge);
      mockRequest.body = badgeData;
      mockRequest.user = { role: UserRole.ADMIN };

      await badgesController.createBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(201);
      expect(responseData).toEqual(mockBadge);
      expect(mockBadgesService.createBadge).toHaveBeenCalledWith(badgeData);
    });

    it('should return 400 for invalid data', async () => {
      mockRequest.body = {
        name: '',
        description: 'Test',
        category: BadgeCategory.ENGAGEMENT,
        criteria: { type: 'lesson_count', requirements: { count: 1 } },
      };
      mockRequest.user = { role: UserRole.ADMIN };

      mockBadgesService.createBadge.mockRejectedValue(
        new Error('Name must be between 1 and 200 characters')
      );

      await badgesController.createBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(400);
      expect(responseData).toHaveProperty('error');
    });

    it('should return 403 for non-admin users', async () => {
      mockRequest.body = {
        name: 'Test Badge',
        description: 'Test',
        category: BadgeCategory.ENGAGEMENT,
        criteria: { type: 'lesson_count', requirements: { count: 1 } },
      };
      mockRequest.user = { role: UserRole.COACH };

      await badgesController.createBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(403);
      expect(responseData).toHaveProperty('error');
      expect(mockBadgesService.createBadge).not.toHaveBeenCalled();
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
      ];

      mockBadgesService.getAllBadges.mockResolvedValue(mockBadges);

      await badgesController.getAllBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockBadges);
    });

    it('should filter badges by category', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          category: BadgeCategory.ENGAGEMENT,
        },
      ];

      mockRequest.query = { category: BadgeCategory.ENGAGEMENT };
      mockBadgesService.getAllBadges.mockResolvedValue(mockBadges);

      await badgesController.getAllBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(mockBadgesService.getAllBadges).toHaveBeenCalledWith(
        BadgeCategory.ENGAGEMENT
      );
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by ID', async () => {
      const mockBadge = {
        id: 'badge-uuid',
        name: 'First Day',
        description: 'Complete your first lesson',
      };

      mockRequest.params = { id: 'badge-uuid' };
      mockBadgesService.getBadgeById.mockResolvedValue(mockBadge);

      await badgesController.getBadgeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockBadge);
    });

    it('should return 404 for non-existent badge', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockBadgesService.getBadgeById.mockResolvedValue(null);

      await badgesController.getBadgeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(404);
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('updateBadge', () => {
    it('should update badge (admin only)', async () => {
      const updateData = {
        name: 'Updated Badge',
        description: 'Updated description',
      };

      const mockUpdatedBadge = {
        id: 'badge-uuid',
        ...updateData,
        category: BadgeCategory.ENGAGEMENT,
        criteria: { type: 'lesson_count', requirements: { count: 1 } },
      };

      mockRequest.params = { id: 'badge-uuid' };
      mockRequest.body = updateData;
      mockRequest.user = { role: UserRole.ADMIN };

      mockBadgesService.updateBadge.mockResolvedValue(mockUpdatedBadge);

      await badgesController.updateBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockUpdatedBadge);
    });

    it('should return 403 for non-admin users', async () => {
      mockRequest.params = { id: 'badge-uuid' };
      mockRequest.body = { name: 'Updated' };
      mockRequest.user = { role: UserRole.STUDENT };

      await badgesController.updateBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(403);
      expect(mockBadgesService.updateBadge).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent badge', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { name: 'Updated' };
      mockRequest.user = { role: UserRole.ADMIN };

      mockBadgesService.updateBadge.mockRejectedValue(
        new Error('Badge not found')
      );

      await badgesController.updateBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(404);
    });
  });

  describe('deleteBadge', () => {
    it('should delete badge (admin only)', async () => {
      mockRequest.params = { id: 'badge-uuid' };
      mockRequest.user = { role: UserRole.ADMIN };

      mockBadgesService.deleteBadge.mockResolvedValue(undefined);

      await badgesController.deleteBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(204);
      expect(mockBadgesService.deleteBadge).toHaveBeenCalledWith('badge-uuid');
    });

    it('should return 403 for non-admin users', async () => {
      mockRequest.params = { id: 'badge-uuid' };
      mockRequest.user = { role: UserRole.COACH };

      await badgesController.deleteBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(403);
      expect(mockBadgesService.deleteBadge).not.toHaveBeenCalled();
    });
  });

  describe('getStudentBadges', () => {
    it('should return student badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          earned_at: new Date('2024-01-15'),
        },
      ];

      mockRequest.params = { studentId: 'student-uuid' };
      mockRequest.user = { id: 'student-uuid', role: UserRole.STUDENT };

      mockBadgesService.getStudentBadges.mockResolvedValue(mockBadges);

      await badgesController.getStudentBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockBadges);
    });

    it('should allow coaches to view any student badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          earned_at: new Date('2024-01-15'),
        },
      ];

      mockRequest.params = { studentId: 'other-student-uuid' };
      mockRequest.user = { id: 'coach-uuid', role: UserRole.COACH };

      mockBadgesService.getStudentBadges.mockResolvedValue(mockBadges);

      await badgesController.getStudentBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockBadges);
    });

    it('should return 403 if student tries to view other student badges', async () => {
      mockRequest.params = { studentId: 'other-student-uuid' };
      mockRequest.user = { id: 'student-uuid', role: UserRole.STUDENT };

      await badgesController.getStudentBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(403);
      expect(mockBadgesService.getStudentBadges).not.toHaveBeenCalled();
    });
  });

  describe('getMyBadges', () => {
    it('should return current user badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
          earned_at: new Date('2024-01-15'),
        },
      ];

      mockRequest.user = { id: 'student-uuid', role: UserRole.STUDENT };

      mockBadgesService.getStudentBadges.mockResolvedValue(mockBadges);

      await badgesController.getMyBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockBadges);
      expect(mockBadgesService.getStudentBadges).toHaveBeenCalledWith(
        'student-uuid'
      );
    });
  });

  describe('awardBadge', () => {
    it('should allow coach to award badge', async () => {
      const awardData = {
        badge_id: 'badge-uuid',
        evidence_type: 'notebook_entry',
        evidence_id: 'entry-123',
      };

      const mockAward = {
        id: 'student-badge-1',
        student_id: 'student-uuid',
        badge_id: 'badge-uuid',
        earned_at: new Date(),
      };

      mockRequest.params = { studentId: 'student-uuid' };
      mockRequest.body = awardData;
      mockRequest.user = { id: 'coach-uuid', role: UserRole.COACH };

      mockBadgesService.manualAward.mockResolvedValue(mockAward);

      await badgesController.awardBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(201);
      expect(responseData).toEqual(mockAward);
      expect(mockBadgesService.manualAward).toHaveBeenCalledWith(
        'student-uuid',
        'badge-uuid',
        'coach-uuid',
        { type: 'notebook_entry', id: 'entry-123' }
      );
    });

    it('should return 403 for non-coach users', async () => {
      mockRequest.params = { studentId: 'student-uuid' };
      mockRequest.body = { badge_id: 'badge-uuid' };
      mockRequest.user = { id: 'student-uuid', role: UserRole.STUDENT };

      await badgesController.awardBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(403);
      expect(mockBadgesService.manualAward).not.toHaveBeenCalled();
    });

    it('should return 409 for duplicate award', async () => {
      mockRequest.params = { studentId: 'student-uuid' };
      mockRequest.body = { badge_id: 'badge-uuid' };
      mockRequest.user = { id: 'coach-uuid', role: UserRole.COACH };

      mockBadgesService.manualAward.mockRejectedValue(
        new Error('Badge already awarded to this student')
      );

      await badgesController.awardBadge(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(409);
    });
  });

  describe('getBadgeProgress', () => {
    it('should return badge progress', async () => {
      const mockProgress = {
        badge_id: 'badge-uuid',
        current: 7,
        required: 10,
        percentage: 70,
      };

      mockRequest.params = { studentId: 'student-uuid', badgeId: 'badge-uuid' };
      mockRequest.user = { id: 'student-uuid', role: UserRole.STUDENT };

      mockBadgesService.getBadgeProgress.mockResolvedValue(mockProgress);

      await badgesController.getBadgeProgress(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toEqual(mockProgress);
    });
  });

  describe('checkAndAwardBadges', () => {
    it('should trigger badge checking (internal API)', async () => {
      const eventData = {
        type: 'lesson_completion',
        lesson_id: 'lesson-123',
      };

      const mockEarnedBadges = [
        {
          id: 'badge-1',
          name: 'First Day',
        },
      ];

      mockRequest.body = {
        student_id: 'student-uuid',
        event: eventData,
      };

      mockBadgesService.checkAndAwardBadges.mockResolvedValue(mockEarnedBadges);

      await badgesController.checkAndAwardBadges(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusCode).toBe(200);
      expect(responseData).toHaveProperty('awarded_badges');
      expect(responseData.awarded_badges).toEqual(mockEarnedBadges);
    });
  });
});
