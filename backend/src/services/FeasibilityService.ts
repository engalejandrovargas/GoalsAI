import { GoogleGenerativeAI } from '@google/generative-ai';
import { Goal, User } from '@prisma/client';
import logger from '../utils/logger';

interface FeasibilityAnalysis {
  score: number;
  redFlags: RedFlag[];
  alternatives: Alternative[];
  assessment: string;
  breakdown: {
    financial: number;
    timeline: number;
    skills: number;
    market: number;
    personal: number;
  };
}

interface RedFlag {
  title: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Alternative {
  title: string;
  description: string;
  feasibilityScore: number;
  estimatedCost: number;
  timeframe: string;
}

export class FeasibilityService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeGoal(goal: Partial<Goal>, user: User): Promise<FeasibilityAnalysis> {
    try {
      const [financial, timeline, skills, market, personal] = await Promise.all([
        this.analyzeFinancialFeasibility(goal, user),
        this.analyzeTimeFeasibility(goal, user),
        this.analyzeSkillRequirements(goal, user),
        this.analyzeMarketConditions(goal),
        this.analyzePersonalCircumstances(goal, user)
      ]);

      const breakdown = { financial, timeline, skills, market, personal };
      const overallScore = this.calculateOverallScore(breakdown);
      const redFlags = this.identifyRedFlags(breakdown, goal, user);
      const alternatives = await this.generateAlternatives(goal, breakdown);
      const assessment = this.generateAssessment(overallScore, redFlags);

      return {
        score: overallScore,
        redFlags,
        alternatives,
        assessment,
        breakdown
      };
    } catch (error) {
      logger.error('Error in feasibility analysis:', error);
      return this.getFallbackAnalysis();
    }
  }

  private async analyzeFinancialFeasibility(goal: Partial<Goal>, user: User): Promise<number> {
    const cost = goal.estimatedCost || 0;
    const income = user.annualIncome || 50000;
    const savings = user.currentSavings || 1000;
    
    const months = goal.targetDate 
      ? Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
      : 12;

    const monthlyDisposableIncome = (income * 0.3) / 12;
    const totalSavingsPotential = savings + (monthlyDisposableIncome * months);
    const savingsRatio = cost / totalSavingsPotential;

    if (savingsRatio > 2) return 5;
    if (savingsRatio > 1.5) return 15;
    if (savingsRatio > 1) return 35;
    if (savingsRatio > 0.8) return 55;
    if (savingsRatio > 0.5) return 75;
    return 95;
  }

  private async analyzeTimeFeasibility(goal: Partial<Goal>, user: User): Promise<number> {
    if (!goal.targetDate) return 70;

    const monthsToTarget = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    
    const prompt = `Analyze if this timeline is realistic:
    Goal: ${goal.title}
    Description: ${goal.description}
    Timeline: ${monthsToTarget} months
    User Age Range: ${user.ageRange}
    
    Consider typical timelines for similar goals. Rate feasibility 0-100.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      });

      const content = result.response.text() || '';
      const score = this.extractScoreFromAI(content);
      return score;
    } catch (error) {
      logger.error('AI timeline analysis failed:', error);
      return 50;
    }
  }

  private async analyzeSkillRequirements(goal: Partial<Goal>, user: User): Promise<number> {
    const prompt = `Analyze skill requirements for this goal:
    Goal: ${goal.title}
    Description: ${goal.description}
    User Situation: ${user.currentSituation || 'Not specified'}
    User Age: ${user.ageRange}
    
    Rate how feasible it is to acquire needed skills (0-100).`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      });

      const content = result.response.text() || '';
      return this.extractScoreFromAI(content);
    } catch (error) {
      return 70;
    }
  }

  private async analyzeMarketConditions(goal: Partial<Goal>): Promise<number> {
    const prompt = `Analyze current market conditions for this goal:
    Goal: ${goal.title}
    Description: ${goal.description}
    
    Consider economic factors, industry trends, competition. Rate feasibility 0-100.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      });

      const content = result.response.text() || '';
      return this.extractScoreFromAI(content);
    } catch (error) {
      return 75;
    }
  }

  private async analyzePersonalCircumstances(goal: Partial<Goal>, user: User): Promise<number> {
    const prompt = `Analyze personal circumstances for this goal:
    Goal: ${goal.title}
    Description: ${goal.description}
    User Location: ${user.location}
    User Age: ${user.ageRange}
    User Situation: ${user.currentSituation || 'Not specified'}
    
    Consider life stage, location advantages/disadvantages. Rate feasibility 0-100.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      });

      const content = result.response.text() || '';
      return this.extractScoreFromAI(content);
    } catch (error) {
      return 80;
    }
  }

  private identifyRedFlags(breakdown: any, goal: Partial<Goal>, user: User): RedFlag[] {
    const flags: RedFlag[] = [];

    if (breakdown.financial < 30) {
      flags.push({
        title: 'Budget Reality Check',
        explanation: `This goal requires more money than you can realistically save in the given timeframe. Consider extending the timeline or reducing the scope.`,
        severity: 'critical'
      });
    }

    if (goal.title?.toLowerCase().includes('professional athlete') && user.ageRange && ['36-45', '46-55', '55+'].includes(user.ageRange)) {
      flags.push({
        title: 'Age Limitation',
        explanation: 'Professional sports careers typically begin much earlier in life. Consider coaching, training, or amateur competition alternatives.',
        severity: 'critical'
      });
    }

    if (breakdown.market < 40) {
      flags.push({
        title: 'Market Conditions',
        explanation: 'Current market conditions make this goal particularly challenging. Consider waiting for better conditions or exploring alternatives.',
        severity: 'high'
      });
    }

    if (breakdown.timeline < 40) {
      flags.push({
        title: 'Timeline Concerns',
        explanation: 'The timeframe for this goal appears unrealistic. Consider extending the deadline or breaking it into smaller milestones.',
        severity: 'medium'
      });
    }

    return flags;
  }

  private async generateAlternatives(goal: Partial<Goal>, breakdown: any): Promise<Alternative[]> {
    const prompt = `Generate 3 realistic alternatives for this goal:
    
    Original Goal: ${goal.title}
    Description: ${goal.description}
    Issues: Low feasibility in areas with scores: ${JSON.stringify(breakdown)}
    
    For each alternative, provide:
    1. A more achievable version of the same goal
    2. A related goal that builds toward the original
    3. A completely different approach to the same outcome
    
    Format as JSON array with title, description, feasibilityScore, estimatedCost, timeframe.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      });

      const content = result.response.text() || '[]';
      const cleanContent = content.replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanContent);
    } catch (error) {
      logger.error('Alternative generation failed:', error);
      return [
        {
          title: 'Simplified Version',
          description: 'A more manageable version of your original goal',
          feasibilityScore: 75,
          estimatedCost: (goal.estimatedCost || 1000) * 0.5,
          timeframe: '6-12 months'
        },
        {
          title: 'Stepping Stone Goal',
          description: 'A smaller goal that builds toward your main objective',
          feasibilityScore: 85,
          estimatedCost: (goal.estimatedCost || 1000) * 0.3,
          timeframe: '3-6 months'
        }
      ];
    }
  }

  private generateAssessment(score: number, redFlags: RedFlag[]): string {
    const criticalFlags = redFlags.filter(f => f.severity === 'critical').length;
    
    if (score < 35 || criticalFlags > 0) {
      return "I need to be honest - this goal isn't realistic with your current situation. The good news is that I can help you find better paths to similar outcomes that you can actually achieve.";
    } else if (score < 60) {
      return "This goal is challenging and will require significant lifestyle changes. It's possible, but you should understand the sacrifices needed before committing to this path.";
    } else if (score < 85) {
      return "This is an ambitious but achievable goal! You'll need focus and smart planning, but it's definitely within reach with the right approach.";
    } else {
      return "Excellent news! This goal is very achievable with your current situation. I can create a straightforward plan to help you reach it efficiently.";
    }
  }

  private calculateOverallScore(breakdown: any): number {
    return Math.round(
      breakdown.financial * 0.3 +
      breakdown.timeline * 0.25 +
      breakdown.skills * 0.2 +
      breakdown.market * 0.15 +
      breakdown.personal * 0.1
    );
  }

  private extractScoreFromAI(content: string): number {
    const scoreMatch = content.match(/(\d{1,3})/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    return Math.min(100, Math.max(0, score));
  }

  private getFallbackAnalysis(): FeasibilityAnalysis {
    return {
      score: 65,
      breakdown: {
        financial: 70,
        timeline: 60,
        skills: 65,
        market: 70,
        personal: 75
      },
      redFlags: [
        {
          title: 'Analysis Unavailable',
          explanation: 'Unable to perform detailed analysis. Please ensure all goal details are provided.',
          severity: 'medium'
        }
      ],
      alternatives: [
        {
          title: 'Simplified Approach',
          description: 'Break your goal into smaller, more manageable steps',
          feasibilityScore: 80,
          estimatedCost: 500,
          timeframe: '3-6 months'
        }
      ],
      assessment: 'This goal appears moderately achievable with proper planning and commitment.'
    };
  }
}

export const feasibilityService = new FeasibilityService();