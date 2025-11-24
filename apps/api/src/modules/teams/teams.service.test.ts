import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TeamsService } from './teams.service';
import { DatabaseService } from '../../config/database';

// Mock the database service
vi.mock('../../config/database');

describe('TeamsService', () => {
  let teamsService: TeamsService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    teamsService = new TeamsService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
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

      mockDb.query.mockResolvedValueOnce({ rows: [mockTeam] });

      const result = await teamsService.createTeam(teamData);

      expect(result).toEqual(mockTeam);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO teams');
      expect(queryCall[1][0]).toBe(teamData.team_number);
      expect(queryCall[1][1]).toBe(teamData.season_year);
    });

    it('should reject duplicate team_number', async () => {
      const teamData = {
        team_number: '6502A',
        season_year: '2024-2025',
      };

      mockDb.query.mockRejectedValueOnce({
        code: '23505', // Unique violation
        constraint: 'teams_team_number_key',
      });

      await expect(teamsService.createTeam(teamData)).rejects.toThrow(
        'Team number already exists'
      );
    });
  });

  describe('getTeams', () => {
    it('should return all teams without filters', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          team_number: '6502A',
          season_year: '2024-2025',
          member_count: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'team-2',
          team_number: '6502B',
          season_year: '2024-2025',
          member_count: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockTeams, rowCount: 2 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 2 }] });

      const result = await teamsService.getTeams({});

      expect(result.data).toEqual(mockTeams);
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should filter by season_year', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          team_number: '6502A',
          season_year: '2024-2025',
          member_count: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockTeams, rowCount: 1 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 1 }] });

      const result = await teamsService.getTeams({
        season_year: '2024-2025',
      });

      expect(result.data).toEqual(mockTeams);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE');
      expect(queryCall[0]).toContain('season_year = $');
    });

    it('should support pagination', async () => {
      const mockTeams = [
        {
          id: 'team-3',
          team_number: '6502C',
          season_year: '2024-2025',
          member_count: 6,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockTeams, rowCount: 1 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 10 }] });

      const result = await teamsService.getTeams({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.total_pages).toBe(2);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('LIMIT');
      expect(queryCall[0]).toContain('OFFSET');
    });
  });

  describe('getTeamById', () => {
    it('should return team with members', async () => {
      const mockTeamWithMembers = {
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
          {
            id: 'member-2',
            team_id: 'team-1',
            user_id: 'user-2',
            role: 'Builder',
            joined_at: new Date(),
            left_at: null,
          },
        ],
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockTeamWithMembers] });

      const result = await teamsService.getTeamById('team-1');

      expect(result).toEqual(mockTeamWithMembers);
      expect(result?.members).toHaveLength(2);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return null if team not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await teamsService.getTeamById('nonexistent');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should only return active members (left_at is null)', async () => {
      const mockTeamWithMembers = {
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

      mockDb.query.mockResolvedValueOnce({ rows: [mockTeamWithMembers] });

      const result = await teamsService.getTeamById('team-1');

      expect(result?.members).toHaveLength(1);
      expect(result?.members[0].left_at).toBeNull();
    });
  });

  describe('updateTeam', () => {
    it('should update team_number', async () => {
      const updatedTeam = {
        id: 'team-1',
        team_number: '6502B',
        season_year: '2024-2025',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedTeam] });

      const result = await teamsService.updateTeam('team-1', {
        team_number: '6502B',
      });

      expect(result.team_number).toBe('6502B');
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE teams');
      expect(queryCall[0]).toContain('team_number');
    });

    it('should update season_year', async () => {
      const updatedTeam = {
        id: 'team-1',
        team_number: '6502A',
        season_year: '2025-2026',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedTeam] });

      const result = await teamsService.updateTeam('team-1', {
        season_year: '2025-2026',
      });

      expect(result.season_year).toBe('2025-2026');
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if team not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        teamsService.updateTeam('nonexistent', {
          team_number: '6502B',
        })
      ).rejects.toThrow('Team not found');
    });

    it('should require at least one field to update', async () => {
      await expect(teamsService.updateTeam('team-1', {})).rejects.toThrow(
        'No update data provided'
      );
    });

    it('should reject duplicate team_number on update', async () => {
      mockDb.query.mockRejectedValueOnce({
        code: '23505', // Unique violation
        constraint: 'teams_team_number_key',
      });

      await expect(
        teamsService.updateTeam('team-1', {
          team_number: '6502B',
        })
      ).rejects.toThrow('Team number already exists');
    });
  });

  describe('deleteTeam (soft delete)', () => {
    it('should soft delete team by setting left_at for all members', async () => {
      const client = {
        query: vi.fn(),
        release: vi.fn(),
      };

      mockDb.getClient.mockResolvedValueOnce(client);

      // Mock BEGIN transaction
      client.query.mockResolvedValueOnce({});
      // Mock UPDATE team_members
      client.query.mockResolvedValueOnce({ rowCount: 3 });
      // Mock SELECT team to verify exists
      client.query.mockResolvedValueOnce({ rows: [{ id: 'team-1' }] });
      // Mock COMMIT transaction
      client.query.mockResolvedValueOnce({});

      await teamsService.deleteTeam('team-1');

      expect(client.query).toHaveBeenCalledTimes(4);
      expect(client.query.mock.calls[0][0]).toBe('BEGIN');
      const updateQuery = client.query.mock.calls[1][0].replace(/\s+/g, ' ').trim();
      expect(updateQuery).toContain('UPDATE team_members');
      expect(updateQuery).toContain('SET left_at = NOW()');
      expect(client.query.mock.calls[3][0]).toBe('COMMIT');
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('should throw error if team not found', async () => {
      const client = {
        query: vi.fn(),
        release: vi.fn(),
      };

      mockDb.getClient.mockResolvedValueOnce(client);

      // Mock BEGIN transaction
      client.query.mockResolvedValueOnce({});
      // Mock UPDATE team_members
      client.query.mockResolvedValueOnce({ rowCount: 0 });
      // Mock SELECT team - not found
      client.query.mockResolvedValueOnce({ rows: [] });
      // Mock ROLLBACK transaction
      client.query.mockResolvedValueOnce({});

      await expect(teamsService.deleteTeam('nonexistent')).rejects.toThrow(
        'Team not found'
      );

      expect(client.query.mock.calls[3][0]).toBe('ROLLBACK');
      expect(client.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('addTeamMember', () => {
    it('should add a member to a team', async () => {
      const memberData = {
        user_id: 'user-1',
        role: 'Driver' as const,
      };

      const mockMember = {
        id: 'member-1',
        team_id: 'team-1',
        ...memberData,
        joined_at: new Date(),
        left_at: null,
      };

      // Mock check for existing active membership - none found
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock user existence check
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'user-1' }] });
      // Mock insertion
      mockDb.query.mockResolvedValueOnce({ rows: [mockMember] });

      const result = await teamsService.addTeamMember('team-1', memberData);

      expect(result).toEqual(mockMember);
      expect(mockDb.query).toHaveBeenCalledTimes(3);

      const insertCall = mockDb.query.mock.calls[2];
      expect(insertCall[0]).toContain('INSERT INTO team_members');
    });

    it('should prevent adding same user twice to same team', async () => {
      const memberData = {
        user_id: 'user-1',
        role: 'Driver' as const,
      };

      // Mock check for existing active membership - found active member
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'member-1',
            team_id: 'team-1',
            user_id: 'user-1',
            left_at: null,
          },
        ],
      });

      await expect(
        teamsService.addTeamMember('team-1', memberData)
      ).rejects.toThrow('User is already an active member of this team');
    });

    it('should allow re-adding user who previously left', async () => {
      const memberData = {
        user_id: 'user-1',
        role: 'Driver' as const,
      };

      const mockMember = {
        id: 'member-2',
        team_id: 'team-1',
        ...memberData,
        joined_at: new Date(),
        left_at: null,
      };

      // Mock check for existing active membership - found inactive member
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'member-1',
            team_id: 'team-1',
            user_id: 'user-1',
            left_at: new Date('2024-01-01'),
          },
        ],
      });
      // Mock user existence check
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'user-1' }] });
      // Mock insertion
      mockDb.query.mockResolvedValueOnce({ rows: [mockMember] });

      const result = await teamsService.addTeamMember('team-1', memberData);

      expect(result).toEqual(mockMember);
      expect(mockDb.query).toHaveBeenCalledTimes(3);
    });

    it('should validate user exists', async () => {
      const memberData = {
        user_id: 'nonexistent-user',
        role: 'Driver' as const,
      };

      // Mock check for existing active membership - none found
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock user existence check - user not found
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        teamsService.addTeamMember('team-1', memberData)
      ).rejects.toThrow('User not found');
    });

    it('should validate role enum values', async () => {
      const memberData = {
        user_id: 'user-1',
        role: 'InvalidRole' as any,
      };

      await expect(
        teamsService.addTeamMember('team-1', memberData)
      ).rejects.toThrow('Role must be one of: Driver, Builder, Programmer, Scout, Coach');
    });
  });

  describe('removeTeamMember', () => {
    it('should soft delete team member by setting left_at', async () => {
      const mockMember = {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'Driver',
        joined_at: new Date(),
        left_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockMember] });

      const result = await teamsService.removeTeamMember('team-1', 'user-1');

      expect(result).toEqual(mockMember);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE team_members');
      expect(queryCall[0]).toContain('left_at = NOW()');
      expect(queryCall[0]).toContain('WHERE team_id = $1 AND user_id = $2 AND left_at IS NULL');
    });

    it('should throw error if member not found or already removed', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        teamsService.removeTeamMember('team-1', 'user-1')
      ).rejects.toThrow('Team member not found or already removed');
    });
  });

  describe('updateTeamMemberRole', () => {
    it('should update member role', async () => {
      const updatedMember = {
        id: 'member-1',
        team_id: 'team-1',
        user_id: 'user-1',
        role: 'Builder',
        joined_at: new Date(),
        left_at: null,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedMember] });

      const result = await teamsService.updateTeamMemberRole('team-1', 'user-1', {
        role: 'Builder' as const,
      });

      expect(result.role).toBe('Builder');
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE team_members');
      expect(queryCall[0]).toContain('role = $');
      expect(queryCall[0]).toContain('WHERE team_id = $');
      expect(queryCall[0]).toContain('AND user_id = $');
      expect(queryCall[0]).toContain('AND left_at IS NULL');
    });

    it('should throw error if member not found or already removed', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        teamsService.updateTeamMemberRole('team-1', 'user-1', {
          role: 'Builder' as const,
        })
      ).rejects.toThrow('Team member not found or already removed');
    });

    it('should validate role enum values', async () => {
      await expect(
        teamsService.updateTeamMemberRole('team-1', 'user-1', {
          role: 'InvalidRole' as any,
        })
      ).rejects.toThrow('Role must be one of: Driver, Builder, Programmer, Scout, Coach');
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

      mockDb.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await teamsService.getTeamStats('team-1');

      expect(result).toEqual(mockStats);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('COUNT(DISTINCT tm.id)');
      expect(queryCall[0]).toContain('COUNT(DISTINCT ps.id)');
      expect(queryCall[0]).toContain('COUNT(DISTINCT cr.id)');
      expect(queryCall[0]).toContain('FROM teams t');
      expect(queryCall[0]).toContain('LEFT JOIN team_members tm');
      expect(queryCall[0]).toContain('LEFT JOIN practice_sessions ps');
      expect(queryCall[0]).toContain('LEFT JOIN competition_results cr');
    });

    it('should return null if team not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await teamsService.getTeamStats('nonexistent');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should only count active members (left_at IS NULL)', async () => {
      const mockStats = {
        team_id: 'team-1',
        member_count: 3, // Only active members
        practice_session_count: 12,
        competition_count: 3,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await teamsService.getTeamStats('team-1');

      expect(result?.member_count).toBe(3);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('tm.left_at IS NULL');
    });
  });
});
