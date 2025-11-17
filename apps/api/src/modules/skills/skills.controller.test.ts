import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { SkillCategory, SkillLevel, GradeLevel, UserRole } from '@stemlab/shared-types';
import { AuthenticatedRequest } from '../auth/auth.middleware';

// Mock the service
vi.mock('./skills.service');

describe('SkillsController', () => {
  let controller: SkillsController;
  let mockService: any;
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    // Create mock service
    mockService = {
      createSkill: vi.fn(),
      updateSkill: vi.fn(),
      getSkillById: vi.fn(),
      listSkills: vi.fn(),
      deleteSkill: vi.fn(),
      assessStudentSkill: vi.fn(),
      getStudentSkillProfile: vi.fn(),
      getStudentSkillProfileByCategory: vi.fn(),
      getSkillStudents: vi.fn(),
      getSkillProgressHistory: vi.fn(),
    };

    controller = new SkillsController(mockService as unknown as SkillsService);

    // Create mock response
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      json: mockJson,
      status: mockStatus,
    };

    // Create mock request
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: {
        userId: 'coach-uuid',
        username: 'coach_test',
        role: UserRole.COACH,
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSkill', () => {
    it('should create skill successfully', async () => {
      const skillData = {
        name: 'Problem Identification',
        category: SkillCategory.ENGINEERING_PROCESS,
        description: 'Ability to identify engineering problems',
        grade_level: GradeLevel.FOUR,
      };

      const mockSkill = {
        id: 'skill-uuid',
        ...skillData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockReq.body = skillData;
      mockService.createSkill.mockResolvedValueOnce(mockSkill);

      await controller.createSkill(mockReq as Request, mockRes as Response);

      expect(mockService.createSkill).toHaveBeenCalledWith(skillData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockSkill);
    });

    it('should handle validation errors', async () => {
      mockReq.body = {
        name: '',
        category: SkillCategory.TEAMWORK,
        description: 'Test',
        grade_level: GradeLevel.K,
      };

      mockService.createSkill.mockRejectedValueOnce(
        new Error('Name must be between 1 and 200 characters')
      );

      await controller.createSkill(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Name must be between 1 and 200 characters',
      });
    });

    it('should handle server errors', async () => {
      mockReq.body = {
        name: 'Test Skill',
        category: SkillCategory.TECHNICAL,
        description: 'Test description',
        grade_level: GradeLevel.THREE,
      };

      mockService.createSkill.mockRejectedValueOnce(new Error('Database error'));

      await controller.createSkill(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to create skill',
      });
    });
  });

  describe('updateSkill', () => {
    it('should update skill successfully', async () => {
      const skillId = 'skill-uuid';
      const updateData = {
        name: 'Updated Skill Name',
        description: 'Updated description',
      };

      const mockUpdatedSkill = {
        id: skillId,
        ...updateData,
        category: SkillCategory.PRESENTATION,
        grade_level: GradeLevel.FIVE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockReq.params = { id: skillId };
      mockReq.body = updateData;
      mockService.updateSkill.mockResolvedValueOnce(mockUpdatedSkill);

      await controller.updateSkill(mockReq as Request, mockRes as Response);

      expect(mockService.updateSkill).toHaveBeenCalledWith(skillId, updateData);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedSkill);
    });

    it('should return 404 if skill not found', async () => {
      mockReq.params = { id: 'nonexistent-id' };
      mockReq.body = { name: 'Updated Name' };
      mockService.updateSkill.mockResolvedValueOnce(null);

      await controller.updateSkill(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Skill not found',
      });
    });
  });

  describe('getSkill', () => {
    it('should get skill by ID', async () => {
      const skillId = 'skill-uuid';
      const mockSkill = {
        id: skillId,
        name: 'Brainstorming',
        category: SkillCategory.ENGINEERING_PROCESS,
        description: 'Generate creative ideas',
        grade_level: GradeLevel.THREE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockReq.params = { id: skillId };
      mockService.getSkillById.mockResolvedValueOnce(mockSkill);

      await controller.getSkill(mockReq as Request, mockRes as Response);

      expect(mockService.getSkillById).toHaveBeenCalledWith(skillId);
      expect(mockJson).toHaveBeenCalledWith(mockSkill);
    });

    it('should return 404 if skill not found', async () => {
      mockReq.params = { id: 'nonexistent-id' };
      mockService.getSkillById.mockResolvedValueOnce(null);

      await controller.getSkill(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Skill not found',
      });
    });
  });

  describe('listSkills', () => {
    it('should list all skills without filters', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Communication',
          category: SkillCategory.TEAMWORK,
          description: 'Effective communication',
          grade_level: GradeLevel.K,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'skill-2',
          name: 'Building',
          category: SkillCategory.TECHNICAL,
          description: 'Basic building skills',
          grade_level: GradeLevel.TWO,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockReq.query = {};
      mockService.listSkills.mockResolvedValueOnce(mockSkills);

      await controller.listSkills(mockReq as Request, mockRes as Response);

      expect(mockService.listSkills).toHaveBeenCalledWith({});
      expect(mockJson).toHaveBeenCalledWith(mockSkills);
    });

    it('should filter by category', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Communication',
          category: SkillCategory.TEAMWORK,
          description: 'Effective communication',
          grade_level: GradeLevel.FOUR,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockReq.query = { category: SkillCategory.TEAMWORK };
      mockService.listSkills.mockResolvedValueOnce(mockSkills);

      await controller.listSkills(mockReq as Request, mockRes as Response);

      expect(mockService.listSkills).toHaveBeenCalledWith({
        category: SkillCategory.TEAMWORK,
      });
      expect(mockJson).toHaveBeenCalledWith(mockSkills);
    });

    it('should filter by grade level', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Simple Presentation',
          category: SkillCategory.PRESENTATION,
          description: 'Show and tell',
          grade_level: GradeLevel.K,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockReq.query = { grade_level: GradeLevel.K };
      mockService.listSkills.mockResolvedValueOnce(mockSkills);

      await controller.listSkills(mockReq as Request, mockRes as Response);

      expect(mockService.listSkills).toHaveBeenCalledWith({
        grade_level: GradeLevel.K,
      });
      expect(mockJson).toHaveBeenCalledWith(mockSkills);
    });
  });

  describe('deleteSkill', () => {
    it('should delete skill successfully', async () => {
      const skillId = 'skill-uuid';

      mockReq.params = { id: skillId };
      mockService.deleteSkill.mockResolvedValueOnce(undefined);

      await controller.deleteSkill(mockReq as Request, mockRes as Response);

      expect(mockService.deleteSkill).toHaveBeenCalledWith(skillId);
      expect(mockStatus).toHaveBeenCalledWith(204);
    });

    it('should return 404 if skill not found', async () => {
      mockReq.params = { id: 'nonexistent-id' };
      mockService.deleteSkill.mockRejectedValueOnce(new Error('Skill not found'));

      await controller.deleteSkill(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Skill not found',
      });
    });
  });

  describe('assessStudentSkill', () => {
    it('should assess student skill successfully', async () => {
      const studentId = 'student-uuid';
      const assessmentData = {
        skill_id: 'skill-uuid',
        level: SkillLevel.DEVELOPING,
        evidence_notes: 'Student showed improvement',
      };

      const mockAssessment = {
        id: 'assessment-uuid',
        student_id: studentId,
        ...assessmentData,
        assessed_by: 'coach-uuid',
        assessed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockReq.params = { studentId };
      mockReq.body = assessmentData;
      mockService.assessStudentSkill.mockResolvedValueOnce(mockAssessment);

      await controller.assessStudentSkill(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockService.assessStudentSkill).toHaveBeenCalledWith({
        student_id: studentId,
        skill_id: assessmentData.skill_id,
        level: assessmentData.level,
        evidence_notes: assessmentData.evidence_notes,
        assessed_by: 'coach-uuid',
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockAssessment);
    });

    it('should handle validation errors', async () => {
      const studentId = 'student-uuid';
      mockReq.params = { studentId };
      mockReq.body = {
        skill_id: 'skill-uuid',
        level: 'invalid_level',
      };

      mockService.assessStudentSkill.mockRejectedValueOnce(
        new Error('Invalid skill level')
      );

      await controller.assessStudentSkill(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid skill level',
      });
    });
  });

  describe('updateStudentSkillAssessment', () => {
    it('should update student skill assessment successfully', async () => {
      const studentId = 'student-uuid';
      const skillId = 'skill-uuid';
      const updateData = {
        level: SkillLevel.PROFICIENT,
        evidence_notes: 'Now works independently',
      };

      const mockUpdatedAssessment = {
        id: 'assessment-uuid',
        student_id: studentId,
        skill_id: skillId,
        ...updateData,
        assessed_by: 'coach-uuid',
        assessed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockReq.params = { studentId, skillId };
      mockReq.body = updateData;
      mockService.assessStudentSkill.mockResolvedValueOnce(mockUpdatedAssessment);

      await controller.updateStudentSkillAssessment(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockService.assessStudentSkill).toHaveBeenCalledWith({
        student_id: studentId,
        skill_id: skillId,
        level: updateData.level,
        evidence_notes: updateData.evidence_notes,
        assessed_by: 'coach-uuid',
      });
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedAssessment);
    });
  });

  describe('getStudentSkillProfile', () => {
    it('should get student skill profile', async () => {
      const studentId = 'student-uuid';
      const mockProfile = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Problem Identification',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Identify problems',
          level: SkillLevel.DEVELOPING,
          evidence_notes: 'Making progress',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
        {
          id: 'assessment-2',
          student_id: studentId,
          skill_id: 'skill-2',
          skill_name: 'Communication',
          skill_category: SkillCategory.TEAMWORK,
          skill_description: 'Communicate effectively',
          level: SkillLevel.PROFICIENT,
          evidence_notes: 'Works independently',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
      ];

      mockReq.params = { studentId };
      mockService.getStudentSkillProfile.mockResolvedValueOnce(mockProfile);

      await controller.getStudentSkillProfile(mockReq as Request, mockRes as Response);

      expect(mockService.getStudentSkillProfile).toHaveBeenCalledWith(studentId);
      expect(mockJson).toHaveBeenCalledWith(mockProfile);
    });

    it('should allow students to view their own profile', async () => {
      const studentId = 'student-uuid';
      mockReq.user = {
        userId: studentId,
        username: 'student_test',
        role: UserRole.STUDENT,
      };

      const mockProfile = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Brainstorming',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Generate ideas',
          level: SkillLevel.NOVICE,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
      ];

      mockReq.params = { studentId };
      mockService.getStudentSkillProfile.mockResolvedValueOnce(mockProfile);

      await controller.getStudentSkillProfile(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockJson).toHaveBeenCalledWith(mockProfile);
    });
  });

  describe('getMySkills', () => {
    it('should get current user skill profile', async () => {
      const studentId = 'student-uuid';
      mockReq.user = {
        userId: studentId,
        username: 'student_test',
        role: UserRole.STUDENT,
      };

      const mockProfile = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Public Speaking',
          skill_category: SkillCategory.PRESENTATION,
          skill_description: 'Present to groups',
          level: SkillLevel.DEVELOPING,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
      ];

      mockService.getStudentSkillProfile.mockResolvedValueOnce(mockProfile);

      await controller.getMySkills(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockService.getStudentSkillProfile).toHaveBeenCalledWith(studentId);
      expect(mockJson).toHaveBeenCalledWith(mockProfile);
    });

    it('should require authentication', async () => {
      mockReq.user = undefined;

      await controller.getMySkills(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });
  });

  describe('getSkillStudents', () => {
    it('should get all students assessed for a skill', async () => {
      const skillId = 'skill-uuid';
      const mockStudents = [
        {
          id: 'assessment-1',
          student_id: 'student-1',
          student_name: 'John Doe',
          student_grade_level: GradeLevel.FOUR,
          skill_id: skillId,
          level: SkillLevel.DEVELOPING,
          evidence_notes: 'Making progress',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
        {
          id: 'assessment-2',
          student_id: 'student-2',
          student_name: 'Jane Smith',
          student_grade_level: GradeLevel.FIVE,
          skill_id: skillId,
          level: SkillLevel.PROFICIENT,
          evidence_notes: 'Works independently',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
      ];

      mockReq.params = { skillId };
      mockService.getSkillStudents.mockResolvedValueOnce(mockStudents);

      await controller.getSkillStudents(mockReq as Request, mockRes as Response);

      expect(mockService.getSkillStudents).toHaveBeenCalledWith(skillId);
      expect(mockJson).toHaveBeenCalledWith(mockStudents);
    });
  });

  describe('getSkillProgressHistory', () => {
    it('should get skill progress history for a student', async () => {
      const studentId = 'student-uuid';
      const skillId = 'skill-uuid';

      const mockHistory = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.NOVICE,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 30),
        },
        {
          id: 'assessment-2',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.DEVELOPING,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 15),
        },
        {
          id: 'assessment-3',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.PROFICIENT,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
        },
      ];

      mockReq.params = { studentId, skillId };
      mockService.getSkillProgressHistory.mockResolvedValueOnce(mockHistory);

      await controller.getSkillProgressHistory(mockReq as Request, mockRes as Response);

      expect(mockService.getSkillProgressHistory).toHaveBeenCalledWith(studentId, skillId);
      expect(mockJson).toHaveBeenCalledWith(mockHistory);
    });
  });
});
