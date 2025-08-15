import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { feasibilityService } from '../services/FeasibilityService';
import { GoalService } from '../services/GoalService';
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

    // Create goal using GoalService
    const goal = await GoalService.createGoal(userId, {
      title: validatedData.title,
      description: validatedData.description || '',
      category: validatedData.category || 'personal',
      targetDate: validatedData.targetDate,
      estimatedCost: validatedData.estimatedCost,
      status: 'planning',
    });

    res.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        priority: goal.priority,
        targetDate: goal.targetDate,
        estimatedCost: goal.estimatedCost,
        currentSaved: goal.currentSaved,
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

// GET /goals - Get user's goals with filtering and pagination
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Parse query parameters
    const {
      category,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      limit,
      offset
    } = req.query;

    const filters = {
      category: category as string,
      status: status as string,
      priority: priority as string,
      search: search as string,
      sortBy: (sortBy as any) || 'createdAt',
      sortOrder: (sortOrder as any) || 'desc',
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0
    };

    const result = await GoalService.getUserGoals(userId, filters);

    // Parse JSON fields for response
    const formattedGoals = result.goals.map(goal => ({
      ...goal,
      feasibilityAnalysis: typeof goal.feasibilityAnalysis === 'string' 
        ? JSON.parse(goal.feasibilityAnalysis) 
        : goal.feasibilityAnalysis,
      redFlags: typeof goal.redFlags === 'string' 
        ? JSON.parse(goal.redFlags) 
        : goal.redFlags,
      suggestedAlternatives: typeof goal.suggestedAlternatives === 'string' 
        ? JSON.parse(goal.suggestedAlternatives) 
        : goal.suggestedAlternatives,
      aiPlan: typeof goal.aiPlan === 'string' 
        ? JSON.parse(goal.aiPlan) 
        : goal.aiPlan,
    }));

    res.json({
      success: true,
      goals: formattedGoals,
      pagination: {
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        limit: filters.limit,
        offset: filters.offset
      }
    });

  } catch (error) {
    logger.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /goals/:id - Get specific goal with progress
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const goal = await GoalService.getGoal(goalId, userId);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Get progress information
    const progress = await GoalService.getGoalProgress(goalId, userId);

    // Parse JSON fields
    const formattedGoal = {
      ...goal,
      feasibilityAnalysis: typeof goal.feasibilityAnalysis === 'string' 
        ? JSON.parse(goal.feasibilityAnalysis) 
        : goal.feasibilityAnalysis,
      redFlags: typeof goal.redFlags === 'string' 
        ? JSON.parse(goal.redFlags) 
        : goal.redFlags,
      suggestedAlternatives: typeof goal.suggestedAlternatives === 'string' 
        ? JSON.parse(goal.suggestedAlternatives) 
        : goal.suggestedAlternatives,
      aiPlan: typeof goal.aiPlan === 'string' 
        ? JSON.parse(goal.aiPlan) 
        : goal.aiPlan,
    };

    res.json({
      success: true,
      goal: formattedGoal,
      progress
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

    // Prepare update data (remove sensitive fields)
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    const updatedGoal = await GoalService.updateGoal(goalId, userId, updateData);

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

    await GoalService.deleteGoal(goalId, userId);

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// GET /goals/categories - Get goal categories with counts
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const categories = await GoalService.getGoalCategories(userId);

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    logger.error('Error fetching goal categories:', error);
    res.status(500).json({ error: 'Failed to fetch goal categories' });
  }
});

// PATCH /goals/:id/progress - Update goal savings progress
router.patch('/:id/progress', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    const { currentSaved } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (typeof currentSaved !== 'number' || currentSaved < 0) {
      return res.status(400).json({ error: 'Invalid current saved amount' });
    }

    const updatedGoal = await GoalService.updateGoalProgress(goalId, userId, currentSaved);

    res.json({
      success: true,
      goal: updatedGoal,
      message: 'Goal progress updated successfully'
    });

  } catch (error) {
    logger.error('Error updating goal progress:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// GET /goals/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await GoalService.getDashboardStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// POST /goals/steps/generate-basic - Generate basic steps for a goal
router.post('/steps/generate-basic', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { goalId, category, title, estimatedCost, targetDate } = req.body;

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

    // Generate basic contextual steps
    const steps = generateBasicSteps(category, title, estimatedCost, targetDate);

    logger.info(`Basic steps generated for goal ${goalId} by user ${userId}`);

    res.json({
      success: true,
      steps,
      message: 'Basic steps generated successfully'
    });

  } catch (error) {
    logger.error('Error generating basic steps:', error);
    res.status(500).json({ error: 'Failed to generate basic steps' });
  }
});

// Helper function to generate basic contextual steps
function generateBasicSteps(category: string, title: string, estimatedCost: number, targetDate: string) {
  const steps: any[] = [];
  const cost = estimatedCost || 0;
  const monthsToGoal = targetDate 
    ? Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 12;

  // Add financial planning step if there's a significant cost
  if (cost > 500) {
    const monthlyAmount = Math.round(cost / monthsToGoal);
    steps.push({
      id: 'financial-planning',
      title: 'Create Financial Plan',
      description: `Save approximately $${monthlyAmount.toLocaleString()}/month to reach your $${cost.toLocaleString()} goal`,
      completed: false,
      priority: 'high',
      category: 'financial',
      tips: [
        'Set up automatic transfers to a dedicated savings account',
        'Track your monthly progress',
        'Consider cutting unnecessary expenses'
      ]
    });
  }

  // Add category-specific basic steps
  const lowerCategory = category?.toLowerCase() || '';
  
  if (lowerCategory.includes('business') || lowerCategory.includes('career')) {
    steps.push(
      {
        id: 'research-phase',
        title: 'Research & Planning Phase',
        description: 'Conduct thorough research on your business/career goal and create a detailed plan',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Research market opportunities',
          'Identify required skills and resources',
          'Create a timeline with milestones'
        ]
      },
      {
        id: 'skill-development',
        title: 'Develop Required Skills',
        description: 'Identify and develop the key skills needed for your business or career goal',
        completed: false,
        priority: 'high',
        category: 'learning',
        tips: [
          'Take relevant courses or training',
          'Practice new skills regularly',
          'Seek mentorship opportunities'
        ]
      }
    );
  } else if (lowerCategory.includes('education') || lowerCategory.includes('learning')) {
    steps.push(
      {
        id: 'program-research',
        title: 'Research Educational Programs',
        description: 'Research and compare educational programs, requirements, and outcomes',
        completed: false,
        priority: 'high',
        category: 'research',
        tips: [
          'Compare multiple program options',
          'Check accreditation and reputation',
          'Review admission requirements and deadlines'
        ]
      },
      {
        id: 'application-prep',
        title: 'Prepare Applications',
        description: 'Gather required documents and complete application process',
        completed: false,
        priority: 'high',
        category: 'preparation',
        tips: [
          'Start gathering documents early',
          'Write compelling personal statements',
          'Secure strong letters of recommendation'
        ]
      }
    );
  } else if (lowerCategory.includes('health') || lowerCategory.includes('fitness')) {
    steps.push(
      {
        id: 'health-assessment',
        title: 'Health & Fitness Assessment',
        description: 'Assess your current health status and set realistic fitness targets',
        completed: false,
        priority: 'high',
        category: 'health',
        tips: [
          'Get medical clearance if needed',
          'Establish baseline measurements',
          'Set realistic short-term goals'
        ]
      },
      {
        id: 'routine-planning',
        title: 'Create Exercise & Nutrition Plan',
        description: 'Develop a structured routine for exercise and healthy eating',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Start with achievable workout schedules',
          'Plan balanced meals in advance',
          'Track your progress weekly'
        ]
      }
    );
  } else if (lowerCategory.includes('travel')) {
    steps.push(
      {
        id: 'trip-planning',
        title: 'Plan Your Trip Details',
        description: 'Research destinations, create itinerary, and plan logistics',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Research visa and travel requirements',
          'Plan your itinerary day by day',
          'Research local customs and weather'
        ]
      },
      {
        id: 'booking-preparation',
        title: 'Make Travel Arrangements',
        description: 'Book flights, accommodation, and prepare necessary documents',
        completed: false,
        priority: 'medium',
        category: 'logistics',
        tips: [
          'Book flights and accommodation in advance',
          'Get travel insurance',
          'Prepare all necessary travel documents'
        ]
      }
    );
  } else {
    // Generic steps for any goal
    steps.push(
      {
        id: 'goal-breakdown',
        title: 'Break Down Your Goal',
        description: 'Break your main goal into smaller, manageable tasks and milestones',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'Make tasks specific and measurable',
          'Set realistic deadlines',
          'Prioritize the most important tasks first'
        ]
      },
      {
        id: 'resource-identification',
        title: 'Identify Required Resources',
        description: 'Determine what resources, skills, or support you need to achieve your goal',
        completed: false,
        priority: 'high',
        category: 'planning',
        tips: [
          'List all required resources',
          'Identify gaps in your current capabilities',
          'Plan how to acquire missing resources'
        ]
      }
    );
  }

  // Always add a progress tracking step
  steps.push({
    id: 'progress-tracking',
    title: 'Set Up Progress Tracking',
    description: 'Create a system to monitor your progress and stay motivated',
    completed: false,
    priority: 'medium',
    category: 'management',
    tips: [
      'Set up regular check-in dates',
      'Use tools or apps to track progress',
      'Celebrate small wins along the way'
    ]
  });

  return steps;
}

// PATCH /goals/bulk-update - Bulk update goals
router.patch('/bulk-update', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    const updatedGoals = [];
    
    for (const update of updates) {
      const { id, data } = update;
      
      // Verify goal belongs to user and update
      const goal = await prisma.goal.findFirst({
        where: { id, userId }
      });
      
      if (goal) {
        const updatedGoal = await GoalService.updateGoal(id, userId, data);
        updatedGoals.push(updatedGoal);
      }
    }

    logger.info(`Bulk updated ${updatedGoals.length} goals for user ${userId}`);

    res.json({
      success: true,
      updatedGoals
    });

  } catch (error) {
    logger.error('Error bulk updating goals:', error);
    res.status(500).json({ error: 'Failed to bulk update goals' });
  }
});

// DELETE /goals/bulk-delete - Bulk delete goals
router.delete('/bulk-delete', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { goalIds } = req.body;
    
    if (!Array.isArray(goalIds)) {
      return res.status(400).json({ error: 'Goal IDs must be an array' });
    }

    // Delete goals that belong to the user
    const deleteResult = await prisma.goal.deleteMany({
      where: {
        id: { in: goalIds },
        userId: userId
      }
    });

    logger.info(`Bulk deleted ${deleteResult.count} goals for user ${userId}`);

    res.json({
      success: true,
      message: `${deleteResult.count} goals deleted successfully`
    });

  } catch (error) {
    logger.error('Error bulk deleting goals:', error);
    res.status(500).json({ error: 'Failed to bulk delete goals' });
  }
});

// POST /goals/:id/duplicate - Duplicate a goal
router.post('/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get original goal
    const originalGoal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: { steps: true }
    });

    if (!originalGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Create duplicate goal
    const duplicateGoal = await prisma.goal.create({
      data: {
        userId,
        title: `${originalGoal.title} (Copy)`,
        description: originalGoal.description,
        category: originalGoal.category,
        priority: originalGoal.priority,
        status: 'planning',
        estimatedCost: originalGoal.estimatedCost,
        currentSaved: 0,
        targetDate: originalGoal.targetDate,
        feasibilityScore: originalGoal.feasibilityScore,
        feasibilityAnalysis: originalGoal.feasibilityAnalysis,
        redFlags: originalGoal.redFlags,
        suggestedAlternatives: originalGoal.suggestedAlternatives,
      }
    });

    // Duplicate steps
    if (originalGoal.steps.length > 0) {
      const duplicateSteps = originalGoal.steps.map(step => ({
        goalId: duplicateGoal.id,
        title: step.title,
        description: step.description,
        stepOrder: step.stepOrder,
        estimatedCost: step.estimatedCost,
        estimatedDuration: step.estimatedDuration,
        deadline: step.deadline,
        completed: false,
        createdBy: step.createdBy
      }));

      await prisma.goalStep.createMany({
        data: duplicateSteps
      });
    }

    logger.info(`Goal ${goalId} duplicated as ${duplicateGoal.id} for user ${userId}`);

    res.json({
      success: true,
      goal: duplicateGoal
    });

  } catch (error) {
    logger.error('Error duplicating goal:', error);
    res.status(500).json({ error: 'Failed to duplicate goal' });
  }
});

// PATCH /goals/:id/archive - Archive a goal
router.patch('/:id/archive', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const archivedGoal = await GoalService.updateGoal(goalId, userId, {
      status: 'paused'
    });

    logger.info(`Goal ${goalId} archived for user ${userId}`);

    res.json({
      success: true,
      goal: archivedGoal
    });

  } catch (error) {
    logger.error('Error archiving goal:', error);
    res.status(500).json({ error: 'Failed to archive goal' });
  }
});

// PATCH /goals/:id/unarchive - Unarchive a goal
router.patch('/:id/unarchive', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const unarchivedGoal = await GoalService.updateGoal(goalId, userId, {
      status: 'in_progress'
    });

    logger.info(`Goal ${goalId} unarchived for user ${userId}`);

    res.json({
      success: true,
      goal: unarchivedGoal
    });

  } catch (error) {
    logger.error('Error unarchiving goal:', error);
    res.status(500).json({ error: 'Failed to unarchive goal' });
  }
});

export default router;