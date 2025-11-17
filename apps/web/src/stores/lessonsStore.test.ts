/**
 * Tests for lessonsStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useLessonsStore } from './lessonsStore';
import type { Lesson, LessonProgress } from '@/types/lesson';

describe('lessonsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useLessonsStore.setState({
      lessons: [],
      progress: [],
      currentLesson: null,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useLessonsStore.getState();
    expect(state.lessons).toEqual([]);
    expect(state.progress).toEqual([]);
    expect(state.currentLesson).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set lessons', () => {
    const mockLessons: Lesson[] = [
      {
        id: 1,
        title: 'Test Lesson',
        description: 'A test lesson',
        type: 'lecture',
        difficulty: 'beginner',
        duration: 30,
        objectives: ['Learn basics'],
        prerequisites: [],
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const { setLessons } = useLessonsStore.getState();
    setLessons(mockLessons);

    const state = useLessonsStore.getState();
    expect(state.lessons).toEqual(mockLessons);
  });

  it('should set progress', () => {
    const mockProgress: LessonProgress[] = [
      {
        id: 1,
        studentId: 1,
        lessonId: 1,
        status: 'in-progress',
        progress: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const { setProgress } = useLessonsStore.getState();
    setProgress(mockProgress);

    const state = useLessonsStore.getState();
    expect(state.progress).toEqual(mockProgress);
  });

  it('should update existing progress', () => {
    const mockProgress: LessonProgress = {
      id: 1,
      studentId: 1,
      lessonId: 1,
      status: 'in-progress',
      progress: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useLessonsStore.setState({ progress: [mockProgress] });

    const { updateProgress } = useLessonsStore.getState();
    updateProgress(1, 75);

    const state = useLessonsStore.getState();
    expect(state.progress[0].progress).toBe(75);
  });

  it('should create new progress if it does not exist', () => {
    const { updateProgress } = useLessonsStore.getState();
    updateProgress(1, 25);

    const state = useLessonsStore.getState();
    expect(state.progress).toHaveLength(1);
    expect(state.progress[0].lessonId).toBe(1);
    expect(state.progress[0].progress).toBe(25);
  });

  it('should set current lesson', () => {
    const mockLesson: Lesson = {
      id: 1,
      title: 'Current Lesson',
      description: 'A current lesson',
      type: 'hands-on',
      difficulty: 'intermediate',
      duration: 45,
      objectives: ['Practice'],
      prerequisites: [],
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { setCurrentLesson } = useLessonsStore.getState();
    setCurrentLesson(mockLesson);

    const state = useLessonsStore.getState();
    expect(state.currentLesson).toEqual(mockLesson);
  });
});
