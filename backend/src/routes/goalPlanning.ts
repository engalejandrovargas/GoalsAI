import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
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
router.post('/generate', requireAuth, async (req, res) => {
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
        ageRange: true,
        interests: true,
        initialGoals: true,
        annualIncome: true,
        currentSavings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare context for AI plan generation
    const userContext = {
      location: user.location || 'Unknown',
      ageRange: user.ageRange || '25-34',
      interests: user.interests ? JSON.parse(user.interests) : [],
      goals: user.initialGoals || '',
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
router.post('/steps', requireAuth, async (req, res) => {
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
router.put('/steps/:id/complete', requireAuth, async (req, res) => {
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
router.get('/:goalId/steps', requireAuth, async (req, res) => {
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

// DELETE /planning/steps/:id - Delete a goal step
router.delete('/steps/:id', requireAuth, async (req, res) => {
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