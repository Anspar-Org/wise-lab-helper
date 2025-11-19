/**
 * Badge and achievement types
 */

export type BadgeCategory = 'achievement' | 'skill' | 'participation' | 'special';

export interface Badge {
  id: number;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl?: string;
  criteria: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBadge {
  id: number;
  studentId: number;
  badgeId: number;
  earnedAt: string;
  createdAt: string;
  updatedAt: string;
}
