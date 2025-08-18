import { PrismaClient } from '@prisma/client';
import { BaseAgent, TaskParameters, AgentResult, AgentCapability, MonitoringParams } from '../types/agent';
import { EncryptionService } from '../utils/encryption';
import logger from '../utils/logger';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private taskQueue: Map<string, TaskParameters[]> = new Map();
  private prisma: PrismaClient;
  private encryptionService: EncryptionService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.encryptionService = new EncryptionService();
    this.initializeAgents();
  }

  private async initializeAgents(): Promise<void> {
    try {
      const agents = await this.prisma.agent.findMany({
        where: { isActive: true },
        include: {
          apiKeys: true,
        },
      });

      for (const agentData of agents) {
        await this.loadAgent(agentData);
      }

      logger.info(`Initialized ${agents.length} agents`);
    } catch (error) {
      logger.error('Failed to initialize agents:', error);
    }
  }

  private async loadAgent(agentData: any): Promise<void> {
    try {
      // Dynamic agent loading based on type
      let AgentClass;
      
      switch (agentData.type) {
        case 'travel':
          const { TravelAgent } = await import('../agents/TravelAgent');
          AgentClass = TravelAgent;
          break;
        case 'financial':
          const { FinancialAgent } = await import('../agents/FinancialAgent');
          AgentClass = FinancialAgent;
          break;
        case 'research':
          const { ResearchAgent } = await import('../agents/ResearchAgent');
          AgentClass = ResearchAgent;
          break;
        case 'learning':
          const { LearningAgent } = await import('../agents/LearningAgent');
          AgentClass = LearningAgent;
          break;
        default:
          logger.warn(`Unknown agent type: ${agentData.type}`);
          return;
      }

      const agent = new AgentClass({
        id: agentData.id,
        name: agentData.name,
        type: agentData.type,
        description: agentData.description,
        capabilities: JSON.parse(agentData.capabilities),
        isActive: agentData.isActive,
        version: agentData.version,
      });

      // Load API credentials
      for (const apiKey of agentData.apiKeys) {
        if (apiKey.isActive) {
          const decryptedValue = this.encryptionService.decrypt(apiKey.encryptedValue);
          agent.setApiCredentials(apiKey.provider, {
            provider: apiKey.provider,
            keyName: apiKey.keyName,
            value: decryptedValue,
            expiresAt: apiKey.expiresAt || undefined,
            monthlyLimit: apiKey.monthlyLimit || undefined,
          });
        }
      }

      this.agents.set(agent.getId(), agent);
      this.taskQueue.set(agent.getId(), []);

      logger.info(`Loaded agent: ${agent.getName()} (${agent.getType()})`);
    } catch (error) {
      logger.error(`Failed to load agent ${agentData.name}:`, error);
    }
  }

  async registerAgent(
    name: string,
    type: string,
    description: string,
    capabilities: AgentCapability[]
  ): Promise<string> {
    try {
      const agent = await this.prisma.agent.create({
        data: {
          name,
          type,
          description,
          capabilities: JSON.stringify(capabilities),
          isActive: true,
          version: '1.0.0',
        },
      });

      logger.info(`Registered new agent: ${name} (${type})`);
      return agent.id;
    } catch (error) {
      logger.error('Failed to register agent:', error);
      throw error;
    }
  }

  async assignAgentsToGoal(goalId: string, agentTypes: string[]): Promise<string[]> {
    try {
      const assignedAgents: string[] = [];
      
      for (const agentType of agentTypes) {
        const availableAgents = Array.from(this.agents.values())
          .filter(agent => agent.getType() === agentType && agent.isActive());
        
        if (availableAgents.length > 0) {
          // For now, pick the first available agent of each type
          // TODO: Implement load balancing and performance-based selection
          const selectedAgent = availableAgents[0];
          assignedAgents.push(selectedAgent.getId());
          
          logger.info(`Assigned ${selectedAgent.getName()} to goal ${goalId}`);
        } else {
          logger.warn(`No available agents found for type: ${agentType}`);
        }
      }

      // Update goal with assigned agents
      await this.prisma.goal.update({
        where: { id: goalId },
        data: {
          assignedAgents: JSON.stringify(assignedAgents),
          lastAgentUpdate: new Date(),
        },
      });

      return assignedAgents;
    } catch (error) {
      logger.error('Failed to assign agents to goal:', error);
      throw error;
    }
  }

  async executeTask(taskParams: TaskParameters): Promise<AgentResult> {
    try {
      // Find appropriate agent for the task
      const agent = await this.selectAgentForTask(taskParams);
      if (!agent) {
        throw new Error(`No suitable agent found for task type: ${taskParams.type}`);
      }

      logger.info(`Executing task ${taskParams.type} with agent ${agent.getName()}`);

      // Execute the task directly without database storage for now
      const startTime = Date.now();
      let result: AgentResult;

      try {
        result = await agent.executeTask(taskParams);
        
        // Update agent performance metrics
        await this.updateAgentMetrics(agent.getId(), Date.now() - startTime, true);
        
        logger.info(`Task ${taskParams.type} completed successfully`);
      } catch (error) {
        result = {
          success: false,
          data: null,
          confidence: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        // Update agent performance metrics
        await this.updateAgentMetrics(agent.getId(), Date.now() - startTime, false);
        
        logger.error(`Task ${taskParams.type} failed:`, error);
      }

      return result;
    } catch (error) {
      logger.error('Failed to execute task:', error);
      throw error;
    }
  }

  private async selectAgentForTask(taskParams: TaskParameters): Promise<BaseAgent | null> {
    // Simple selection: find first available agent that can handle the task type
    // TODO: Implement sophisticated selection based on:
    // - Agent performance history
    // - Current load
    // - Specific capabilities match
    // - Cost optimization
    
    // For now, match agent by task type
    const agentType = this.getAgentTypeForTask(taskParams.type);
    
    for (const agent of this.agents.values()) {
      if (agent.isActive() && agent.getType() === agentType) {
        return agent;
      }
    }
    
    return null;
  }
  
  private getAgentTypeForTask(taskType: string): string {
    // Map task types to agent types
    const taskToAgentMap: Record<string, string> = {
      'searchFlights': 'travel',
      'searchHotels': 'travel',
      'checkVisaRequirements': 'travel',
      'calculateTravelBudget': 'travel',
      'convertCurrency': 'financial',
      'calculateSavingsPlan': 'financial',
      'analyzeInvestmentOptions': 'financial',
      'budgetOptimization': 'financial',
      'conductMarketResearch': 'research',
      'marketResearch': 'research',
      'competitiveAnalysis': 'research',
      'trendAnalysis': 'research',
      'feasibilityStudy': 'research',
      'findCourses': 'learning',
      'createLearningPath': 'learning',
      'assessSkillGap': 'learning',
      'findCertifications': 'learning',
    };
    
    return taskToAgentMap[taskType] || 'research'; // Default to research agent
  }

  private canHandleTask(agent: BaseAgent, taskParams: TaskParameters): boolean {
    const capabilities = agent.getCapabilities();
    return capabilities.some(cap => cap.name === taskParams.type);
  }

  private async updateAgentMetrics(
    agentId: string,
    responseTime: number,
    success: boolean
  ): Promise<void> {
    try {
      const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent) return;

      const newTotalExecutions = agent.totalExecutions + 1;
      const newAverageResponseTime = Math.round(
        (agent.averageResponseTime * agent.totalExecutions + responseTime) / newTotalExecutions
      );
      const newSuccessRate = success
        ? (agent.successRate * agent.totalExecutions + 1) / newTotalExecutions
        : (agent.successRate * agent.totalExecutions) / newTotalExecutions;

      await this.prisma.agent.update({
        where: { id: agentId },
        data: {
          totalExecutions: newTotalExecutions,
          averageResponseTime: newAverageResponseTime,
          successRate: newSuccessRate,
          lastExecuted: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to update agent metrics:', error);
    }
  }

  async setupMonitoring(monitorParams: MonitoringParams): Promise<string> {
    try {
      const monitor = await this.prisma.agentMonitor.create({
        data: {
          goalId: monitorParams.goalId,
          agentId: monitorParams.agentId,
          monitorType: monitorParams.monitorType,
          parameters: JSON.stringify(monitorParams.parameters),
          frequency: monitorParams.frequency,
          threshold: monitorParams.threshold,
          thresholdType: monitorParams.thresholdType,
          isActive: true,
        },
      });

      logger.info(`Setup monitoring ${monitor.id} for goal ${monitorParams.goalId}`);
      return monitor.id;
    } catch (error) {
      logger.error('Failed to setup monitoring:', error);
      throw error;
    }
  }

  async getAgentStatus(agentId: string): Promise<any> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          tasks: {
            where: {
              status: { in: ['pending', 'running'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      return {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        isActive: agent.isActive,
        performance: {
          successRate: agent.successRate,
          averageResponseTime: agent.averageResponseTime,
          totalExecutions: agent.totalExecutions,
          lastExecuted: agent.lastExecuted,
        },
        activeTasks: agent.tasks.length,
        recentTasks: agent.tasks,
      };
    } catch (error) {
      logger.error('Failed to get agent status:', error);
      throw error;
    }
  }

  async getAllAgents(): Promise<any[]> {
    try {
      const agents = await this.prisma.agent.findMany({
        include: {
          tasks: {
            where: { status: { in: ['pending', 'running'] } },
          },
        },
      });

      return agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        description: agent.description,
        isActive: agent.isActive,
        version: agent.version,
        capabilities: JSON.parse(agent.capabilities),
        performance: {
          successRate: agent.successRate,
          averageResponseTime: agent.averageResponseTime,
          totalExecutions: agent.totalExecutions,
          lastExecuted: agent.lastExecuted,
        },
        activeTasks: agent.tasks.length,
      }));
    } catch (error) {
      logger.error('Failed to get all agents:', error);
      throw error;
    }
  }

  async addApiCredentials(
    agentId: string,
    provider: string,
    keyName: string,
    value: string,
    expiresAt?: Date,
    monthlyLimit?: number
  ): Promise<void> {
    try {
      const encryptedValue = this.encryptionService.encrypt(value);
      
      await this.prisma.agentApiKey.create({
        data: {
          agentId,
          provider,
          keyName,
          encryptedValue,
          expiresAt,
          monthlyLimit,
          isActive: true,
        },
      });

      // Update the in-memory agent if it's loaded
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.setApiCredentials(provider, {
          provider,
          keyName,
          value,
          expiresAt,
          monthlyLimit,
        });
      }

      logger.info(`Added API credentials for agent ${agentId}, provider ${provider}`);
    } catch (error) {
      logger.error('Failed to add API credentials:', error);
      throw error;
    }
  }
}