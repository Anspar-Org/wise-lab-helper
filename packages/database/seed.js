#!/usr/bin/env node

/**
 * Database Seed Script
 * Populates database with VEX IQ Mix & Match educational content
 *
 * Usage:
 *   node seed.js              # Seed all phases
 *   node seed.js --phase=1    # Seed specific phase
 *   node seed.js --clear      # Clear all seed data first
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://stemlab:stemlab_dev_password@localhost:5432/stemlab_dev';

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const phaseArg = args.find(arg => arg.startsWith('--phase='));
const targetPhase = phaseArg ? parseInt(phaseArg.split('=')[1]) : null;

async function seedDatabase() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Clear existing seed data if requested
    if (shouldClear) {
      console.log('🗑️  Clearing existing seed data...\n');
      await clearSeedData(client);
    }

    // Seed data in phases
    if (!targetPhase || targetPhase === 1) {
      await seedPhase1(client);
    }
    if (!targetPhase || targetPhase === 2) {
      await seedPhase2(client);
    }
    if (!targetPhase || targetPhase === 3) {
      await seedPhase3(client);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function clearSeedData(client) {
  // Delete in reverse order of dependencies
  await client.query('DELETE FROM student_badges');
  await client.query('DELETE FROM student_skills');
  await client.query('DELETE FROM student_lesson_progress');
  await client.query('DELETE FROM notebook_entries');
  await client.query('DELETE FROM lesson_steps');
  await client.query('DELETE FROM lessons');
  await client.query('DELETE FROM badges');
  await client.query('DELETE FROM skills');

  console.log('✅ Seed data cleared\n');
}

/**
 * PHASE 1: Foundation Content
 * - 10 Foundation Lessons
 * - 20 Core Skills
 * - 10 Beginner Badges
 */
async function seedPhase1(client) {
  console.log('📦 PHASE 1: Foundation Content\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Load seed data
  const lessonsData = require('./seeds/phase1-lessons.json');
  const skillsData = require('./seeds/phase1-skills.json');
  const badgesData = require('./seeds/phase1-badges.json');

  // Seed lessons with steps
  console.log(`📚 Seeding ${lessonsData.length} foundation lessons...`);
  for (const lesson of lessonsData) {
    const lessonResult = await client.query(`
      INSERT INTO lessons (
        title, category, grade_level, duration_minutes, content,
        learning_objectives, published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      lesson.title,
      lesson.category,
      lesson.grade_level,
      lesson.duration_minutes,
      JSON.stringify({
        description: lesson.description,
        materials_needed: lesson.materials_needed
      }),
      lesson.learning_objectives,
      lesson.published !== false
    ]);

    const lessonId = lessonResult.rows[0].id;

    // Seed lesson steps
    if (lesson.steps && lesson.steps.length > 0) {
      for (const step of lesson.steps) {
        await client.query(`
          INSERT INTO lesson_steps (
            lesson_id, step_number, title, content
          )
          VALUES ($1, $2, $3, $4::jsonb)
        `, [
          lessonId,
          step.step_number,
          step.title,
          JSON.stringify({
            text: step.content,
            estimated_minutes: step.estimated_minutes,
            resources: step.resources || []
          })
        ]);
      }
    }

    console.log(`  ✅ ${lesson.title}`);
  }

  // Seed skills
  console.log(`\n🎯 Seeding ${skillsData.length} core skills...`);
  for (const skill of skillsData) {
    await client.query(`
      INSERT INTO skills (
        name, category, description, grade_level
      )
      VALUES ($1, $2, $3, $4)
    `, [
      skill.name,
      skill.category,
      skill.description,
      skill.grade_level
    ]);
    console.log(`  ✅ ${skill.name}`);
  }

  // Seed badges
  console.log(`\n🏆 Seeding ${badgesData.length} beginner badges...`);
  for (const badge of badgesData) {
    await client.query(`
      INSERT INTO badges (
        name, category, description, criteria, icon
      )
      VALUES ($1, $2, $3, $4::jsonb, $5)
    `, [
      badge.name,
      badge.category,
      badge.description,
      JSON.stringify({ requirements: badge.criteria }),
      badge.icon_url || null
    ]);
    console.log(`  ✅ ${badge.name}`);
  }

  console.log('\n✅ Phase 1 completed!\n');
}

/**
 * PHASE 2: Intermediate Content
 * - 15 Intermediate Exercises
 * - 15 Intermediate Skills
 * - 7 Intermediate Badges
 */
async function seedPhase2(client) {
  console.log('📦 PHASE 2: Intermediate Content\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const lessonsData = require('./seeds/phase2-lessons.json');
  const skillsData = require('./seeds/phase2-skills.json');
  const badgesData = require('./seeds/phase2-badges.json');

  if (lessonsData.length === 0 && skillsData.length === 0 && badgesData.length === 0) {
    console.log('⏭️  Phase 2 data files are empty - skipping\n');
    return;
  }

  // Use same structure as Phase 1
  console.log(`📚 Seeding ${lessonsData.length} intermediate lessons...`);
  for (const lesson of lessonsData) {
    const lessonResult = await client.query(`
      INSERT INTO lessons (
        title, category, grade_level, duration_minutes, content,
        learning_objectives, published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      lesson.title,
      lesson.category,
      lesson.grade_level,
      lesson.duration_minutes,
      JSON.stringify({
        description: lesson.description,
        materials_needed: lesson.materials_needed
      }),
      lesson.learning_objectives,
      lesson.published !== false
    ]);

    const lessonId = lessonResult.rows[0].id;

    if (lesson.steps && lesson.steps.length > 0) {
      for (const step of lesson.steps) {
        await client.query(`
          INSERT INTO lesson_steps (
            lesson_id, step_number, title, content
          )
          VALUES ($1, $2, $3, $4::jsonb)
        `, [
          lessonId,
          step.step_number,
          step.title,
          JSON.stringify({
            text: step.content,
            estimated_minutes: step.estimated_minutes,
            resources: step.resources || []
          })
        ]);
      }
    }

    console.log(`  ✅ ${lesson.title}`);
  }

  console.log(`\n🎯 Seeding ${skillsData.length} intermediate skills...`);
  for (const skill of skillsData) {
    await client.query(`
      INSERT INTO skills (
        name, category, description, grade_level
      )
      VALUES ($1, $2, $3, $4)
    `, [
      skill.name,
      skill.category,
      skill.description,
      skill.grade_level
    ]);
    console.log(`  ✅ ${skill.name}`);
  }

  console.log(`\n🏆 Seeding ${badgesData.length} intermediate badges...`);
  for (const badge of badgesData) {
    await client.query(`
      INSERT INTO badges (
        name, category, description, criteria, icon
      )
      VALUES ($1, $2, $3, $4::jsonb, $5)
    `, [
      badge.name,
      badge.category,
      badge.description,
      JSON.stringify({ requirements: badge.criteria }),
      badge.icon_url || null
    ]);
    console.log(`  ✅ ${badge.name}`);
  }

  console.log('\n✅ Phase 2 completed!\n');
}

/**
 * PHASE 3: Advanced & Competition Content
 * - 10 Advanced Lessons
 * - 10 Advanced Skills
 * - 3 Advanced Badges
 */
async function seedPhase3(client) {
  console.log('📦 PHASE 3: Advanced & Competition Content\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const lessonsData = require('./seeds/phase3-lessons.json');
  const skillsData = require('./seeds/phase3-skills.json');
  const badgesData = require('./seeds/phase3-badges.json');

  if (lessonsData.length === 0 && skillsData.length === 0 && badgesData.length === 0) {
    console.log('⏭️  Phase 3 data files are empty - skipping\n');
    return;
  }

  // Use same structure as Phase 1 & 2
  console.log(`📚 Seeding ${lessonsData.length} advanced lessons...`);
  for (const lesson of lessonsData) {
    const lessonResult = await client.query(`
      INSERT INTO lessons (
        title, category, grade_level, duration_minutes, content,
        learning_objectives, published
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      lesson.title,
      lesson.category,
      lesson.grade_level,
      lesson.duration_minutes,
      JSON.stringify({
        description: lesson.description,
        materials_needed: lesson.materials_needed
      }),
      lesson.learning_objectives,
      lesson.published !== false
    ]);

    const lessonId = lessonResult.rows[0].id;

    if (lesson.steps && lesson.steps.length > 0) {
      for (const step of lesson.steps) {
        await client.query(`
          INSERT INTO lesson_steps (
            lesson_id, step_number, title, content
          )
          VALUES ($1, $2, $3, $4::jsonb)
        `, [
          lessonId,
          step.step_number,
          step.title,
          JSON.stringify({
            text: step.content,
            estimated_minutes: step.estimated_minutes,
            resources: step.resources || []
          })
        ]);
      }
    }

    console.log(`  ✅ ${lesson.title}`);
  }

  console.log(`\n🎯 Seeding ${skillsData.length} advanced skills...`);
  for (const skill of skillsData) {
    await client.query(`
      INSERT INTO skills (
        name, category, description, grade_level
      )
      VALUES ($1, $2, $3, $4)
    `, [
      skill.name,
      skill.category,
      skill.description,
      skill.grade_level
    ]);
    console.log(`  ✅ ${skill.name}`);
  }

  console.log(`\n🏆 Seeding ${badgesData.length} advanced badges...`);
  for (const badge of badgesData) {
    await client.query(`
      INSERT INTO badges (
        name, category, description, criteria, icon
      )
      VALUES ($1, $2, $3, $4::jsonb, $5)
    `, [
      badge.name,
      badge.category,
      badge.description,
      JSON.stringify({ requirements: badge.criteria }),
      badge.icon_url || null
    ]);
    console.log(`  ✅ ${badge.name}`);
  }

  console.log('\n✅ Phase 3 completed!\n');
}

seedDatabase();
