import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { UserRole } from '@stemlab/shared-types';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.middleware';

// Mock the database and service
vi.mock('../../config/database');
vi.mock('./teams.service');

describe('TeamsController', () => {
  let teamsController: TeamsController;
  let mockTeamsService: any;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create mock service
    mockTeamsService = {
      createTeam: vi.fn(),
      getTeams: vi.fn(),
      getTeamById: vi.fn(),
      updateTeam: vi.fn(),
      deleteTeam: vi.fn(),
      addTeamMember: vi.fn(),
      removeTeamMember: vi.fn(),
      updateTeamMemberRole: vi.fn(),
      getTeamStats: vi.fn(),
    };

    // Mock the TeamsService constructor
    vi.mocked(TeamsService).mockImplementation(() => mockTeamsService);

    teamsController = new TeamsController();

    // Create mock request and response
    mockRequest = {
      user: {
        id: 'coach-user-id',
        role: UserRole.COACH,
      } as any,
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a team (Coach)', async () => {
      const teamData = {
        team_number: '6502A',
        season_year: '2024-2025',
      };

      const mockTeam = {
        id: 'team-uuid-1',
        ...teamData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.body = teamData;
      mockTeamsService.createTeam.mockResolvedValueOnce(mockTeam);

      await teamsController.createTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTeam);
      expect(mockTeamsService.createTeam).toHaveBeenCalledWith(teamData);
    });

    it('should create a team (Admin)', async () => {
      mockRequest.user = { id: 'admin-id', role: UserRole.ADMIN } as any;

      const teamData = {
        team_number: '6502A',
        season_year: '2024-2025',
      };

      const mockTeam = {
        id: 'team-uuid-1',
        ...teamData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.body = teamData;
      mockTeamsService.createTeam.mockResolvedValueOnce(mockTeam);

      await teamsController.createTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTeam);
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.createTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Only coaches and admins can create teams',
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        team_number: 'invalid',
        season_year: 'invalid',
      };

      await teamsController.createTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getTeams', () => {
    it('should return all teams', async () => {
      const mockTeams = {
        data: [
          {
            id: 'team-1',
            team_number: '6502A',
            season_year: '2024-2025',
            member_count: 5,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
      };

      mockTeamsService.getTeams.mockResolvedValueOnce(mockTeams);

      await teamsController.getTeams(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTeams);
    });

    it('should support filtering by season_year', async () => {
      mockRequest.query = { season_year: '2024-2025' };

      const mockTeams = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
        },
      };

      mockTeamsService.getTeams.mockResolvedValueOnce(mockTeams);

      await teamsController.getTeams(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockTeamsService.getTeams).toHaveBeenCalledWith(
        expect.objectContaining({
          season_year: '2024-2025',
        })
      );
    });
  });

  describe('getTeamById', () => {
    it('should return team with members', async () => {
      const mockTeam = {
        id: 'team-1',
        team_number: '6502A',
        season_year: '2024-2025',
        created_at: new Date(),
        updated_at: new Date(),
        members: [
          {
            id: 'member-1',
            team_id: 'team-1',
            user_id: 'user-1',
            role: 'Driver',
            joined_at: new Date(),
            left_at: null,
          },
        ],
      };

      mockRequest.params = { id: 'team-1' };
      mockTeamsService.getTeamById.mockResolvedValueOnce(mockTeam);

      await teamsController.getTeamById(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTeam);
    });

    it('should return 404 if team not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockTeamsService.getTeamById.mockResolvedValueOnce(null);

      await teamsController.getTeamById(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Team not found',
      });
    });
  });

  describe('updateTeam', () => {
    it('should update team (Coach)', async () => {
      const updateData = {
        team_number: '6502B',
      };

      const mockTeam = {
        id: 'team-1',
        team_number: '6502B',
        season_year: '2024-2025',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.params = { id: 'team-1' };
      mockRequest.body = updateData;
      mockTeamsService.updateTeam.mockResolvedValueOnce(mockTeam);

      await teamsController.updateTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTeam);
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.updateTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if team not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { team_number: '6502B' };
      mockTeamsService.updateTeam.mockRejectedValueOnce(new Error('Team not found'));

      await teamsController.updateTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTeam', () => {
    it('should delete team (Coach)', async () => {
      mockRequest.params = { id: 'team-1' };
      mockTeamsService.deleteTeam.mockResolvedValueOnce(undefined);

      await teamsController.deleteTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
      expect(mockTeamsService.deleteTeam).toHaveBeenCalledWith('team-1');
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.deleteTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if team not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockTeamsService.deleteTeam.mockRejectedValueOnce(new Error('Team not found'));

      await teamsController.deleteTeam(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('addTeamMember', () => {
    it('should add member to team (Coach)', async () => {
      const memberData = {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        role: 'Driver' as const,
      };

      const mockMember = {
        id: 'member-1',
        team_id: 'team-1',
        ...memberData,
        joined_at: new Date(),
        left_at: null,
      };

      mockRequest.params = { id: 'team-1' };
      mockRequest.body = memberData;
      mockTeamsService.addTeamMember.mockResolvedValueOnce(mockMember);

      await teamsController.addTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMember);
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.addTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 409 for duplicate member', async () => {
      mockRequest.params = { id: 'team-1' };
      mockRequest.body = { user_id: '550e8400-e29b-41d4-a716-446655440001', role: 'Driver' };
      mockTeamsService.addTeamMember.mockRejectedValueOnce(
        new Error('User is already an active member of this team')
      );

      await teamsController.addTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });
  });

  describe('removeTeamMember', () => {
    it('should remove member from team (Coach)', async () => {
      const mockMember = {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'Driver',
        joined_at: new Date(),
        left_at: new Date(),
      };

      mockRequest.params = { id: 'team-1', userId: 'user-1' };
      mockTeamsService.removeTeamMember.mockResolvedValueOnce(mockMember);

      await teamsController.removeTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
      expect(mockTeamsService.removeTeamMember).toHaveBeenCalledWith('team-1', 'user-1');
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.removeTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if member not found', async () => {
      mockRequest.params = { id: 'team-1', userId: 'user-1' };
      mockTeamsService.removeTeamMember.mockRejectedValueOnce(
        new Error('Team member not found or already removed')
      );

      await teamsController.removeTeamMember(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateTeamMemberRole', () => {
    it('should update member role (Coach)', async () => {
      const roleData = {
        role: 'Builder' as const,
      };

      const mockMember = {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'Builder',
        joined_at: new Date(),
        left_at: null,
      };

      mockRequest.params = { id: 'team-1', userId: 'user-1' };
      mockRequest.body = roleData;
      mockTeamsService.updateTeamMemberRole.mockResolvedValueOnce(mockMember);

      await teamsController.updateTeamMemberRole(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMember);
    });

    it('should reject if not Coach or Admin', async () => {
      mockRequest.user = { id: 'student-id', role: UserRole.STUDENT } as any;

      await teamsController.updateTeamMemberRole(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', async () => {
      const mockStats = {
        team_id: 'team-1',
        member_count: 5,
        practice_session_count: 12,
        competition_count: 3,
      };

      mockRequest.params = { id: 'team-1' };
      mockTeamsService.getTeamStats.mockResolvedValueOnce(mockStats);

      await teamsController.getTeamStats(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
    });

    it('should return 404 if team not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockTeamsService.getTeamStats.mockResolvedValueOnce(null);

      await teamsController.getTeamStats(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Team not found',
      });
    });
  });
});
