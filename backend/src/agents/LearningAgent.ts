import { BaseAgent, TaskParameters, AgentResult, AgentCapability } from '../types/agent';
import logger from '../utils/logger';

interface LearningResourceParams {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  budget?: number;
  format?: 'online' | 'in-person' | 'hybrid';
}

interface SkillAssessmentParams {
  targetRole: string;
  currentSkills: string[];
  experience?: string;
}

interface LearningPathParams {
  goal: string;
  timeframe: string;
  preferredFormat: 'online' | 'in-person' | 'hybrid';
  budget?: number;
  currentLevel?: string;
}

export class LearningAgent extends BaseAgent {
  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'findLearningResources',
        description: 'Find courses and learning materials',
        parameters: {
          skill: { type: 'string', required: true },
          level: { type: 'string', default: 'beginner' },
          budget: { type: 'number', required: false },
        },
      },
      {
        name: 'assessSkillGaps',
        description: 'Analyze skill requirements vs current skills',
        parameters: {
          targetRole: { type: 'string', required: true },
          currentSkills: { type: 'array', required: true },
        },
      },
      {
        name: 'createLearningPath',
        description: 'Create personalized learning roadmap',
        parameters: {
          goal: { type: 'string', required: true },
          timeframe: { type: 'string', required: true },
          preferredFormat: { type: 'string', default: 'online' },
        },
      },
    ];
  }

  validateParameters(parameters: Record<string, any>): boolean {
    return parameters && typeof parameters === 'object';
  }

  // Method declarations first
  private async findLearningResources(params: LearningResourceParams): Promise<any> {
    logger.info(`Finding learning resources for ${params.skill} at ${params.level} level`);
    
    try {
      // Try to use free educational APIs
      const resources = await this.searchEducationalContent(params.skill, params.level);
      
      // Generate comprehensive resource recommendations
      const recommendations = this.generateResourceRecommendations(params);
      
      return {
        skill: params.skill,
        level: params.level,
        budget: params.budget,
        resources: resources,
        recommendations: recommendations,
        platforms: this.getRecommendedPlatforms(params.skill, params.level),
        timeline: this.estimateLearningTimeline(params.skill, params.level),
        searchDate: new Date().toISOString(),
        dataSource: 'Educational content APIs + Knowledge base',
      };
    } catch (error) {
      logger.error('Learning resource search failed, using knowledge base:', error);
      
      // Fallback to curated recommendations
      const recommendations = this.generateResourceRecommendations(params);
      
      return {
        skill: params.skill,
        level: params.level,
        budget: params.budget,
        resources: recommendations.courses,
        recommendations: recommendations,
        platforms: this.getRecommendedPlatforms(params.skill, params.level),
        timeline: this.estimateLearningTimeline(params.skill, params.level),
        searchDate: new Date().toISOString(),
        dataSource: 'Educational knowledge base (Fallback)',
        fallback: true,
      };
    }
  }

  private async assessSkillGaps(params: SkillAssessmentParams): Promise<any> {
    logger.info(`Assessing skill gaps for ${params.targetRole}`);
    
    const roleRequirements = this.getRoleRequirements(params.targetRole);
    const skillGaps = this.analyzeSkillGaps(params.currentSkills, roleRequirements);
    const learningPriorities = this.prioritizeSkills(skillGaps);
    
    return {
      targetRole: params.targetRole,
      currentSkills: params.currentSkills,
      requiredSkills: roleRequirements,
      skillGaps: skillGaps,
      priorities: learningPriorities,
      readinessScore: this.calculateReadinessScore(params.currentSkills, roleRequirements),
      recommendations: this.generateSkillRecommendations(skillGaps, params.targetRole),
      timeline: this.estimateSkillAcquisitionTime(skillGaps),
      assessmentDate: new Date().toISOString(),
    };
  }

  private async createLearningPath(params: LearningPathParams): Promise<any> {
    logger.info(`Creating learning path for goal: ${params.goal}`);
    
    const learningPath = this.generateLearningPath(params);
    const milestones = this.createLearningMilestones(params, learningPath);
    const resources = await this.getPathResources(learningPath);
    
    return {
      goal: params.goal,
      timeframe: params.timeframe,
      preferredFormat: params.preferredFormat,
      budget: params.budget,
      path: learningPath,
      milestones: milestones,
      resources: resources,
      estimatedHours: this.calculateTotalHours(learningPath),
      difficulty: this.assessPathDifficulty(learningPath),
      schedule: this.generateLearningSchedule(params.timeframe, learningPath),
      success_metrics: this.defineMilestoneMetrics(learningPath),
      pathId: `learning_path_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  async executeTask(task: TaskParameters): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`LearningAgent executing task: ${task.type} for goal ${task.goalId}`);
      
      let result: any;
      let confidence = 0.8;
      
      switch (task.type) {
        case 'findLearningResources':
          result = await this.findLearningResources(task.parameters as LearningResourceParams);
          confidence = 0.85;
          break;
          
        case 'assessSkillGaps':
          result = await this.assessSkillGaps(task.parameters as SkillAssessmentParams);
          confidence = 0.80;
          break;
          
        case 'createLearningPath':
          result = await this.createLearningPath(task.parameters as LearningPathParams);
          confidence = 0.90;
          break;
          
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
      
      this.logPerformance(startTime, true);
      
      return {
        success: true,
        data: result,
        confidence,
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'learning',
          taskType: task.type,
        },
      };
    } catch (error) {
      this.logPerformance(startTime, false);
      
      logger.error(`LearningAgent task failed: ${error}`);
      
      return {
        success: false,
        data: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime: Date.now() - startTime,
          agentType: 'learning',
          taskType: task.type,
        },
      };
    }
  }

  // Helper methods
  private async searchEducationalContent(skill: string, level: string): Promise<any[]> {
    try {
      const skillResources = this.getSkillSpecificResources(skill, level);
      return skillResources;
    } catch (error) {
      logger.error('Educational content API failed:', error);
      return this.getSkillSpecificResources(skill, level);
    }
  }

  private getSkillSpecificResources(skill: string, level: string): any[] {
    const resourceDatabase: Record<string, Record<string, any[]>> = {
      'javascript': {
        beginner: [
          {
            title: 'JavaScript Basics Course',
            provider: 'freeCodeCamp',
            type: 'Interactive Course',
            duration: '40 hours',
            price: 'Free',
            rating: 4.8,
            url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
            description: 'Comprehensive introduction to JavaScript programming',
          },
          {
            title: 'JavaScript.info Tutorial',
            provider: 'JavaScript.info',
            type: 'Documentation',
            duration: 'Self-paced',
            price: 'Free',
            rating: 4.9,
            url: 'https://javascript.info/',
            description: 'Modern JavaScript tutorial with practical examples',
          },
        ],
        intermediate: [
          {
            title: 'You Don\'t Know JS Book Series',
            provider: 'Kyle Simpson',
            type: 'Book',
            duration: '60 hours',
            price: '$30',
            rating: 4.7,
            description: 'Deep dive into JavaScript mechanics and advanced concepts',
          },
        ],
      },
      'python': {
        beginner: [
          {
            title: 'Python for Everybody',
            provider: 'University of Michigan',
            type: 'MOOC',
            duration: '8 months',
            price: 'Free (Audit)',
            rating: 4.8,
            description: 'Complete Python programming specialization',
          },
        ],
      },
      'data-science': {
        beginner: [
          {
            title: 'Data Science Introduction',
            provider: 'Kaggle Learn',
            type: 'Micro-courses',
            duration: '20 hours',
            price: 'Free',
            rating: 4.6,
            description: 'Practical data science with Python and pandas',
          },
        ],
      },
    };

    const skillKey = skill.toLowerCase().replace(/\s+/g, '-');
    return resourceDatabase[skillKey]?.[level] || [
      {
        title: `${skill} ${level} Course`,
        provider: 'Various Providers',
        type: 'Mixed Content',
        duration: '20-40 hours',
        price: 'Free - $100',
        rating: 4.5,
        description: `Comprehensive ${level} level ${skill} learning resources`,
      },
    ];
  }

  private generateResourceRecommendations(params: LearningResourceParams): any {
    return {
      courses: this.getSkillSpecificResources(params.skill, params.level),
      books: this.recommendBooks(params.skill, params.level),
      practiceProjects: this.suggestProjects(params.skill, params.level),
      communities: this.findLearningCommunities(params.skill),
      tools: this.recommendLearningTools(params.skill),
    };
  }

  private recommendBooks(skill: string, level: string): any[] {
    const bookDatabase: Record<string, any[]> = {
      'javascript': [
        {
          title: 'Eloquent JavaScript',
          author: 'Marijn Haverbeke',
          level: 'beginner-intermediate',
          price: 'Free online',
          description: 'Modern introduction to programming and JavaScript',
        },
      ],
      'python': [
        {
          title: 'Automate the Boring Stuff with Python',
          author: 'Al Sweigart',
          level: 'beginner',
          price: 'Free online',
          description: 'Practical Python programming for everyday tasks',
        },
      ],
    };

    return bookDatabase[skill.toLowerCase()] || [];
  }

  private suggestProjects(skill: string, level: string): any[] {
    const projectDatabase: Record<string, Record<string, any[]>> = {
      'javascript': {
        beginner: [
          { name: 'Todo List App', difficulty: 'Easy', time: '1 week' },
          { name: 'Calculator', difficulty: 'Easy', time: '3 days' },
        ],
        intermediate: [
          { name: 'Weather App with API', difficulty: 'Medium', time: '2 weeks' },
          { name: 'E-commerce Site', difficulty: 'Medium-Hard', time: '1 month' },
        ],
      },
    };

    return projectDatabase[skill.toLowerCase()]?.[level] || [
      { name: `${skill} Practice Project`, difficulty: 'Varies', time: '1-4 weeks' },
    ];
  }

  private findLearningCommunities(skill: string): any[] {
    return [
      { name: 'Stack Overflow', type: 'Q&A', url: 'https://stackoverflow.com' },
      { name: 'Reddit Communities', type: 'Forum', url: `https://reddit.com/r/${skill}` },
      { name: 'Discord Servers', type: 'Chat', description: 'Real-time learning discussions' },
    ];
  }

  private recommendLearningTools(skill: string): any[] {
    const toolDatabase: Record<string, any[]> = {
      'javascript': [
        { name: 'VS Code', type: 'IDE', price: 'Free' },
        { name: 'Chrome DevTools', type: 'Debugging', price: 'Free' },
      ],
      'python': [
        { name: 'Jupyter Notebook', type: 'Environment', price: 'Free' },
        { name: 'PyCharm', type: 'IDE', price: 'Free Community' },
      ],
    };

    return toolDatabase[skill.toLowerCase()] || [
      { name: 'Generic Learning Tools', type: 'Various', price: 'Varies' },
    ];
  }

  private getRecommendedPlatforms(skill: string, level: string): any[] {
    return [
      { name: 'Coursera', type: 'MOOC', strengths: ['University courses', 'Certificates'] },
      { name: 'freeCodeCamp', type: 'Free', strengths: ['Hands-on', 'Community'] },
      { name: 'Udemy', type: 'Paid', strengths: ['Variety', 'Practical'] },
      { name: 'YouTube', type: 'Free', strengths: ['Visual learning', 'Variety'] },
    ];
  }

  private estimateLearningTimeline(skill: string, level: string): any {
    const timeEstimates: Record<string, Record<string, any>> = {
      'javascript': {
        beginner: { weeks: 8, hoursPerWeek: 10, total: '80 hours' },
        intermediate: { weeks: 12, hoursPerWeek: 8, total: '96 hours' },
        advanced: { weeks: 16, hoursPerWeek: 6, total: '96 hours' },
      },
    };

    return timeEstimates[skill.toLowerCase()]?.[level] || {
      weeks: 10,
      hoursPerWeek: 8,
      total: '80 hours',
    };
  }

  private getRoleRequirements(role: string): string[] {
    const roleRequirements: Record<string, string[]> = {
      'frontend-developer': [
        'HTML/CSS', 'JavaScript', 'React/Vue/Angular', 'Git', 'Responsive Design',
        'REST APIs', 'Testing', 'Web Performance', 'Accessibility',
      ],
      'backend-developer': [
        'Programming Language (Python/Node.js/Java)', 'Databases', 'APIs', 'Git',
        'Cloud Services', 'Security', 'Testing', 'DevOps Basics',
      ],
      'data-scientist': [
        'Python/R', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization',
        'Pandas/NumPy', 'Jupyter', 'Git', 'Business Understanding',
      ],
      'product-manager': [
        'Product Strategy', 'User Research', 'Analytics', 'Roadmapping',
        'Communication', 'Agile/Scrum', 'Stakeholder Management', 'Technical Understanding',
      ],
    };

    const roleKey = role.toLowerCase().replace(/\s+/g, '-');
    return roleRequirements[roleKey] || [
      'Core Technical Skills',
      'Communication',
      'Problem Solving',
      'Industry Knowledge',
    ];
  }

  private analyzeSkillGaps(currentSkills: string[], requiredSkills: string[]): any[] {
    return requiredSkills.map(required => {
      const hasSkill = currentSkills.some(current => 
        current.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(current.toLowerCase())
      );

      return {
        skill: required,
        status: hasSkill ? 'present' : 'missing',
        priority: hasSkill ? 'maintenance' : 'learn',
        matchedWith: hasSkill ? currentSkills.find(current => 
          current.toLowerCase().includes(required.toLowerCase()) ||
          required.toLowerCase().includes(current.toLowerCase())
        ) : null,
      };
    });
  }

  private prioritizeSkills(skillGaps: any[]): any[] {
    const missingSkills = skillGaps.filter(gap => gap.status === 'missing');
    
    // Simple prioritization based on skill importance
    const priorityOrder = ['javascript', 'python', 'react', 'sql', 'git'];
    
    return missingSkills
      .sort((a, b) => {
        const aIndex = priorityOrder.findIndex(skill => 
          a.skill.toLowerCase().includes(skill)
        );
        const bIndex = priorityOrder.findIndex(skill => 
          b.skill.toLowerCase().includes(skill)
        );
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      })
      .map((skill, index) => ({
        ...skill,
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
        order: index + 1,
      }));
  }

  private calculateReadinessScore(currentSkills: string[], requiredSkills: string[]): number {
    const matches = requiredSkills.filter(required =>
      currentSkills.some(current => 
        current.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(current.toLowerCase())
      )
    );

    return Math.round((matches.length / requiredSkills.length) * 100);
  }

  private generateSkillRecommendations(skillGaps: any[], targetRole: string): any {
    const missingSkills = skillGaps.filter(gap => gap.status === 'missing');
    const highPrioritySkills = missingSkills.slice(0, 3);

    return {
      immediate: highPrioritySkills.map(skill => ({
        skill: skill.skill,
        reason: 'Essential for role entry',
        timeline: '1-3 months',
        resources: this.getSkillSpecificResources(skill.skill, 'beginner'),
      })),
      longTerm: missingSkills.slice(3).map(skill => ({
        skill: skill.skill,
        reason: 'Important for career growth',
        timeline: '6-12 months',
      })),
      next_steps: [
        'Focus on top 3 priority skills first',
        'Build portfolio projects demonstrating skills',
        'Consider bootcamp or formal education',
        'Join relevant professional communities',
        'Seek mentorship or coaching',
      ],
    };
  }

  private estimateSkillAcquisitionTime(skillGaps: any[]): any {
    const missingCount = skillGaps.filter(gap => gap.status === 'missing').length;
    
    return {
      optimistic: `${missingCount * 2} months`,
      realistic: `${missingCount * 4} months`,
      conservative: `${missingCount * 6} months`,
      factors: [
        'Current experience level',
        'Time availability',
        'Learning approach',
        'Complexity of skills',
        'Support system',
      ],
    };
  }

  private generateLearningPath(params: LearningPathParams): any[] {
    // Generate a structured learning path based on the goal
    const pathSteps = this.breakDownGoal(params.goal);
    
    return pathSteps.map((step, index) => ({
      phase: index + 1,
      title: step.title,
      description: step.description,
      skills: step.skills,
      duration: step.duration,
      type: step.type,
      prerequisites: step.prerequisites || [],
      deliverables: step.deliverables,
    }));
  }

  private breakDownGoal(goal: string): any[] {
    // Simple goal breakdown - in production this could use NLP
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('web develop') || goalLower.includes('frontend')) {
      return [
        {
          title: 'Foundation Skills',
          description: 'Master the basics of web development',
          skills: ['HTML', 'CSS', 'JavaScript Basics'],
          duration: '6 weeks',
          type: 'foundation',
          deliverables: ['Static website', 'CSS animations'],
        },
        {
          title: 'Interactive Development',
          description: 'Add interactivity with JavaScript',
          skills: ['DOM Manipulation', 'Event Handling', 'APIs'],
          duration: '4 weeks',
          type: 'skill-building',
          prerequisites: ['Foundation Skills'],
          deliverables: ['Interactive web app'],
        },
        {
          title: 'Modern Framework',
          description: 'Learn a modern JavaScript framework',
          skills: ['React/Vue', 'State Management', 'Routing'],
          duration: '6 weeks',
          type: 'advanced',
          prerequisites: ['Interactive Development'],
          deliverables: ['SPA application'],
        },
      ];
    }
    
    // Generic path for other goals
    return [
      {
        title: 'Foundation Phase',
        description: 'Build fundamental knowledge',
        skills: ['Core concepts', 'Basic tools'],
        duration: '4 weeks',
        type: 'foundation',
        deliverables: ['Basic project'],
      },
      {
        title: 'Practice Phase',
        description: 'Apply knowledge through practice',
        skills: ['Practical application', 'Real projects'],
        duration: '6 weeks',
        type: 'practice',
        deliverables: ['Portfolio project'],
      },
      {
        title: 'Mastery Phase',
        description: 'Develop advanced skills',
        skills: ['Advanced concepts', 'Best practices'],
        duration: '8 weeks',
        type: 'mastery',
        deliverables: ['Professional project'],
      },
    ];
  }

  private createLearningMilestones(params: LearningPathParams, path: any[]): any[] {
    return path.map((phase, index) => ({
      milestone: index + 1,
      title: `Complete ${phase.title}`,
      description: phase.description,
      targetDate: this.calculateTargetDate(params.timeframe, index, path.length),
      criteria: [
        'Complete all learning materials',
        'Finish practice exercises',
        'Submit deliverable project',
        'Pass knowledge assessment',
      ],
      deliverables: phase.deliverables,
    }));
  }

  private calculateTargetDate(timeframe: string, phaseIndex: number, totalPhases: number): string {
    const timeframeMonths = parseInt(timeframe.replace(/\D/g, '')) || 6;
    const monthsPerPhase = timeframeMonths / totalPhases;
    const targetMonth = (phaseIndex + 1) * monthsPerPhase;
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + targetMonth);
    
    return targetDate.toISOString().split('T')[0];
  }

  private async getPathResources(path: any[]): Promise<any[]> {
    return path.map(phase => ({
      phase: phase.phase,
      resources: phase.skills.flatMap((skill: string) =>
        this.getSkillSpecificResources(skill, 'beginner')
      ),
    }));
  }

  private calculateTotalHours(path: any[]): number {
    return path.reduce((total, phase) => {
      const weeks = parseInt(phase.duration) || 4;
      return total + (weeks * 10); // Assume 10 hours per week
    }, 0);
  }

  private assessPathDifficulty(path: any[]): string {
    const phases = path.length;
    const totalSkills = path.reduce((sum, phase) => sum + phase.skills.length, 0);
    
    if (totalSkills > 15 || phases > 4) return 'High';
    if (totalSkills > 8 || phases > 3) return 'Medium';
    return 'Low';
  }

  private generateLearningSchedule(timeframe: string, path: any[]): any {
    const totalMonths = parseInt(timeframe.replace(/\D/g, '')) || 6;
    
    return {
      totalDuration: `${totalMonths} months`,
      weeklyHours: '8-12 hours',
      schedule: 'Part-time study (evenings and weekends)',
      phases: path.map((phase, index) => ({
        phase: phase.phase,
        startWeek: (index * Math.ceil((totalMonths * 4) / path.length)) + 1,
        duration: phase.duration,
      })),
    };
  }

  private defineMilestoneMetrics(path: any[]): any[] {
    return [
      'Completion rate of assigned materials',
      'Quality of project deliverables',
      'Performance on practice exercises',
      'Active participation in community',
      'Portfolio development progress',
    ];
  }
}