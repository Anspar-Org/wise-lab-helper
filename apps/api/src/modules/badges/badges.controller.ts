import { Request, Response } from 'express';
import { BadgesService } from './badges.service';
import { getDatabase } from '../../config/database';
import { UserRole } from '@stemlab/shared-types';

/**
 * Badges Controller
 *
 * Handles HTTP requests for badge operations
 */
export class BadgesController {
  private badgesService: BadgesService;

  constructor() {
    const db = getDatabase();
    this.badgesService = new BadgesService(db);
  }

  /**
   * Create a new badge (Admin only)
   * POST /api/v1/badges
   */
  createBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only admins can create badges',
        });
        return;
      }

      const badge = await this.badgesService.createBadge(req.body);
      res.status(201).json(badge);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all badges (optionally filtered by category)
   * GET /api/v1/badges
   */
  getAllBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.query.category as any;
      const badges = await this.badgesService.getAllBadges(category);
      res.status(200).json(badges);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get badge by ID
   * GET /api/v1/badges/:id
   */
  getBadgeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const badge = await this.badgesService.getBadgeById(req.params.id);

      if (!badge) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Badge not found',
        });
        return;
      }

      res.status(200).json(badge);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Update badge (Admin only)
   * PUT /api/v1/badges/:id
   */
  updateBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only admins can update badges',
        });
        return;
      }

      const badge = await this.badgesService.updateBadge(req.params.id, req.body);
      res.status(200).json(badge);
    } catch (error: any) {
      if (error.message === 'Badge not found') {
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
   * Delete badge (Admin only)
   * DELETE /api/v1/badges/:id
   */
  deleteBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only admins can delete badges',
        });
        return;
      }

      await this.badgesService.deleteBadge(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      if (error.message === 'Badge not found') {
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
   * Get student badges
   * GET /api/v1/students/:studentId/badges
   */
  getStudentBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;

      // Check authorization: students can only view their own, coaches/admins can view any
      if (
        req.user?.role === UserRole.STUDENT &&
        req.user?.id !== studentId
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own badges',
        });
        return;
      }

      const badges = await this.badgesService.getStudentBadges(studentId);
      res.status(200).json(badges);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get current user's badges
   * GET /api/v1/me/badges
   */
  getMyBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const badges = await this.badgesService.getStudentBadges(req.user.id);
      res.status(200).json(badges);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Award badge to student (Coach/Admin only)
   * POST /api/v1/students/:studentId/badges
   */
  awardBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (
        req.user?.role !== UserRole.COACH &&
        req.user?.role !== UserRole.ADMIN
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can award badges',
        });
        return;
      }

      const { studentId } = req.params;
      const { badge_id, evidence_type, evidence_id } = req.body;

      const evidence =
        evidence_type && evidence_id
          ? { type: evidence_type, id: evidence_id }
          : undefined;

      const award = await this.badgesService.manualAward(
        studentId,
        badge_id,
        req.user.id,
        evidence
      );

      res.status(201).json(award);
    } catch (error: any) {
      if (error.message === 'Badge already awarded to this student') {
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
   * Get progress toward a badge
   * GET /api/v1/students/:studentId/badges/:badgeId/progress
   * or GET /api/v1/me/badges/progress/:badgeId
   */
  getBadgeProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const studentId = req.params.studentId || req.user?.id;
      const { badgeId } = req.params;

      if (!studentId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Check authorization: students can only view their own progress
      if (
        req.user?.role === UserRole.STUDENT &&
        req.user?.id !== studentId
      ) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own progress',
        });
        return;
      }

      const progress = await this.badgesService.getBadgeProgress(
        studentId,
        badgeId
      );

      res.status(200).json(progress);
    } catch (error: any) {
      if (error.message === 'Badge not found') {
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
   * Get all badge progress for current user
   * GET /api/v1/me/badges/progress
   */
  getMyBadgeProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Get all available badges
      const availableBadges = await this.badgesService.getAvailableBadges(
        req.user.id
      );

      // Get progress for each badge
      const progressList = await Promise.all(
        availableBadges.map(async (badge) => {
          const progress = await this.badgesService.getBadgeProgress(
            req.user!.id,
            badge.id
          );
          return {
            badge,
            progress,
          };
        })
      );

      res.status(200).json(progressList);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Check and award badges (Internal API)
   * POST /api/v1/badges/check-awards
   */
  checkAndAwardBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const { student_id, event } = req.body;

      if (!student_id || !event) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'student_id and event are required',
        });
        return;
      }

      const awardedBadges = await this.badgesService.checkAndAwardBadges(
        student_id,
        event
      );

      res.status(200).json({
        awarded_badges: awardedBadges,
        count: awardedBadges.length,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Handle errors and send appropriate response
   */
  private handleError(res: Response, error: any): void {
    console.error('Badge controller error:', error);

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
