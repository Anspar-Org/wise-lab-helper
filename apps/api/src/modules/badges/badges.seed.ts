import { DatabaseService } from '../../config/database';
import { BadgeCategory, CreateBadgeRequest } from '@stemlab/shared-types';

/**
 * Badge Seed Data
 *
 * Initial badge definitions covering:
 * - Methodology badges (engineering process)
 * - Skill badges (competencies)
 * - Engagement badges (participation)
 * - Team badges (collaboration)
 */

export const INITIAL_BADGES: CreateBadgeRequest[] = [
  // =====================================================
  // METHODOLOGY BADGES
  // =====================================================
  {
    name: 'Problem Solver',
    description: 'Identify and document 5 problems in your engineering notebook',
    icon: 'lightbulb',
    category: BadgeCategory.METHODOLOGY,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 5,
        entry_type: 'brainstorm',
      },
    },
  },
  {
    name: 'Idea Generator',
    description: 'Complete 3 lessons in the methodology category',
    icon: 'sparkles',
    category: BadgeCategory.METHODOLOGY,
    criteria: {
      type: 'lesson_count',
      requirements: {
        count: 3,
        category: 'methodology',
      },
    },
  },
  {
    name: 'Design Thinker',
    description: 'Create 3 design entries in your engineering notebook',
    icon: 'pencil-ruler',
    category: BadgeCategory.METHODOLOGY,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 3,
        entry_type: 'design',
      },
    },
  },
  {
    name: 'Test Master',
    description: 'Document 10 tests in your engineering notebook',
    icon: 'flask',
    category: BadgeCategory.METHODOLOGY,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 10,
        entry_type: 'test',
      },
    },
  },
  {
    name: 'Iteration Champion',
    description: 'Document 5 design iterations showing improvement',
    icon: 'refresh-cw',
    category: BadgeCategory.METHODOLOGY,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 5,
        entry_type: 'reflection',
      },
    },
  },

  // =====================================================
  // SKILL BADGES
  // =====================================================
  {
    name: 'Team Player',
    description: 'Reach proficient level in teamwork skills',
    icon: 'users',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'teamwork',
        level: 'proficient',
      },
    },
  },
  {
    name: 'Master Researcher',
    description: 'Reach proficient level in research skills',
    icon: 'search',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'research',
        level: 'proficient',
      },
    },
  },
  {
    name: 'Builder',
    description: 'Reach proficient level in technical/building skills',
    icon: 'hammer',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'technical',
        level: 'proficient',
      },
    },
  },
  {
    name: 'Coding Champion',
    description: 'Reach proficient level in programming skills',
    icon: 'code',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'technical',
        level: 'proficient',
      },
    },
  },
  {
    name: 'Presenter Pro',
    description: 'Reach proficient level in presentation skills',
    icon: 'presentation',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'presentation',
        level: 'proficient',
      },
    },
  },
  {
    name: 'Master Engineer',
    description: 'Reach advanced level in any skill category',
    icon: 'award',
    category: BadgeCategory.SKILL,
    criteria: {
      type: 'skill_level',
      requirements: {
        skill_category: 'engineering_process',
        level: 'advanced',
      },
    },
  },

  // =====================================================
  // ENGAGEMENT BADGES
  // =====================================================
  {
    name: 'First Day',
    description: 'Complete your first lesson',
    icon: 'star',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'lesson_count',
      requirements: {
        count: 1,
      },
    },
  },
  {
    name: 'Getting Started',
    description: 'Complete 3 lessons',
    icon: 'flag',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'lesson_count',
      requirements: {
        count: 3,
      },
    },
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: 'book-open',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'lesson_count',
      requirements: {
        count: 10,
      },
    },
  },
  {
    name: 'Notebook Keeper',
    description: 'Create 10 engineering notebook entries',
    icon: 'notebook',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 10,
      },
    },
  },
  {
    name: 'Prolific Writer',
    description: 'Create 25 engineering notebook entries',
    icon: 'pen-tool',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'notebook_count',
      requirements: {
        minimum: 25,
      },
    },
  },
  {
    name: 'Week Warrior',
    description: 'Complete lessons for 5 consecutive days',
    icon: 'calendar-check',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'streak',
      requirements: {
        days: 5,
      },
    },
  },
  {
    name: 'Marathon Runner',
    description: 'Spend 100+ minutes learning',
    icon: 'clock',
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: 'time_spent',
      requirements: {
        minutes: 100,
      },
    },
  },

  // =====================================================
  // TEAM BADGES
  // =====================================================
  {
    name: 'Team Captain',
    description: 'Take on a leadership role in your team',
    icon: 'shield',
    category: BadgeCategory.TEAM,
    criteria: {
      type: 'custom',
      requirements: {
        custom_check: 'checkTeamCaptain',
      },
    },
  },
  {
    name: 'Helpful Helper',
    description: 'Help a teammate with their work',
    icon: 'heart',
    category: BadgeCategory.TEAM,
    criteria: {
      type: 'custom',
      requirements: {
        custom_check: 'checkHelper',
      },
    },
  },
];

/**
 * Seed badges into the database
 *
 * @param db - Database service
 */
export async function seedBadges(db: DatabaseService): Promise<void> {
  console.log('Seeding badges...');

  let successCount = 0;
  let skipCount = 0;

  for (const badge of INITIAL_BADGES) {
    try {
      // Check if badge already exists
      const existing = await db.query(
        'SELECT id FROM badges WHERE name = $1',
        [badge.name]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  Badge "${badge.name}" already exists, skipping`);
        skipCount++;
        continue;
      }

      // Insert badge
      await db.query(
        `INSERT INTO badges (name, description, icon, category, criteria)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          badge.name,
          badge.description,
          badge.icon,
          badge.category,
          JSON.stringify(badge.criteria),
        ]
      );

      console.log(`  ✅ Created badge: ${badge.name}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to create badge "${badge.name}":`, error);
    }
  }

  console.log(`\nBadge seeding complete:`);
  console.log(`  Created: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Total: ${INITIAL_BADGES.length}`);
}

/**
 * Remove all seeded badges from the database
 *
 * @param db - Database service
 */
export async function unseedBadges(db: DatabaseService): Promise<void> {
  console.log('Removing seeded badges...');

  const badgeNames = INITIAL_BADGES.map((b) => b.name);

  try {
    const result = await db.query(
      `DELETE FROM badges WHERE name = ANY($1)
       RETURNING name`,
      [badgeNames]
    );

    console.log(`  ✅ Removed ${result.rows.length} badges`);
  } catch (error) {
    console.error('  ❌ Failed to remove badges:', error);
  }
}
