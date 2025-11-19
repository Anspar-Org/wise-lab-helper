/**
 * Notebook store
 * Manages student notebook entries
 */

import { create } from 'zustand';
import type { NotebookEntry } from '@/types/notebook';

interface NotebookState {
  entries: NotebookEntry[];
  currentEntry: NotebookEntry | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEntries: (entries: NotebookEntry[]) => void;
  addEntry: (entry: NotebookEntry) => void;
  updateEntry: (id: number, updates: Partial<NotebookEntry>) => void;
  deleteEntry: (id: number) => void;
  setCurrentEntry: (entry: NotebookEntry | null) => void;
  clearError: () => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  setEntries: (entries: NotebookEntry[]) => {
    set({ entries, error: null });
  },

  addEntry: (entry: NotebookEntry) => {
    set((state) => ({
      entries: [...state.entries, entry],
    }));
  },

  updateEntry: (id: number, updates: Partial<NotebookEntry>) => {
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  },

  deleteEntry: (id: number) => {
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
      currentEntry:
        state.currentEntry?.id === id ? null : state.currentEntry,
    }));
  },

  setCurrentEntry: (entry: NotebookEntry | null) => {
    set({ currentEntry: entry });
  },

  clearError: () => {
    set({ error: null });
  },
}));
