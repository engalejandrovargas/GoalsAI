import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireSessionAuth } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Create a new step for a goal
router.post('/:goalId/steps', requireSessionAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, description, estimatedCost, estimatedDuration, deadline } = req.body;
    const userId = (req.user as any)?.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Step title is required'
      });
    }

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Get the next step order
    const lastStep = await prisma.goalStep.findFirst({
      where: { goalId },
      orderBy: { stepOrder: 'desc' }
    });

    const stepOrder = (lastStep?.stepOrder ?? 0) + 1;

    const step = await prisma.goalStep.create({
      data: {
        goalId,
        title,
        description,
        stepOrder,
        estimatedCost: estimatedCost || null,
        estimatedDuration: estimatedDuration || null,
        deadline: deadline ? new Date(deadline) : null,
        createdBy: 'user'
      }
    });

    res.json({
      success: true,
      step
    });
  } catch (error) {
    logger.error('Error creating goal step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create step'
    });
  }
});

// Get all steps for a goal
router.get('/:goalId/steps', requireSessionAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = (req.user as any)?.id;

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const steps = await prisma.goalStep.findMany({
      where: { goalId },
      orderBy: { stepOrder: 'asc' }
    });

    res.json({
      success: true,
      steps
    });
  } catch (error) {
    logger.error('Error fetching goal steps:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch steps'
    });
  }
});

// Update step completion status
router.patch('/:goalId/steps/:stepId', requireSessionAuth, async (req, res) => {
  try {
    const { goalId, stepId } = req.params;
    const { completed, title, description, estimatedCost, estimatedDuration, deadline } = req.body;
    const userId = (req.user as any)?.id;

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Verify step belongs to goal
    const step = await prisma.goalStep.findFirst({
      where: { id: stepId, goalId }
    });

    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }

    const updateData: any = {};
    if (completed !== undefined) updateData.completed = completed;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const updatedStep = await prisma.goalStep.update({
      where: { id: stepId },
      data: updateData
    });

    // If step is completed, check if goal should be updated
    if (completed) {
      const allSteps = await prisma.goalStep.findMany({
        where: { goalId }
      });
      
      const completedSteps = allSteps.filter(s => s.completed).length;
      const totalSteps = allSteps.length;
      
      // If all steps are completed, mark goal as completed
      if (completedSteps === totalSteps && totalSteps > 0) {
        await prisma.goal.update({
          where: { id: goalId },
          data: { status: 'completed' }
        });
      } else if (completedSteps > 0 && goal.status === 'planning') {
        // If first step is completed, change status to in_progress
        await prisma.goal.update({
          where: { id: goalId },
          data: { status: 'in_progress' }
        });
      }
    }

    res.json({
      success: true,
      step: updatedStep
    });
  } catch (error) {
    logger.error('Error updating goal step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update step'
    });
  }
});

// Delete a step
router.delete('/:goalId/steps/:stepId', requireSessionAuth, async (req, res) => {
  try {
    const { goalId, stepId } = req.params;
    const userId = (req.user as any)?.id;

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Verify step belongs to goal
    const step = await prisma.goalStep.findFirst({
      where: { id: stepId, goalId }
    });

    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }

    await prisma.goalStep.delete({
      where: { id: stepId }
    });

    res.json({
      success: true,
      message: 'Step deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting goal step:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete step'
    });
  }
});

// Update goal progress (savings)
router.patch('/:goalId/progress', requireSessionAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { currentSaved } = req.body;
    const userId = (req.user as any)?.id;

    if (typeof currentSaved !== 'number' || currentSaved < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid savings amount'
      });
    }

    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { currentSaved }
    });

    res.json({
      success: true,
      goal: updatedGoal
    });
  } catch (error) {
    logger.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

export default router;