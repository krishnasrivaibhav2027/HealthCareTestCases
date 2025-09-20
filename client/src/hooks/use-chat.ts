import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    requirementId?: string;
    generatedTestCases?: any[];
    complianceValidation?: any[];
  };
}

interface ChatSession {
  sessionId: string;
  requirementId: string;
}

export function useChat(requirementId?: string) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const queryClient = useQueryClient();

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async (reqId: string) => {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementId: reqId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }
      
      const data = await response.json();
      return { sessionId: data.sessionId, requirementId: reqId };
    },
    onSuccess: (session) => {
      setCurrentSession(session);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages
      if (currentSession) {
        queryClient.invalidateQueries({ 
          queryKey: ['chat-messages', currentSession.sessionId] 
        });
      }
    },
  });

  // Get chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', currentSession?.sessionId],
    queryFn: async () => {
      if (!currentSession?.sessionId) return [];
      
      const response = await fetch(`/api/chat/sessions/${currentSession.sessionId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json();
    },
    enabled: !!currentSession?.sessionId,
  });

  // Get sessions for requirement
  const { data: sessions = [] } = useQuery({
    queryKey: ['chat-sessions', requirementId],
    queryFn: async () => {
      if (!requirementId) return [];
      
      const response = await fetch(`/api/chat/requirements/${requirementId}/sessions`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      return response.json();
    },
    enabled: !!requirementId,
  });

  const startNewSession = useCallback((reqId: string) => {
    createSessionMutation.mutate(reqId);
  }, [createSessionMutation]);

  const sendMessage = useCallback((message: string) => {
    if (!currentSession) return;
    sendMessageMutation.mutate({ sessionId: currentSession.sessionId, message });
  }, [currentSession, sendMessageMutation]);

  const selectSession = useCallback((sessionId: string, reqId: string) => {
    setCurrentSession({ sessionId, requirementId: reqId });
  }, []);

  return {
    currentSession,
    messages: messages as ChatMessage[],
    sessions,
    messagesLoading,
    isCreatingSession: createSessionMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    startNewSession,
    sendMessage,
    selectSession,
  };
}