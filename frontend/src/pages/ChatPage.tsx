import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  Loader, 
  RefreshCw,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  Target,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import GoalCreationModal from '../components/GoalCreationModal';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  sessionType: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: {
    role: string;
    content: string;
    timestamp: string;
  };
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalFromChat, setGoalFromChat] = useState<string>('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = async () => {
    try {
      const response = await apiService.getChatSessions();
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.getChatSession(sessionId);
      if (response.success) {
        setMessages(response.session.messages || []);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInputMessage('');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Optimistically add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    let hasAddedAiMessage = false;

    try {
      let sessionId = currentSessionId;
      let hasStartedStreaming = false;
      
      for await (const chunk of apiService.sendChatMessageStreaming(
        userMessage, 
        currentSessionId || undefined,
        'goal_creation'
      )) {
        if (chunk.type === 'session_id') {
          sessionId = chunk.sessionId || sessionId;
          setCurrentSessionId(sessionId);
        } else if (chunk.type === 'chunk' && chunk.content) {
          // First chunk received - switch from loading to streaming
          if (!hasStartedStreaming) {
            setIsLoading(false);
            setIsStreaming(true);
            hasStartedStreaming = true;
            
            // Add the initial AI message on first chunk
            if (!hasAddedAiMessage) {
              const initialAiMessage: Message = {
                role: 'assistant',
                content: chunk.content,
                timestamp: new Date().toISOString(),
              };
              setMessages(prev => [...prev, initialAiMessage]);
              hasAddedAiMessage = true;
            }
          } else {
            // Update the AI message with streaming content
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                lastMessage.content += chunk.content;
              }
              return newMessages;
            });
          }
        } else if (chunk.type === 'complete') {
          // Streaming complete, refresh sessions list
          loadSessions();
          break;
        } else if (chunk.type === 'error') {
          console.error('Streaming error:', chunk.message);
          toast.error(chunk.message || 'Error in streaming response');
          break;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove the AI message if it was added but failed
      if (hasAddedAiMessage) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      const response = await apiService.deleteChatSession(sessionId);
      if (response.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          startNewSession();
        }
        toast.success('Chat session deleted');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const clearSession = async () => {
    if (!currentSessionId) return;
    if (!confirm('Are you sure you want to clear this conversation?')) return;

    try {
      const response = await apiService.clearChatSession(currentSessionId);
      if (response.success) {
        setMessages([]);
        toast.success('Conversation cleared');
        loadSessions();
      }
    } catch (error) {
      console.error('Error clearing session:', error);
      toast.error('Failed to clear conversation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const extractGoalFromMessage = (message: string): string => {
    // Simple extraction - in a real app, this would be more sophisticated
    // Look for patterns like "I want to...", "My goal is...", "I plan to..."
    const goalPatterns = [
      /(?:i want to|i'd like to|i plan to|my goal is to|i aim to)\s+(.+?)(?:\.|$|,)/i,
      /(?:goal|objective|target):\s*(.+?)(?:\.|$|,)/i,
    ];

    for (const pattern of goalPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  };

  const isGoalRelatedMessage = (message: string): boolean => {
    const goalKeywords = [
      'goal', 'achieve', 'want to', 'plan to', 'dream', 'aspire', 
      'objective', 'target', 'ambition', 'wish to', 'hope to',
      'learning', 'save money', 'lose weight', 'travel to', 'start'
    ];
    
    return goalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  const handleCreateGoalFromChat = (message: string) => {
    const extractedGoal = extractGoalFromMessage(message);
    setGoalFromChat(extractedGoal || message);
    setShowGoalModal(true);
  };

  const handleGoalCreated = () => {
    setShowGoalModal(false);
    setGoalFromChat('');
    toast.success('Goal created from chat conversation!');
  };

  const copyToClipboard = async (text: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageIndex(messageIndex);
      toast.success('Copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className={`flex h-full ${colors.background}`}>
      {/* Sidebar - Chat Sessions */}
      <div className={`w-80 ${colors.cardBackground} border-r ${colors.cardBorder} flex flex-col`}>
        <div className={`p-4 border-b ${colors.cardBorder}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${colors.textPrimary} flex items-center`}>
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              AI Chat
            </h2>
            <button
              onClick={startNewSession}
              className={`p-2 ${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.backgroundSecondary} rounded-lg transition-colors`}
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className={`text-sm ${colors.textSecondary}`}>
            Chat with AI to refine your goals and get personalized guidance.
          </p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No chat sessions yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentSessionId === session.id
                      ? `${colors.backgroundSecondary} border ${colors.cardBorder}`
                      : `hover:${colors.backgroundSecondary}`
                  }`}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <span className={`text-xs ${colors.textTertiary}`}>
                          {formatDate(session.updatedAt)}
                        </span>
                      </div>
                      {session.lastMessage && (
                        <p className={`text-sm ${colors.textSecondary} truncate`}>
                          {session.lastMessage.content}
                        </p>
                      )}
                      <p className={`text-xs ${colors.textTertiary} mt-1`}>
                        {session.messageCount} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className={`${colors.cardBackground} border-b ${colors.cardBorder} p-4 flex items-center justify-between`}>
          <div>
            <h1 className={`text-xl font-semibold ${colors.textPrimary} flex items-center`}>
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              Goal Coaching Chat
            </h1>
            <p className={`text-sm ${colors.textSecondary}`}>
              Get personalized advice from your AI goal coach
            </p>
          </div>
          {currentSessionId && (
            <button
              onClick={clearSession}
              className={`p-2 ${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.backgroundSecondary} rounded-lg transition-colors`}
              title="Clear conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-medium ${colors.textPrimary} mb-2`}>
                Welcome to AI Goal Coaching! 👋
              </h3>
              <p className={`${colors.textSecondary} max-w-md mx-auto`}>
                I'm here to help you clarify your goals, create actionable plans, and overcome obstacles. 
                What would you like to work on today?
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-3xl ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-2 relative group ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : `${colors.cardBackground} border ${colors.cardBorder} ${colors.textPrimary}`
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({children}) => <ul className="mb-2 pl-4 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="mb-2 pl-4 space-y-1">{children}</ol>,
                              li: ({children}) => <li className={colors.textPrimary}>{children}</li>,
                              strong: ({children}) => <strong className={`font-semibold ${colors.textPrimary}`}>{children}</strong>,
                              em: ({children}) => <em className={`italic ${colors.textSecondary}`}>{children}</em>,
                              code: ({children}) => (
                                <code className={`${colors.backgroundTertiary} ${colors.textPrimary} px-1 py-0.5 rounded text-sm font-mono`}>
                                  {children}
                                </code>
                              ),
                              pre: ({children}) => (
                                <pre className={`${colors.backgroundTertiary} p-3 rounded-md overflow-x-auto my-2`}>
                                  {children}
                                </pre>
                              ),
                              blockquote: ({children}) => (
                                <blockquote className={`border-l-4 ${colors.border} pl-4 italic my-2`}>
                                  {children}
                                </blockquote>
                              ),
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      {/* Copy button */}
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className={`absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                          message.role === 'user'
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : `${colors.backgroundTertiary} hover:opacity-80 ${colors.textSecondary}`
                        }`}
                        title="Copy message"
                      >
                        {copiedMessageIndex === index ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-blue-100' : colors.textTertiary
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message.role === 'user' && isGoalRelatedMessage(message.content) && (
                          <button
                            onClick={() => handleCreateGoalFromChat(message.content)}
                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors flex items-center"
                            title="Create goal from this message"
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Create Goal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className={`${colors.cardBackground} border ${colors.cardBorder} rounded-2xl px-4 py-2`}>
                  <div className="flex items-center space-x-2">
                    <Loader className={`w-4 h-4 animate-spin ${colors.textTertiary}`} />
                    <span className={colors.textTertiary}>AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`${colors.cardBackground} border-t ${colors.cardBorder} p-4`}>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your goals, get advice, or brainstorm ideas..."
                rows={1}
                className={`w-full px-4 py-3 border ${colors.inputBorder} rounded-lg ${colors.inputBackground} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading || isStreaming}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isStreaming}
              className={`p-3 rounded-lg transition-colors ${
                inputMessage.trim() && !isLoading && !isStreaming
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading || isStreaming ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className={`text-xs ${colors.textTertiary} mt-2`}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && messages.some(m => m.role === 'user' && isGoalRelatedMessage(m.content)) && (
          <div className={`${colors.backgroundTertiary} border-t ${colors.cardBorder} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h4 className={`text-sm font-medium ${colors.textPrimary}`}>Ready to turn ideas into action?</h4>
                  <p className={`text-xs ${colors.textSecondary}`}>I noticed you mentioned some goals. Want to create an actionable plan?</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const goalMessage = messages.find(m => m.role === 'user' && isGoalRelatedMessage(m.content));
                  if (goalMessage) {
                    handleCreateGoalFromChat(goalMessage.content);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Create Goal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setGoalFromChat('');
        }}
        onGoalCreated={handleGoalCreated}
        prefillDescription={goalFromChat}
      />
    </div>
  );
};

export default ChatPage;