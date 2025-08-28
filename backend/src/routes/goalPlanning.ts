import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireSessionAuth } from '../middleware/auth';
import { aiService } from '../services/aiService';
import logger from '../utils/logger';

const router = express.Router();

// Validation schemas
const generatePlanSchema = z.object({
  goalId: z.string(),
});

const createStepSchema = z.object({
  goalId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  estimatedCost: z.number().optional(),
  estimatedDuration: z.string().optional(),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  stepOrder: z.number(),
});

// POST /planning/generate - Generate AI plan for a goal
router.post('/generate', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { goalId } = generatePlanSchema.parse(req.body);

    // Get goal and user data
    const goal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        nationality: true,
        travelBudget: true,
        travelStyle: true,
        firstGoal: true,
        annualIncome: true,
        currentSavings: true,
        occupation: true,
        workSchedule: true,
        personalityType: true,
        learningStyle: true,
        decisionMakingStyle: true,
        communicationStyle: true,
        motivationalFactors: true,
        lifePriorities: true,
        previousExperiences: true,
        skillsAndStrengths: true,
        aiInstructions: true,
        aiTone: true,
        aiDetailLevel: true,
        aiApproachStyle: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare enhanced context for AI plan generation (travel-focused)
    const userContext = {
      location: user.location || 'Unknown',
      travelBudget: user.travelBudget || 'Budget traveler ($50-100/day)',
      interests: [],
      goals: user.firstGoal || '',
      nationality: user.nationality,
      travelStyle: user.travelStyle,
      firstGoal: user.firstGoal,
      
      // Legacy fields with travel-appropriate defaults
      ageRange: '25-34',
      currentSituation: user.travelStyle || 'Planning travel adventure',
      availableTime: 'Flexible for travel',
      riskTolerance: 'Moderate',
      preferredApproach: 'Flexible with room for creativity',
      
      // Extended context
      occupation: user.occupation,
      annualIncome: user.annualIncome,
      currentSavings: user.currentSavings,
      workSchedule: user.workSchedule,
      personalityType: user.personalityType,
      learningStyle: user.learningStyle,
      decisionMakingStyle: user.decisionMakingStyle,
      communicationStyle: user.communicationStyle,
      motivationalFactors: user.motivationalFactors ? JSON.parse(user.motivationalFactors) : null,
      lifePriorities: user.lifePriorities ? JSON.parse(user.lifePriorities) : null,
      previousExperiences: user.previousExperiences ? JSON.parse(user.previousExperiences) : null,
      skillsAndStrengths: user.skillsAndStrengths ? JSON.parse(user.skillsAndStrengths) : null,
      
      // AI behavior preferences
      aiInstructions: user.aiInstructions,
      aiTone: user.aiTone,
      aiDetailLevel: user.aiDetailLevel,
      aiApproachStyle: user.aiApproachStyle,
    };

    const goalDescription = `${goal.title}: ${goal.description}`;
    
    // Get existing feasibility analysis or create one
    let feasibilityAnalysis;
    if (goal.feasibilityAnalysis) {
      feasibilityAnalysis = JSON.parse(goal.feasibilityAnalysis);
    } else {
      feasibilityAnalysis = await aiService.analyzeFeasibility(goalDescription, userContext);
    }

    logger.info(`Generating AI plan for goal ${goalId} for user ${userId}`);

    // Generate detailed implementation plan
    const aiPlan = await aiService.generateGoalPlan(goalDescription, feasibilityAnalysis, userContext);

    if (!aiPlan) {
      return res.status(500).json({ error: 'Failed to generate plan' });
    }

    // Update goal with AI plan
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        aiPlan: JSON.stringify(aiPlan),
        feasibilityAnalysis: JSON.stringify(feasibilityAnalysis),
        updatedAt: new Date(),
      },
    });

    // Create goal steps from AI plan if they exist
    if (aiPlan.actionSteps && Array.isArray(aiPlan.actionSteps)) {
      const steps = aiPlan.actionSteps.map((step: any, index: number) => ({
        goalId: goalId,
        title: step.step || step.title || `Step ${index + 1}`,
        description: step.description || step.details || '',
        stepOrder: index + 1,
        estimatedCost: step.cost || 0,
        estimatedDuration: step.timeframe || step.duration || '1 week',
        deadline: step.deadline ? new Date(step.deadline) : null,
        createdBy: 'ai',
      }));

      // Delete existing AI-generated steps and create new ones
      await prisma.goalStep.deleteMany({
        where: {
          goalId: goalId,
          createdBy: 'ai',
        },
      });

      await prisma.goalStep.createMany({
        data: steps,
      });
    }

    logger.info(`AI plan generated successfully for goal ${goalId}`);

    res.json({
      success: true,
      goal: updatedGoal,
      plan: aiPlan,
      message: 'Goal plan generated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error generating goal plan:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// POST /planning/steps - Create a manual goal step
router.post('/steps', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = createStepSchema.parse(req.body);

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { 
        id: validatedData.goalId,
        userId: userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Create the step
    const step = await prisma.goalStep.create({
      data: {
        goalId: validatedData.goalId,
        title: validatedData.title,
        description: validatedData.description || '',
        stepOrder: validatedData.stepOrder,
        estimatedCost: validatedData.estimatedCost,
        estimatedDuration: validatedData.estimatedDuration,
        deadline: validatedData.deadline,
        createdBy: 'user',
      },
    });

    logger.info(`Manual step created for goal ${validatedData.goalId} by user ${userId}`);

    res.json({
      success: true,
      step,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error creating goal step:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

// PUT /planning/steps/:id/complete - Mark step as completed
router.put('/steps/:id/complete', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const stepId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify step belongs to user's goal
    const step = await prisma.goalStep.findFirst({
      where: { 
        id: stepId,
        goal: {
          userId: userId,
        },
      },
      include: {
        goal: true,
      },
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Toggle completion status
    const updatedStep = await prisma.goalStep.update({
      where: { id: stepId },
      data: {
        completed: !step.completed,
      },
    });

    logger.info(`Step ${stepId} completion toggled by user ${userId}`);

    res.json({
      success: true,
      step: updatedStep,
    });

  } catch (error) {
    logger.error('Error updating step completion:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// GET /planning/:goalId/steps - Get all steps for a goal
router.get('/:goalId/steps', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.goalId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Get all steps for the goal
    const steps = await prisma.goalStep.findMany({
      where: { goalId },
      orderBy: { stepOrder: 'asc' },
    });

    res.json({
      success: true,
      steps,
    });

  } catch (error) {
    logger.error('Error fetching goal steps:', error);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
});

// POST /planning/generate-action-plan - Generate comprehensive action plan with smart steps
router.post('/generate-action-plan', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { goalId, goal } = req.body;

    // Get user data for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        nationality: true,
        travelBudget: true,
        travelStyle: true,
        firstGoal: true,
        annualIncome: true,
        currentSavings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate smart action steps using AI
    const actionSteps = await generateSmartActionPlan(goal, user);

    logger.info(`Action plan generated for goal ${goalId} by user ${userId}`);

    res.json({
      success: true,
      steps: actionSteps,
      message: 'Action plan generated successfully',
    });

  } catch (error) {
    logger.error('Error generating action plan:', error);
    res.status(500).json({ error: 'Failed to generate action plan' });
  }
});

// Helper function to generate smart action plan
async function generateSmartActionPlan(goal: any, user: any): Promise<any[]> {
  const steps: any[] = [];
  const category = goal.category?.toLowerCase() || 'general';
  const cost = goal.estimatedCost || 0;
  const targetDate = new Date(goal.targetDate);
  const monthsToGoal = Math.max(1, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)));

  // Generate category-specific steps
  if (category.includes('business') || category.includes('career')) {
    steps.push(
      {
        id: 'research-validation',
        title: 'Market Research & Validation',
        description: 'Research your target market, analyze competitors, and validate your business idea through surveys and interviews with potential customers.',
        completed: false,
        estimatedCost: Math.max(100, Math.round(cost * 0.05)),
        estimatedHours: 40,
        priority: 'high',
        category: 'research',
        prerequisites: [],
        resources: ['Google Trends', 'SurveyMonkey', 'Industry reports', 'Competitor analysis tools'],
        tips: [
          'Survey at least 50 potential customers',
          'Analyze your top 5 competitors thoroughly',
          'Use Google Trends to understand market demand',
          'Join industry forums and communities'
        ]
      },
      {
        id: 'business-plan',
        title: 'Develop Comprehensive Business Plan',
        description: 'Create a detailed business plan including executive summary, market analysis, financial projections, and marketing strategy.',
        completed: false,
        estimatedCost: 500,
        estimatedHours: 60,
        priority: 'high',
        category: 'planning',
        prerequisites: ['Market Research & Validation'],
        resources: ['Business plan templates', 'Financial modeling tools', 'SCORE mentors'],
        tips: [
          'Include 3-year financial projections',
          'Define clear KPIs and success metrics',
          'Get feedback from experienced entrepreneurs',
          'Consider different revenue streams'
        ]
      },
      {
        id: 'legal-structure',
        title: 'Set Up Legal Structure',
        description: 'Register your business, choose the right legal structure (LLC, Corporation, etc.), and obtain necessary licenses.',
        completed: false,
        estimatedCost: 1000,
        estimatedHours: 20,
        priority: 'medium',
        category: 'legal',
        resources: ['LegalZoom', 'Local attorney', 'SBA resources'],
        tips: [
          'Consult with a business attorney',
          'Consider tax implications of different structures',
          'Check local licensing requirements'
        ]
      }
    );
  } else if (category.includes('education')) {
    steps.push(
      {
        id: 'program-research',
        title: 'Research Programs & Requirements',
        description: 'Research educational programs, admission requirements, costs, and career outcomes. Compare multiple options.',
        completed: false,
        estimatedCost: 0,
        estimatedHours: 25,
        priority: 'high',
        category: 'research',
        tips: [
          'Compare at least 5 programs',
          'Check job placement rates',
          'Read student reviews and testimonials',
          'Attend virtual information sessions'
        ]
      },
      {
        id: 'application-prep',
        title: 'Prepare Application Materials',
        description: 'Gather transcripts, write personal statements, secure recommendation letters, and prepare for entrance exams.',
        completed: false,
        estimatedCost: Math.round(cost * 0.15),
        estimatedHours: 40,
        priority: 'high',
        category: 'preparation',
        prerequisites: ['Research Programs & Requirements'],
        tips: [
          'Start gathering materials 6 months early',
          'Write compelling personal statements',
          'Take practice tests for entrance exams',
          'Maintain good relationships with recommenders'
        ]
      }
    );
  } else if (category.includes('travel')) {
    steps.push(
      {
        id: 'itinerary-planning',
        title: 'Plan Detailed Itinerary & Budget',
        description: 'Research destinations, create day-by-day itinerary, budget for all expenses including hidden costs.',
        completed: false,
        estimatedCost: 0,
        estimatedHours: 20,
        priority: 'high',
        category: 'planning',
        tips: [
          'Use travel planning apps',
          'Research visa requirements early',
          'Check seasonal weather patterns',
          'Budget for unexpected expenses (20% extra)'
        ]
      },
      {
        id: 'booking-arrangements',
        title: 'Book Transportation & Accommodation',
        description: 'Book flights, hotels, and local transportation. Consider travel insurance and cancellation policies.',
        completed: false,
        estimatedCost: Math.round(cost * 0.7),
        estimatedHours: 15,
        priority: 'medium',
        category: 'booking',
        prerequisites: ['Plan Detailed Itinerary & Budget'],
        tips: [
          'Book flights 6-8 weeks in advance',
          'Compare accommodation options',
          'Get comprehensive travel insurance',
          'Check cancellation policies'
        ]
      }
    );
  } else if (category.includes('health') || category.includes('fitness')) {
    steps.push(
      {
        id: 'health-assessment',
        title: 'Complete Health Assessment',
        description: 'Get medical clearance, assess current fitness level, and identify any health considerations.',
        completed: false,
        estimatedCost: 200,
        estimatedHours: 5,
        priority: 'high',
        category: 'health',
        tips: [
          'Get a full physical examination',
          'Document current fitness baseline',
          'Identify any medical restrictions',
          'Consider working with a trainer'
        ]
      },
      {
        id: 'fitness-plan',
        title: 'Create Personalized Fitness Plan',
        description: 'Develop a structured workout routine, meal plan, and progress tracking system tailored to your goals.',
        completed: false,
        estimatedCost: 300,
        estimatedHours: 10,
        priority: 'high',
        category: 'planning',
        prerequisites: ['Complete Health Assessment'],
        tips: [
          'Start with achievable goals',
          'Include both cardio and strength training',
          'Plan your meals in advance',
          'Track progress weekly'
        ]
      }
    );
  }

  // Add financial planning steps for any goal with significant cost
  if (cost > 1000) {
    const monthlyAmount = Math.round(cost / monthsToGoal);
    
    steps.unshift({
      id: 'savings-plan',
      title: 'Establish Dedicated Savings Plan',
      description: `Set up automatic savings to accumulate $${cost.toLocaleString()} by your target date. Save $${monthlyAmount.toLocaleString()} per month.`,
      completed: false,
      estimatedCost: 0,
      estimatedHours: 3,
      priority: 'high',
      category: 'financial',
      tips: [
        'Open a high-yield savings account',
        'Set up automatic transfers',
        'Track progress monthly',
        'Cut unnecessary expenses',
        'Consider side income opportunities'
      ],
      resources: ['High-yield savings account', 'Budgeting apps', 'Expense tracking tools']
    });

    // Add investment planning for larger amounts
    if (cost > 10000) {
      steps.splice(1, 0, {
        id: 'investment-strategy',
        title: 'Develop Investment Strategy',
        description: 'Research investment options to grow your savings faster. Consider low-risk options aligned with your timeline.',
        completed: false,
        estimatedCost: 100,
        estimatedHours: 15,
        priority: 'medium',
        category: 'financial',
        prerequisites: ['Establish Dedicated Savings Plan'],
        tips: [
          'Consider conservative investments for short-term goals',
          'Diversify your investment portfolio',
          'Consult with a financial advisor',
          'Understand risk vs. return'
        ]
      });
    }
  }

  // Add timeline management steps
  if (monthsToGoal > 6) {
    steps.push({
      id: 'milestone-tracking',
      title: 'Set Up Milestone Tracking System',
      description: 'Create quarterly milestones and progress check-ins to stay on track with your goal timeline.',
      completed: false,
      estimatedCost: 0,
      estimatedHours: 5,
      priority: 'medium',
      category: 'management',
      tips: [
        'Set specific quarterly targets',
        'Schedule monthly progress reviews',
        'Use project management tools',
        'Celebrate milestone achievements'
      ]
    });
  }

  // Add contingency planning
  steps.push({
    id: 'contingency-plan',
    title: 'Develop Contingency Plans',
    description: 'Identify potential obstacles and create backup plans for common scenarios that might derail your progress.',
    completed: false,
    estimatedCost: 0,
    estimatedHours: 8,
    priority: 'low',
    category: 'planning',
    tips: [
      'Identify top 3 potential obstacles',
      'Create specific action plans for each scenario',
      'Build buffer time into your schedule',
      'Have emergency fund for unexpected costs'
    ]
  });

  return steps;
}

// PUT /planning/steps/:id - Update a goal step
router.put('/steps/:id', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const stepId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify step belongs to user's goal
    const step = await prisma.goalStep.findFirst({
      where: { 
        id: stepId,
        goal: {
          userId: userId,
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Update the step
    const updatedStep = await prisma.goalStep.update({
      where: { id: stepId },
      data: req.body,
    });

    logger.info(`Step ${stepId} updated by user ${userId}`);

    res.json({
      success: true,
      step: updatedStep,
    });

  } catch (error) {
    logger.error('Error updating step:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// DELETE /planning/steps/:id - Delete a goal step
router.delete('/steps/:id', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const stepId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify step belongs to user's goal
    const step = await prisma.goalStep.findFirst({
      where: { 
        id: stepId,
        goal: {
          userId: userId,
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    await prisma.goalStep.delete({
      where: { id: stepId },
    });

    logger.info(`Step ${stepId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Step deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting step:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

export default router;