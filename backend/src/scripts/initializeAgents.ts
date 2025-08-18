import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

async function initializeAgents() {
  try {
    logger.info('Initializing agents...');

    // Clear existing agents to avoid duplicates
    await prisma.agentTask.deleteMany();
    await prisma.agentApiKey.deleteMany();
    await prisma.agentMonitor.deleteMany();
    await prisma.agent.deleteMany();

    // Travel Agent
    const travelAgent = await prisma.agent.create({
      data: {
        name: 'Travel Agent',
        type: 'travel',
        description: 'Specializes in travel planning, flight searches, hotel bookings, visa requirements, and budget calculations',
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
              currency: { type: 'string', default: 'USD' }
            }
          },
          {
            name: 'searchHotels',
            description: 'Find accommodation options and prices',
            parameters: {
              destination: { type: 'string', required: true },
              checkIn: { type: 'string', required: true },
              checkOut: { type: 'string', required: true },
              guests: { type: 'number', default: 1 },
              currency: { type: 'string', default: 'USD' }
            }
          },
          {
            name: 'checkVisaRequirements',
            description: 'Check visa requirements and processing times',
            parameters: {
              fromCountry: { type: 'string', required: true },
              toCountry: { type: 'string', required: true },
              nationality: { type: 'string', required: true },
              purposeOfTravel: { type: 'string', default: 'tourism' }
            }
          },
          {
            name: 'calculateTravelBudget',
            description: 'Estimate comprehensive travel budget',
            parameters: {
              destination: { type: 'string', required: true },
              duration: { type: 'number', required: true },
              travelStyle: { type: 'string', default: 'mid-range' },
              currency: { type: 'string', default: 'USD' }
            }
          }
        ]),
        isActive: true,
        version: '1.0.0',
        successRate: 0.9,
        averageResponseTime: 2000,
        totalExecutions: 0
      }
    });

    // Financial Agent
    const financialAgent = await prisma.agent.create({
      data: {
        name: 'Financial Agent',
        type: 'financial',
        description: 'Handles financial planning, savings calculations, investment analysis, and cost optimization',
        capabilities: JSON.stringify([
          {
            name: 'calculateSavingsPlan',
            description: 'Create a detailed savings plan for financial goals',
            parameters: {
              targetAmount: { type: 'number', required: true },
              targetDate: { type: 'string', required: true },
              currentSavings: { type: 'number', default: 0 },
              monthlyIncome: { type: 'number', required: true },
              monthlyExpenses: { type: 'number', required: true }
            }
          },
          {
            name: 'analyzeInvestmentOptions',
            description: 'Analyze investment opportunities and returns',
            parameters: {
              amount: { type: 'number', required: true },
              timeframe: { type: 'number', required: true },
              riskTolerance: { type: 'string', default: 'moderate' }
            }
          },
          {
            name: 'convertCurrency',
            description: 'Convert currency and provide exchange rate analysis',
            parameters: {
              amount: { type: 'number', required: true },
              fromCurrency: { type: 'string', required: true },
              toCurrency: { type: 'string', required: true }
            }
          },
          {
            name: 'budgetOptimization',
            description: 'Analyze spending patterns and suggest optimizations',
            parameters: {
              monthlyIncome: { type: 'number', required: true },
              expenses: { type: 'object', required: true },
              savingsGoal: { type: 'number', required: true }
            }
          }
        ]),
        isActive: true,
        version: '1.0.0',
        successRate: 0.85,
        averageResponseTime: 1500,
        totalExecutions: 0
      }
    });

    // Research Agent
    const researchAgent = await prisma.agent.create({
      data: {
        name: 'Research Agent',
        type: 'research',
        description: 'Conducts market research, trend analysis, competitive intelligence, and feasibility studies',
        capabilities: JSON.stringify([
          {
            name: 'marketResearch',
            description: 'Conduct comprehensive market research',
            parameters: {
              industry: { type: 'string', required: true },
              location: { type: 'string', required: true },
              segment: { type: 'string', required: false }
            }
          },
          {
            name: 'competitiveAnalysis',
            description: 'Analyze competitive landscape',
            parameters: {
              industry: { type: 'string', required: true },
              competitors: { type: 'array', required: false }
            }
          },
          {
            name: 'trendAnalysis',
            description: 'Identify and analyze market trends',
            parameters: {
              topic: { type: 'string', required: true },
              timeframe: { type: 'string', default: '12months' }
            }
          },
          {
            name: 'feasibilityStudy',
            description: 'Conduct feasibility analysis for projects or goals',
            parameters: {
              project: { type: 'string', required: true },
              budget: { type: 'number', required: false },
              timeline: { type: 'string', required: false }
            }
          }
        ]),
        isActive: true,
        version: '1.0.0',
        successRate: 0.8,
        averageResponseTime: 3000,
        totalExecutions: 0
      }
    });

    // Learning Agent
    const learningAgent = await prisma.agent.create({
      data: {
        name: 'Learning Agent',
        type: 'learning',
        description: 'Finds learning resources, creates study plans, assesses skill gaps, and tracks educational progress',
        capabilities: JSON.stringify([
          {
            name: 'findCourses',
            description: 'Find relevant courses and learning materials',
            parameters: {
              subject: { type: 'string', required: true },
              level: { type: 'string', default: 'beginner' },
              format: { type: 'string', default: 'online' },
              budget: { type: 'number', required: false }
            }
          },
          {
            name: 'createLearningPath',
            description: 'Create a structured learning path',
            parameters: {
              goal: { type: 'string', required: true },
              currentLevel: { type: 'string', required: true },
              timeline: { type: 'string', required: true },
              timeCommitment: { type: 'string', required: true }
            }
          },
          {
            name: 'assessSkillGap',
            description: 'Assess skill gaps for career or educational goals',
            parameters: {
              targetRole: { type: 'string', required: true },
              currentSkills: { type: 'array', required: true },
              industry: { type: 'string', required: true }
            }
          },
          {
            name: 'findCertifications',
            description: 'Find relevant certifications and credentials',
            parameters: {
              field: { type: 'string', required: true },
              level: { type: 'string', default: 'intermediate' },
              provider: { type: 'string', required: false }
            }
          }
        ]),
        isActive: true,
        version: '1.0.0',
        successRate: 0.88,
        averageResponseTime: 2500,
        totalExecutions: 0
      }
    });

    logger.info(`Initialized 4 agents:`);
    logger.info(`- ${travelAgent.name} (${travelAgent.id})`);
    logger.info(`- ${financialAgent.name} (${financialAgent.id})`);
    logger.info(`- ${researchAgent.name} (${researchAgent.id})`);
    logger.info(`- ${learningAgent.name} (${learningAgent.id})`);

  } catch (error) {
    logger.error('Failed to initialize agents:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeAgents()
    .then(() => {
      logger.info('Agent initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Agent initialization failed:', error);
      process.exit(1);
    });
}

export { initializeAgents };