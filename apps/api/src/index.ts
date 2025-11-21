import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase, getDatabase } from './config/database';

// Import routers
import { authRouter } from './modules/auth/auth.routes';
import { lessonsRouter } from './modules/lessons/lessons.routes';
import { skillsRouter } from './modules/skills/skills.routes';
import { notebookRouter } from './modules/notebook/notebook.routes';
import { badgesRouter } from './modules/badges/badges.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/health', async (_req, res) => {
  const db = getDatabase();
  const dbHealthy = await db.healthCheck();

  res.json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealthy ? 'connected' : 'disconnected',
    localOnly: db.isLocalOnly(),
  });
});

// API version endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    name: 'STEM Lab Assistant API',
    version: '0.1.0',
    description: 'Learning platform for elementary engineering education',
    features: [
      'Authentication (PIN, Animal Grid, Password)',
      'Lessons & Learning Content',
      'Skills Tracking & Assessment',
      'Engineering Notebook with File Uploads',
      'Badge System & Gamification',
    ],
    endpoints: {
      auth: '/api/v1/auth',
      lessons: '/api/v1/lessons',
      skills: '/api/v1/skills',
      notebook: '/api/v1/notebook',
      badges: '/api/v1/badges',
    },
  });
});

// Mount API routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/lessons', lessonsRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/notebook', notebookRouter);
app.use('/api/v1/badges', badgesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 STEM Lab Assistant API Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api/v1`);
      console.log('');
      console.log('📡 Available Endpoints:');
      console.log(`   Auth:     /api/v1/auth`);
      console.log(`   Lessons:  /api/v1/lessons`);
      console.log(`   Skills:   /api/v1/skills`);
      console.log(`   Notebook: /api/v1/notebook`);
      console.log(`   Badges:   /api/v1/badges`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  const db = getDatabase();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, closing server...');
  const db = getDatabase();
  await db.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;
