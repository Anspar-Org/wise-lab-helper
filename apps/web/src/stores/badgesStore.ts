/**
 * Badges store
 * Manages badges and student achievements
 */

import { create } from 'zustand';
import type { Badge, StudentBadge } from '@/types/badge';

interface BadgesState {
  badges: Badge[];
  studentBadges: StudentBadge[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setBadges: (badges: Badge[]) => void;
  setStudentBadges: (studentBadges: StudentBadge[]) => void;
  addStudentBadge: (studentBadge: StudentBadge) => void;
  clearError: () => void;
}

export const useBadgesStore = create<BadgesState>((set) => ({
  badges: [],
  studentBadges: [],
  isLoading: false,
  error: null,

  setBadges: (badges: Badge[]) => {
    set({ badges, error: null });
  },

  setStudentBadges: (studentBadges: StudentBadge[]) => {
    set({ studentBadges, error: null });
  },

  addStudentBadge: (studentBadge: StudentBadge) => {
    set((state) => ({
      studentBadges: [...state.studentBadges, studentBadge],
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
