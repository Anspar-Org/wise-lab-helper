import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'STEM Lab Assistant API',
      version: '0.1.0',
      description: 'Learning platform for elementary engineering education (K-5) with focus on VEX IQ robotics',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token obtained from login endpoints',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            role: {
              type: 'string',
              enum: ['student', 'coach', 'admin'],
              description: 'User role',
            },
            auth_method: {
              type: 'string',
              enum: ['pin', 'animal_grid', 'password'],
              description: 'Authentication method used',
            },
            avatar_url: {
              type: 'string',
              description: 'DiceBear avatar URL',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Badge: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Badge unique identifier',
            },
            name: {
              type: 'string',
              description: 'Badge name',
            },
            description: {
              type: 'string',
              description: 'Badge description',
            },
            category: {
              type: 'string',
              enum: ['skill', 'achievement', 'team', 'methodology', 'engagement'],
              description: 'Badge category',
            },
            criteria: {
              type: 'string',
              description: 'Criteria for earning the badge',
            },
            points: {
              type: 'integer',
              description: 'Points awarded for earning this badge',
            },
            icon_url: {
              type: 'string',
              description: 'Badge icon URL',
            },
          },
        },
        Lesson: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Lesson unique identifier',
            },
            title: {
              type: 'string',
              description: 'Lesson title',
            },
            description: {
              type: 'string',
              description: 'Lesson description',
            },
            category: {
              type: 'string',
              enum: ['building', 'programming', 'driving', 'strategy', 'methodology'],
              description: 'Lesson category',
            },
            grade_level: {
              type: 'string',
              description: 'Target grade level (K-5)',
            },
            duration_minutes: {
              type: 'integer',
              description: 'Estimated duration in minutes',
            },
            learning_objectives: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of learning objectives',
            },
            published: {
              type: 'boolean',
              description: 'Whether lesson is published',
            },
          },
        },
        Skill: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Skill unique identifier',
            },
            name: {
              type: 'string',
              description: 'Skill name',
            },
            description: {
              type: 'string',
              description: 'Skill description',
            },
            category: {
              type: 'string',
              enum: ['technical', 'teamwork', 'engineering_process'],
              description: 'Skill category',
            },
            grade_level: {
              type: 'string',
              description: 'Target grade level (K-5)',
            },
          },
        },
        NotebookEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Notebook entry unique identifier',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'User who created the entry',
            },
            title: {
              type: 'string',
              description: 'Entry title',
            },
            content: {
              type: 'string',
              description: 'Entry content (markdown supported)',
            },
            entry_date: {
              type: 'string',
              format: 'date',
              description: 'Date of the entry',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tags for categorization',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Entry creation timestamp',
            },
          },
        },
        PracticeSession: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Practice session unique identifier',
            },
            team_id: {
              type: 'string',
              format: 'uuid',
              description: 'Team unique identifier',
            },
            session_date: {
              type: 'string',
              format: 'date-time',
              description: 'Date of the practice session',
            },
            duration_minutes: {
              type: 'integer',
              description: 'Duration in minutes',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Session notes',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Session creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Session last update timestamp',
            },
          },
        },
        SessionRotation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Rotation unique identifier',
            },
            session_id: {
              type: 'string',
              format: 'uuid',
              description: 'Practice session ID',
            },
            student_id: {
              type: 'string',
              format: 'uuid',
              description: 'Student ID',
            },
            station: {
              type: 'string',
              enum: ['Building', 'Programming', 'Driving', 'Documentation'],
              description: 'Station assignment',
            },
            start_time: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$',
              description: 'Rotation start time (HH:MM or HH:MM:SS)',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Rotation creation timestamp',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration (PIN, Animal Grid, Password)',
      },
      {
        name: 'Badges',
        description: 'Badge system and gamification',
      },
      {
        name: 'Lessons',
        description: 'Learning content and progress tracking',
      },
      {
        name: 'Skills',
        description: 'Skills tracking and assessment',
      },
      {
        name: 'Notebook',
        description: 'Engineering notebook with media uploads',
      },
      {
        name: 'Practice Sessions',
        description: 'Practice session management and rotation tracking',
      },
      {
        name: 'Rotations',
        description: 'Student rotation management within practice sessions',
      },
      {
        name: 'Health',
        description: 'System health and status',
      },
    ],
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/index.ts',
  ],
};

// Lazy load swagger spec to avoid performance issues in tests
let cachedSwaggerSpec: any = null;

export const getSwaggerSpec = () => {
  if (!cachedSwaggerSpec) {
    cachedSwaggerSpec = swaggerJsdoc(options);
  }
  return cachedSwaggerSpec;
};

export const swaggerSpec = getSwaggerSpec();

// Custom CSS for Swagger UI
export const swaggerUiCustomCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info .title { color: #2c3e50; }
  .swagger-ui .opblock-tag { font-size: 18px; }
`;

// Swagger UI options
export const swaggerUiOptions = {
  customCss: swaggerUiCustomCss,
  customSiteTitle: 'STEM Lab Assistant API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
};
