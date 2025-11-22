# Database Package

PostgreSQL database schemas, migrations, and seed data for STEM Lab Assistant.

## Quick Start

```bash
# Run migrations
node migrate.js

# Seed all phases
npm run seed

# Seed specific phase
npm run seed:phase1
npm run seed:phase2
npm run seed:phase3

# Clear and reseed
npm run seed:clear
```

## Database Structure

### Migrations

Located in `migrations/` directory. Applied sequentially by `migrate.js`.

Current schema includes:
- **users** - Student and staff authentication
- **lessons** + **lesson_steps** - Learning content
- **skills** + **student_skills** - Competency tracking
- **badges** + **student_badges** - Achievement system
- **notebook_entries** - Engineering documentation
- **teams**, **practice_sessions**, **competition_results** - Team management

### Seed Data

Located in `seeds/` directory, organized in 3 phases:

#### Phase 1: Foundation Content ✅
**Status:** Complete (10 lessons, 20 skills, 10 badges)

Foundation lessons for VEX IQ beginners:
- Your First VEX IQ Robot
- Robot Parts Detective
- Your First Robot Program
- Understanding Team Roles
- Engineering Notebook Basics
- Build a Simple Claw
- Introduction to Gears
- Drive in a Square
- Sensor Exploration: Bumper Switch
- Match Day Simulation

Core skills covering building, programming, driving, teamwork, and documentation.

Beginner badges for first achievements.

#### Phase 2: Intermediate Content 🚧
**Status:** Planned (15 exercises, 15 skills, 7 badges)

Intermediate challenges:
- Advanced gear trains and compound mechanisms
- Sensor fusion and decision-making
- Autonomous programming patterns
- Driver control optimization
- Team collaboration strategies
- Data-driven iteration

#### Phase 3: Advanced & Competition 🚧
**Status:** Planned (10 lessons, 10 skills, 3 badges)

Competition preparation:
- Match strategy development
- Judge interview skills
- Design documentation excellence
- Advanced programming techniques
- Performance optimization
- Gracious professionalism

## Seed Script Usage

### Basic Commands

```bash
# Seed all phases
node seed.js

# Seed specific phase
node seed.js --phase=1
node seed.js --phase=2
node seed.js --phase=3

# Clear existing seed data before seeding
node seed.js --clear
node seed.js --phase=1 --clear
```

### Schema Notes

The seed script aligns with the actual database schema:

**Lessons:**
- `content` field is JSONB containing `{description, materials_needed}`
- `learning_objectives` is a text array
- Valid categories: `methodology`, `teamwork`, `research_skills`, `technical`
- Valid grade_levels: `K`, `1`, `2`, `3`, `4`, `5` (individual grades)

**Lesson Steps:**
- `content` field is JSONB containing `{text, estimated_minutes, resources}`

**Skills:**
- Valid categories: `engineering_process`, `teamwork`, `research`, `technical`, `presentation`
- `description` field includes progression notes

**Badges:**
- Valid categories: `methodology`, `skill`, `engagement`, `team`
- `criteria` field is JSONB containing `{requirements}`

## Development

### Adding New Seed Data

1. Create/edit JSON files in `seeds/phase[1-3]-[lessons|skills|badges].json`
2. Follow the schema structure (see existing Phase 1 files)
3. Test: `npm run seed:phase1 -- --clear`
4. Commit changes

### Data Structure Examples

**Lesson:**
```json
{
  "title": "Lesson Title",
  "category": "technical",
  "grade_level": "3",
  "duration_minutes": 45,
  "description": "What students will do",
  "learning_objectives": ["Objective 1", "Objective 2"],
  "materials_needed": ["Item 1", "Item 2"],
  "steps": [
    {
      "step_number": 1,
      "title": "Step Title",
      "content": "Step instructions",
      "estimated_minutes": 10,
      "resources": ["Resource 1"]
    }
  ]
}
```

**Skill:**
```json
{
  "name": "Skill Name",
  "category": "technical",
  "grade_level": "4",
  "description": "What this skill is. Progression: novice → developing → proficient → advanced."
}
```

**Badge:**
```json
{
  "name": "Badge Name",
  "category": "skill",
  "description": "What this badge represents",
  "criteria": "How to earn it",
  "icon_url": null
}
```

## Database Connection

Set `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
```

Or use default from `.env` file (see `apps/api/.env.example`).

## Troubleshooting

**"Relation does not exist" errors:**
- Run migrations first: `node migrate.js`

**"Invalid enum value" errors:**
- Check that categories and grade_levels match valid enum values (see Schema Notes above)

**"Invalid JSON" errors:**
- Ensure JSONB fields (`content`, `criteria`) are properly formatted

## Contributing

This is VEX IQ Mix & Match specific content for Wise Elementary (Teams 6502A & 6502B).

For other competitions or seasons, create new phase files or modify existing ones.
