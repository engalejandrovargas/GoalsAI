import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Plane, 
  DollarSign, 
  Search, 
  BookOpen, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  capabilities: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  performance: {
    successRate: number;
    totalExecutions: number;
    averageResponseTime: number;
    lastExecuted?: string;
  };
  activeTasks: number;
}

interface AgentTask {
  id: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  confidence?: number;
  createdAt: string;
  completedAt?: string;
}

const AgentDashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      console.log('Fetching agents from /agents endpoint...');
      const response = await apiService.getAgents();
      console.log('Agents response:', response);
      setAgents(response.agents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      console.error('Error details:', error.response?.data);
      // For now, let's continue even if the API fails
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentTasks = async (agentId: string) => {
    try {
      const response = await apiService.getAgentStatus(agentId);
      setAgentTasks(response.recentTasks || []);
    } catch (error) {
      console.error('Failed to fetch agent tasks:', error);
    }
  };

  const testAgent = async (agent: Agent) => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      let testParams;
      
      switch (agent.type) {
        case 'travel':
          testParams = {
            taskType: 'searchFlights',
            parameters: {
              origin: 'NYC',
              destination: 'LAX',
              departureDate: '2025-03-01',
              passengers: 1,
              currency: 'USD'
            }
          };
          break;
        case 'financial':
          testParams = {
            taskType: 'convertCurrency',
            parameters: {
              amount: 1000,
              fromCurrency: 'USD',
              toCurrency: 'EUR'
            }
          };
          break;
        default:
          testParams = {
            taskType: 'conductMarketResearch',
            parameters: {
              industry: 'technology',
              region: 'global'
            }
          };
      }

      const response = await apiService.executeAgentTask({
        goalId: 'demo-goal-' + Date.now(),
        ...testParams
      });
      
      setTestResult(response);
      await fetchAgents(); // Refresh to get updated metrics
    } catch (error) {
      console.error('Agent test failed:', error);
      setTestResult({ 
        success: false, 
        error: 'Test failed - check console for details' 
      });
    } finally {
      setTestLoading(false);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'travel': return <Plane className="w-6 h-6" />;
      case 'financial': return <DollarSign className="w-6 h-6" />;
      case 'research': return <Search className="w-6 h-6" />;
      case 'learning': return <BookOpen className="w-6 h-6" />;
      default: return <Bot className="w-6 h-6" />;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'travel': return 'from-blue-500 to-cyan-500';
      case 'financial': return 'from-green-500 to-emerald-500';
      case 'research': return 'from-purple-500 to-indigo-500';
      case 'learning': return 'from-orange-500 to-yellow-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Agent Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Agent Dashboard</h1>
              <p className="text-gray-600">Manage and monitor your intelligent agents</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold">{agents.filter(a => a.isActive).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">
                    {agents.reduce((sum, agent) => sum + agent.performance.totalExecutions, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {agents.length > 0 
                      ? Math.round(agents.reduce((sum, agent) => sum + agent.performance.successRate, 0) / agents.length * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">
                    {agents.length > 0 
                      ? Math.round(agents.reduce((sum, agent) => sum + agent.performance.averageResponseTime, 0) / agents.length)
                      : 0}ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Agent Header */}
              <div className={`bg-gradient-to-r ${getAgentColor(agent.type)} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAgentIcon(agent.type)}
                    <div>
                      <h3 className="text-xl font-semibold">{agent.name}</h3>
                      <p className="text-white/80 text-sm capitalize">{agent.type} Agent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.isActive ? (
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                
                {/* Capabilities */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Capabilities ({agent.capabilities.length})</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {agent.capabilities.slice(0, 3).map((capability, idx) => (
                      <div key={idx} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        • {capability.description}
                      </div>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <div className="text-sm text-blue-600">
                        +{agent.capabilities.length - 3} more capabilities
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(agent.performance.successRate * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {agent.performance.totalExecutions}
                    </p>
                    <p className="text-xs text-gray-500">Tasks Run</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {agent.performance.averageResponseTime}ms
                    </p>
                    <p className="text-xs text-gray-500">Avg Time</p>
                  </div>
                </div>

                {/* Debug Info */}
                <div className="text-xs text-gray-500 mb-2">
                  Debug: isActive={agent.isActive ? 'true' : 'false'}, type={agent.type}
                </div>

                {/* Test Button */}
                <button
                  onClick={() => testAgent(agent)}
                  disabled={testLoading || !agent.isActive}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    agent.isActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {testLoading ? 'Testing...' : 'Test Agent'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Results */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Test Results</h3>
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? 'Agent test successful!' : 'Agent test failed'}
                  </p>
                  {testResult.confidence && (
                    <p className="text-sm text-gray-600 mt-1">
                      Confidence: {Math.round(testResult.confidence * 100)}%
                    </p>
                  )}
                  {testResult.result && (
                    <div className="mt-2 p-3 bg-white rounded border text-sm">
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {JSON.stringify(testResult.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {testResult.error && (
                    <p className="text-sm text-red-600 mt-1">{testResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboardPage;