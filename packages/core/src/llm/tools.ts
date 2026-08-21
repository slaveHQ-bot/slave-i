import { tool } from 'ai';
import { z } from 'zod';
import { getDb, subtasks } from '../db';
import crypto from 'crypto';

export const getTools = (): any => ({
  createSubtask: tool({
    description: 'Create a subtask to be executed by a specialized agent.',
    parameters: z.object({
      taskId: z.string().describe('The parent task ID.'),
      objective: z.string().describe('A clear, actionable objective for this subtask.'),
      dependencies: z.array(z.string()).optional().describe('List of subtask IDs this subtask depends on.'),
      assignedSlave: z.string().describe('The ID of the specialized agent assigned to this task (e.g., coder_slave, terminal_slave).'),
    }),
    execute: async (args: any) => {
      const db = getDb();
      const id = crypto.randomUUID();
      await db.insert(subtasks).values({
        id,
        taskId: args.taskId,
        objective: args.objective,
        dependencies: JSON.stringify(args.dependencies || []),
        assignedSlave: args.assignedSlave,
        status: 'queued',
      });
      return { id, objective: args.objective, assignedSlave: args.assignedSlave, status: 'queued' };
    },
  } as any)
});
