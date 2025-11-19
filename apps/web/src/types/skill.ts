/**
 * Skill and assessment types
 */

export type SkillCategory = 'robotics' | 'programming' | 'engineering' | 'problem-solving';

export interface Skill {
  id: number;
  name: string;
  description: string;
  category: SkillCategory;
  level: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface StudentSkill {
  id: number;
  studentId: number;
  skillId: number;
  level: number; // 1-5
  earnedAt: string;
  createdAt: string;
  updatedAt: string;
}
