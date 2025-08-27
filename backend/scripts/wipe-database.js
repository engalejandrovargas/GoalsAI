#!/usr/bin/env node

/**
 * Database Wipe Script
 * 
 * This script completely wipes out all data from the database.
 * Use with caution - this operation cannot be undone!
 * 
 * Usage: node scripts/wipe-database.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Initialize Prisma client with the backend database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, '../prisma/dev.db')}`
    }
  }
});

async function wipeDatabase() {
  console.log('🗑️  Starting database wipe...');
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('');

  try {
    // Start a transaction to ensure all operations complete or none do
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      console.log('🧹 Deleting agent monitors...');
      await tx.agentMonitor.deleteMany();
      
      console.log('🧹 Deleting agent tasks...');
      await tx.agentTask.deleteMany();
      
      console.log('🧹 Deleting agent API keys...');
      await tx.agentApiKey.deleteMany();
      
      console.log('🧹 Deleting agents...');
      await tx.agent.deleteMany();
      
      console.log('🧹 Deleting chat sessions...');
      await tx.chatSession.deleteMany();
      
      console.log('🧹 Deleting goal pivots...');
      await tx.goalPivot.deleteMany();
      
      console.log('🧹 Deleting goal steps...');
      await tx.goalStep.deleteMany();
      
      console.log('🧹 Deleting goals...');
      await tx.goal.deleteMany();
      
      console.log('🧹 Deleting users...');
      await tx.user.deleteMany();
    });

    console.log('');
    console.log('✅ Database successfully wiped!');
    console.log('📊 All tables are now empty and ready for fresh data.');
    
  } catch (error) {
    console.error('❌ Error wiping database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function confirmAction() {
  // Simple confirmation for non-interactive environments
  const args = process.argv.slice(2);
  if (!args.includes('--confirm')) {
    console.log('🛑 To confirm database wipe, run with --confirm flag:');
    console.log('   node scripts/wipe-database.js --confirm');
    console.log('');
    console.log('⚠️  This action cannot be undone!');
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    await confirmAction();
    await wipeDatabase();
    console.log('');
    console.log('🎉 Database wipe completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Handle script termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⏹️  Script interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Script terminated');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { wipeDatabase };