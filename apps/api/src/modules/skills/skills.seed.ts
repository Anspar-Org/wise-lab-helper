import { DatabaseService } from '../../config/database';
import { SkillCategory, GradeLevel } from '@stemlab/shared-types';

/**
 * Skills Seed Data
 *
 * Initial skills taxonomy covering 5 categories across grade levels K-5
 * Categories:
 * - Engineering Process (problem-solving, brainstorming, testing, iteration)
 * - Teamwork (communication, collaboration, conflict resolution)
 * - Research (question formulation, source evaluation)
 * - Technical (building, programming, tools)
 * - Presentation (public speaking, explaining concepts)
 */

interface SeedSkill {
  name: string;
  category: SkillCategory;
  description: string;
  grade_level: GradeLevel;
}

export const initialSkills: SeedSkill[] = [
  // =====================================================
  // ENGINEERING PROCESS SKILLS
  // =====================================================
  {
    name: 'Problem Identification',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Ability to recognize and clearly define engineering problems or challenges that need to be solved.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Brainstorming',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Generate multiple creative ideas and solutions to problems through structured thinking and discussion.',
    grade_level: GradeLevel.K,
  },
  {
    name: 'Design Planning',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Create detailed plans and sketches for engineering projects, including materials and steps needed.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Prototyping',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Build initial models or versions of designs to test ideas before creating the final product.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Testing Methodology',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Develop and conduct systematic tests to evaluate how well designs work and identify areas for improvement.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Iterative Improvement',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Use test results and feedback to make successive improvements to designs and solutions.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Documentation',
    category: SkillCategory.ENGINEERING_PROCESS,
    description:
      'Record the engineering process, including observations, measurements, and design changes in a clear and organized way.',
    grade_level: GradeLevel.FIVE,
  },

  // =====================================================
  // TEAMWORK SKILLS
  // =====================================================
  {
    name: 'Communication',
    category: SkillCategory.TEAMWORK,
    description:
      'Express ideas clearly and listen actively to team members, ensuring everyone understands the plan.',
    grade_level: GradeLevel.TWO,
  },
  {
    name: 'Collaboration',
    category: SkillCategory.TEAMWORK,
    description:
      'Work effectively with others toward common goals, sharing responsibilities and supporting teammates.',
    grade_level: GradeLevel.K,
  },
  {
    name: 'Active Listening',
    category: SkillCategory.TEAMWORK,
    description:
      'Pay full attention to others when they speak, ask clarifying questions, and acknowledge their ideas.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Conflict Resolution',
    category: SkillCategory.TEAMWORK,
    description:
      'Address disagreements constructively, find compromises, and maintain positive team dynamics.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Leadership',
    category: SkillCategory.TEAMWORK,
    description:
      'Guide and motivate team members, delegate tasks effectively, and ensure the team stays on track.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Sharing Resources',
    category: SkillCategory.TEAMWORK,
    description:
      'Take turns using materials and tools, ensuring fair access for all team members.',
    grade_level: GradeLevel.ONE,
  },

  // =====================================================
  // RESEARCH SKILLS
  // =====================================================
  {
    name: 'Question Formulation',
    category: SkillCategory.RESEARCH,
    description:
      'Develop clear, specific questions that guide research and investigation into topics or problems.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Source Evaluation',
    category: SkillCategory.RESEARCH,
    description:
      'Assess the reliability and relevance of information sources, distinguishing between credible and unreliable sources.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Note-Taking',
    category: SkillCategory.RESEARCH,
    description:
      'Record important information from research in an organized way, capturing key facts and ideas.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Information Synthesis',
    category: SkillCategory.RESEARCH,
    description:
      'Combine information from multiple sources to form comprehensive understanding and draw conclusions.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Observation Skills',
    category: SkillCategory.RESEARCH,
    description:
      'Notice and record details about objects, processes, or phenomena during investigations.',
    grade_level: GradeLevel.ONE,
  },

  // =====================================================
  // TECHNICAL SKILLS
  // =====================================================
  {
    name: 'Building and Assembly',
    category: SkillCategory.TECHNICAL,
    description:
      'Use various materials and fasteners to construct stable structures and mechanisms.',
    grade_level: GradeLevel.TWO,
  },
  {
    name: 'Programming Basics',
    category: SkillCategory.TECHNICAL,
    description:
      'Understand and write simple programs using block-based coding or text-based languages.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Tool Usage',
    category: SkillCategory.TECHNICAL,
    description:
      'Safely and effectively use hand tools, power tools, and specialized equipment for building and testing.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Measurement and Precision',
    category: SkillCategory.TECHNICAL,
    description:
      'Use measuring tools accurately and understand the importance of precise measurements in engineering.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Robot Control',
    category: SkillCategory.TECHNICAL,
    description:
      'Operate and program robots to perform specific tasks, adjusting controls for desired movements.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Simple Machines',
    category: SkillCategory.TECHNICAL,
    description:
      'Understand and apply concepts of levers, pulleys, gears, and other simple machines in designs.',
    grade_level: GradeLevel.THREE,
  },

  // =====================================================
  // PRESENTATION SKILLS
  // =====================================================
  {
    name: 'Public Speaking',
    category: SkillCategory.PRESENTATION,
    description:
      'Speak clearly and confidently in front of groups, maintaining eye contact and appropriate volume.',
    grade_level: GradeLevel.FOUR,
  },
  {
    name: 'Visual Communication',
    category: SkillCategory.PRESENTATION,
    description:
      'Create effective visual aids (posters, slides, demonstrations) to support presentations.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Explaining Concepts',
    category: SkillCategory.PRESENTATION,
    description:
      'Break down complex ideas into simpler terms that others can understand, using examples and analogies.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Interview Skills',
    category: SkillCategory.PRESENTATION,
    description:
      'Answer questions thoughtfully and ask clarifying questions during judging or evaluation sessions.',
    grade_level: GradeLevel.FIVE,
  },
  {
    name: 'Demonstrating Projects',
    category: SkillCategory.PRESENTATION,
    description:
      'Show how projects work, explaining the engineering process and decisions made along the way.',
    grade_level: GradeLevel.THREE,
  },
  {
    name: 'Show and Tell',
    category: SkillCategory.PRESENTATION,
    description:
      'Share ideas and creations with peers in an informal setting, building confidence in presenting.',
    grade_level: GradeLevel.K,
  },
];

/**
 * Seed the database with initial skills taxonomy
 *
 * @param db - Database service instance
 * @returns Number of skills created
 */
export async function seedSkills(db: DatabaseService): Promise<number> {
  console.log('🌱 Seeding skills taxonomy...');

  let created = 0;

  for (const skill of initialSkills) {
    try {
      // Check if skill already exists
      const existing = await db.query(
        'SELECT id FROM skills WHERE name = $1 AND category = $2 AND grade_level = $3',
        [skill.name, skill.category, skill.grade_level]
      );

      if (existing.rows.length === 0) {
        // Create new skill
        await db.query(
          `INSERT INTO skills (name, category, description, grade_level)
           VALUES ($1, $2, $3, $4)`,
          [skill.name, skill.category, skill.description, skill.grade_level]
        );
        created++;
        console.log(`  ✓ Created: ${skill.name} (${skill.category}, Grade ${skill.grade_level})`);
      } else {
        console.log(`  - Skipped: ${skill.name} (already exists)`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${skill.name}:`, error);
    }
  }

  console.log(`✅ Skills seeding complete: ${created} new skills created`);
  return created;
}

/**
 * Remove all seeded skills from the database
 * WARNING: This will delete all skills and their assessments
 *
 * @param db - Database service instance
 */
export async function clearSkills(db: DatabaseService): Promise<void> {
  console.log('🗑️  Clearing skills...');

  await db.query('DELETE FROM student_skills');
  await db.query('DELETE FROM skills');

  console.log('✅ All skills cleared');
}

/**
 * Get skill statistics by category
 *
 * @param db - Database service instance
 */
export async function getSkillStats(db: DatabaseService): Promise<void> {
  console.log('\n📊 Skills Statistics:');
  console.log('=====================');

  const result = await db.query(
    `SELECT
       category,
       COUNT(*) as count,
       json_agg(DISTINCT grade_level ORDER BY grade_level) as grade_levels
     FROM skills
     GROUP BY category
     ORDER BY category`
  );

  for (const row of result.rows) {
    console.log(`${row.category}: ${row.count} skills (Grades: ${row.grade_levels.join(', ')})`);
  }

  const total = await db.query('SELECT COUNT(*) as total FROM skills');
  console.log(`\nTotal Skills: ${total.rows[0].total}`);
}
