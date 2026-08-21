import { getDb } from './index';
import { conversations, messages } from './schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class ChatManager {
  private static instance: ChatManager;

  private constructor() {}

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  async getConversations() {
    const db = getDb();
    return await db.select().from(conversations).orderBy(desc(conversations.startedAt));
  }

  async getConversation(id: string) {
    const db = getDb();
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv;
  }

  async createConversation(title?: string) {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(conversations).values({
      id,
      startedAt: Date.now(),
      title: title || 'New Chat'
    });
    return id;
  }

  async renameConversation(id: string, newTitle: string) {
    const db = getDb();
    await db.update(conversations).set({ title: newTitle }).where(eq(conversations.id, id));
  }

  async deleteConversation(id: string) {
    const db = getDb();
    // Delete all messages first (foreign key constraints if enforced, or just manually)
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessages(conversationId: string) {
    const db = getDb();
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async saveMessage(conversationId: string, role: 'user' | 'agent' | 'system', content: string) {
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(messages).values({
      id,
      conversationId,
      role,
      content,
      createdAt: Date.now(),
    });
    return id;
  }

  async deleteMessage(messageId: string) {
    const db = getDb();
    await db.delete(messages).where(eq(messages.id, messageId));
  }
}
