import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { prisma } from './config/database';
import logger from './utils/logger';
import passport from './config/passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import goalRoutes from './routes/goals';
import goalStepsRoutes from './routes/goalSteps';
import goalPlanningRoutes from './routes/goalPlanning';
import chatRoutes from './routes/chat';
import progressRoutes from './routes/progress';
import agentRoutes from './routes/agents';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5176',
    'http://localhost:5173', // Default port
    'http://localhost:5174', // Alternative port
    'http://localhost:5175'  // Another alternative
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/agents') || req.path.startsWith('/auth')) {
    logger.info(`Request: ${req.method} ${req.path}, User authenticated: ${req.isAuthenticated()}, Session ID: ${req.sessionID}, User: ${req.user ? 'exists' : 'undefined'}`);
    logger.info(`Session data: ${JSON.stringify(req.session)}`);
    logger.info(`Cookies: ${JSON.stringify(req.headers.cookie)}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/goals', goalStepsRoutes);
app.use('/api/planning', goalPlanningRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/agents', agentRoutes);

// Test endpoint for agent functionality (development only)
if (process.env.NODE_ENV !== 'production') {
  app.post('/test-agents', async (req, res) => {
    try {
      const { AgentManager } = require('./services/AgentManager');
      const agentManager = new AgentManager(prisma);
      
      const { taskType, parameters } = req.body;
      
      if (!taskType || !parameters) {
        return res.status(400).json({ error: 'taskType and parameters are required' });
      }

      const taskParams = {
        goalId: `test-${Date.now()}`,
        userId: 'test-user',
        type: taskType,
        priority: 'medium' as 'medium',
        parameters,
      };

      const result = await agentManager.executeTask(taskParams);
      
      res.json({
        success: result.success,
        result: result.data,
        confidence: result.confidence,
        metadata: result.metadata,
        error: result.error,
      });
    } catch (error) {
      logger.error('Test agent execution failed:', error);
      res.status(500).json({ 
        error: 'Failed to execute test agent task', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Goals AI Backend is running!',
    version: '1.0.0',
    authenticated: req.isAuthenticated()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 DreamPlan AI Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️ Database: SQLite (dev.db)`);
  logger.info(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  logger.info(`🔐 JWT Authentication enabled`);
  logger.info(`🔑 Google OAuth configured`);
});

export default app;