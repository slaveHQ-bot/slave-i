import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PluginLoader } from '../engine/PluginLoader';

const execAsync = promisify(exec);

export const getWorkerTools = (onStatusUpdate: (msg: string) => void): any => {
  const pluginTools = PluginLoader.getInstance().getPluginTools();
  
  const coreTools = {
    runCommand: tool({
    description: 'Execute a bash command on the local machine.',
    parameters: z.object({
      command: z.string().describe('The bash command to execute.'),
      cwd: z.string().optional().describe('The working directory to run the command in. Defaults to user home.'),
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Running command: ${args.command}`);
      try {
        const cwd = args.cwd || os.homedir();
        const { stdout, stderr } = await execAsync(args.command, { cwd });
        if (stderr) {
           onStatusUpdate(`> Command stderr: ${stderr.substring(0, 100)}...`);
        }
        return { success: true, stdout, stderr };
      } catch (error: any) {
        onStatusUpdate(`> Command failed: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
  } as any),

  readFile: tool({
    description: 'Read the contents of a file on the local machine.',
    parameters: z.object({
      filePath: z.string().describe('The absolute path to the file.'),
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Reading file: ${args.filePath}`);
      try {
        const content = await fs.readFile(args.filePath, 'utf-8');
        return { success: true, content };
      } catch (error: any) {
        onStatusUpdate(`> Failed to read file: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
  } as any),

  writeFile: tool({
    description: 'Write content to a file on the local machine. Overwrites existing content.',
    parameters: z.object({
      filePath: z.string().describe('The absolute path to the file.'),
      content: z.string().describe('The content to write to the file.'),
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Writing file: ${args.filePath}`);
      try {
        const dir = path.dirname(args.filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(args.filePath, args.content, 'utf-8');
        return { success: true };
      } catch (error: any) {
        onStatusUpdate(`> Failed to write file: ${error.message}`);
        return { success: false, error: error.message };
      }
    },
  } as any),

  fetchUrl: tool({
    description: 'Fetch and extract the raw text content from a public URL.',
    parameters: z.object({
      url: z.string().describe('The URL to fetch.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Fetching URL: ${args.url}`);
      try {
        const response = await fetch(args.url);
        if (!response.ok) {
           return `Error fetching URL: HTTP ${response.status} ${response.statusText}`;
        }
        const text = await response.text();
        const strippedText = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 10000); 
        return `Extracted Text (truncated to 10k chars): ${strippedText}`;
      } catch (e: any) {
        return `Error fetching URL: ${e.message}`;
      }
    }
  } as any),

  spawnSubtask: tool({
    description: 'Recursively spawn a new subtask to the OS Task Graph if you encounter a problem too large or need a different agent (like TerminalSlave or BrowserSlave) to handle a specific piece of work.',
    parameters: z.object({
      assignedSlave: z.string().describe('The ID of the specialized agent to route to (e.g., "coder_slave", "terminal_slave", "browser_slave").'),
      objective: z.string().describe('The detailed objective for the new subtask.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Spawning recursive subtask to ${args.assignedSlave}`);
      try {
        const { getDb } = require('../db');
        const { tasks } = require('../db/schema');
        const db = getDb();
        const crypto = require('crypto');
        
        // We link this to a "Recursive Tasks" intent or find the parent intent ID if passed
        // For simplicity, we just create it as an unlinked global subtask that the AgentRuntime will pick up.
        // Or better: fetch the first active intent.
        const { eq } = require('drizzle-orm');
        const activeTasks = await db.select().from(tasks).where(eq(tasks.status, 'running')).limit(1);
        if (activeTasks.length === 0) return 'Error: No active main task to attach subtask to.';
        
        const subtaskId = `subtask-${crypto.randomUUID().slice(0, 8)}`;
        const { subtasks } = require('../db/schema');
        
        await db.insert(subtasks).values({
          id: subtaskId,
          taskId: activeTasks[0].id,
          objective: `[Recursion] ${args.objective}`,
          status: 'queued',
          assignedSlave: args.assignedSlave,
          dependencies: '[]',
          result: '',
          createdAt: Date.now()
        });
        
        return `Successfully spawned subtask ${subtaskId}. The OS DAG engine will execute it concurrently.`;
      } catch (e: any) {
        return `Error spawning subtask: ${e.message}`;
      }
    }
  } as any),

  sendMessageToAgent: tool({
    description: 'Broadcast an ephemeral message to a PubSub channel (often the ID of another agent).',
    parameters: z.object({
      channel: z.string().describe('The channel to broadcast to. Use an agent ID like "coder_slave" to send directly to them.'),
      message: z.string().describe('The string message or JSON payload to send.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Sending message to channel: ${args.channel}`);
      try {
        const { AgentRegistry } = require('../engine/AgentRegistry');
        AgentRegistry.getInstance().publish(args.channel, args.message);
        return `Successfully sent message to ${args.channel}.`;
      } catch (e: any) {
        return `Failed to send message: ${e.message}`;
      }
    }
  } as any),

  waitForMessageFromAgent: tool({
    description: 'Pause execution and wait up to 30 seconds for an ephemeral message on a specific PubSub channel (usually your own agent ID).',
    parameters: z.object({
      channel: z.string().describe('The channel to listen on (e.g., your own agent ID).'),
      timeoutSeconds: z.number().optional().describe('How long to wait before timing out (max 60). Default 30.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Listening for message on channel: ${args.channel}`);
      try {
        const { AgentRegistry } = require('../engine/AgentRegistry');
        const timeout = (args.timeoutSeconds || 30) * 1000;

        return await new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            unsubscribe();
            resolve(`Timeout: No message received on ${args.channel} within ${timeout / 1000} seconds.`);
          }, timeout);

          const unsubscribe = AgentRegistry.getInstance().subscribe(args.channel, (message: any) => {
            clearTimeout(timeoutId);
            unsubscribe();
            onStatusUpdate(`> Received message on ${args.channel}`);
            resolve(`Received message: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
          });
        });
      } catch (e: any) {
        return `Failed to wait for message: ${e.message}`;
      }
    }
  } as any),

  recompileAndRebootOS: tool({
    description: 'Recompiles the Slave OS source code via pnpm build. If successful, triggers a hot-reload reboot of the Electron application to apply your self-evolved changes.',
    parameters: z.object({
      commitMessage: z.string().describe('A git commit message describing what you changed before triggering the reboot.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Checkpoint: Committing changes - "${args.commitMessage}"`);
      try {
        const repoPath = '/home/omkhalane/Desktop/slave';
        
        // Git checkpoint
        await execAsync('git add .', { cwd: repoPath });
        await execAsync(`git commit -m "${args.commitMessage}" || echo "Nothing to commit"`, { cwd: repoPath });
        
        onStatusUpdate(`> Self-Evolution: Recompiling OS Kernel...`);
        const { stdout, stderr } = await execAsync('pnpm build', { cwd: repoPath });
        
        onStatusUpdate(`> Compilation successful! Triggering OS reboot...`);
        const { AgentRegistry } = require('../engine/AgentRegistry');
        AgentRegistry.getInstance().publish('OS_REBOOT_REQUEST', { reason: args.commitMessage });
        
        return `Build successful. OS Reboot signal sent.`;
      } catch (e: any) {
        onStatusUpdate(`> Self-Evolution Failed: Compilation error.`);
        return `Build failed! The OS was NOT rebooted. Please fix the following errors and try again:\n\n${e.stdout}\n${e.stderr}`;
      }
    }
  } as any),

  storeMemory: tool({
    description: 'Commit a piece of information to the persistent Vector Knowledge Graph.',
    parameters: z.object({
      text: z.string().describe('The content to memorize.'),
      tags: z.array(z.string()).describe('List of tags to categorize the memory.')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Encoding memory to Vector Store...`);
      try {
        const { VectorStore } = require('../memory/VectorStore');
        const id = await VectorStore.getInstance().store(args.text, args.tags);
        return `Successfully encoded memory with ID: ${id}`;
      } catch (e: any) {
        return `Failed to encode memory: ${e.message}`;
      }
    }
  } as any),

  recallMemory: tool({
    description: 'Semantically search the persistent Vector Knowledge Graph for past memories or context.',
    parameters: z.object({
      query: z.string().describe('The search query or intent to match against past memories.'),
      topK: z.number().optional().describe('Number of results to return (default 3).')
    }),
    execute: async (args: any) => {
      onStatusUpdate(`> Querying Vector Store for "${args.query}"...`);
      try {
        const { VectorStore } = require('../memory/VectorStore');
        const results = await VectorStore.getInstance().search(args.query, args.topK || 3);
        if (results.length === 0) return 'No relevant memories found.';
        return JSON.stringify(results, null, 2);
      } catch (e: any) {
        return `Failed to query memory: ${e.message}`;
      }
    }
  } as any),

  takeScreenshot: tool({
    description: 'Capture a screenshot of the user\'s active display for Computer Vision tasks. Returns a base64 encoded PNG string.',
    parameters: z.object({}),
    execute: async () => {
      onStatusUpdate(`> Capturing active screen...`);
      try {
        const { AgentRegistry } = require('../engine/AgentRegistry');
        AgentRegistry.getInstance().publish('EYE_ACTIVE', { active: true });
        
        const screenshot = require('screenshot-desktop');
        const imgBuffer = await screenshot({ format: 'png' });
        const base64Image = imgBuffer.toString('base64');
        
        AgentRegistry.getInstance().publish('EYE_ACTIVE', { active: false });
        
        return `SCREENSHOT_CAPTURED: data:image/png;base64,${base64Image}`;
      } catch (e: any) {
        onStatusUpdate(`> Screen capture failed.`);
        return `Failed to capture screen: ${e.message}`;
      }
    }
  } as any)
  };

  return { ...coreTools, ...pluginTools };
};
