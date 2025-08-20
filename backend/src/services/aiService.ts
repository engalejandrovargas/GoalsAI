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
  interests?: string[];
  goals?: string;
  currentSituation?: string | null;
  availableTime?: string | null;
  riskTolerance?: string | null;
  preferredApproach?: string | null;
  firstGoal?: string | null;
  
  // Extended context for enhanced AI behavior
  occupation?: string | null;
  annualIncome?: number | null;
  currentSavings?: number | null;
  workSchedule?: string | null;
  personalityType?: string | null;
  learningStyle?: string | null;
  decisionMakingStyle?: string | null;
  communicationStyle?: string | null;
  motivationalFactors?: string[] | null;
  lifePriorities?: string[] | null;
  previousExperiences?: string[] | null;
  skillsAndStrengths?: string[] | null;
  
  // AI behavior preferences
  aiInstructions?: string | null;
  aiTone?: string;
  aiDetailLevel?: string;
  aiApproachStyle?: string;
}

interface GoalComplexitySettings {
  timeHorizon: 'short' | 'medium' | 'long' | 'very_long'; // <3mo, 3-12mo, 1-3yr, >3yr
  financialComplexity: 'minimal' | 'moderate' | 'significant' | 'major'; // <$500, $500-5k, $5k-25k, >$25k
  skillRequirement: 'basic' | 'intermediate' | 'advanced' | 'expert';
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  supportNeeded: 'self_directed' | 'minimal_guidance' | 'regular_support' | 'intensive_coaching';
  domainSpecific: boolean; // Whether goal requires domain-specific expertise
}

export class AIService {
  // Fallback model chain - ordered by preference (best to fallback)
  private modelFallbackChain = [
    'gemini-1.5-flash',           // Most reliable current model
    'gemini-1.5-pro',             // Alternative stable model 
    'gemini-pro'                  // Legacy fallback
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
      // Check if API key is configured
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        logger.warn('Google Gemini API key not configured, using fallback analysis');
        return this.getFallbackAnalysis(goalDescription);
      }

      const prompt = this.buildFeasibilityPrompt(goalDescription, userContext);
      logger.info(`Starting AI analysis for goal: "${goalDescription.substring(0, 50)}..."`);
      
      const result = await this.tryWithFallback(async (model) => {
        logger.info('Sending request to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        logger.info(`Received AI response of length: ${text.length}`);
        return text;
      });
      
      logger.info('Gemini AI response received successfully');
      
      // Parse the JSON response from Gemini (handle markdown code blocks)
      let cleanText = result.trim();
      if (cleanText.startsWith('```json') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanText.startsWith('```') && cleanText.endsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      logger.info('Attempting to parse AI response as JSON...');
      const analysis = JSON.parse(cleanText);
      logger.info('AI response parsed successfully');
      
      // Validate and ensure all required fields are present
      return this.validateAnalysis(analysis);
      
    } catch (error: any) {
      logger.error('Error in AI feasibility analysis - all models failed:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        stack: error.stack
      });
      
      // Return a fallback analysis if all AI models fail
      logger.info('Returning fallback analysis due to AI failure');
      return this.getFallbackAnalysis(goalDescription);
    }
  }

  private buildFeasibilityPrompt(goalDescription: string, userContext: UserContext): string {
    const extendedContext = this.buildExtendedContextString(userContext);
    const complexitySettings = this.analyzeGoalComplexity(goalDescription, userContext);
    const personalizedInstructions = this.buildPersonalizedInstructions(userContext, complexitySettings);

    return `
You are an expert life coach and goal achievement analyst with deep expertise across multiple domains. Analyze the feasibility of the following goal and provide a comprehensive, personalized assessment.

USER CONTEXT:
- Location: ${userContext.location}
- Age Range: ${userContext.ageRange}
- Interests: ${userContext.interests?.join(', ') || 'Not specified'}
- Current Situation: ${userContext.currentSituation || 'Not specified'}
- Available Time: ${userContext.availableTime || 'Not specified'}
- Risk Tolerance: ${userContext.riskTolerance || 'Not specified'}
${extendedContext}

GOAL: ${goalDescription}

COMPLEXITY ANALYSIS:
- Time Horizon: ${complexitySettings.timeHorizon}
- Financial Complexity: ${complexitySettings.financialComplexity}
- Skill Requirement: ${complexitySettings.skillRequirement}
- Risk Level: ${complexitySettings.riskLevel}
- Support Needed: ${complexitySettings.supportNeeded}
- Domain Specific: ${complexitySettings.domainSpecific}

PERSONALIZED INSTRUCTIONS:
${personalizedInstructions}

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

Consider the user's complete profile, their unique circumstances, financial situation, learning style, and personality type. Tailor your analysis to their complexity requirements and provide actionable, personalized recommendations. Be realistic but encouraging, adapting your communication style to their preferences.
`;
  }

  private buildExtendedContextString(userContext: UserContext): string {
    let context = '';
    
    if (userContext.occupation) {
      context += `- Occupation: ${userContext.occupation}\n`;
    }
    if (userContext.annualIncome) {
      context += `- Annual Income: $${userContext.annualIncome.toLocaleString()}\n`;
    }
    if (userContext.currentSavings) {
      context += `- Current Savings: $${userContext.currentSavings.toLocaleString()}\n`;
    }
    if (userContext.workSchedule) {
      context += `- Work Schedule: ${userContext.workSchedule}\n`;
    }
    if (userContext.personalityType) {
      context += `- Personality Type: ${userContext.personalityType}\n`;
    }
    if (userContext.learningStyle) {
      context += `- Learning Style: ${userContext.learningStyle}\n`;
    }
    if (userContext.decisionMakingStyle) {
      context += `- Decision Making Style: ${userContext.decisionMakingStyle}\n`;
    }
    if (userContext.communicationStyle) {
      context += `- Communication Style: ${userContext.communicationStyle}\n`;
    }
    if (userContext.motivationalFactors?.length) {
      context += `- Motivational Factors: ${userContext.motivationalFactors.join(', ')}\n`;
    }
    if (userContext.lifePriorities?.length) {
      context += `- Life Priorities: ${userContext.lifePriorities.join(', ')}\n`;
    }
    if (userContext.previousExperiences?.length) {
      context += `- Previous Experiences: ${userContext.previousExperiences.join(', ')}\n`;
    }
    if (userContext.skillsAndStrengths?.length) {
      context += `- Skills & Strengths: ${userContext.skillsAndStrengths.join(', ')}\n`;
    }
    
    return context;
  }

  private analyzeGoalComplexity(goalDescription: string, userContext: UserContext): GoalComplexitySettings {
    const goal = goalDescription.toLowerCase();
    
    // Analyze time horizon based on keywords and user context
    let timeHorizon: GoalComplexitySettings['timeHorizon'] = 'medium';
    if (goal.includes('week') || goal.includes('month') || goal.includes('quick')) {
      timeHorizon = 'short';
    } else if (goal.includes('year') || goal.includes('long term') || goal.includes('career') || goal.includes('degree')) {
      timeHorizon = 'long';
    } else if (goal.includes('decade') || goal.includes('retirement') || goal.includes('legacy')) {
      timeHorizon = 'very_long';
    }

    // Analyze financial complexity
    let financialComplexity: GoalComplexitySettings['financialComplexity'] = 'moderate';
    if (goal.includes('free') || goal.includes('low cost') || goal.includes('budget')) {
      financialComplexity = 'minimal';
    } else if (goal.includes('house') || goal.includes('business') || goal.includes('invest') || goal.includes('$')) {
      financialComplexity = 'significant';
    } else if (goal.includes('company') || goal.includes('empire') || goal.includes('million')) {
      financialComplexity = 'major';
    }

    // Analyze skill requirements
    let skillRequirement: GoalComplexitySettings['skillRequirement'] = 'intermediate';
    if (goal.includes('learn') || goal.includes('beginner') || goal.includes('start')) {
      skillRequirement = 'basic';
    } else if (goal.includes('master') || goal.includes('expert') || goal.includes('professional') || goal.includes('advanced')) {
      skillRequirement = 'advanced';
    } else if (goal.includes('world class') || goal.includes('elite') || goal.includes('pioneer')) {
      skillRequirement = 'expert';
    }

    // Analyze risk level based on goal type and user risk tolerance
    let riskLevel: GoalComplexitySettings['riskLevel'] = 'moderate';
    if (userContext.riskTolerance === 'low' || goal.includes('safe') || goal.includes('secure')) {
      riskLevel = 'low';
    } else if (userContext.riskTolerance === 'high' || goal.includes('startup') || goal.includes('venture') || goal.includes('gamble')) {
      riskLevel = 'high';
    }

    // Determine support needed based on complexity and user preferences
    let supportNeeded: GoalComplexitySettings['supportNeeded'] = 'minimal_guidance';
    if (userContext.preferredApproach === 'independent' || skillRequirement === 'basic') {
      supportNeeded = 'self_directed';
    } else if (skillRequirement === 'expert' || financialComplexity === 'major') {
      supportNeeded = 'intensive_coaching';
    } else if (timeHorizon === 'long' || timeHorizon === 'very_long') {
      supportNeeded = 'regular_support';
    }

    // Check if domain-specific expertise is needed
    const domainSpecific = goal.includes('medical') || goal.includes('legal') || goal.includes('technical') || 
                          goal.includes('scientific') || goal.includes('engineering') || goal.includes('finance');

    return {
      timeHorizon,
      financialComplexity,
      skillRequirement,
      riskLevel,
      supportNeeded,
      domainSpecific
    };
  }

  private buildPersonalizedInstructions(userContext: UserContext, complexity: GoalComplexitySettings): string {
    let instructions = [];

    // Add AI tone and style preferences
    if (userContext.aiTone) {
      switch (userContext.aiTone) {
        case 'motivational':
          instructions.push('Use an inspiring, energetic tone that emphasizes possibilities and builds confidence.');
          break;
        case 'formal':
          instructions.push('Maintain a professional, structured approach with clear frameworks and methodologies.');
          break;
        case 'casual':
          instructions.push('Use a friendly, conversational tone that feels approachable and relatable.');
          break;
        default:
          instructions.push('Balance professionalism with warmth, being both informative and encouraging.');
      }
    }

    // Add detail level preferences
    if (userContext.aiDetailLevel) {
      switch (userContext.aiDetailLevel) {
        case 'brief':
          instructions.push('Keep responses concise and focus on the most essential information.');
          break;
        case 'detailed':
          instructions.push('Provide comprehensive analysis with thorough explanations and multiple options.');
          break;
        default:
          instructions.push('Provide balanced detail - enough to be useful without overwhelming.');
      }
    }

    // Add approach style preferences
    if (userContext.aiApproachStyle) {
      switch (userContext.aiApproachStyle) {
        case 'structured':
          instructions.push('Present information in clear, logical frameworks with step-by-step processes.');
          break;
        case 'creative':
          instructions.push('Think outside the box and suggest innovative, unconventional approaches.');
          break;
        default:
          instructions.push('Adapt your approach based on the specific goal and user needs.');
      }
    }

    // Add learning style considerations
    if (userContext.learningStyle) {
      switch (userContext.learningStyle) {
        case 'visual':
          instructions.push('Suggest visual learning resources and emphasize charts, diagrams, and visual planning tools.');
          break;
        case 'auditory':
          instructions.push('Recommend podcasts, audiobooks, and discussion-based learning opportunities.');
          break;
        case 'kinesthetic':
          instructions.push('Focus on hands-on activities, practical exercises, and experiential learning.');
          break;
        case 'reading':
          instructions.push('Prioritize books, articles, and written resources for learning and development.');
          break;
      }
    }

    // Add personality-based recommendations
    if (userContext.personalityType) {
      if (userContext.personalityType.includes('introvert')) {
        instructions.push('Consider solitary activities and self-paced learning options.');
      } else if (userContext.personalityType.includes('extrovert')) {
        instructions.push('Emphasize group activities, networking, and collaborative approaches.');
      }
    }

    // Add complexity-based instructions
    if (complexity.supportNeeded === 'intensive_coaching') {
      instructions.push('Strongly recommend professional guidance and mentorship throughout the journey.');
    } else if (complexity.supportNeeded === 'self_directed') {
      instructions.push('Focus on self-study resources and independent learning paths.');
    }

    if (complexity.domainSpecific) {
      instructions.push('Identify domain experts and specialized resources for technical aspects.');
    }

    // Add financial considerations
    if (userContext.annualIncome && userContext.currentSavings) {
      const financialRatio = userContext.currentSavings / userContext.annualIncome;
      if (financialRatio < 0.1) {
        instructions.push('Be particularly mindful of budget constraints and suggest low-cost alternatives.');
      } else if (financialRatio > 0.5) {
        instructions.push('User has good financial flexibility - can suggest premium options when valuable.');
      }
    }

    // Add custom AI instructions if provided
    if (userContext.aiInstructions) {
      instructions.push(`CUSTOM INSTRUCTIONS: ${userContext.aiInstructions}`);
    }

    return instructions.join('\n');
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
USER CONTEXT: ${userContext.location}, ${userContext.ageRange}, interested in ${userContext.interests?.join(', ') || 'Not specified'}

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

    const extendedContext = this.buildExtendedContextString(userContext);
    const personalizedInstructions = this.buildChatPersonalizedInstructions(userContext);

    return `
You are an expert AI goal coach with deep expertise across multiple life domains. You help users achieve their dreams through personalized, encouraging, and actionable advice tailored to their unique circumstances.

USER CONTEXT:
- Location: ${userContext.location}
- Age Range: ${userContext.ageRange}
- Interests: ${userContext.interests?.join(', ') || 'Not specified'}
- Current Situation: ${userContext.currentSituation || 'Not specified'}
- Available Time: ${userContext.availableTime || 'Not specified'}
- Risk Tolerance: ${userContext.riskTolerance || 'Not specified'}
- Initial Goals: ${userContext.goals}
${extendedContext}

SESSION TYPE: ${sessionType}

CONVERSATION HISTORY:
${historyText}

USER MESSAGE: ${message}

PERSONALIZED COACHING STYLE:
${personalizedInstructions}

INSTRUCTIONS:
- Be encouraging, supportive, and practical
- Ask clarifying questions when needed to understand their specific situation
- Provide specific, actionable advice tailored to their profile
- Use their context, personality, and preferences to personalize responses
- Consider their financial situation, learning style, and life priorities
- Adapt your communication style to their preferences (tone, detail level, approach)
- If helping with goal creation, guide them step by step based on their complexity needs
- If analyzing feasibility, be realistic but optimistic, considering their risk tolerance
- Include relevant resources that match their learning style and budget
- Reference their skills, experiences, and motivational factors when applicable

Respond as their personalized AI coach (keep it under 400 words for detailed responses, 200 for brief):
`;
  }

  private buildChatPersonalizedInstructions(userContext: UserContext): string {
    let instructions = [];

    // Communication style adaptation
    if (userContext.aiTone === 'motivational') {
      instructions.push('Use an inspiring, energetic tone that builds confidence and enthusiasm.');
    } else if (userContext.aiTone === 'formal') {
      instructions.push('Maintain a professional, structured communication style.');
    } else if (userContext.aiTone === 'casual') {
      instructions.push('Use a friendly, conversational tone that feels natural and approachable.');
    }

    // Detail level preferences
    if (userContext.aiDetailLevel === 'brief') {
      instructions.push('Keep responses concise and focus on key actionable points.');
    } else if (userContext.aiDetailLevel === 'detailed') {
      instructions.push('Provide comprehensive guidance with thorough explanations and examples.');
    }

    // Approach style
    if (userContext.aiApproachStyle === 'structured') {
      instructions.push('Present advice in clear, logical frameworks with numbered steps.');
    } else if (userContext.aiApproachStyle === 'creative') {
      instructions.push('Suggest innovative, unconventional approaches and thinking outside the box.');
    }

    // Learning style considerations
    if (userContext.learningStyle === 'visual') {
      instructions.push('Suggest visual tools, diagrams, and recommend creating visual plans or mood boards.');
    } else if (userContext.learningStyle === 'auditory') {
      instructions.push('Recommend podcasts, audiobooks, and verbal discussion strategies.');
    } else if (userContext.learningStyle === 'kinesthetic') {
      instructions.push('Focus on hands-on activities and practical, experiential approaches.');
    }

    // Motivational factors integration
    if (userContext.motivationalFactors?.length) {
      instructions.push(`Connect advice to their key motivators: ${userContext.motivationalFactors.join(', ')}.`);
    }

    // Custom instructions
    if (userContext.aiInstructions) {
      instructions.push(`Follow these custom preferences: ${userContext.aiInstructions}`);
    }

    return instructions.length > 0 ? instructions.join('\n') : 'Provide balanced, helpful guidance adapted to their needs.';
  }
}

export const aiService = new AIService();