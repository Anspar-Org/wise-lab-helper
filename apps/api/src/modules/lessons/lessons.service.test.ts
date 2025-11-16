import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LessonsService } from './lessons.service';
import { DatabaseService } from '../../config/database';
import {
  LessonCategory,
  GradeLevel,
  UserRole,
  LessonProgressStatus
} from '@stemlab/shared-types';

// Mock the database service
vi.mock('../../config/database');

describe('LessonsService', () => {
  let lessonsService: LessonsService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    lessonsService = new LessonsService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createLesson', () => {
    const validLessonData = {
      title: 'Introduction to Engineering',
      category: LessonCategory.METHODOLOGY,
      grade_level: GradeLevel.FOUR,
      duration_minutes: 30,
      content: {
        introduction: 'Learn about engineering',
        sections: [
          {
            title: 'What is Engineering?',
            content: 'Engineering is problem solving...',
          },
        ],
      },
      learning_objectives: ['Understand engineering process', 'Identify problems'],
      created_by: 'coach-uuid',
    };

    it('should create lesson with valid data', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        ...validLessonData,
        published: false,
        display_order: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(validLessonData);

      expect(result).toEqual(mockLesson);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO lessons');
      expect(queryCall[1]).toContain(validLessonData.title);
      expect(queryCall[1]).toContain(validLessonData.category);
    });

    it('should default published to false', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        ...validLessonData,
        published: false,
        display_order: 0,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(validLessonData);

      expect(result.published).toBe(false);
    });

    it('should set display_order automatically if not provided', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        ...validLessonData,
        published: false,
        display_order: 0,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(validLessonData);

      expect(result.display_order).toBeDefined();
    });

    it('should store learning_objectives as array', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        ...validLessonData,
        published: false,
        display_order: 0,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(validLessonData);

      expect(Array.isArray(result.learning_objectives)).toBe(true);
      expect(result.learning_objectives.length).toBeGreaterThan(0);
    });

    it('should allow published to be set to true', async () => {
      const publishedLessonData = { ...validLessonData, published: true };
      const mockLesson = {
        id: 'lesson-uuid',
        ...publishedLessonData,
        display_order: 0,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(publishedLessonData);

      expect(result.published).toBe(true);
    });

    it('should handle media_urls array', async () => {
      const lessonWithMedia = {
        ...validLessonData,
        media_urls: ['https://example.com/video.mp4'],
      };
      const mockLesson = {
        id: 'lesson-uuid',
        ...lessonWithMedia,
        published: false,
        display_order: 0,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.createLesson(lessonWithMedia);

      expect(result.media_urls).toEqual(['https://example.com/video.mp4']);
    });
  });

  describe('getLessons', () => {
    it('should return only published lessons for students', async () => {
      const mockLessons = [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          published: true,
          category: LessonCategory.METHODOLOGY,
          grade_level: GradeLevel.FOUR,
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '1' }] });

      const result = await lessonsService.getLessons({
        userRole: UserRole.STUDENT,
      });

      expect(result.data).toEqual(mockLessons);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('published = true');
    });

    it('should return all lessons for coaches', async () => {
      const mockLessons = [
        { id: 'lesson-1', published: true },
        { id: 'lesson-2', published: false },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '2' }] });

      const result = await lessonsService.getLessons({
        userRole: UserRole.COACH,
      });

      expect(result.data).toEqual(mockLessons);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).not.toContain('published = true');
    });

    it('should filter by category', async () => {
      const mockLessons = [
        { id: 'lesson-1', category: LessonCategory.METHODOLOGY },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '1' }] });

      await lessonsService.getLessons({
        userRole: UserRole.COACH,
        category: LessonCategory.METHODOLOGY,
      });

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('category =');
    });

    it('should filter by grade_level', async () => {
      const mockLessons = [
        { id: 'lesson-1', grade_level: GradeLevel.FOUR },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '1' }] });

      await lessonsService.getLessons({
        userRole: UserRole.COACH,
        grade_level: GradeLevel.FOUR,
      });

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('grade_level =');
    });

    it('should paginate results', async () => {
      const mockLessons = Array(20).fill(null).map((_, i) => ({
        id: `lesson-${i}`,
        title: `Lesson ${i}`,
      }));

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '20' }] });

      const result = await lessonsService.getLessons({
        userRole: UserRole.COACH,
        page: 1,
        limit: 10,
      });

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('LIMIT');
      expect(queryCall[0]).toContain('OFFSET');
    });

    it('should order by display_order', async () => {
      const mockLessons = [
        { id: 'lesson-1', display_order: 0 },
        { id: 'lesson-2', display_order: 1 },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockLessons });
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: '2' }] });

      await lessonsService.getLessons({
        userRole: UserRole.COACH,
      });

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('ORDER BY display_order');
    });
  });

  describe('getLessonById', () => {
    it('should return lesson by id', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        title: 'Test Lesson',
        published: true,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.getLessonById('lesson-uuid');

      expect(result).toEqual(mockLesson);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if lesson not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        lessonsService.getLessonById('nonexistent-uuid')
      ).rejects.toThrow('Lesson not found');
    });
  });

  describe('updateLesson', () => {
    it('should update lesson fields', async () => {
      const updateData = {
        title: 'Updated Title',
        published: true,
      };

      const mockUpdatedLesson = {
        id: 'lesson-uuid',
        ...updateData,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockUpdatedLesson] });

      const result = await lessonsService.updateLesson('lesson-uuid', updateData);

      expect(result).toEqual(mockUpdatedLesson);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if lesson not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        lessonsService.updateLesson('nonexistent-uuid', { title: 'Test' })
      ).rejects.toThrow('Lesson not found');
    });
  });

  describe('deleteLesson', () => {
    it('should delete lesson', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'lesson-uuid' }] });

      await lessonsService.deleteLesson('lesson-uuid');

      expect(mockDb.query).toHaveBeenCalledTimes(1);
      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('DELETE FROM lessons');
    });

    it('should throw error if lesson not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        lessonsService.deleteLesson('nonexistent-uuid')
      ).rejects.toThrow('Lesson not found');
    });
  });

  describe('publishLesson', () => {
    it('should set published to true', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        title: 'Test Lesson',
        published: true,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.publishLesson('lesson-uuid', true);

      expect(result.published).toBe(true);
    });

    it('should set published to false (unpublish)', async () => {
      const mockLesson = {
        id: 'lesson-uuid',
        title: 'Test Lesson',
        published: false,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockLesson] });

      const result = await lessonsService.publishLesson('lesson-uuid', false);

      expect(result.published).toBe(false);
    });
  });

  describe('Lesson Steps', () => {
    describe('createLessonStep', () => {
      it('should create lesson step', async () => {
        const stepData = {
          lesson_id: 'lesson-uuid',
          step_number: 1,
          title: 'Step 1',
          content: { text: 'Step content' },
        };

        const mockStep = {
          id: 'step-uuid',
          ...stepData,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockStep] });

        const result = await lessonsService.createLessonStep(stepData);

        expect(result).toEqual(mockStep);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
      });

      it('should handle interactive elements', async () => {
        const stepData = {
          lesson_id: 'lesson-uuid',
          step_number: 1,
          title: 'Quiz Step',
          content: { text: 'Quiz content' },
          interactive_elements: {
            type: 'quiz',
            questions: [{ question: 'Test?', answer: 'Yes' }],
          },
        };

        const mockStep = { id: 'step-uuid', ...stepData };

        mockDb.query.mockResolvedValueOnce({ rows: [mockStep] });

        const result = await lessonsService.createLessonStep(stepData);

        expect(result.interactive_elements).toBeDefined();
      });
    });

    describe('getLessonSteps', () => {
      it('should return steps ordered by step_number', async () => {
        const mockSteps = [
          { id: 'step-1', step_number: 1 },
          { id: 'step-2', step_number: 2 },
        ];

        mockDb.query.mockResolvedValueOnce({ rows: mockSteps });

        const result = await lessonsService.getLessonSteps('lesson-uuid');

        expect(result).toEqual(mockSteps);
        const queryCall = mockDb.query.mock.calls[0];
        expect(queryCall[0]).toContain('ORDER BY step_number');
      });
    });

    describe('updateLessonStep', () => {
      it('should update step', async () => {
        const updateData = { title: 'Updated Step Title' };
        const mockStep = { id: 'step-uuid', ...updateData };

        mockDb.query.mockResolvedValueOnce({ rows: [mockStep] });

        const result = await lessonsService.updateLessonStep(
          'lesson-uuid',
          'step-uuid',
          updateData
        );

        expect(result).toEqual(mockStep);
      });

      it('should throw error if step not found', async () => {
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        await expect(
          lessonsService.updateLessonStep('lesson-uuid', 'nonexistent', { title: 'Test' })
        ).rejects.toThrow('Step not found');
      });
    });

    describe('deleteLessonStep', () => {
      it('should delete step', async () => {
        mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'step-uuid' }] });

        await lessonsService.deleteLessonStep('lesson-uuid', 'step-uuid');

        expect(mockDb.query).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Student Progress', () => {
    describe('startLesson', () => {
      it('should create progress record', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          student_id: 'student-uuid',
          lesson_id: 'lesson-uuid',
          status: LessonProgressStatus.IN_PROGRESS,
          progress_percent: 0,
          current_step: 1,
          started_at: new Date(),
          time_spent_minutes: 0,
        };

        // First query checks for existing progress
        mockDb.query.mockResolvedValueOnce({ rows: [] });
        // Second query creates new progress
        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.startLesson('student-uuid', 'lesson-uuid');

        expect(result.status).toBe(LessonProgressStatus.IN_PROGRESS);
        expect(result.started_at).toBeDefined();
        expect(result.progress_percent).toBe(0);
      });

      it('should set status to in_progress', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          student_id: 'student-uuid',
          lesson_id: 'lesson-uuid',
          status: LessonProgressStatus.IN_PROGRESS,
          started_at: new Date(),
        };

        // First query checks for existing progress
        mockDb.query.mockResolvedValueOnce({ rows: [] });
        // Second query creates new progress
        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.startLesson('student-uuid', 'lesson-uuid');

        expect(result.status).toBe(LessonProgressStatus.IN_PROGRESS);
      });

      it('should throw error if progress already exists', async () => {
        // First query checks for existing progress
        mockDb.query.mockResolvedValueOnce({
          rows: [{ id: 'existing-progress' }]
        });

        await expect(
          lessonsService.startLesson('student-uuid', 'lesson-uuid')
        ).rejects.toThrow('Progress already exists');
      });
    });

    describe('getStudentProgress', () => {
      it('should return student progress for lesson', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          student_id: 'student-uuid',
          lesson_id: 'lesson-uuid',
          status: LessonProgressStatus.IN_PROGRESS,
          progress_percent: 50,
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.getStudentProgress(
          'student-uuid',
          'lesson-uuid'
        );

        expect(result).toEqual(mockProgress);
      });

      it('should throw error if progress not found', async () => {
        mockDb.query.mockResolvedValueOnce({ rows: [] });

        await expect(
          lessonsService.getStudentProgress('student-uuid', 'lesson-uuid')
        ).rejects.toThrow('Progress not found');
      });
    });

    describe('updateProgress', () => {
      it('should update progress_percent', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          progress_percent: 75,
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.updateProgress(
          'student-uuid',
          'lesson-uuid',
          { progress_percent: 75 }
        );

        expect(result.progress_percent).toBe(75);
      });

      it('should update current_step', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          current_step: 3,
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.updateProgress(
          'student-uuid',
          'lesson-uuid',
          { current_step: 3 }
        );

        expect(result.current_step).toBe(3);
      });

      it('should increment time_spent_minutes', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          time_spent_minutes: 45,
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.updateProgress(
          'student-uuid',
          'lesson-uuid',
          { time_spent_minutes: 45 }
        );

        expect(result.time_spent_minutes).toBe(45);
      });

      it('should allow student notes', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          notes: 'This was interesting!',
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.updateProgress(
          'student-uuid',
          'lesson-uuid',
          { notes: 'This was interesting!' }
        );

        expect(result.notes).toBe('This was interesting!');
      });
    });

    describe('completeLesson', () => {
      it('should set status to completed', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          status: LessonProgressStatus.COMPLETED,
          progress_percent: 100,
          completed_at: new Date(),
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.completeLesson(
          'student-uuid',
          'lesson-uuid'
        );

        expect(result.status).toBe(LessonProgressStatus.COMPLETED);
      });

      it('should set progress_percent to 100', async () => {
        const mockProgress = {
          id: 'progress-uuid',
          status: LessonProgressStatus.COMPLETED,
          progress_percent: 100,
          completed_at: new Date(),
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.completeLesson(
          'student-uuid',
          'lesson-uuid'
        );

        expect(result.progress_percent).toBe(100);
      });

      it('should set completed_at timestamp', async () => {
        const now = new Date();
        const mockProgress = {
          id: 'progress-uuid',
          status: LessonProgressStatus.COMPLETED,
          progress_percent: 100,
          completed_at: now,
        };

        mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

        const result = await lessonsService.completeLesson(
          'student-uuid',
          'lesson-uuid'
        );

        expect(result.completed_at).toBeDefined();
      });
    });

    describe('getAllStudentProgress', () => {
      it('should return all progress for a student', async () => {
        const mockProgressList = [
          { id: 'progress-1', lesson_id: 'lesson-1' },
          { id: 'progress-2', lesson_id: 'lesson-2' },
        ];

        mockDb.query.mockResolvedValueOnce({ rows: mockProgressList });

        const result = await lessonsService.getAllStudentProgress('student-uuid');

        expect(result).toEqual(mockProgressList);
        expect(result.length).toBe(2);
      });
    });
  });
});
