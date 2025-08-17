const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Important for cookies/sessions
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async checkAuthStatus() {
    return this.request<{
      authenticated: boolean;
      user: any;
    }>('/auth/status');
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/auth/me');
  }

  async logout() {
    return this.request<{
      success: boolean;
      message: string;
    }>('/auth/logout', {
      method: 'POST',
    });
  }

  // User methods
  async completeOnboarding(data: any) {
    return this.request<any>('/users/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/users/profile');
  }

  async updateUserProfile(profileData: any) {
    return this.request<{
      success: boolean;
      user: any;
      message: string;
    }>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Goals methods
  async getGoals(filters?: {
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/goals?${queryString}` : '/goals';
    
    return this.request<{
      success: boolean;
      goals: any[];
      pagination?: {
        totalCount: number;
        hasMore: boolean;
        limit: number;
        offset: number;
      };
    }>(url);
  }

  async createGoal(goalData: any) {
    return this.request<{
      success: boolean;
      goal: any;
    }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async analyzeGoal(goalDescription: string) {
    return this.request<{
      success: boolean;
      analysis: any;
      goalDescription: string;
    }>('/goals/analyze', {
      method: 'POST',
      body: JSON.stringify({ goalDescription }),
    });
  }

  async getGoal(goalId: string) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}`);
  }

  async updateGoal(goalId: string, updateData: any) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteGoal(goalId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  async analyzeExistingGoal(goalId: string) {
    return this.request<{
      success: boolean;
      goal: any;
      analysis: any;
    }>(`/goals/${goalId}/analyze`, {
      method: 'POST',
    });
  }

  // Chat methods
  async sendChatMessage(message: string, sessionId?: string, sessionType?: 'general' | 'goal_creation' | 'goal_refinement') {
    return this.request<{
      success: boolean;
      sessionId: string;
      message: string;
      sessionType: string;
    }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, sessionType }),
    });
  }

  async *sendChatMessageStreaming(message: string, sessionId?: string, sessionType?: 'general' | 'goal_creation' | 'goal_refinement'): AsyncGenerator<{
    type: 'session_id' | 'chunk' | 'complete' | 'error';
    sessionId?: string;
    content?: string;
    message?: string;
  }, void, unknown> {
    const response = await fetch(`${this.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId, sessionType }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                yield parsed;
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getChatSessions() {
    return this.request<{
      success: boolean;
      sessions: any[];
    }>('/chat/sessions');
  }

  async getChatSession(sessionId: string) {
    return this.request<{
      success: boolean;
      session: any;
    }>(`/chat/sessions/${sessionId}`);
  }

  async deleteChatSession(sessionId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async clearChatSession(sessionId: string) {
    return this.request<{
      success: boolean;
      message: string;
      session: any;
    }>(`/chat/sessions/${sessionId}/clear`, {
      method: 'POST',
    });
  }

  // Goal Steps methods
  async getGoalSteps(goalId: string) {
    return this.request<{
      success: boolean;
      steps: any[];
    }>(`/goals/${goalId}/steps`);
  }

  async createGoalStep(goalId: string, stepData: any) {
    return this.request<{
      success: boolean;
      step: any;
    }>(`/goals/${goalId}/steps`, {
      method: 'POST',
      body: JSON.stringify(stepData),
    });
  }

  async updateGoalStep(goalId: string, stepId: string, updateData: any) {
    return this.request<{
      success: boolean;
      step: any;
    }>(`/goals/${goalId}/steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteGoalStep(goalId: string, stepId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/goals/${goalId}/steps/${stepId}`, {
      method: 'DELETE',
    });
  }

  async updateGoalProgress(goalId: string, currentSaved: number) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ currentSaved }),
    });
  }

  // Additional Goals methods
  async getGoalCategories() {
    return this.request<{
      success: boolean;
      categories: any[];
    }>('/goals/categories');
  }

  async bulkUpdateGoals(updates: Array<{ id: string; data: any }>) {
    return this.request<{
      success: boolean;
      updatedGoals: any[];
    }>('/goals/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  }

  async bulkDeleteGoals(goalIds: string[]) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/goals/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ goalIds }),
    });
  }

  async duplicateGoal(goalId: string) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}/duplicate`, {
      method: 'POST',
    });
  }

  async archiveGoal(goalId: string) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}/archive`, {
      method: 'PATCH',
    });
  }

  async unarchiveGoal(goalId: string) {
    return this.request<{
      success: boolean;
      goal: any;
    }>(`/goals/${goalId}/unarchive`, {
      method: 'PATCH',
    });
  }

  // Progress methods
  async getProgressMetrics() {
    return this.request<{
      success: boolean;
      metrics: any;
    }>('/progress/metrics');
  }

  async getProgressInsights(goalId?: string) {
    const url = goalId ? `/progress/insights?goalId=${goalId}` : '/progress/insights';
    return this.request<{
      success: boolean;
      insights: any;
    }>(url);
  }

  async getProgressAnalytics() {
    return this.request<{
      success: boolean;
      analytics: any;
    }>('/progress/analytics');
  }

  async updateProgress(goalId: string, progressData: {
    currentSaved?: number;
    stepId?: string;
    stepCompleted?: boolean;
    notes?: string;
  }) {
    return this.request<{
      success: boolean;
      goal: any;
      message: string;
    }>(`/progress/update/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  // Extended Profile methods
  async updateExtendedProfile(profileData: {
    occupation?: string;
    annualIncome?: number;
    currentSavings?: number;
    workSchedule?: string;
    personalityType?: string;
    learningStyle?: string;
    decisionMakingStyle?: string;
    communicationStyle?: string;
    motivationalFactors?: string[];
    lifePriorities?: string[];
    previousExperiences?: string[];
    skillsAndStrengths?: string[];
  }) {
    return this.request<{
      success: boolean;
      profile: any;
      message: string;
    }>('/users/extended-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // AI Settings methods
  async getAISettings() {
    return this.request<{
      success: boolean;
      aiSettings: {
        aiInstructions?: string;
        aiTone: string;
        aiDetailLevel: string;
        aiApproachStyle: string;
      };
    }>('/users/ai-settings');
  }

  async updateAISettings(aiSettings: {
    aiInstructions?: string;
    aiTone?: 'helpful' | 'casual' | 'formal' | 'motivational';
    aiDetailLevel?: 'brief' | 'balanced' | 'detailed';
    aiApproachStyle?: 'structured' | 'adaptive' | 'creative';
  }) {
    return this.request<{
      success: boolean;
      aiSettings: any;
      message: string;
    }>('/users/ai-settings', {
      method: 'PUT',
      body: JSON.stringify(aiSettings),
    });
  }
}

export const apiService = new ApiService();
export default apiService;