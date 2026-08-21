import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

interface VectorMemory {
  id: string;
  text: string;
  tags: string[];
  embedding: number[];
  createdAt: number;
}

export class VectorStore {
  private static instance: VectorStore;
  private db: any;
  private memories: VectorMemory[] = [];
  private initPromise: Promise<void>;
  
  private constructor() {
    let userData = '';
    // Use a standard config directory if app is undefined
    userData = path.join(process.env.HOME || process.env.USERPROFILE || '', '.slave-os');
    if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
    
    this.db = createClient({ url: `file:${path.join(userData, 'vectors.sqlite')}` });
    this.initPromise = this.initialize();
  }

  private async initialize() {
    await this.initDb();
    await this.loadMemories();
  }

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  private async initDb() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS vector_memories (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        tags TEXT NOT NULL,
        embedding TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  private async loadMemories() {
    const res = await this.db.execute('SELECT * FROM vector_memories');
    this.memories = res.rows.map((r: any) => ({
      id: r.id,
      text: r.text,
      tags: JSON.parse(r.tags),
      embedding: JSON.parse(r.embedding),
      createdAt: r.created_at
    }));
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const { ConfigStore } = require('../config/ConfigStore');
    const openAiKey = ConfigStore.getInstance().getConfig().openAiKey;
    if (!openAiKey) throw new Error('OpenAI API Key not set for embeddings.');

    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch embedding: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data[0].embedding;
  }

  public async store(text: string, tags: string[] = []): Promise<string> {
    await this.initPromise;
    const embedding = await this.getEmbedding(text);
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    const memory: VectorMemory = {
      id,
      text,
      tags,
      embedding,
      createdAt: Date.now()
    };

    await this.db.execute({
      sql: 'INSERT INTO vector_memories (id, text, tags, embedding, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [
        memory.id,
        memory.text,
        JSON.stringify(memory.tags),
        JSON.stringify(memory.embedding),
        memory.createdAt
      ]
    });

    this.memories.push(memory);
    return id;
  }

  public async search(query: string, topK: number = 3): Promise<Omit<VectorMemory, 'embedding'>[]> {
    await this.initPromise;
    if (this.memories.length === 0) return [];
    
    try {
      const queryEmbedding = await this.getEmbedding(query);
      
      const results = this.memories.map(mem => ({
        ...mem,
        score: this.cosineSimilarity(queryEmbedding, mem.embedding)
      }));

      results.sort((a, b) => (b as any).score - (a as any).score);

      return results.slice(0, topK).map(r => ({
        id: r.id,
        text: r.text,
        tags: r.tags,
        createdAt: r.createdAt
      }));
    } catch (e) {
      console.error('Vector search failed', e);
      return [];
    }
  }
}
