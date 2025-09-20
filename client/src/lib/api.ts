export interface Requirement {
  id: string;
  jiraKey: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee?: string;
  complianceStandards: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  steps: Array<{ step: string; expectedResult: string }>;
  priority: string;
  complianceChecks: string[];
  aiGenerated: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  // Requirements
  async getRequirements(): Promise<Requirement[]> {
    const response = await fetch('/api/requirements');
    if (!response.ok) throw new Error('Failed to fetch requirements');
    return response.json();
  },

  async getRequirement(id: string): Promise<Requirement> {
    const response = await fetch(`/api/requirements/${id}`);
    if (!response.ok) throw new Error('Failed to fetch requirement');
    return response.json();
  },

  // Test Cases
  async getTestCases(): Promise<TestCase[]> {
    const response = await fetch('/api/test-cases');
    if (!response.ok) throw new Error('Failed to fetch test cases');
    return response.json();
  },

  async getTestCasesByRequirement(requirementId: string): Promise<TestCase[]> {
    const response = await fetch(`/api/test-cases/requirement/${requirementId}`);
    if (!response.ok) throw new Error('Failed to fetch test cases');
    return response.json();
  },

  // Chat
  async createChatSession(requirementId: string): Promise<{ sessionId: string }> {
    const response = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId }),
    });
    if (!response.ok) throw new Error('Failed to create chat session');
    return response.json();
  },

  async sendMessage(sessionId: string, message: string) {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getChatMessages(sessionId: string) {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },
};