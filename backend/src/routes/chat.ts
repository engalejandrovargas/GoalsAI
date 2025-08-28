import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { requireSessionAuth } from '../middleware/auth';
import { aiService } from '../services/aiService';
import logger from '../utils/logger';

const router = express.Router();

// Validation schemas
const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
  sessionType: z.enum(['general', 'goal_creation', 'goal_refinement']).optional().default('general'),
});

// POST /chat/stream - Send a message to AI with streaming response
router.post('/stream', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    const { message, sessionId, sessionType } = sendMessageSchema.parse(req.body);

    // Get enhanced user context for AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        nationality: true,
        travelBudget: true,
        travelStyle: true,
        firstGoal: true,
        ageRange: true,
        currentSituation: true,
        availableTime: true,
        riskTolerance: true,
        preferredApproach: true,
        occupation: true,
        annualIncome: true,
        currentSavings: true,
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

    // Find or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: userId,
        },
      });
    }

    if (!chatSession) {
      // Create new session
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          sessionType,
          messages: JSON.stringify([]),
        },
      });
    }

    // Get conversation history
    const conversationHistory = JSON.parse(chatSession.messages);

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.get('Origin') || 'http://localhost:5174',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
    });

    // Send session ID first
    res.write(`data: ${JSON.stringify({ type: 'session_id', sessionId: chatSession.id })}\n\n`);

    let fullAIResponse = '';

    try {
      // Get streaming AI response
      const streamGenerator = aiService.chatWithAIStreaming(message, conversationHistory, userContext, sessionType);
      
      for await (const chunk of streamGenerator) {
        fullAIResponse += chunk;
        // Send chunk to client
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);

    } catch (error) {
      logger.error('Error in streaming chat:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred while processing your message' })}\n\n`);
      fullAIResponse = "I'm sorry, I encountered an error while processing your message. Please try again.";
    }

    // Update conversation history in background
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: fullAIResponse, timestamp: new Date().toISOString() }
    ];

    // Update chat session
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messages: JSON.stringify(updatedHistory),
        updatedAt: new Date(),
      },
    });

    logger.info(`Streaming chat message processed for user ${userId} in session ${chatSession.id}`);
    res.end();

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error processing streaming chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST /chat/message - Send a message to AI
router.post('/message', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    const { message, sessionId, sessionType } = sendMessageSchema.parse(req.body);

    // Get enhanced user context for AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        location: true,
        nationality: true,
        travelBudget: true,
        travelStyle: true,
        firstGoal: true,
        ageRange: true,
        currentSituation: true,
        availableTime: true,
        riskTolerance: true,
        preferredApproach: true,
        occupation: true,
        annualIncome: true,
        currentSavings: true,
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

    // Find or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: userId,
        },
      });
    }

    if (!chatSession) {
      // Create new session
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          sessionType,
          messages: JSON.stringify([]),
        },
      });
    }

    // Get conversation history
    const conversationHistory = JSON.parse(chatSession.messages);

    // Get AI response
    const aiResponse = await aiService.chatWithAI(message, conversationHistory, userContext, sessionType);

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    // Update chat session
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: {
        messages: JSON.stringify(updatedHistory),
        updatedAt: new Date(),
      },
    });

    logger.info(`Chat message processed for user ${userId} in session ${chatSession.id}`);

    res.json({
      success: true,
      sessionId: chatSession.id,
      message: aiResponse,
      sessionType,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    logger.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /chat/sessions - Get user's chat sessions
router.get('/sessions', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        sessionType: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    // Parse messages and add preview
    const formattedSessions = sessions.map(session => {
      const messages = JSON.parse(session.messages);
      const lastMessage = messages[messages.length - 1];
      const messageCount = messages.length;

      return {
        id: session.id,
        sessionType: session.sessionType,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount,
        lastMessage: lastMessage ? {
          role: lastMessage.role,
          content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
          timestamp: lastMessage.timestamp,
        } : null,
      };
    });

    res.json({
      success: true,
      sessions: formattedSessions,
    });

  } catch (error) {
    logger.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /chat/sessions/:id - Get specific chat session
router.get('/sessions/:id', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const sessionId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        userId: userId,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Parse messages
    const messages = JSON.parse(session.messages);

    res.json({
      success: true,
      session: {
        id: session.id,
        sessionType: session.sessionType,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages,
      },
    });

  } catch (error) {
    logger.error('Error fetching chat session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// DELETE /chat/sessions/:id - Delete chat session
router.delete('/sessions/:id', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const sessionId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if session belongs to user
    const existingSession = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        userId: userId,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    logger.info(`Chat session ${sessionId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Chat session deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// POST /chat/sessions/:id/clear - Clear chat session messages
router.post('/sessions/:id/clear', requireSessionAuth, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const sessionId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if session belongs to user
    const existingSession = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        userId: userId,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Clear messages
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: JSON.stringify([]),
        updatedAt: new Date(),
      },
    });

    logger.info(`Chat session ${sessionId} cleared by user ${userId}`);

    res.json({
      success: true,
      message: 'Chat session cleared successfully',
      session: {
        id: updatedSession.id,
        sessionType: updatedSession.sessionType,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt,
        messages: [],
      },
    });

  } catch (error) {
    logger.error('Error clearing chat session:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

export default router;