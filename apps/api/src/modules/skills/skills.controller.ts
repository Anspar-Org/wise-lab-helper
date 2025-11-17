import { Request, Response } from 'express';
import { SkillsService } from './skills.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { SkillCategory, GradeLevel, SkillLevel } from '@stemlab/shared-types';

/**
 * Skills Controller
 *
 * Handles HTTP requests for skills and assessments
 */
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  /**
   * Create a new skill
   * POST /api/v1/skills
   * Auth: Coach or Admin
   */
  async createSkill(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, description, grade_level } = req.body;

      const skill = await this.skillsService.createSkill({
        name,
        category,
        description,
        grade_level,
      });

      res.status(201).json(skill);
    } catch (error: any) {
      if (
        error.message.includes('must be') ||
        error.message.includes('Invalid') ||
        error.message.includes('required')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create skill',
        });
      }
    }
  }

  /**
   * Update an existing skill
   * PUT /api/v1/skills/:id
   * Auth: Coach or Admin
   */
  async updateSkill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const skill = await this.skillsService.updateSkill(id, updateData);

      if (!skill) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Skill not found',
        });
        return;
      }

      res.json(skill);
    } catch (error: any) {
      if (
        error.message.includes('must be') ||
        error.message.includes('Invalid') ||
        error.message.includes('required')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update skill',
        });
      }
    }
  }

  /**
   * Get a skill by ID
   * GET /api/v1/skills/:id
   * Auth: Any authenticated user
   */
  async getSkill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const skill = await this.skillsService.getSkillById(id);

      if (!skill) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Skill not found',
        });
        return;
      }

      res.json(skill);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve skill',
      });
    }
  }

  /**
   * List all skills with optional filters
   * GET /api/v1/skills
   * Auth: Any authenticated user
   */
  async listSkills(req: Request, res: Response): Promise<void> {
    try {
      const { category, grade_level } = req.query;

      const filters: {
        category?: SkillCategory;
        grade_level?: GradeLevel;
      } = {};

      if (category) {
        filters.category = category as SkillCategory;
      }

      if (grade_level) {
        filters.grade_level = grade_level as GradeLevel;
      }

      const skills = await this.skillsService.listSkills(filters);

      res.json(skills);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve skills',
      });
    }
  }

  /**
   * Delete a skill
   * DELETE /api/v1/skills/:id
   * Auth: Coach or Admin
   */
  async deleteSkill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.skillsService.deleteSkill(id);

      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Skill not found') {
        res.status(404).json({
          error: 'Not Found',
          message: 'Skill not found',
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to delete skill',
        });
      }
    }
  }

  /**
   * Assess a student's skill level
   * POST /api/v1/students/:studentId/skills
   * Auth: Coach or Admin
   */
  async assessStudentSkill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const { skill_id, level, evidence_notes } = req.body;

      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const assessment = await this.skillsService.assessStudentSkill({
        student_id: studentId,
        skill_id,
        level,
        evidence_notes,
        assessed_by: req.user.userId,
      });

      res.status(201).json(assessment);
    } catch (error: any) {
      if (
        error.message.includes('must') ||
        error.message.includes('Invalid') ||
        error.message.includes('required')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to assess skill',
        });
      }
    }
  }

  /**
   * Update a student's skill assessment
   * PUT /api/v1/students/:studentId/skills/:skillId
   * Auth: Coach or Admin
   */
  async updateStudentSkillAssessment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { studentId, skillId } = req.params;
      const { level, evidence_notes } = req.body;

      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const assessment = await this.skillsService.assessStudentSkill({
        student_id: studentId,
        skill_id: skillId,
        level,
        evidence_notes,
        assessed_by: req.user.userId,
      });

      res.json(assessment);
    } catch (error: any) {
      if (
        error.message.includes('must') ||
        error.message.includes('Invalid') ||
        error.message.includes('required')
      ) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update assessment',
        });
      }
    }
  }

  /**
   * Get a student's skill profile
   * GET /api/v1/students/:studentId/skills
   * Auth: Student (own profile), Coach, or Admin
   */
  async getStudentSkillProfile(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      const profile = await this.skillsService.getStudentSkillProfile(studentId);

      res.json(profile);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve skill profile',
      });
    }
  }

  /**
   * Get current user's skill profile
   * GET /api/v1/me/skills
   * Auth: Any authenticated user
   */
  async getMySkills(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const profile = await this.skillsService.getStudentSkillProfile(req.user.userId);

      res.json(profile);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve skill profile',
      });
    }
  }

  /**
   * Get all students assessed for a skill
   * GET /api/v1/skills/:skillId/students
   * Auth: Coach or Admin
   */
  async getSkillStudents(req: Request, res: Response): Promise<void> {
    try {
      const { skillId } = req.params;

      const students = await this.skillsService.getSkillStudents(skillId);

      res.json(students);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve students',
      });
    }
  }

  /**
   * Get skill progress history for a student
   * GET /api/v1/students/:studentId/skills/:skillId/history
   * Auth: Student (own history), Coach, or Admin
   */
  async getSkillProgressHistory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, skillId } = req.params;

      const history = await this.skillsService.getSkillProgressHistory(studentId, skillId);

      res.json(history);
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve skill history',
      });
    }
  }
}
