/**
 * Lesson and progress types
 */

export type LessonType = 'lecture' | 'hands-on' | 'challenge';
export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  type: LessonType;
  difficulty: LessonDifficulty;
  duration: number; // in minutes
  objectives: string[];
  prerequisites: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: number;
  studentId: number;
  lessonId: number;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
