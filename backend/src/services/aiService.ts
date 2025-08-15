import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

interface FeasibilityAnalysis {
  feasibilityScore: number; // 0-100
  category: string;
  estimatedTimeframe: string;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  redFlags: string[];
  successFactors: string[];
  alternatives: string[];
  actionSteps: Array<{
    step: string;
    timeframe: string;
    cost?: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  resources: Array<{
    type: 'course' | 'book' | 'tool' | 'service' | 'community';
    name: string;
    description: string;
    url?: string;
    cost?: number;
  }>;
}

interface UserContext {
  location: string;
  ageRange: string;
  interests: string[];
  goals: string;
}

export class AIService {
  // Fallback model chain - ordered by preference (best to fallback)
  private modelFallbackChain = [
    'gemini-2.5-flash',           // Latest, best performance
    'gemini-2.0-flash',           // Newer generation
    'gemini-2.5-flash-lite',      // Lightweight version
    'gemini-2.0-flash-lite',      // Most cost-efficient
    'gemini-1.5-flash',           // Legacy stable
    'gemini-1.5-flash-8b'         // Smallest fallback
  ];
  
  private currentModelIndex = 0;

  private getCurrentModel() {
    const modelName = this.modelFallbackChain[this.currentModelIndex];
    return genAI.getGenerativeModel({ model: modelName });
  }

  private async tryWithFallback<T>(operation: (model: any) => Promise<T>): Promise<T> {
    const maxAttempts = this.modelFallbackChain.length;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const model = this.getCurrentModel();
        const modelName = this.modelFallbackChain[this.currentModelIndex];
        
        if (attempt > 0) {
          logger.info(`Trying fallback model: ${modelName} (attempt ${attempt + 1}/${maxAttempts})`);
        } else {
          logger.info(`Using primary model: ${modelName}`);
        }

        const result = await operation(model);
        
        // Success! Reset to primary model for future requests if we were using a fallback
        if (this.currentModelIndex > 0) {
          logger.info(`Operation successful with ${modelName}, resetting to primary model`);
          this.currentModelIndex = 0;
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        const modelName = this.modelFallbackChain[this.currentModelIndex];
        
        logger.warn(`Model ${modelName} failed: ${error.message}`);
        
        // Move to next fallback model
        this.currentModelIndex = (this.currentModelIndex + 1) % this.modelFallbackChain.length;
        
        // If it's a 503 (overloaded) or 429 (rate limit), try next model immediately
        // For other errors, also try fallback
        if (attempt < maxAttempts - 1) {
          // Small delay between model attempts
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      }
    }

    // All models failed, throw the last error
    throw lastError;
  }

  async analyzeFeasibility(goalDescription: string, userContext: UserContext): Promise<FeasibilityAnalysis> {
    try {
      const prompt = this.buildFeasibilityPrompt(goalDescription, userContext);
      
      const result = await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
      
      logger.info('Gemini AI response received for feasibility analysis');
      
      // Parse the JSON response from Gemini (handle markdown code blocks)
      let cleanText = result.trim();
      if (cleanText.startsWith('```json') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanText.startsWith('```') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      const analysis = JSON.parse(cleanText);
      
      // Validate and ensure all required fields are present
      return this.validateAnalysis(analysis);
      
    } catch (error) {
      logger.error('Error in AI feasibility analysis - all models failed:', error);
      
      // Return a fallback analysis if all AI models fail
      return this.getFallbackAnalysis(goalDescription);
    }
  }

  private buildFeasibilityPrompt(goalDescription: string, userContext: UserContext): string {
    return `
You are an expert life coach and goal achievement analyst. Analyze the feasibility of the following goal and provide a comprehensive assessment.

USER CONTEXT:
- Location: ${userContext.location}
- Age Range: ${userContext.ageRange}
- Interests: ${userContext.interests.join(', ')}
- Goal: ${goalDescription}

Please provide a detailed feasibility analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "feasibilityScore": [0-100 integer representing how achievable this goal is],
  "category": "[auto-detect category: travel, financial, learning, health, career, creative, personal, business, or other]",
  "estimatedTimeframe": "[realistic timeframe like '3-6 months', '1-2 years', etc.]",
  "estimatedCost": {
    "min": [minimum cost in USD],
    "max": [maximum cost in USD], 
    "currency": "USD"
  },
  "redFlags": [
    "[potential obstacle 1]",
    "[potential obstacle 2]",
    "[potential obstacle 3]"
  ],
  "successFactors": [
    "[key success factor 1]",
    "[key success factor 2]", 
    "[key success factor 3]"
  ],
  "alternatives": [
    "[alternative approach 1]",
    "[alternative approach 2]",
    "[alternative approach 3]"
  ],
  "actionSteps": [
    {
      "step": "[specific actionable step]",
      "timeframe": "[when to do this]",
      "cost": [estimated cost or 0],
      "priority": "high|medium|low"
    }
  ],
  "resources": [
    {
      "type": "course|book|tool|service|community",
      "name": "[resource name]",
      "description": "[brief description]",
      "url": "[optional URL if known]",
      "cost": [cost in USD or 0 if free]
    }
  ]
}

Consider the user's location for local opportunities, their age range for relevant life stage factors, and their interests for potential synergies. Be realistic but encouraging. Provide at least 3-5 action steps and 3-5 resources.
`;
  }

  private validateAnalysis(analysis: any): FeasibilityAnalysis {
    // Ensure all required fields exist with sensible defaults
    return {
      feasibilityScore: Math.min(100, Math.max(0, analysis.feasibilityScore || 50)),
      category: analysis.category || 'personal',
      estimatedTimeframe: analysis.estimatedTimeframe || '3-6 months',
      estimatedCost: {
        min: analysis.estimatedCost?.min || 0,
        max: analysis.estimatedCost?.max || 500,
        currency: 'USD'
      },
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : ['Requires dedication and consistency'],
      successFactors: Array.isArray(analysis.successFactors) ? analysis.successFactors : ['Clear planning', 'Regular progress tracking'],
      alternatives: Array.isArray(analysis.alternatives) ? analysis.alternatives : ['Break into smaller goals'],
      actionSteps: Array.isArray(analysis.actionSteps) ? analysis.actionSteps : [
        {
          step: 'Define specific objectives and success criteria',
          timeframe: 'Week 1',
          cost: 0,
          priority: 'high' as const
        }
      ],
      resources: Array.isArray(analysis.resources) ? analysis.resources : [
        {
          type: 'book' as const,
          name: 'Goal Setting Guide',
          description: 'Comprehensive guide to achieving your objectives',
          cost: 0
        }
      ]
    };
  }

  private getFallbackAnalysis(goalDescription: string): FeasibilityAnalysis {
    return {
      feasibilityScore: 75,
      category: 'personal',
      estimatedTimeframe: '3-6 months',
      estimatedCost: {
        min: 100,
        max: 1000,
        currency: 'USD'
      },
      redFlags: [
        'May require significant time investment',
        'Success depends on consistent effort',
        'External factors could impact timeline'
      ],
      successFactors: [
        'Clear goal definition and planning',
        'Regular progress tracking and adjustment',
        'Building supportive habits and routines'
      ],
      alternatives: [
        'Break the goal into smaller, manageable milestones',
        'Find a mentor or accountability partner',
        'Consider online courses or workshops'
      ],
      actionSteps: [
        {
          step: 'Research and gather information about your goal',
          timeframe: 'Week 1-2',
          cost: 0,
          priority: 'high'
        },
        {
          step: 'Create a detailed action plan with milestones',
          timeframe: 'Week 3',
          cost: 0,
          priority: 'high'
        },
        {
          step: 'Identify required resources and tools',
          timeframe: 'Week 3-4',
          cost: 200,
          priority: 'medium'
        }
      ],
      resources: [
        {
          type: 'book',
          name: 'Goal Achievement Handbook',
          description: 'Practical strategies for reaching your objectives',
          cost: 25
        },
        {
          type: 'tool',
          name: 'Goal Tracking App',
          description: 'Digital tool for monitoring progress',
          cost: 0
        }
      ]
    };
  }

  async generateGoalPlan(goalDescription: string, feasibilityAnalysis: FeasibilityAnalysis, userContext: UserContext): Promise<any> {
    try {
      const prompt = `
Based on the following goal and feasibility analysis, create a detailed implementation plan.

GOAL: ${goalDescription}
FEASIBILITY SCORE: ${feasibilityAnalysis.feasibilityScore}
ESTIMATED TIMEFRAME: ${feasibilityAnalysis.estimatedTimeframe}
USER CONTEXT: ${userContext.location}, ${userContext.ageRange}, interested in ${userContext.interests.join(', ')}

Create a comprehensive plan in JSON format with:
- Weekly milestones for the first month
- Monthly milestones for the duration
- Specific actionable tasks
- Success metrics
- Contingency plans

Respond ONLY with valid JSON.
`;

      const result = await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
      
      // Parse the JSON response (handle markdown code blocks)
      let cleanText = result.trim();
      if (cleanText.startsWith('```json') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanText.startsWith('```') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      return JSON.parse(cleanText);
    } catch (error) {
      logger.error('Error generating goal plan - all models failed:', error);
      return null;
    }
  }

  async chatWithAI(message: string, conversationHistory: any[], userContext: UserContext, sessionType: string = 'general'): Promise<string> {
    try {
      const contextPrompt = this.buildChatPrompt(message, conversationHistory, userContext, sessionType);
      
      const result = await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        return response.text();
      });
      
      logger.info('AI chat response generated successfully');
      
      return result;
    } catch (error: any) {
      logger.error('Error in AI chat - all models failed:', error);
      
      // Provide specific error messages based on the error type
      if (error.status === 503) {
        return "I'm experiencing high demand across all my AI models right now. Please try again in a few moments. In the meantime, you can create goals using the dashboard!";
      } else if (error.status === 429) {
        return "I've hit my rate limit on all available models. Please wait a moment before sending another message.";
      } else if (error.status === 400) {
        return "There seems to be an issue with your message format. Could you please rephrase your question?";
      } else {
        return "I'm sorry, I'm having trouble with all my AI models right now. Please try again in a moment, or use the goal creation feature on the dashboard!";
      }
    }
  }

  async *chatWithAIStreaming(message: string, conversationHistory: any[], userContext: UserContext, sessionType: string = 'general'): AsyncGenerator<string, void, unknown> {
    try {
      const contextPrompt = this.buildChatPrompt(message, conversationHistory, userContext, sessionType);
      
      const result = await this.tryWithFallback(async (model) => {
        const result = await model.generateContentStream(contextPrompt);
        return result.stream;
      });
      
      logger.info('AI chat streaming response started successfully');
      
      for await (const chunk of result) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
      
      logger.info('AI chat streaming response completed successfully');
      
    } catch (error: any) {
      logger.error('Error in AI chat streaming - all models failed:', error);
      
      // Provide specific error messages based on the error type
      if (error.status === 503) {
        yield "I'm experiencing high demand across all my AI models right now. Please try again in a few moments. In the meantime, you can create goals using the dashboard!";
      } else if (error.status === 429) {
        yield "I've hit my rate limit on all available models. Please wait a moment before sending another message.";
      } else if (error.status === 400) {
        yield "There seems to be an issue with your message format. Could you please rephrase your question?";
      } else {
        yield "I'm sorry, I'm having trouble with all my AI models right now. Please try again in a moment, or use the goal creation feature on the dashboard!";
      }
    }
  }

  private buildChatPrompt(message: string, conversationHistory: any[], userContext: UserContext, sessionType: string): string {
    const historyText = conversationHistory
      .slice(-10) // Only use last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `
You are an expert AI goal coach helping users achieve their dreams. You provide personalized, encouraging, and actionable advice.

USER CONTEXT:
- Location: ${userContext.location}
- Age Range: ${userContext.ageRange}
- Interests: ${userContext.interests.join(', ')}
- Initial Goals: ${userContext.goals}

SESSION TYPE: ${sessionType}

CONVERSATION HISTORY:
${historyText}

USER MESSAGE: ${message}

INSTRUCTIONS:
- Be encouraging, supportive, and practical
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Use the user's context to personalize your response
- Keep responses conversational but informative
- If helping with goal creation, guide them step by step
- If analyzing feasibility, be realistic but optimistic
- Include relevant resources, tips, or strategies when helpful

Respond as a helpful AI coach (keep it under 300 words):
`;
  }
}

export const aiService = new AIService();