/**
 * Notebook entry types
 */

export type EntryType = 'text' | 'image' | 'code' | 'reflection';

export interface NotebookEntry {
  id: number;
  studentId: number;
  lessonId?: number;
  title: string;
  content: string;
  type: EntryType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
