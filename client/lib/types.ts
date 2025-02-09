export interface NavigationItem {
  icon: string;
  label: string;
  path: string;
  description: string;
}

export interface SwarmType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: 'purple' | 'blue' | 'cyan' | 'green';
  agents: string[];
}

export interface RecentChat {
  id: string;
  name: string;
  path: string;
  type: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  swarmId: string;
  conversationId: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  swarmId: string;
  title: string;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  provider: string;
  isActive?: boolean;
  capabilities?: string[];
}

export interface Swarm {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  capabilities?: string[];
  agents?: Array<Agent | string>;
  tasks?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 