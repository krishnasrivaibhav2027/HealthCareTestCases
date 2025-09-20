import { ChatSession, ChatMessage } from './types';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { pgTable, text, jsonb, timestamp, varchar } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Chat sessions table for persistence
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey(),
  requirementId: varchar("requirement_id").notNull(),
  messages: jsonb("messages").$type<ChatMessage[]>().default([]),
  context: jsonb("context").$type<ChatSession['context']>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export class ChatMemoryStore {
  async createSession(sessionId: string, requirementId: string, requirement: any): Promise<ChatSession> {
    const session: ChatSession = {
      id: sessionId,
      requirementId,
      messages: [],
      context: {
        requirement: {
          jiraKey: requirement.jiraKey,
          title: requirement.title,
          description: requirement.description,
          complianceStandards: requirement.complianceStandards || []
        },
        generatedTestCases: [],
        complianceValidations: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(chatSessions).values({
      id: sessionId,
      requirementId,
      messages: [],
      context: session.context,
    });

    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const [result] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));

    if (!result) return null;

    return {
      id: result.id,
      requirementId: result.requirementId,
      messages: result.messages || [],
      context: result.context || {
        requirement: { jiraKey: '', title: '', description: '', complianceStandards: [] },
        generatedTestCases: [],
        complianceValidations: []
      },
      createdAt: result.createdAt || new Date(),
      updatedAt: result.updatedAt || new Date()
    };
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    await db
      .update(chatSessions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(chatSessions.id, sessionId));
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const updatedMessages = [...session.messages, message];
    await this.updateSession(sessionId, { messages: updatedMessages });
  }

  async getSessionsByRequirement(requirementId: string): Promise<ChatSession[]> {
    const results = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.requirementId, requirementId));

    return results.map(result => ({
      id: result.id,
      requirementId: result.requirementId,
      messages: result.messages || [],
      context: result.context || {
        requirement: { jiraKey: '', title: '', description: '', complianceStandards: [] },
        generatedTestCases: [],
        complianceValidations: []
      },
      createdAt: result.createdAt || new Date(),
      updatedAt: result.updatedAt || new Date()
    }));
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
  }
}

export const chatMemoryStore = new ChatMemoryStore();