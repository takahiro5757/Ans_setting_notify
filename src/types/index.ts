export interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSettings {
  agentName: string;
  responseTime: number;
  language: string;
  theme: string;
  avatarUrl: string;
}

export interface Customer {
  id: string;
  name: string;
  contactInfo: string;
  history: Transaction[];
  notes: string;
}

export interface SecondaryStore {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactInfo: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  customerId: string;
  secondaryStoreId?: string;
  type: 'processing' | 'return';
  status: 'pending' | 'completed' | 'cancelled';
  amount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Shift {
  id: string;
  staffId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'absent';
} 