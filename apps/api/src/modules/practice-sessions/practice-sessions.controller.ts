import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { PracticeSessionsService } from './practice-sessions.service';
import { getDatabase } from '../../config/database';
import { UserRole } from '@stemlab/shared-types';
import {
  CreatePracticeSessionSchema,
  UpdatePracticeSessionSchema,
  CreateSessionRotationSchema,
  UpdateSessionRotationSchema,
  GetPracticeSessionsFiltersSchema,
} from './practice-sessions.validation';

/**
 * Practice Sessions Controller
 *
 * Handles HTTP requests for practice session and rotation operations
 */
export class PracticeSessionsController {
  private practiceSessionsService: PracticeSessionsService;

  constructor() {
    const db = getDatabase();
    this.practiceSessionsService = new PracticeSessionsService(db);
  }

  /**
   * Create a new practice session (Coach/Admin only)
   * POST /api/v1/practice-sessions
   */
  createPracticeSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can create practice sessions',
        });
        return;
      }

      // Validate request body
      const validatedData = CreatePracticeSessionSchema.parse(req.body);

      const session = await this.practiceSessionsService.createPracticeSession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all practice sessions with filters
   * GET /api/v1/practice-sessions
   */
  getPracticeSessions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Parse and validate query parameters
      const filters = GetPracticeSessionsFiltersSchema.parse({
        team_id: req.query.team_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });

      const sessions = await this.practiceSessionsService.getPracticeSessions(filters);
      res.status(200).json(sessions);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get practice session by ID with rotations
   * GET /api/v1/practice-sessions/:id
   */
  getPracticeSessionById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const session = await this.practiceSessionsService.getPracticeSessionById(
        req.params.id
      );

      if (!session) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Practice session not found',
        });
        return;
      }

      res.status(200).json(session);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Update practice session (Coach/Admin only)
   * PUT /api/v1/practice-sessions/:id
   */
  updatePracticeSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can update practice sessions',
        });
        return;
      }

      // Validate request body
      const validatedData = UpdatePracticeSessionSchema.parse(req.body);

      const session = await this.practiceSessionsService.updatePracticeSession(
        req.params.id,
        validatedData
      );

      res.status(200).json(session);
    } catch (error: any) {
      if (error.message === 'Practice session not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }
      this.handleError(res, error);
    }
  };

  /**
   * Delete practice session (Coach/Admin only)
   * DELETE /api/v1/practice-sessions/:id
   */
  deletePracticeSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can delete practice sessions',
        });
        return;
      }

      await this.practiceSessionsService.deletePracticeSession(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      if (error.message === 'Practice session not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }
      this.handleError(res, error);
    }
  };

  /**
   * Add rotation to practice session (Coach/Admin only)
   * POST /api/v1/practice-sessions/:id/rotations
   */
  addRotation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can add rotations',
        });
        return;
      }

      // Validate request body
      const validatedData = CreateSessionRotationSchema.parse(req.body);

      const rotation = await this.practiceSessionsService.addRotation(
        req.params.id,
        validatedData
      );

      res.status(201).json(rotation);
    } catch (error: any) {
      if (error.message === 'Student already has a rotation in this session') {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }
      this.handleError(res, error);
    }
  };

  /**
   * Get all rotations for a practice session
   * GET /api/v1/practice-sessions/:id/rotations
   */
  getRotations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const rotations = await this.practiceSessionsService.getRotations(req.params.id);
      res.status(200).json(rotations);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Update rotation (Coach/Admin only)
   * PUT /api/v1/practice-sessions/:id/rotations/:rotationId
   */
  updateRotation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can update rotations',
        });
        return;
      }

      // Validate request body
      const validatedData = UpdateSessionRotationSchema.parse(req.body);

      const rotation = await this.practiceSessionsService.updateRotation(
        req.params.id,
        req.params.rotationId,
        validatedData
      );

      res.status(200).json(rotation);
    } catch (error: any) {
      if (error.message === 'Rotation not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }
      this.handleError(res, error);
    }
  };

  /**
   * Delete rotation (Coach/Admin only)
   * DELETE /api/v1/practice-sessions/:id/rotations/:rotationId
   */
  deleteRotation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can delete rotations',
        });
        return;
      }

      await this.practiceSessionsService.deleteRotation(
        req.params.id,
        req.params.rotationId
      );

      res.sendStatus(204);
    } catch (error: any) {
      if (error.message === 'Rotation not found') {
        res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
        return;
      }
      this.handleError(res, error);
    }
  };

  /**
   * Handle errors and send appropriate response
   */
  private handleError(res: Response, error: any): void {
    console.error('Practice sessions controller error:', error);

    // Zod validation errors
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    // Validation errors
    if (
      error.message?.includes('must be') ||
      error.message?.includes('required') ||
      error.message?.includes('Invalid')
    ) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    // Conflict errors
    if (error.message?.includes('already exists')) {
      res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
      return;
    }

    // Default to 500
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
}
