import { memories } from './schema';
import { getDb } from './index';
import { eq, or, and, desc, like } from 'drizzle-orm';
import crypto from 'crypto';

export class MemoryManager {
  async saveMemory(scope: string, source: string, content: string, confidence: number = 1.0) {
    const db = getDb();
    const now = Date.now();
    await db.insert(memories).values({
      id: crypto.randomUUID(),
      scope,
      source,
      content,
      confidence,
      createdAt: now,
      updatedAt: now
    });
  }

  async getMemoriesByScope(scope: string) {
    const db = getDb();
    return await db.select().from(memories).where(eq(memories.scope, scope)).orderBy(desc(memories.createdAt));
  }

  async searchMemories(query: string, scope?: string) {
    const db = getDb();
    const q = `%${query}%`;
    let condition = like(memories.content, q);
    
    if (scope) {
      condition = and(condition, eq(memories.scope, scope)) as any;
    }
    
    return await db.select().from(memories).where(condition).orderBy(desc(memories.createdAt));
  }
  
  async getAllMemories() {
    const db = getDb();
    return await db.select().from(memories).orderBy(desc(memories.createdAt));
  }

  async deleteMemory(id: string) {
    const db = getDb();
    await db.delete(memories).where(eq(memories.id, id));
  }

  async updateMemory(id: string, content: string, confidence?: number) {
    const db = getDb();
    const updateData: any = { content, updatedAt: Date.now() };
    if (confidence !== undefined) updateData.confidence = confidence;
    await db.update(memories).set(updateData).where(eq(memories.id, id));
  }

  async forgetAll() {
    const db = getDb();
    await db.delete(memories);
  }

  async getContextSummary(): Promise<string> {
    const db = getDb();
    const sysMem = await db.select().from(memories).where(or(eq(memories.scope, 'system'), eq(memories.scope, 'user'))).orderBy(desc(memories.createdAt)).limit(50);
    const taskMem = await db.select().from(memories).where(eq(memories.scope, 'task')).orderBy(desc(memories.createdAt)).limit(10);
    
    let summary = "System & User Context:\n";
    for (const mem of sysMem) {
      summary += `- [${mem.scope.toUpperCase()}] ${mem.content}\n`;
    }
    summary += "\nRecent Task Memory Context:\n";
    for (const mem of taskMem) {
      summary += `- [${mem.source}] ${mem.content}\n`;
    }
    return summary;
  }

  async getRelevantContext(intent: string, limit: number = 5): Promise<string> {
    const db = getDb();
    const allTaskMems = await db.select().from(memories).where(eq(memories.scope, 'task'));
    
    const stopWords = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'];
    const tokens = intent.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
    
    const scoredMemories = allTaskMems.map(mem => {
      let score = 0;
      const textToSearch = mem.content.toLowerCase();
      
      for (const token of tokens) {
        if (textToSearch.includes(token)) {
          score += 1;
        }
      }
      return { mem, score };
    });

    const relevant = scoredMemories.filter(m => m.score > 0).sort((a, b) => (b.score * b.mem.confidence) - (a.score * a.mem.confidence)).slice(0, limit);
    
    if (relevant.length === 0) {
       return "No highly relevant historical context found.";
    }

    let summary = "Relevant Historical Context (via RAG Simulation):\n";
    for (const item of relevant) {
      summary += `- [Score: ${item.score}] ${item.mem.content}\n`;
    }
    return summary;
  }
}
