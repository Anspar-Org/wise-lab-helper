import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { TeamsService } from './teams.service';
import { getDatabase } from '../../config/database';
import { UserRole } from '@stemlab/shared-types';
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  AddTeamMemberSchema,
  UpdateTeamMemberRoleSchema,
  GetTeamsFiltersSchema,
} from './teams.validation';

/**
 * Teams Controller
 *
 * Handles HTTP requests for team and team member operations
 */
export class TeamsController {
  private teamsService: TeamsService;

  constructor() {
    const db = getDatabase();
    this.teamsService = new TeamsService(db);
  }

  /**
   * Create a new team (Coach/Admin only)
   * POST /api/v1/teams
   */
  createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can create teams',
        });
        return;
      }

      // Validate request body
      const validatedData = CreateTeamSchema.parse(req.body);

      const team = await this.teamsService.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get all teams with filters
   * GET /api/v1/teams
   */
  getTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Parse and validate query parameters
      const filters = GetTeamsFiltersSchema.parse({
        season_year: req.query.season_year,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });

      const teams = await this.teamsService.getTeams(filters);
      res.status(200).json(teams);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Get team by ID with members
   * GET /api/v1/teams/:id
   */
  getTeamById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const team = await this.teamsService.getTeamById(req.params.id);

      if (!team) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Team not found',
        });
        return;
      }

      res.status(200).json(team);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Update team (Coach/Admin only)
   * PUT /api/v1/teams/:id
   */
  updateTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can update teams',
        });
        return;
      }

      // Validate request body
      const validatedData = UpdateTeamSchema.parse(req.body);

      const team = await this.teamsService.updateTeam(req.params.id, validatedData);

      res.status(200).json(team);
    } catch (error: any) {
      if (error.message === 'Team not found') {
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
   * Delete team (Coach/Admin only)
   * DELETE /api/v1/teams/:id
   */
  deleteTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can delete teams',
        });
        return;
      }

      await this.teamsService.deleteTeam(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      if (error.message === 'Team not found') {
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
   * Add member to team (Coach/Admin only)
   * POST /api/v1/teams/:id/members
   */
  addTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can add team members',
        });
        return;
      }

      // Validate request body
      const validatedData = AddTeamMemberSchema.parse(req.body);

      const member = await this.teamsService.addTeamMember(req.params.id, validatedData);

      res.status(201).json(member);
    } catch (error: any) {
      if (error.message === 'User is already an active member of this team') {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }
      if (error.message === 'User not found') {
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
   * Remove member from team (Coach/Admin only)
   * DELETE /api/v1/teams/:id/members/:userId
   */
  removeTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can remove team members',
        });
        return;
      }

      await this.teamsService.removeTeamMember(req.params.id, req.params.userId);

      res.sendStatus(204);
    } catch (error: any) {
      if (error.message === 'Team member not found or already removed') {
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
   * Update team member role (Coach/Admin only)
   * PUT /api/v1/teams/:id/members/:userId
   */
  updateTeamMemberRole = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      // Check authorization
      if (req.user?.role !== UserRole.COACH && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only coaches and admins can update team member roles',
        });
        return;
      }

      // Validate request body
      const validatedData = UpdateTeamMemberRoleSchema.parse(req.body);

      const member = await this.teamsService.updateTeamMemberRole(
        req.params.id,
        req.params.userId,
        validatedData
      );

      res.status(200).json(member);
    } catch (error: any) {
      if (error.message === 'Team member not found or already removed') {
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
   * Get team statistics
   * GET /api/v1/teams/:id/stats
   */
  getTeamStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.teamsService.getTeamStats(req.params.id);

      if (!stats) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Team not found',
        });
        return;
      }

      res.status(200).json(stats);
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * Handle errors and send appropriate response
   */
  private handleError(res: Response, error: any): void {
    console.error('Teams controller error:', error);

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
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('already an active member')
    ) {
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
