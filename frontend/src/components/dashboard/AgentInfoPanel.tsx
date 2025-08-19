import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Server,
  Globe,
  ChevronDown,
  ChevronRight,
  Info,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface AgentInfo {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  lastActivity: string;
  tasksCompleted: number;
  successRate: number;
  currentTask?: string;
  description: string;
}

interface ApiUsage {
  provider: string;
  service: string;
  endpoint: string;
  callsCount: number;
  lastUsed: string;
  cost?: number;
  responseTime: number;
  status: 'success' | 'error' | 'rate_limited';
}

interface Recommendation {
  id: string;
  agentId: string;
  type: 'suggestion' | 'warning' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
  actionable?: boolean;
}

interface AgentInfoPanelProps {
  goalId: string;
  assignedAgents: string[];
  showApiUsage?: boolean;
  showAgentStatus?: boolean;
  showRecommendations?: boolean;
  onRefreshAgents?: () => void;
}

const AgentInfoPanel: React.FC<AgentInfoPanelProps> = ({
  goalId,
  assignedAgents,
  showApiUsage = true,
  showAgentStatus = true,
  showRecommendations = true,
  onRefreshAgents,
}) => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadAgentData = async () => {
      setLoading(true);
      
      // Mock agents data based on assignedAgents
      const mockAgents: AgentInfo[] = assignedAgents.map((agentType, index) => ({
        id: `agent-${agentType}-${index}`,
        name: `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`,
        type: agentType,
        status: ['active', 'idle', 'active'][index % 3] as any,
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        tasksCompleted: Math.floor(Math.random() * 50) + 10,
        successRate: 85 + Math.random() * 15,
        currentTask: Math.random() > 0.5 ? `Processing ${agentType} data for goal` : undefined,
        description: `Specialized agent for ${agentType} related tasks and analysis`,
      }));

      // Mock API usage data
      const mockApiUsage: ApiUsage[] = [
        {
          provider: 'OpenAI',
          service: 'GPT-4',
          endpoint: '/chat/completions',
          callsCount: 23,
          lastUsed: new Date(Date.now() - 300000).toISOString(),
          cost: 0.45,
          responseTime: 850,
          status: 'success',
        },
        {
          provider: 'Weather API',
          service: 'OpenWeatherMap',
          endpoint: '/weather/forecast',
          callsCount: 8,
          lastUsed: new Date(Date.now() - 600000).toISOString(),
          cost: 0.02,
          responseTime: 320,
          status: 'success',
        },
        {
          provider: 'Flight API',
          service: 'Amadeus',
          endpoint: '/shopping/flight-offers',
          callsCount: 5,
          lastUsed: new Date(Date.now() - 900000).toISOString(),
          cost: 0.15,
          responseTime: 1200,
          status: 'success',
        },
      ];

      // Mock recommendations
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          agentId: 'agent-travel-0',
          type: 'suggestion',
          title: 'Optimal booking window detected',
          description: 'Flight prices are currently 15% below average. Consider booking within the next 3 days.',
          impact: 'high',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          actionable: true,
        },
        {
          id: 'rec-2',
          agentId: 'agent-financial-0',
          type: 'optimization',
          title: 'Budget allocation suggestion',
          description: 'Consider allocating 20% more budget to accommodation for better value options.',
          impact: 'medium',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actionable: true,
        },
        {
          id: 'rec-3',
          agentId: 'agent-weather-0',
          type: 'warning',
          title: 'Weather pattern alert',
          description: 'Unusual weather patterns detected for your travel dates. Monitor forecasts closely.',
          impact: 'medium',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      setAgents(mockAgents);
      setApiUsage(mockApiUsage);
      setRecommendations(mockRecommendations);
      setLoading(false);
    };

    loadAgentData();
  }, [assignedAgents, goalId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'idle': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'optimization': return <Zap className="w-4 h-4 text-purple-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const totalApiCalls = apiUsage.reduce((sum, usage) => sum + usage.callsCount, 0);
  const totalApiCost = apiUsage.reduce((sum, usage) => sum + (usage.cost || 0), 0);
  const activeAgents = agents.filter(agent => agent.status === 'active').length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Agents
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {activeAgents}/{agents.length} active
          </div>
          {onRefreshAgents && (
            <button
              onClick={onRefreshAgents}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Agent Status Overview */}
      {showAgentStatus && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">{activeAgents}</div>
              <div className="text-green-600 text-sm">Active</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">
                {agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)}
              </div>
              <div className="text-blue-600 text-sm">Tasks Done</div>
            </div>
            {showApiUsage && (
              <>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-purple-600 text-2xl font-bold">{totalApiCalls}</div>
                  <div className="text-purple-600 text-sm">API Calls</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <div className="text-orange-600 text-2xl font-bold">${totalApiCost.toFixed(2)}</div>
                  <div className="text-orange-600 text-sm">API Cost</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Individual Agents */}
      <div className="space-y-4 mb-6">
        {agents.map((agent) => (
          <div key={agent.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Zap className={`w-5 h-5 ${
                      agent.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                  <button
                    onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {expandedAgent === agent.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {agent.tasksCompleted} tasks
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {agent.successRate.toFixed(1)}% success
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(agent.lastActivity)}
                </div>
              </div>

              {agent.currentTask && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-300">
                  Currently: {agent.currentTask}
                </div>
              )}
            </div>

            <AnimatePresence>
              {expandedAgent === agent.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="text-sm space-y-2">
                    <div><span className="font-medium">Type:</span> {agent.type}</div>
                    <div><span className="font-medium">Agent ID:</span> {agent.id}</div>
                    <div><span className="font-medium">Last Activity:</span> {new Date(agent.lastActivity).toLocaleString()}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* API Usage Details */}
      {showApiUsage && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              API Usage
            </h4>
            <button
              onClick={() => setShowApiDetails(!showApiDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              {showApiDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <AnimatePresence>
            {showApiDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {apiUsage.map((usage, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {usage.provider} - {usage.service}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usage.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {usage.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div>{usage.callsCount} calls</div>
                      <div>{usage.responseTime}ms avg</div>
                      {usage.cost && <div>${usage.cost.toFixed(3)} cost</div>}
                      <div>{formatRelativeTime(usage.lastUsed)}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Agent Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            AI Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {rec.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact} impact
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(rec.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rec.description}
                    </p>
                    {rec.actionable && (
                      <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparency Note */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <div className="font-medium mb-1">Transparency Notice</div>
            <div>
              All AI agent activities and API usage are logged for your review. 
              Your data is processed securely and used only to achieve your goals.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentInfoPanel;