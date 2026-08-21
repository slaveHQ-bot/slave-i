import { getDb, tasks, subtasks, runs } from '../db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class TaskEngine {
  private activeControllers: Map<string, AbortController> = new Map();

  constructor() {}

  async createTask(intent: string, metadata?: string) {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(tasks).values({
      id,
      intent,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
      metadata
    });
    return id;
  }

  async getTask(id: string) {
    const db = getDb();
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async updateTaskStatus(id: string, status: 'queued' | 'running' | 'completed' | 'failed') {
    const db = getDb();
    await db.update(tasks).set({ status, updatedAt: Date.now() }).where(eq(tasks.id, id));
  }

  registerController(taskId: string, controller: AbortController) {
    this.activeControllers.set(taskId, controller);
  }

  unregisterController(taskId: string) {
    this.activeControllers.delete(taskId);
  }

  abortTask(taskId: string) {
    const controller = this.activeControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(taskId);
    }
  }
}
