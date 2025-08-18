import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireSessionAuth } from '../middleware/auth';
import { AgentManager } from '../services/AgentManager';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Global agent manager instance
let agentManager: AgentManager;

// Initialize agent manager on first request
router.use(async (req, res, next) => {
  if (!agentManager) {
    agentManager = new AgentManager(prisma);
  }
  next();
});

// Get all available agents
router.get('/', requireSessionAuth, async (req: any, res) => {
  try {
    const agents = await agentManager.getAllAgents();
    res.json({ agents });
  } catch (error) {
    logger.error('Failed to get agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get specific agent status
router.get('/:agentId', requireSessionAuth, async (req: any, res) => {
  try {
    const { agentId } = req.params;
    const agentStatus = await agentManager.getAgentStatus(agentId);
    res.json(agentStatus);
  } catch (error) {
    logger.error(`Failed to get agent status for ${req.params.agentId}:`, error);
    res.status(500).json({ error: 'Failed to fetch agent status' });
  }
});

// Assign agents to a goal
router.post('/assign-to-goal', requireSessionAuth, async (req: any, res) => {
  try {
    const { goalId, agentTypes } = req.body;
    
    if (!goalId || !Array.isArray(agentTypes)) {
      return res.status(400).json({ error: 'goalId and agentTypes array are required' });
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: (req.user as any).id },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const assignedAgents = await agentManager.assignAgentsToGoal(goalId, agentTypes);
    
    res.json({
      message: 'Agents assigned successfully',
      goalId,
      assignedAgents,
    });
  } catch (error) {
    logger.error('Failed to assign agents to goal:', error);
    res.status(500).json({ error: 'Failed to assign agents' });
  }
});

// Execute a task
router.post('/execute-task', requireSessionAuth, async (req: any, res) => {
  try {
    logger.info(`POST /agents/execute-task called`);
    logger.info('Request body:', JSON.stringify(req.body, null, 2));
    
    const { goalId, taskType, parameters, priority = 'medium' } = req.body;
    
    if (!taskType || !parameters) {
      logger.error('Missing required fields - taskType:', taskType, 'parameters:', parameters);
      return res.status(400).json({ error: 'taskType and parameters are required' });
    }

    logger.info('Validated request - taskType:', taskType, 'priority:', priority);

    // Verify goal belongs to user if goalId is provided (skip for demo goals)
    if (goalId && !goalId.startsWith('demo-goal-') && !goalId.startsWith('temp-')) {
      logger.info('Checking goal ownership for goalId:', goalId);
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId: (req.user as any).id },
      });

      if (!goal) {
        logger.error('Goal not found or access denied for goalId:', goalId);
        return res.status(404).json({ error: 'Goal not found' });
      }
      logger.info('Goal ownership verified');
    } else if (goalId) {
      logger.info('Skipping goal verification for demo/temp goal:', goalId);
    }

    const taskParams = {
      goalId: goalId || `temp-${Date.now()}`,
      userId: (req.user as any).id,
      type: taskType,
      priority: priority as 'high' | 'medium' | 'low',
      parameters,
    };

    logger.info('About to execute task with params:', JSON.stringify(taskParams, null, 2));
    
    logger.info('Calling agentManager.executeTask...');
    const result = await agentManager.executeTask(taskParams);
    logger.info('Task execution completed successfully:', JSON.stringify(result, null, 2));
    
    res.json({
      success: result.success,
      result: result.data,
      confidence: result.confidence,
      metadata: result.metadata,
      error: result.error,
    });
  } catch (error) {
    logger.error('Failed to execute task - detailed error:', error);
    logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ 
      error: 'Failed to execute task', 
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    });
  }
});

// Set up monitoring for a goal
router.post('/setup-monitoring', requireSessionAuth, async (req: any, res) => {
  try {
    const { goalId, agentId, monitorType, parameters, frequency = 'daily', threshold, thresholdType } = req.body;
    
    if (!goalId || !agentId || !monitorType || !parameters) {
      return res.status(400).json({ error: 'goalId, agentId, monitorType, and parameters are required' });
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: (req.user as any).id },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const monitorParams = {
      goalId,
      agentId,
      monitorType,
      parameters,
      frequency: frequency as 'hourly' | 'daily' | 'weekly',
      threshold,
      thresholdType: thresholdType as 'above' | 'below' | 'change_percent' | undefined,
    };

    const monitorId = await agentManager.setupMonitoring(monitorParams);
    
    res.json({
      message: 'Monitoring setup successfully',
      monitorId,
      parameters: monitorParams,
    });
  } catch (error) {
    logger.error('Failed to setup monitoring:', error);
    res.status(500).json({ error: 'Failed to setup monitoring' });
  }
});

// Get goal's agent activities
router.get('/goal/:goalId/activities', requireSessionAuth, async (req: any, res) => {
  try {
    const { goalId } = req.params;
    
    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: (req.user as any).id },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const activities = await prisma.agentTask.findMany({
      where: { goalId },
      include: {
        agent: {
          select: { name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      agent: activity.agent,
      taskType: activity.taskType,
      status: activity.status,
      confidence: activity.confidence,
      result: activity.result ? JSON.parse(activity.result) : null,
      error: activity.errorMessage,
      createdAt: activity.createdAt,
      startedAt: activity.startedAt,
      completedAt: activity.completedAt,
    }));

    res.json({ activities: formattedActivities });
  } catch (error) {
    logger.error('Failed to get goal activities:', error);
    res.status(500).json({ error: 'Failed to fetch goal activities' });
  }
});

// Add API credentials for an agent (admin only)
router.post('/:agentId/credentials', requireSessionAuth, async (req: any, res) => {
  try {
    const { agentId } = req.params;
    const { provider, keyName, value, expiresAt, monthlyLimit } = req.body;
    
    if (!provider || !keyName || !value) {
      return res.status(400).json({ error: 'provider, keyName, and value are required' });
    }

    // TODO: Add admin check here
    // For now, any authenticated user can add credentials
    
    await agentManager.addApiCredentials(
      agentId,
      provider,
      keyName,
      value,
      expiresAt ? new Date(expiresAt) : undefined,
      monthlyLimit
    );
    
    res.json({
      message: 'API credentials added successfully',
      agentId,
      provider,
      keyName,
    });
  } catch (error) {
    logger.error('Failed to add API credentials:', error);
    res.status(500).json({ error: 'Failed to add API credentials' });
  }
});

// Get agent task history
router.get('/:agentId/tasks', requireSessionAuth, async (req: any, res) => {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    const whereClause: any = { agentId };
    if (status) {
      whereClause.status = status;
    }

    const tasks = await prisma.agentTask.findMany({
      where: whereClause,
      include: {
        goal: {
          select: { id: true, title: true, userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Filter tasks to only show those belonging to the current user
    const userTasks = tasks.filter(task => task.goal.userId === (req.user as any).id);

    const formattedTasks = userTasks.map(task => ({
      id: task.id,
      taskType: task.taskType,
      status: task.status,
      priority: task.priority,
      confidence: task.confidence,
      parameters: task.parameters ? JSON.parse(task.parameters) : null,
      result: task.result ? JSON.parse(task.result) : null,
      error: task.errorMessage,
      goal: {
        id: task.goal.id,
        title: task.goal.title,
      },
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      retryCount: task.retryCount,
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    logger.error('Failed to get agent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch agent tasks' });
  }
});

export default router;