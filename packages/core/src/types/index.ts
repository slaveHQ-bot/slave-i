export interface Task {
  id: string;
  intent: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  metadata?: string;
}

export interface Memory {
  id: string;
  content: string;
  type: 'user' | 'project' | 'conversation' | 'task';
  importance: number;
  createdAt: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}
