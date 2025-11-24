import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PracticeSessionsService } from './practice-sessions.service';
import { DatabaseService } from '../../config/database';

// Mock the database service
vi.mock('../../config/database');

describe('PracticeSessionsService', () => {
  let practiceSessionsService: PracticeSessionsService;
  let mockDb: any;

  beforeEach(() => {
    // Create a fresh mock database for each test
    mockDb = {
      query: vi.fn(),
      getClient: vi.fn(),
    };

    practiceSessionsService = new PracticeSessionsService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPracticeSession', () => {
    it('should create a new practice session', async () => {
      const sessionData = {
        team_id: 'team-uuid-1',
        session_date: new Date('2024-03-15'),
        duration_minutes: 90,
        notes: 'First practice session',
      };

      const mockSession = {
        id: 'session-uuid-1',
        ...sessionData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockSession] });

      const result = await practiceSessionsService.createPracticeSession(sessionData);

      expect(result).toEqual(mockSession);
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('INSERT INTO practice_sessions');
      expect(queryCall[1][0]).toBe(sessionData.team_id);
    });

    it('should validate team_id exists', async () => {
      const sessionData = {
        team_id: 'nonexistent-team-uuid',
        session_date: new Date('2024-03-15'),
        duration_minutes: 90,
      };

      mockDb.query.mockRejectedValueOnce({
        code: '23503', // Foreign key violation
        message: 'Team not found',
      });

      await expect(
        practiceSessionsService.createPracticeSession(sessionData)
      ).rejects.toThrow('Team not found');
    });

    it('should require positive duration_minutes', async () => {
      const sessionData = {
        team_id: 'team-uuid-1',
        session_date: new Date('2024-03-15'),
        duration_minutes: -10,
      };

      await expect(
        practiceSessionsService.createPracticeSession(sessionData)
      ).rejects.toThrow('duration_minutes must be a positive integer');
    });
  });

  describe('getPracticeSessions', () => {
    it('should return all practice sessions without filters', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          team_id: 'team-1',
          session_date: new Date('2024-03-15'),
          duration_minutes: 90,
          notes: 'Session 1',
          rotation_count: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'session-2',
          team_id: 'team-1',
          session_date: new Date('2024-03-16'),
          duration_minutes: 120,
          notes: 'Session 2',
          rotation_count: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockSessions, rowCount: 2 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 2 }] });

      const result = await practiceSessionsService.getPracticeSessions({});

      expect(result.data).toEqual(mockSessions);
      expect(result.data.length).toBe(2);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should filter by team_id', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          team_id: 'team-specific',
          session_date: new Date('2024-03-15'),
          duration_minutes: 90,
          rotation_count: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockSessions, rowCount: 1 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 1 }] });

      const result = await practiceSessionsService.getPracticeSessions({
        team_id: 'team-specific',
      });

      expect(result.data).toEqual(mockSessions);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('WHERE');
      expect(queryCall[0]).toContain('team_id = $');
    });

    it('should filter by date range', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          team_id: 'team-1',
          session_date: new Date('2024-03-15'),
          duration_minutes: 90,
          rotation_count: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockSessions, rowCount: 1 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 1 }] });

      const result = await practiceSessionsService.getPracticeSessions({
        date_from: '2024-03-01',
        date_to: '2024-03-31',
      });

      expect(result.data).toEqual(mockSessions);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('session_date >= $');
      expect(queryCall[0]).toContain('session_date <= $');
    });

    it('should support pagination', async () => {
      const mockSessions = [
        {
          id: 'session-3',
          team_id: 'team-1',
          session_date: new Date('2024-03-17'),
          duration_minutes: 90,
          rotation_count: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock main query
      mockDb.query.mockResolvedValueOnce({ rows: mockSessions, rowCount: 1 });
      // Mock count query
      mockDb.query.mockResolvedValueOnce({ rows: [{ total: 10 }] });

      const result = await practiceSessionsService.getPracticeSessions({
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(10);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('LIMIT');
      expect(queryCall[0]).toContain('OFFSET');
    });
  });

  describe('getPracticeSessionById', () => {
    it('should return session with rotations', async () => {
      const mockSessionWithRotations = {
        id: 'session-1',
        team_id: 'team-1',
        session_date: new Date('2024-03-15'),
        duration_minutes: 90,
        notes: 'Session with rotations',
        created_at: new Date(),
        updated_at: new Date(),
        rotations: [
          {
            id: 'rotation-1',
            session_id: 'session-1',
            student_id: 'student-1',
            station: 'Building',
            start_time: '14:00:00',
            created_at: new Date(),
          },
          {
            id: 'rotation-2',
            session_id: 'session-1',
            student_id: 'student-2',
            station: 'Programming',
            start_time: '14:00:00',
            created_at: new Date(),
          },
        ],
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockSessionWithRotations] });

      const result = await practiceSessionsService.getPracticeSessionById('session-1');

      expect(result).toEqual(mockSessionWithRotations);
      expect(result?.rotations).toHaveLength(2);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return null if session not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await practiceSessionsService.getPracticeSessionById('nonexistent');

      expect(result).toBeNull();
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePracticeSession', () => {
    it('should update session date', async () => {
      const updatedSession = {
        id: 'session-1',
        team_id: 'team-1',
        session_date: new Date('2024-03-20'),
        duration_minutes: 90,
        notes: 'Original notes',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedSession] });

      const result = await practiceSessionsService.updatePracticeSession('session-1', {
        session_date: new Date('2024-03-20'),
      });

      expect(result.session_date).toEqual(new Date('2024-03-20'));
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('UPDATE practice_sessions');
      expect(queryCall[0]).toContain('session_date');
    });

    it('should update duration_minutes', async () => {
      const updatedSession = {
        id: 'session-1',
        team_id: 'team-1',
        session_date: new Date('2024-03-15'),
        duration_minutes: 120,
        notes: 'Original notes',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedSession] });

      const result = await practiceSessionsService.updatePracticeSession('session-1', {
        duration_minutes: 120,
      });

      expect(result.duration_minutes).toBe(120);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should update notes', async () => {
      const updatedSession = {
        id: 'session-1',
        team_id: 'team-1',
        session_date: new Date('2024-03-15'),
        duration_minutes: 90,
        notes: 'Updated notes',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedSession] });

      const result = await practiceSessionsService.updatePracticeSession('session-1', {
        notes: 'Updated notes',
      });

      expect(result.notes).toBe('Updated notes');
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if session not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        practiceSessionsService.updatePracticeSession('nonexistent', {
          notes: 'New notes',
        })
      ).rejects.toThrow('Practice session not found');
    });

    it('should require at least one field to update', async () => {
      await expect(
        practiceSessionsService.updatePracticeSession('session-1', {})
      ).rejects.toThrow('No update data provided');
    });
  });

  describe('deletePracticeSession', () => {
    it('should delete a practice session', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'session-1' }] });

      await practiceSessionsService.deletePracticeSession('session-1');

      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('DELETE FROM practice_sessions');
      expect(queryCall[1][0]).toBe('session-1');
    });

    it('should throw error if session not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        practiceSessionsService.deletePracticeSession('nonexistent')
      ).rejects.toThrow('Practice session not found');
    });
  });

  describe('addRotation', () => {
    it('should add a rotation to a session', async () => {
      const rotationData = {
        student_id: 'student-1',
        station: 'Building' as const,
        start_time: '14:00:00',
      };

      const mockRotation = {
        id: 'rotation-1',
        session_id: 'session-1',
        ...rotationData,
        created_at: new Date(),
      };

      // Mock overlap check - no overlaps
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // Mock insertion
      mockDb.query.mockResolvedValueOnce({ rows: [mockRotation] });

      const result = await practiceSessionsService.addRotation('session-1', rotationData);

      expect(result).toEqual(mockRotation);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const insertCall = mockDb.query.mock.calls[1];
      expect(insertCall[0]).toContain('INSERT INTO session_rotations');
    });

    it('should prevent overlapping rotations for same student', async () => {
      const rotationData = {
        student_id: 'student-1',
        station: 'Building' as const,
        start_time: '14:00:00',
      };

      // Mock overlap check - student already has rotation in this session
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'existing-rotation',
            student_id: 'student-1',
            session_id: 'session-1',
            station: 'Programming',
            start_time: '14:00:00',
          },
        ],
      });

      await expect(
        practiceSessionsService.addRotation('session-1', rotationData)
      ).rejects.toThrow('Student already has a rotation in this session');
    });

    it('should validate station enum values', async () => {
      const rotationData = {
        student_id: 'student-1',
        station: 'InvalidStation' as any,
        start_time: '14:00:00',
      };

      await expect(
        practiceSessionsService.addRotation('session-1', rotationData)
      ).rejects.toThrow('Station must be one of: Building, Programming, Driving, Documentation');
    });
  });

  describe('getRotations', () => {
    it('should return all rotations for a session', async () => {
      const mockRotations = [
        {
          id: 'rotation-1',
          session_id: 'session-1',
          student_id: 'student-1',
          station: 'Building',
          start_time: '14:00:00',
          created_at: new Date(),
        },
        {
          id: 'rotation-2',
          session_id: 'session-1',
          student_id: 'student-2',
          station: 'Programming',
          start_time: '14:00:00',
          created_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValueOnce({ rows: mockRotations });

      const result = await practiceSessionsService.getRotations('session-1');

      expect(result).toEqual(mockRotations);
      expect(result.length).toBe(2);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no rotations', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await practiceSessionsService.getRotations('session-1');

      expect(result).toEqual([]);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateRotation', () => {
    it('should update rotation station', async () => {
      const updatedRotation = {
        id: 'rotation-1',
        session_id: 'session-1',
        student_id: 'student-1',
        station: 'Driving',
        start_time: '14:00:00',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedRotation] });

      const result = await practiceSessionsService.updateRotation(
        'session-1',
        'rotation-1',
        { station: 'Driving' as const }
      );

      expect(result.station).toBe('Driving');
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should update rotation start_time', async () => {
      const updatedRotation = {
        id: 'rotation-1',
        session_id: 'session-1',
        student_id: 'student-1',
        station: 'Building',
        start_time: '15:00:00',
        created_at: new Date(),
      };

      mockDb.query.mockResolvedValueOnce({ rows: [updatedRotation] });

      const result = await practiceSessionsService.updateRotation(
        'session-1',
        'rotation-1',
        { start_time: '15:00:00' }
      );

      expect(result.start_time).toBe('15:00:00');
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error if rotation not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        practiceSessionsService.updateRotation('session-1', 'nonexistent', {
          station: 'Building' as const,
        })
      ).rejects.toThrow('Rotation not found');
    });
  });

  describe('deleteRotation', () => {
    it('should delete a rotation', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'rotation-1' }] });

      await practiceSessionsService.deleteRotation('session-1', 'rotation-1');

      expect(mockDb.query).toHaveBeenCalledTimes(1);

      const queryCall = mockDb.query.mock.calls[0];
      expect(queryCall[0]).toContain('DELETE FROM session_rotations');
      expect(queryCall[1][0]).toBe('rotation-1');
      expect(queryCall[1][1]).toBe('session-1');
    });

    it('should throw error if rotation not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        practiceSessionsService.deleteRotation('session-1', 'nonexistent')
      ).rejects.toThrow('Rotation not found');
    });
  });
});
