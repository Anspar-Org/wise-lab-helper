/**
 * Tests for notebookStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useNotebookStore } from './notebookStore';
import type { NotebookEntry } from '@/types/notebook';

describe('notebookStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useNotebookStore.setState({
      entries: [],
      currentEntry: null,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useNotebookStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.currentEntry).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add entry', () => {
    const mockEntry: NotebookEntry = {
      id: 1,
      studentId: 1,
      title: 'Test Entry',
      content: 'Test content',
      type: 'text',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { addEntry } = useNotebookStore.getState();
    addEntry(mockEntry);

    const state = useNotebookStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]).toEqual(mockEntry);
  });

  it('should update entry', () => {
    const mockEntry: NotebookEntry = {
      id: 1,
      studentId: 1,
      title: 'Original Title',
      content: 'Original content',
      type: 'text',
      tags: ['original'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useNotebookStore.setState({ entries: [mockEntry] });

    const { updateEntry } = useNotebookStore.getState();
    updateEntry(1, { title: 'Updated Title', content: 'Updated content' });

    const state = useNotebookStore.getState();
    expect(state.entries[0].title).toBe('Updated Title');
    expect(state.entries[0].content).toBe('Updated content');
  });

  it('should delete entry', () => {
    const mockEntry: NotebookEntry = {
      id: 1,
      studentId: 1,
      title: 'Test Entry',
      content: 'Test content',
      type: 'text',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useNotebookStore.setState({ entries: [mockEntry] });

    const { deleteEntry } = useNotebookStore.getState();
    deleteEntry(1);

    const state = useNotebookStore.getState();
    expect(state.entries).toHaveLength(0);
  });

  it('should set current entry', () => {
    const mockEntry: NotebookEntry = {
      id: 1,
      studentId: 1,
      title: 'Current Entry',
      content: 'Current content',
      type: 'text',
      tags: ['current'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { setCurrentEntry } = useNotebookStore.getState();
    setCurrentEntry(mockEntry);

    const state = useNotebookStore.getState();
    expect(state.currentEntry).toEqual(mockEntry);
  });

  it('should clear current entry when deleting it', () => {
    const mockEntry: NotebookEntry = {
      id: 1,
      studentId: 1,
      title: 'Test Entry',
      content: 'Test content',
      type: 'text',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useNotebookStore.setState({ entries: [mockEntry], currentEntry: mockEntry });

    const { deleteEntry } = useNotebookStore.getState();
    deleteEntry(1);

    const state = useNotebookStore.getState();
    expect(state.currentEntry).toBeNull();
  });
});
