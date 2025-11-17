/**
 * Lessons store
 * Manages lessons and student progress
 */

import { create } from 'zustand';
import type { Lesson, LessonProgress } from '@/types/lesson';

interface LessonsState {
  lessons: Lesson[];
  progress: LessonProgress[];
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLessons: (lessons: Lesson[]) => void;
  setProgress: (progress: LessonProgress[]) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  updateProgress: (lessonId: number, progressValue: number) => void;
  clearError: () => void;
}

export const useLessonsStore = create<LessonsState>((set) => ({
  lessons: [],
  progress: [],
  currentLesson: null,
  isLoading: false,
  error: null,

  setLessons: (lessons: Lesson[]) => {
    set({ lessons, error: null });
  },

  setProgress: (progress: LessonProgress[]) => {
    set({ progress, error: null });
  },

  setCurrentLesson: (lesson: Lesson | null) => {
    set({ currentLesson: lesson });
  },

  updateProgress: (lessonId: number, progressValue: number) => {
    set((state) => {
      const existingProgress = state.progress.find(
        (p) => p.lessonId === lessonId
      );

      if (existingProgress) {
        return {
          progress: state.progress.map((p) =>
            p.lessonId === lessonId
              ? { ...p, progress: progressValue }
              : p
          ),
        };
      }

      // If progress doesn't exist, create a new one
      const newProgress: LessonProgress = {
        id: Date.now(), // Temporary ID
        studentId: 0, // Will be set from auth store
        lessonId,
        status: progressValue > 0 ? 'in-progress' : 'not-started',
        progress: progressValue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        progress: [...state.progress, newProgress],
      };
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
