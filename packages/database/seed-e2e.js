/**
 * E2E Test Database Seeding Script
 * Seeds the test database with realistic test data
 *
 * Run with: node packages/database/seed-e2e.js
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

const { Pool } = pg;

// Use test database URL or default
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:testpassword@localhost:5433/stemlab_test';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

/**
 * Test data fixtures matching E2E test expectations
 */
const TEST_DATA = {
  students: [
    {
      username: 'testStudent1',
      display_name: 'Test Student 1',
      pin: '1234',
      grade: '3',
      avatar: JSON.stringify({ style: 'robot' }),
      auth_method: 'pin'
    },
    {
      username: 'youngLearner',
      display_name: 'Young Learner',
      animal_pattern: JSON.stringify(['cat', 'dog', 'bird', 'fish']),
      grade: 'K',
      avatar: JSON.stringify({ style: 'dinosaur' }),
      auth_method: 'animal_grid'
    },
  ],
  coaches: [
    {
      username: 'coach1',
      email: 'coach1@test.com',
      password: 'TestPassword123!',
      display_name: 'Coach Smith'
    },
  ],
  lessons: [
    {
      title: 'Introduction to VEX IQ',
      content: { description: 'Learn the basics of VEX IQ robotics', sections: [] },
      category: 'technical',
      grade_level: '3',
      duration_minutes: 30,
      learning_objectives: ['Understand robot parts', 'Identify basic components'],
      published: true
    },
    {
      title: 'Building Your First Robot',
      content: { description: 'Step-by-step guide to building a simple robot', sections: [] },
      category: 'technical',
      grade_level: '4',
      duration_minutes: 45,
      learning_objectives: ['Follow build instructions', 'Use tools properly'],
      published: true
    },
  ],
  skills: [
    {
      name: 'Problem Solving',
      category: 'engineering_process',
      description: 'Ability to identify and solve engineering problems',
      grade_level: '3'
    },
    {
      name: 'Team Collaboration',
      category: 'teamwork',
      description: 'Working effectively with team members',
      grade_level: '4'
    },
  ],
  badges: [
    {
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'trophy',
      category: 'engagement',
      criteria: {
        type: 'lesson_completion',
        count: 1
      }
    },
    {
      name: 'Team Player',
      description: 'Demonstrate excellent teamwork',
      icon: 'users',
      category: 'skill',
      criteria: {
        type: 'skill_assessment',
        skill: 'Team Collaboration',
        level: 'proficient'
      }
    },
  ],
};

/**
 * Clear existing test data
 */
async function clearDatabase() {
  console.log('🗑️  Clearing existing test data...');

  try {
    await pool.query('TRUNCATE TABLE student_badges CASCADE');
    await pool.query('TRUNCATE TABLE student_skills CASCADE');
    await pool.query('TRUNCATE TABLE student_lesson_progress CASCADE');
    await pool.query('TRUNCATE TABLE lesson_steps CASCADE');
    await pool.query('TRUNCATE TABLE notebook_entries CASCADE');
    await pool.query('TRUNCATE TABLE badges CASCADE');
    await pool.query('TRUNCATE TABLE skills CASCADE');
    await pool.query('TRUNCATE TABLE lessons CASCADE');
    await pool.query('TRUNCATE TABLE users CASCADE');

    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Seed students
 */
async function seedStudents() {
  console.log('👨‍🎓 Seeding students...');

  for (const student of TEST_DATA.students) {
    const hashedPin = student.pin ? await bcrypt.hash(student.pin, 10) : null;
    const hashedAnimalPattern = student.animal_pattern ? await bcrypt.hash(student.animal_pattern, 10) : null;

    await pool.query(
      `INSERT INTO users (username, display_name, pin_hash, animal_pattern_hash, grade_level, avatar_config, role, auth_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'student', $7, NOW())`,
      [student.username, student.display_name, hashedPin, hashedAnimalPattern, student.grade, student.avatar, student.auth_method]
    );
  }

  console.log(`✅ Seeded ${TEST_DATA.students.length} students`);
}

/**
 * Seed coaches
 */
async function seedCoaches() {
  console.log('👨‍🏫 Seeding coaches...');

  for (const coach of TEST_DATA.coaches) {
    const hashedPassword = await bcrypt.hash(coach.password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, role, auth_type, created_at)
       VALUES ($1, $2, $3, $4, 'coach', 'password', NOW())`,
      [coach.username, coach.email, hashedPassword, coach.display_name]
    );
  }

  console.log(`✅ Seeded ${TEST_DATA.coaches.length} coaches`);
}

/**
 * Seed lessons
 */
async function seedLessons() {
  console.log('📚 Seeding lessons...');

  for (const lesson of TEST_DATA.lessons) {
    await pool.query(
      `INSERT INTO lessons (title, content, category, grade_level, duration_minutes, learning_objectives, published, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [lesson.title, lesson.content, lesson.category, lesson.grade_level, lesson.duration_minutes, lesson.learning_objectives, lesson.published]
    );
  }

  console.log(`✅ Seeded ${TEST_DATA.lessons.length} lessons`);
}

/**
 * Seed skills
 */
async function seedSkills() {
  console.log('🎯 Seeding skills...');

  for (const skill of TEST_DATA.skills) {
    await pool.query(
      `INSERT INTO skills (name, category, description, grade_level, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [skill.name, skill.category, skill.description, skill.grade_level]
    );
  }

  console.log(`✅ Seeded ${TEST_DATA.skills.length} skills`);
}

/**
 * Seed badges
 */
async function seedBadges() {
  console.log('🏆 Seeding badges...');

  for (const badge of TEST_DATA.badges) {
    await pool.query(
      `INSERT INTO badges (name, description, icon, category, criteria, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [badge.name, badge.description, badge.icon, badge.category, badge.criteria]
    );
  }

  console.log(`✅ Seeded ${TEST_DATA.badges.length} badges`);
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting E2E test database seeding...\n');
    console.log(`Database: ${DATABASE_URL}\n`);

    await clearDatabase();
    await seedStudents();
    await seedCoaches();
    await seedLessons();
    await seedSkills();
    await seedBadges();

    console.log('\n✅ E2E test database seeded successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase, TEST_DATA };
