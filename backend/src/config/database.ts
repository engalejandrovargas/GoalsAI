import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Create Prisma client with logging configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['info', 'warn', 'error'] // Removed 'query' to stop verbose SQL logging
    : ['warn', 'error'],
  errorFormat: 'pretty'
});

// Connect to database
prisma.$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Handle errors
prisma.$on('error', (error) => {
  logger.error('Database error:', error);
});

export { prisma };