import { getDb, mcpServers } from '../db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class McpManager {
  private static instance: McpManager;

  private constructor() {}

  public static getInstance(): McpManager {
    if (!McpManager.instance) {
      McpManager.instance = new McpManager();
    }
    return McpManager.instance;
  }

  async listServers() {
    const db = getDb();
    try {
      return await db.select().from(mcpServers);
    } catch (e) {
      return [];
    }
  }

  async addServer(serverData: any) {
    const db = getDb();
    const id = serverData.id || crypto.randomUUID();
    const now = Date.now();

    const record = {
      id,
      name: serverData.name,
      type: serverData.type,
      command: serverData.command || '',
      args: serverData.args || '[]',
      env: serverData.env || '{}',
      url: serverData.url || '',
      status: 'disconnected', // Initial state
      capabilities: serverData.capabilities || '{"tools":[],"resources":[],"prompts":[]}',
      updatedAt: now,
    };

    const isNew = !serverData.id;

    if (isNew) {
      await db.insert(mcpServers).values({ ...record, createdAt: now });
    } else {
      await db.update(mcpServers).set(record).where(eq(mcpServers.id, id));
    }
    return { ...record, createdAt: isNew ? now : undefined };
  }

  async removeServer(id: string) {
    const db = getDb();
    await db.delete(mcpServers).where(eq(mcpServers.id, id));
    return true;
  }

  async getTools(serverId: string) {
    const db = getDb();
    const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId));
    if (!server) return [];
    try {
      const caps = JSON.parse(server.capabilities || '{}');
      return caps.tools || [];
    } catch {
      return [];
    }
  }
}
