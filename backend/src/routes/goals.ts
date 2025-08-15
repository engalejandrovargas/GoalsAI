import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { feasibilityService } from '../services/FeasibilityService';
import logger from '../utils/logger';

const router = express.Router();

// Validation schemas
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  estimatedCost: z.number().optional(),
});

const analyzeGoalSchema = z.object({
  goalDescription: z.string().min(10, 'Goal description must be at least 10 characters'),
});

// POST /goals/analyze - Analyze goal feasibility with AI
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    const { goalDescription } = analyzeGoalSchema.parse(req.body);

    // Get user context for AI analysis
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        ageRange: true,
        interests: true,
        initialGoals: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user context
    const userContext = {
      location: user.location || 'Unknown',
      ageRange: user.ageRange || '25-34',
      interests: user.interests ? JSON.parse(user.interests) : [],
      goals: user.initialGoals || '',
    };

    logger.info(`Analyzing goal feasibility for user ${userId}: "${goalDescription.substring(0, 50)}..."`);

    // Analyze with enhanced feasibility service
    const analysis = await aiService.analyzeFeasibility(goalDescription, userContext);
    
    // Get detailed feasibility analysis if goal has enough info
    let detailedAnalysis = null;
    if (analysis.feasibilityScore && analysis.estimatedCost) {
      const goalData = {
        title: goalDescription.split(':')[0] || goalDescription.substring(0, 50),
        description: goalDescription,
        estimatedCost: analysis.estimatedCost.max,
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now as default
      };
      
      try {
        detailedAnalysis = await feasibilityService.analyzeGoal(goalData, user as any);
      } catch (error) {
        logger.warn('Detailed feasibility analysis failed, using basic analysis');
      }
    }

    res.json({
      success: true,
      analysis,
      detailedAnalysis,
      goalDescription,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error analyzing goal:', error);
    res.status(500).json({ error: 'Failed to analyze goal' });
  }
});

// POST /goals - Create a new goal
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    const validatedData = createGoalSchema.parse(req.body);

    // Create goal in database
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description || '',
        category: validatedData.category || 'personal',
        targetDate: validatedData.targetDate,
        estimatedCost: validatedData.estimatedCost,
        status: 'planning',
      },
    });

    logger.info(`Goal created for user ${userId}: "${goal.title}" (ID: ${goal.id})`);

    res.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        targetDate: goal.targetDate,
        estimatedCost: goal.estimatedCost,
        createdAt: goal.createdAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// POST /goals/:id/analyze - Analyze existing goal
router.post('/:id/analyze', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user context and goal description
    const userContext = {
      location: user.location || 'Unknown',
      ageRange: user.ageRange || '25-34',
      interests: user.interests ? JSON.parse(user.interests) : [],
      goals: user.initialGoals || '',
    };

    const goalDescription = `${goal.title}: ${goal.description}`;

    logger.info(`Analyzing existing goal ${goalId} for user ${userId}`);

    // Analyze with AI
    const analysis = await aiService.analyzeFeasibility(goalDescription, userContext);

    // Update goal with AI analysis
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        feasibilityScore: analysis.feasibilityScore,
        feasibilityAnalysis: JSON.stringify(analysis),
        category: analysis.category,
      },
    });

    res.json({
      success: true,
      goal: updatedGoal,
      analysis,
    });

  } catch (error) {
    logger.error('Error analyzing existing goal:', error);
    res.status(500).json({ error: 'Failed to analyze goal' });
  }
});

// GET /goals - Get user's goals
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    // Parse JSON fields for response
    const formattedGoals = goals.map(goal => ({
      ...goal,
      feasibilityAnalysis: goal.feasibilityAnalysis ? JSON.parse(goal.feasibilityAnalysis) : null,
      redFlags: goal.redFlags ? JSON.parse(goal.redFlags) : null,
      suggestedAlternatives: goal.suggestedAlternatives ? JSON.parse(goal.suggestedAlternatives) : null,
      aiPlan: goal.aiPlan ? JSON.parse(goal.aiPlan) : null,
    }));

    res.json({
      success: true,
      goals: formattedGoals,
    });

  } catch (error) {
    logger.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /goals/:id - Get specific goal
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const goal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: userId,
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Parse JSON fields
    const formattedGoal = {
      ...goal,
      feasibilityAnalysis: goal.feasibilityAnalysis ? JSON.parse(goal.feasibilityAnalysis) : null,
      redFlags: goal.redFlags ? JSON.parse(goal.redFlags) : null,
      suggestedAlternatives: goal.suggestedAlternatives ? JSON.parse(goal.suggestedAlternatives) : null,
      aiPlan: goal.aiPlan ? JSON.parse(goal.aiPlan) : null,
    };

    res.json({
      success: true,
      goal: formattedGoal,
    });

  } catch (error) {
    logger.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// PUT /goals/:id - Update goal
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Update goal
    const updateData = req.body;
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    res.json({
      success: true,
      goal: updatedGoal,
    });

  } catch (error) {
    logger.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /goals/:id - Delete goal
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    logger.info(`Goal ${goalId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;