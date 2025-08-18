import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const defaultAgents = [
  {
    name: 'Travel Agent',
    type: 'travel',
    description: 'Specialized in travel planning, flight searches, hotel bookings, visa requirements, and budget calculations',
    capabilities: JSON.stringify([
      {
        name: 'searchFlights',
        description: 'Search for flight prices and schedules',
        parameters: {
          origin: { type: 'string', required: true },
          destination: { type: 'string', required: true },
          departureDate: { type: 'string', required: true },
          returnDate: { type: 'string', required: false },
          passengers: { type: 'number', default: 1 },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'searchHotels',
        description: 'Find accommodation options and prices',
        parameters: {
          destination: { type: 'string', required: true },
          checkIn: { type: 'string', required: true },
          checkOut: { type: 'string', required: true },
          guests: { type: 'number', default: 1 },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'checkVisaRequirements',
        description: 'Check visa requirements and processing times',
        parameters: {
          fromCountry: { type: 'string', required: true },
          toCountry: { type: 'string', required: true },
          nationality: { type: 'string', required: true },
          purposeOfTravel: { type: 'string', default: 'tourism' },
        },
      },
      {
        name: 'calculateTravelBudget',
        description: 'Estimate comprehensive travel budget',
        parameters: {
          destination: { type: 'string', required: true },
          duration: { type: 'number', required: true },
          travelStyle: { type: 'string', default: 'mid-range' },
          currency: { type: 'string', default: 'USD' },
        },
      },
    ]),
    version: '1.0.0',
    isActive: true,
  },
  {
    name: 'Financial Agent',
    type: 'financial',
    description: 'Expert in financial planning, savings calculations, currency conversion, and investment analysis',
    capabilities: JSON.stringify([
      {
        name: 'calculateSavingsPlan',
        description: 'Create a detailed savings plan to reach financial goals',
        parameters: {
          goalAmount: { type: 'number', required: true },
          currentSavings: { type: 'number', default: 0 },
          targetDate: { type: 'string', required: true },
          monthlyIncome: { type: 'number', required: true },
          monthlyExpenses: { type: 'number', required: true },
          currency: { type: 'string', default: 'USD' },
        },
      },
      {
        name: 'convertCurrency',
        description: 'Convert between different currencies with real-time rates',
        parameters: {
          amount: { type: 'number', required: true },
          fromCurrency: { type: 'string', required: true },
          toCurrency: { type: 'string', required: true },
          date: { type: 'string', required: false },
        },
      },
      {
        name: 'analyzeInvestmentOptions',
        description: 'Analyze investment options based on risk tolerance and time horizon',
        parameters: {
          amount: { type: 'number', required: true },
          timeHorizon: { type: 'number', required: true },
          riskTolerance: { type: 'string', required: true },
          goalType: { type: 'string', required: true },
          currency: { type: 'string', default: 'USD' },
        },
      },
    ]),
    version: '1.0.0',
    isActive: true,
  },
  {
    name: 'Research Agent',
    type: 'research',
    description: 'Conducts market research, competitive analysis, and feasibility validation',
    capabilities: JSON.stringify([
      {
        name: 'conductMarketResearch',
        description: 'Research market conditions and trends',
        parameters: {
          industry: { type: 'string', required: true },
          region: { type: 'string', default: 'global' },
          timeframe: { type: 'string', default: '1year' },
        },
      },
      {
        name: 'analyzeCompetition',
        description: 'Analyze competitive landscape',
        parameters: {
          industry: { type: 'string', required: true },
          competitors: { type: 'array', required: false },
        },
      },
      {
        name: 'validateFeasibility',
        description: 'Validate goal feasibility with real-world data',
        parameters: {
          goalType: { type: 'string', required: true },
          parameters: { type: 'object', required: true },
        },
      },
    ]),
    version: '1.0.0',
    isActive: true,
  },
  {
    name: 'Learning Agent',
    type: 'learning',
    description: 'Finds learning resources, assesses skill gaps, and creates personalized learning paths',
    capabilities: JSON.stringify([
      {
        name: 'findLearningResources',
        description: 'Find courses and learning materials',
        parameters: {
          skill: { type: 'string', required: true },
          level: { type: 'string', default: 'beginner' },
          budget: { type: 'number', required: false },
        },
      },
      {
        name: 'assessSkillGaps',
        description: 'Analyze skill requirements vs current skills',
        parameters: {
          targetRole: { type: 'string', required: true },
          currentSkills: { type: 'array', required: true },
        },
      },
      {
        name: 'createLearningPath',
        description: 'Create personalized learning roadmap',
        parameters: {
          goal: { type: 'string', required: true },
          timeframe: { type: 'string', required: true },
          preferredFormat: { type: 'string', default: 'online' },
        },
      },
    ]),
    version: '1.0.0',
    isActive: true,
  },
];

async function seedAgents() {
  try {
    logger.info('Starting agent seeding process...');

    for (const agentData of defaultAgents) {
      // Check if agent already exists
      const existingAgent = await prisma.agent.findFirst({
        where: { name: agentData.name, type: agentData.type },
      });

      if (existingAgent) {
        logger.info(`Agent ${agentData.name} already exists, skipping...`);
        continue;
      }

      // Create the agent
      const createdAgent = await prisma.agent.create({
        data: agentData,
      });

      logger.info(`Created agent: ${createdAgent.name} (${createdAgent.type})`);
    }

    logger.info('Agent seeding completed successfully!');
  } catch (error) {
    logger.error('Failed to seed agents:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedAgents()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedAgents };