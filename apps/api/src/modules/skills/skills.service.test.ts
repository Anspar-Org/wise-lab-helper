import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SkillsService } from './skills.service';
import { DatabaseService } from '../../config/database';
import { SkillCategory, SkillLevel, GradeLevel, UserRole } from '@stemlab/shared-types';

// Mock the database service
vi.mock('../../config/database');

describe('SkillsService', () => {
  let skillsService: SkillsService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    skillsService = new SkillsService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSkill', () => {
    it('should create skill with valid data', async () => {
      const skillData = {
        name: 'Problem Identification',
        category: SkillCategory.ENGINEERING_PROCESS,
        description: 'Ability to identify and define engineering problems clearly',
        grade_level: GradeLevel.FOUR,
      };

      const mockSkill = {
        id: 'skill-uuid',
        ...skillData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockSkill] });

      const result = await skillsService.createSkill(skillData);

      expect(result).toEqual(mockSkill);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO skills');
      expect(queryCall[1][0]).toBe(skillData.name);
      expect(queryCall[1][1]).toBe(skillData.category);
      expect(queryCall[1][2]).toBe(skillData.description);
      expect(queryCall[1][3]).toBe(skillData.grade_level);
    });

    it('should validate category enum', async () => {
      const skillData = {
        name: 'Test Skill',
        category: 'invalid_category' as any,
        description: 'Test description',
        grade_level: GradeLevel.THREE,
      };

      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Invalid skill category'
      );
    });

    it('should validate grade_level enum', async () => {
      const skillData = {
        name: 'Test Skill',
        category: SkillCategory.TEAMWORK,
        description: 'Test description',
        grade_level: 'invalid_grade' as any,
      };

      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Invalid grade level'
      );
    });

    it('should require description', async () => {
      const skillData = {
        name: 'Test Skill',
        category: SkillCategory.TECHNICAL,
        description: '',
        grade_level: GradeLevel.FIVE,
      };

      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Description must be between 1 and 2000 characters'
      );
    });

    it('should validate name length (1-200 characters)', async () => {
      const skillData = {
        name: '',
        category: SkillCategory.PRESENTATION,
        description: 'Test description',
        grade_level: GradeLevel.TWO,
      };

      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Name must be between 1 and 200 characters'
      );

      skillData.name = 'a'.repeat(201);
      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Name must be between 1 and 200 characters'
      );
    });

    it('should validate description length (1-2000 characters)', async () => {
      const skillData = {
        name: 'Test Skill',
        category: SkillCategory.RESEARCH,
        description: 'a'.repeat(2001),
        grade_level: GradeLevel.K,
      };

      await expect(skillsService.createSkill(skillData)).rejects.toThrow(
        'Description must be between 1 and 2000 characters'
      );
    });
  });

  describe('updateSkill', () => {
    it('should update skill with valid data', async () => {
      const skillId = 'skill-uuid';
      const updateData = {
        name: 'Updated Problem Identification',
        description: 'Updated description for problem identification',
      };

      const mockUpdatedSkill = {
        id: skillId,
        name: updateData.name,
        category: SkillCategory.ENGINEERING_PROCESS,
        description: updateData.description,
        grade_level: GradeLevel.FOUR,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUpdatedSkill] });

      const result = await skillsService.updateSkill(skillId, updateData);

      expect(result).toEqual(mockUpdatedSkill);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return null if skill not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await skillsService.updateSkill('nonexistent-id', {
        name: 'Updated Name',
      });

      expect(result).toBeNull();
    });

    it('should validate category if provided in update', async () => {
      await expect(
        skillsService.updateSkill('skill-id', {
          category: 'invalid' as any,
        })
      ).rejects.toThrow('Invalid skill category');
    });
  });

  describe('getSkillById', () => {
    it('should return skill by ID', async () => {
      const mockSkill = {
        id: 'skill-uuid',
        name: 'Brainstorming',
        category: SkillCategory.ENGINEERING_PROCESS,
        description: 'Generate creative solutions to problems',
        grade_level: GradeLevel.THREE,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockSkill] });

      const result = await skillsService.getSkillById('skill-uuid');

      expect(result).toEqual(mockSkill);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM skills WHERE id'),
        ['skill-uuid']
      );
    });

    it('should return null if skill not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await skillsService.getSkillById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listSkills', () => {
    it('should list all skills without filters', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Skill 1',
          category: SkillCategory.TEAMWORK,
          description: 'Description 1',
          grade_level: GradeLevel.K,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'skill-2',
          name: 'Skill 2',
          category: SkillCategory.TECHNICAL,
          description: 'Description 2',
          grade_level: GradeLevel.FIVE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockSkills });

      const result = await skillsService.listSkills({});

      expect(result).toEqual(mockSkills);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
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

      mockDb.query.mockResolvedValueOnce({ rows: mockSkills });

      const result = await skillsService.listSkills({
        category: SkillCategory.TEAMWORK,
      });

      expect(result).toEqual(mockSkills);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE category = $1');
    });

    it('should filter by grade level', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Simple Building',
          category: SkillCategory.TECHNICAL,
          description: 'Basic building skills',
          grade_level: GradeLevel.K,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockSkills });

      const result = await skillsService.listSkills({
        grade_level: GradeLevel.K,
      });

      expect(result).toEqual(mockSkills);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE grade_level = $1');
    });

    it('should filter by both category and grade level', async () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Public Speaking K',
          category: SkillCategory.PRESENTATION,
          description: 'Speaking in front of others',
          grade_level: GradeLevel.K,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockSkills });

      const result = await skillsService.listSkills({
        category: SkillCategory.PRESENTATION,
        grade_level: GradeLevel.K,
      });

      expect(result).toEqual(mockSkills);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE category = $1 AND grade_level = $2');
    });
  });

  describe('deleteSkill', () => {
    it('should delete skill by ID', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      await skillsService.deleteSkill('skill-uuid');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM skills WHERE id'),
        ['skill-uuid']
      );
    });

    it('should throw error if skill not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(skillsService.deleteSkill('nonexistent')).rejects.toThrow(
        'Skill not found'
      );
    });
  });

  describe('assessStudentSkill', () => {
    it('should create new assessment', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.DEVELOPING,
        evidence_notes: 'Student showed improvement in brainstorming during project',
        assessed_by: 'coach-uuid',
      };

      const mockAssessment = {
        id: 'assessment-uuid',
        ...assessmentData,
        assessed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock check for existing assessment
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock insert new assessment
      mockDb.query.mockResolvedValueOnce({ rows: [mockAssessment] });

      const result = await skillsService.assessStudentSkill(assessmentData);

      expect(result).toEqual(mockAssessment);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should update existing assessment', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.PROFICIENT,
        evidence_notes: 'Student now works independently',
        assessed_by: 'coach-uuid',
      };

      const existingAssessment = {
        id: 'assessment-uuid',
        student_id: assessmentData.student_id,
        skill_id: assessmentData.skill_id,
        level: SkillLevel.DEVELOPING,
        assessed_by: 'coach-uuid',
        assessed_at: new Date(Date.now() - 86400000),
      };

      const updatedAssessment = {
        ...existingAssessment,
        level: assessmentData.level,
        evidence_notes: assessmentData.evidence_notes,
        assessed_by: assessmentData.assessed_by,
        assessed_at: new Date(),
        updated_at: new Date(),
      };

      // Mock check for existing assessment (found)
      mockDb.query.mockResolvedValueOnce({ rows: [existingAssessment] });
      // Mock update existing assessment
      mockDb.query.mockResolvedValueOnce({ rows: [updatedAssessment] });

      const result = await skillsService.assessStudentSkill(assessmentData);

      expect(result).toEqual(updatedAssessment);
      expect(result.level).toBe(SkillLevel.PROFICIENT);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should require assessed_by (coach)', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.NOVICE,
        assessed_by: '', // Invalid: empty
      };

      await expect(skillsService.assessStudentSkill(assessmentData)).rejects.toThrow(
        'assessed_by is required'
      );
    });

    it('should validate skill_level enum', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: 'invalid_level' as any,
        assessed_by: 'coach-uuid',
      };

      await expect(skillsService.assessStudentSkill(assessmentData)).rejects.toThrow(
        'Invalid skill level'
      );
    });

    it('should store evidence_notes', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.ADVANCED,
        evidence_notes: 'Student taught others how to use the tools effectively',
        assessed_by: 'coach-uuid',
      };

      const mockAssessment = {
        id: 'assessment-uuid',
        ...assessmentData,
        assessed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({ rows: [mockAssessment] });

      const result = await skillsService.assessStudentSkill(assessmentData);

      expect(result.evidence_notes).toBe(assessmentData.evidence_notes);
    });

    it('should set assessed_at timestamp', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.DEVELOPING,
        assessed_by: 'coach-uuid',
      };

      const mockAssessment = {
        id: 'assessment-uuid',
        ...assessmentData,
        assessed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({ rows: [mockAssessment] });

      const result = await skillsService.assessStudentSkill(assessmentData);

      expect(result.assessed_at).toBeDefined();
      expect(result.assessed_at).toBeInstanceOf(Date);
    });

    it('should validate evidence_notes length (max 2000 characters)', async () => {
      const assessmentData = {
        student_id: 'student-uuid',
        skill_id: 'skill-uuid',
        level: SkillLevel.PROFICIENT,
        evidence_notes: 'a'.repeat(2001),
        assessed_by: 'coach-uuid',
      };

      await expect(skillsService.assessStudentSkill(assessmentData)).rejects.toThrow(
        'Evidence notes must not exceed 2000 characters'
      );
    });
  });

  describe('getStudentSkillProfile', () => {
    it('should return all assessments for student', async () => {
      const studentId = 'student-uuid';

      const mockAssessments = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Problem Identification',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Identify engineering problems',
          level: SkillLevel.DEVELOPING,
          evidence_notes: 'Making progress',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
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
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockAssessments });

      const result = await skillsService.getStudentSkillProfile(studentId);

      expect(result).toHaveLength(2);
      expect(result[0].student_id).toBe(studentId);
      expect(result[0].skill_name).toBe('Problem Identification');
      expect(result[1].skill_name).toBe('Communication');
    });

    it('should include skill details in profile', async () => {
      const studentId = 'student-uuid';

      const mockAssessments = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Brainstorming',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Generate creative ideas',
          skill_grade_level: GradeLevel.FOUR,
          level: SkillLevel.NOVICE,
          evidence_notes: null,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockAssessments });

      const result = await skillsService.getStudentSkillProfile(studentId);

      expect(result[0].skill_name).toBe('Brainstorming');
      expect(result[0].skill_category).toBe(SkillCategory.ENGINEERING_PROCESS);
      expect(result[0].skill_description).toBe('Generate creative ideas');
    });

    it('should group by category', async () => {
      const studentId = 'student-uuid';

      const mockAssessments = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: 'skill-1',
          skill_name: 'Problem Identification',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Identify problems',
          level: SkillLevel.DEVELOPING,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'assessment-2',
          student_id: studentId,
          skill_id: 'skill-2',
          skill_name: 'Brainstorming',
          skill_category: SkillCategory.ENGINEERING_PROCESS,
          skill_description: 'Generate ideas',
          level: SkillLevel.PROFICIENT,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockAssessments });

      const result = await skillsService.getStudentSkillProfileByCategory(studentId);

      expect(result[SkillCategory.ENGINEERING_PROCESS]).toHaveLength(2);
      expect(result[SkillCategory.ENGINEERING_PROCESS][0].skill_name).toBe('Problem Identification');
      expect(result[SkillCategory.ENGINEERING_PROCESS][1].skill_name).toBe('Brainstorming');
    });

    it('should show latest assessment per skill', async () => {
      const studentId = 'student-uuid';
      const skillId = 'skill-uuid';

      const mockAssessments = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: skillId,
          skill_name: 'Communication',
          skill_category: SkillCategory.TEAMWORK,
          skill_description: 'Communicate effectively',
          level: SkillLevel.PROFICIENT,
          evidence_notes: 'Latest assessment',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockAssessments });

      const result = await skillsService.getStudentSkillProfile(studentId);

      // Should only return one assessment per skill (the latest)
      const skillAssessments = result.filter(a => a.skill_id === skillId);
      expect(skillAssessments).toHaveLength(1);
      expect(skillAssessments[0].level).toBe(SkillLevel.PROFICIENT);
    });
  });

  describe('getSkillStudents', () => {
    it('should return all students assessed for a skill', async () => {
      const skillId = 'skill-uuid';

      const mockAssessments = [
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

      mockDb.query.mockResolvedValueOnce({ rows: mockAssessments });

      const result = await skillsService.getSkillStudents(skillId);

      expect(result).toHaveLength(2);
      expect(result[0].student_name).toBe('John Doe');
      expect(result[0].level).toBe(SkillLevel.DEVELOPING);
      expect(result[1].student_name).toBe('Jane Smith');
      expect(result[1].level).toBe(SkillLevel.PROFICIENT);
    });
  });

  describe('skillProgressTracking', () => {
    it('should track skill level changes over time', async () => {
      const studentId = 'student-uuid';
      const skillId = 'skill-uuid';

      const mockHistory = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.NOVICE,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 30), // 30 days ago
        },
        {
          id: 'assessment-2',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.DEVELOPING,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 15), // 15 days ago
        },
        {
          id: 'assessment-3',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.PROFICIENT,
          assessed_by: 'coach-uuid',
          assessed_at: new Date(), // Today
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await skillsService.getSkillProgressHistory(studentId, skillId);

      expect(result).toHaveLength(3);
      expect(result[0].level).toBe(SkillLevel.NOVICE);
      expect(result[1].level).toBe(SkillLevel.DEVELOPING);
      expect(result[2].level).toBe(SkillLevel.PROFICIENT);
    });

    it('should show assessment history in chronological order', async () => {
      const studentId = 'student-uuid';
      const skillId = 'skill-uuid';

      const mockHistory = [
        {
          id: 'assessment-1',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.NOVICE,
          evidence_notes: 'First assessment',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 60),
          created_at: new Date(Date.now() - 86400000 * 60),
        },
        {
          id: 'assessment-2',
          student_id: studentId,
          skill_id: skillId,
          level: SkillLevel.DEVELOPING,
          evidence_notes: 'Second assessment',
          assessed_by: 'coach-uuid',
          assessed_at: new Date(Date.now() - 86400000 * 30),
          created_at: new Date(Date.now() - 86400000 * 30),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await skillsService.getSkillProgressHistory(studentId, skillId);

      // Should be in chronological order (oldest first)
      expect(result[0].evidence_notes).toBe('First assessment');
      expect(result[1].evidence_notes).toBe('Second assessment');
      expect(result[0].assessed_at.getTime()).toBeLessThan(result[1].assessed_at.getTime());
    });
  });
});
