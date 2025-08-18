export interface AgentCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  data: any;
  confidence: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface TaskParameters {
  goalId: string;
  userId: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  parameters: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agentId: string;
  goalId: string;
  taskType: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  result?: AgentResult;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface MonitoringParams {
  goalId: string;
  agentId: string;
  monitorType: string;
  parameters: Record<string, any>;
  frequency: 'hourly' | 'daily' | 'weekly';
  threshold?: number;
  thresholdType?: 'above' | 'below' | 'change_percent';
}

export interface AgentApiCredentials {
  provider: string;
  keyName: string;
  value: string;
  expiresAt?: Date;
  monthlyLimit?: number;
}

export interface AgentPerformanceMetrics {
  successRate: number;
  averageResponseTime: number;
  totalExecutions: number;
  lastExecuted?: Date;
}

export interface BaseAgentConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: AgentCapability[];
  isActive: boolean;
  version: string;
}

export abstract class BaseAgent {
  protected config: BaseAgentConfig;
  protected apiCredentials: Map<string, AgentApiCredentials>;

  constructor(config: BaseAgentConfig) {
    this.config = config;
    this.apiCredentials = new Map();
  }

  abstract executeTask(task: TaskParameters): Promise<AgentResult>;
  abstract validateParameters(parameters: Record<string, any>): boolean;
  abstract getCapabilities(): AgentCapability[];

  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getType(): string {
    return this.config.type;
  }

  getDescription(): string {
    return this.config.description;
  }

  isActive(): boolean {
    return this.config.isActive;
  }

  setApiCredentials(provider: string, credentials: AgentApiCredentials): void {
    this.apiCredentials.set(provider, credentials);
  }

  getApiCredentials(provider: string): AgentApiCredentials | undefined {
    return this.apiCredentials.get(provider);
  }

  protected async makeApiCall(
    provider: string,
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const credentials = this.apiCredentials.get(provider);
    if (!credentials) {
      throw new Error(`No API credentials found for provider: ${provider}`);
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${credentials.value}`,
    };

    return fetch(endpoint, { ...options, headers });
  }

  protected logPerformance(startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;
    // Log to monitoring system
    console.log(`Agent ${this.getName()} task completed in ${duration}ms, success: ${success}`);
  }
}