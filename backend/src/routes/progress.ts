import express from 'express';
import { requireSessionAuth } from '../middleware/auth';
import { ProgressService } from '../services/ProgressService';
import logger from '../utils/logger';

const router = express.Router();

// GET /progress/metrics - Get user progress metrics
router.get('/metrics', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const metrics = await ProgressService.getProgressMetrics(userId);

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    logger.error('Error fetching progress metrics:', error);
    res.status(500).json({ error: 'Failed to fetch progress metrics' });
  }
});

// GET /progress/insights - Get goal insights
router.get('/insights', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.query.goalId as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const insights = await ProgressService.getGoalInsights(userId, goalId);

    res.json({
      success: true,
      insights
    });

  } catch (error) {
    logger.error('Error fetching goal insights:', error);
    res.status(500).json({ error: 'Failed to fetch goal insights' });
  }
});

// GET /progress/analytics - Get user analytics
router.get('/analytics', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const analytics = await ProgressService.getUserAnalytics(userId);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// PUT /progress/update/:goalId - Update goal progress
router.put('/update/:goalId', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const goalId = req.params.goalId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const progressData = {
      currentSaved: req.body.currentSaved,
      stepId: req.body.stepId,
      stepCompleted: req.body.stepCompleted,
      notes: req.body.notes
    };

    const updatedGoal = await ProgressService.updateGoalProgress(goalId, userId, progressData);

    res.json({
      success: true,
      goal: updatedGoal,
      message: 'Progress updated successfully'
    });

  } catch (error) {
    logger.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;