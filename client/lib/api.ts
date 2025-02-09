import axios, { AxiosError } from 'axios';
import { Agent, Swarm, Message, Conversation } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.debug('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ API Request Error:', {
      message: error.message,
      code: error.code,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.debug('✅ API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('❌ API Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ API Network Error:', {
        message: error.message,
        code: error.code,
        request: error.request,
        isTimeout: error.code === 'ECONNABORTED',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ API Setup Error:', {
        message: error.message,
        code: error.code,
      });
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleApiResponse = async <T>(promise: Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await promise;
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.code === 'ECONNABORTED' 
        ? 'Request timed out. Please try again.'
        : error.response?.data?.error || error.message;
      
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
};

// Agents API
export const agentsApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Agent[]>>('/api/agents');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Agent>>(`/api/agents/${id}`);
    return response.data;
  },
  
  create: async (agent: Omit<Agent, 'id' | 'isActive'>) => {
    const response = await api.post<ApiResponse<Agent>>('/api/agents', agent);
    return response.data;
  },
  
  update: async (id: string, agent: Partial<Agent>) => {
    const response = await api.put<ApiResponse<Agent>>(`/api/agents/${id}`, agent);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/agents/${id}`);
    return response.data;
  },
};

// Swarms API
export const swarmsApi = {
  getAll: () => handleApiResponse<Swarm[]>(api.get('/api/swarms')),
  getById: (id: string) => handleApiResponse<Swarm>(api.get(`/api/swarms/${id}`)),
  create: (swarm: Omit<Swarm, 'id' | 'createdAt' | 'updatedAt'>) => 
    handleApiResponse<Swarm>(api.post('/api/swarms', swarm)),
  update: (id: string, swarm: Partial<Swarm>) => 
    handleApiResponse<Swarm>(api.put(`/api/swarms/${id}`, swarm)),
  delete: (id: string) => 
    handleApiResponse<void>(api.delete(`/api/swarms/${id}`)),
  addAgent: (swarmId: string, agentId: string) => 
    handleApiResponse<Swarm>(api.post(`/api/swarms/${swarmId}/agents`, { agentId })),
  removeAgent: (swarmId: string, agentId: string) => 
    handleApiResponse<Swarm>(api.delete(`/api/swarms/${swarmId}/agents/${agentId}`)),
};

// Chat API
export const chatApi = {
  getConversations: (swarmId: string) =>
    handleApiResponse<Conversation[]>(api.get(`/api/messages/${swarmId}/conversations`)),
    
  getMessages: (swarmId: string, conversationId: string) =>
    handleApiResponse<Message[]>(api.get(`/api/messages/${swarmId}/conversations/${conversationId}`)),
    
  sendMessage: (swarmId: string, content: string, model: string, conversationId?: string) =>
    handleApiResponse<{
      conversation: Conversation;
      userMessage: Message;
      assistantMessage: Message;
    }>(api.post(`/api/messages/${swarmId}`, { content, model, conversationId })),
    
  deleteConversation: (swarmId: string, conversationId: string) =>
    handleApiResponse<void>(api.delete(`/api/messages/${swarmId}/conversations/${conversationId}`)),
};

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export default api; 