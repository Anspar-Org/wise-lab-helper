import { Request, Response } from 'express';
import { LessonsService } from './lessons.service';
import { getDatabase } from '../../config/database';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { UserRole } from '@stemlab/shared-types';

/**
 * LessonsController - HTTP request handlers for lessons endpoints
 */
export class LessonsController {
  private lessonsService: LessonsService;

  constructor() {
    const db = getDatabase();
    this.lessonsService = new LessonsService(db);
  }

  /**
   * Create a new lesson
   * POST /api/v1/lessons
   * Access: Coach, Admin
   */
  createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const lessonData = {
        ...req.body,
        created_by: req.user.userId,
      };

      const lesson = await this.lessonsService.createLesson(lessonData);

      res.status(201).json({
        message: 'Lesson created successfully',
        data: lesson,
      });
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to create lesson',
      });
    }
  };

  /**
   * Get lessons with filters
   * GET /api/v1/lessons
   * Access: All authenticated users
   */
  getLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const {
        category,
        grade_level,
        published,
        page = 1,
        limit = 20,
      } = req.query;

      const options = {
        userRole: req.user.role,
        category: category as any,
        grade_level: grade_level as any,
        published: published === 'true' ? true : published === 'false' ? false : undefined,
        page: typeof page === 'string' ? parseInt(page, 10) : 1,
        limit: typeof limit === 'string' ? parseInt(limit, 10) : 20,
      };

      const result = await this.lessonsService.getLessons(options);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error getting lessons:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get lessons',
      });
    }
  };

  /**
   * Get lesson by ID
   * GET /api/v1/lessons/:id
   * Access: All authenticated users
   */
  getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lesson = await this.lessonsService.getLessonById(id);

      res.status(200).json({
        data: lesson,
      });
    } catch (error: any) {
      console.error('Error getting lesson:', error);

      if (error.message === 'Lesson not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get lesson',
      });
    }
  };

  /**
   * Update lesson
   * PUT /api/v1/lessons/:id
   * Access: Coach, Admin
   */
  updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lesson = await this.lessonsService.updateLesson(id, updateData);

      res.status(200).json({
        message: 'Lesson updated successfully',
        data: lesson,
      });
    } catch (error: any) {
      console.error('Error updating lesson:', error);

      if (error.message === 'Lesson not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update lesson',
      });
    }
  };

  /**
   * Delete lesson
   * DELETE /api/v1/lessons/:id
   * Access: Coach, Admin
   */
  deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.lessonsService.deleteLesson(id);

      res.status(200).json({
        message: 'Lesson deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting lesson:', error);

      if (error.message === 'Lesson not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete lesson',
      });
    }
  };

  /**
   * Publish or unpublish lesson
   * PATCH /api/v1/lessons/:id/publish
   * Access: Coach, Admin
   */
  publishLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { published } = req.body;

      if (typeof published !== 'boolean') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Published field must be a boolean',
        });
        return;
      }

      const lesson = await this.lessonsService.publishLesson(id, published);

      res.status(200).json({
        message: `Lesson ${published ? 'published' : 'unpublished'} successfully`,
        data: lesson,
      });
    } catch (error: any) {
      console.error('Error publishing lesson:', error);

      if (error.message === 'Lesson not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to publish lesson',
      });
    }
  };

  // =====================================================
  // LESSON STEPS
  // =====================================================

  /**
   * Get lesson steps
   * GET /api/v1/lessons/:id/steps
   * Access: All authenticated users
   */
  getLessonSteps = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const steps = await this.lessonsService.getLessonSteps(id);

      res.status(200).json({
        data: steps,
      });
    } catch (error: any) {
      console.error('Error getting lesson steps:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get lesson steps',
      });
    }
  };

  /**
   * Create lesson step
   * POST /api/v1/lessons/:id/steps
   * Access: Coach, Admin
   */
  createLessonStep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const stepData = {
        lesson_id: id,
        ...req.body,
      };

      const step = await this.lessonsService.createLessonStep(stepData);

      res.status(201).json({
        message: 'Lesson step created successfully',
        data: step,
      });
    } catch (error: any) {
      console.error('Error creating lesson step:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to create lesson step',
      });
    }
  };

  /**
   * Update lesson step
   * PUT /api/v1/lessons/:id/steps/:stepId
   * Access: Coach, Admin
   */
  updateLessonStep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, stepId } = req.params;
      const updateData = req.body;

      const step = await this.lessonsService.updateLessonStep(id, stepId, updateData);

      res.status(200).json({
        message: 'Lesson step updated successfully',
        data: step,
      });
    } catch (error: any) {
      console.error('Error updating lesson step:', error);

      if (error.message === 'Step not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson step not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update lesson step',
      });
    }
  };

  /**
   * Delete lesson step
   * DELETE /api/v1/lessons/:id/steps/:stepId
   * Access: Coach, Admin
   */
  deleteLessonStep = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, stepId } = req.params;
      await this.lessonsService.deleteLessonStep(id, stepId);

      res.status(200).json({
        message: 'Lesson step deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting lesson step:', error);

      if (error.message === 'Step not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Lesson step not found',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete lesson step',
      });
    }
  };

  // =====================================================
  // STUDENT PROGRESS
  // =====================================================

  /**
   * Start lesson (create progress record)
   * POST /api/v1/lessons/:id/start
   * Access: Students (and coaches/admins for testing)
   */
  startLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const studentId = req.user.userId;

      const progress = await this.lessonsService.startLesson(studentId, id);

      res.status(201).json({
        message: 'Lesson started successfully',
        data: progress,
      });
    } catch (error: any) {
      console.error('Error starting lesson:', error);

      if (error.message.includes('already exists')) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'You have already started this lesson',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to start lesson',
      });
    }
  };

  /**
   * Get student progress for a lesson
   * GET /api/v1/lessons/:id/progress
   * Access: Students (own progress), Coaches/Admins (any progress)
   */
  getStudentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const studentId = req.user.userId;

      const progress = await this.lessonsService.getStudentProgress(studentId, id);

      res.status(200).json({
        data: progress,
      });
    } catch (error: any) {
      console.error('Error getting progress:', error);

      if (error.message === 'Progress not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Progress not found. Start the lesson first.',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get progress',
      });
    }
  };

  /**
   * Update student progress
   * PUT /api/v1/lessons/:id/progress
   * Access: Students (own progress)
   */
  updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const studentId = req.user.userId;
      const updateData = req.body;

      const progress = await this.lessonsService.updateProgress(
        studentId,
        id,
        updateData
      );

      res.status(200).json({
        message: 'Progress updated successfully',
        data: progress,
      });
    } catch (error: any) {
      console.error('Error updating progress:', error);

      if (error.message === 'Progress not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Progress not found. Start the lesson first.',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update progress',
      });
    }
  };

  /**
   * Complete lesson
   * POST /api/v1/lessons/:id/complete
   * Access: Students (own progress)
   */
  completeLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const studentId = req.user.userId;

      const progress = await this.lessonsService.completeLesson(studentId, id);

      res.status(200).json({
        message: 'Lesson completed successfully! Great job!',
        data: progress,
      });
    } catch (error: any) {
      console.error('Error completing lesson:', error);

      if (error.message === 'Progress not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Progress not found. Start the lesson first.',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to complete lesson',
      });
    }
  };

  /**
   * Get all progress for a student
   * GET /api/v1/students/:studentId/progress
   * Access: Students (own), Coaches/Admins (any)
   */
  getAllStudentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { studentId } = req.params;

      // Students can only view their own progress
      if (
        req.user.role === UserRole.STUDENT &&
        req.user.userId !== studentId
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own progress',
        });
        return;
      }

      const progressList = await this.lessonsService.getAllStudentProgress(studentId);

      res.status(200).json({
        data: progressList,
      });
    } catch (error: any) {
      console.error('Error getting all student progress:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get student progress',
      });
    }
  };
}

// Export singleton instance
export const lessonsController = new LessonsController();
