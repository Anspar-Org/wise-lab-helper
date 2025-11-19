/**
 * Skills store
 * Manages student skills and assessments
 */

import { create } from 'zustand';
import type { Skill, StudentSkill } from '@/types/skill';

interface SkillsState {
  skills: Skill[];
  studentSkills: StudentSkill[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSkills: (skills: Skill[]) => void;
  setStudentSkills: (studentSkills: StudentSkill[]) => void;
  addStudentSkill: (studentSkill: StudentSkill) => void;
  updateSkillLevel: (skillId: number, level: number) => void;
  clearError: () => void;
}

export const useSkillsStore = create<SkillsState>((set) => ({
  skills: [],
  studentSkills: [],
  isLoading: false,
  error: null,

  setSkills: (skills: Skill[]) => {
    set({ skills, error: null });
  },

  setStudentSkills: (studentSkills: StudentSkill[]) => {
    set({ studentSkills, error: null });
  },

  addStudentSkill: (studentSkill: StudentSkill) => {
    set((state) => ({
      studentSkills: [...state.studentSkills, studentSkill],
    }));
  },

  updateSkillLevel: (skillId: number, level: number) => {
    set((state) => ({
      studentSkills: state.studentSkills.map((ss) =>
        ss.skillId === skillId ? { ...ss, level } : ss
      ),
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
