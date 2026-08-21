import { getDb, subtasks, runs } from '../../db';
import { MemoryManager } from '../../db/MemoryManager';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { Skill } from '../../skills/Skill';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
}

export abstract class BaseSlave {
  abstract readonly agentInfo: AgentInfo;

  /**
   * Optionally declare a fixed set of skills this slave always uses.
   * Slaves can also override buildSkillsForObjective() for dynamic selection.
   */
  protected readonly baseSkills: Skill[] = [];

  protected abstract getTools(onStatusUpdate: (msg: string) => void): Record<string, any>;
  protected abstract getSystemPrompt(): string;

  /**
   * Override this in subclasses to dynamically select skills per objective.
   * By default, uses the SkillRegistry to infer skills from the objective text.
   */
  protected buildSkillsForObjective(objective: string): Skill[] {
    try {
      const { SkillRegistry } = require('../../skills/SkillRegistry');
      return SkillRegistry.getInstance().inferSkills(objective);
    } catch {
      return [];
    }
  }

  /**
   * Compose the final system prompt by injecting active skill fragments.
   */
  private composeFinalSystemPrompt(objective: string): string {
    const basePrompt = this.getSystemPrompt();
    const inferredSkills = this.buildSkillsForObjective(objective);
    const allSkills = [...this.baseSkills, ...inferredSkills];

    if (allSkills.length === 0) return basePrompt;

    const skillSection = allSkills
      .map(s => s.systemPromptFragment.trim())
      .join('\n\n---\n\n');

    return `${basePrompt}\n\n---\n\n## Active Skills for This Task\n\n${skillSection}`;
  }

  async executeSubtask(subtaskId: string, objective: string, taskId: string, broadcastUpdate: (msg: string) => void, abortSignal?: AbortSignal): Promise<boolean> {
    const db = getDb();

    const runId = crypto.randomUUID();
    await db.insert(runs).values({
      id: runId,
      taskId,
      attempt: 1,
      startedAt: Date.now(),
      status: 'running'
    });

    const { tasks } = require('../../db/schema');
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    const options = task.metadata ? JSON.parse(task.metadata) : { providerId: 'openai', modelId: 'gpt-4o' };
    const { ProviderRegistry } = require('../../llm/ProviderRegistry');
    const provider = ProviderRegistry.getInstance().getProvider(options.providerId);
    if (!provider) throw new Error(`Provider not found: ${options.providerId}`);

    // Compose skill-aware system prompt
    const finalSystemPrompt = this.composeFinalSystemPrompt(objective);

    let userContent: any = `Objective: ${objective}`;
    if (options.attachments && options.attachments.length > 0) {
      userContent = [{ type: 'text', text: `Objective: ${objective}` }];
      for (const att of options.attachments) {
        if (att.type === 'image' && att.data) {
          userContent.push({ type: 'image', image: att.data });
        }
      }
    }
    let messages: any[] = [{ role: 'user', content: userContent }];
    const MAX_ATTEMPTS = 3;
    let finalResult = '';
    let success = false;

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (abortSignal?.aborted) throw new Error('AbortError');
      try {
        const tools = this.getTools(broadcastUpdate);

        if (attempt > 1) {
          broadcastUpdate(`> [${this.agentInfo.name}] Retrying subtask (Attempt ${attempt}/${MAX_ATTEMPTS})...`);
        }

        const { content: text, toolCalls, usage } = await provider.chat({
          modelId: options.modelId,
          abortSignal,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          messages: [
            { role: 'system', content: finalSystemPrompt },
            ...messages
          ],
          tools
        });

        if (usage) {
          totalPromptTokens += (usage as any).promptTokens || 0;
          totalCompletionTokens += (usage as any).completionTokens || 0;
        }

        finalResult = text || 'Tool execution completed.';
        messages.push({ role: 'assistant', content: text || '', toolCalls });

        if (toolCalls && toolCalls.length > 0) {
          let hasError = false;
          const toolResults: any[] = [];

          for (const call of toolCalls) {
            const tool = tools[call.toolName];
            if (tool && tool.execute) {
              broadcastUpdate(`> [${this.agentInfo.name}] Executing ${call.toolName}...`);
              try {
                const args = (call as any).args;
                const result = await tool.execute(args);
                finalResult += `\n[Tool Output ${call.toolName}]: ${JSON.stringify(result)}`;
                toolResults.push({ toolCallId: call.toolCallId, result });
              } catch (toolError: any) {
                broadcastUpdate(`> [${this.agentInfo.name}] Tool ${call.toolName} failed: ${toolError.message}`);
                toolResults.push({ toolCallId: call.toolCallId, result: `ERROR: ${toolError.message}` });
                hasError = true;
              }
            }
          }

          messages.push({ role: 'tool', content: toolResults });

          if (hasError) {
            errorCount++;
            messages.push({ role: 'user', content: 'Some tools returned errors. Please read the error messages and try to fix your command.' });
            continue;
          }
        }

        success = true;
        break;
      } catch (error: any) {
        if (error.name === 'AbortError') throw error;
        errorCount++;
        console.error(`[BaseSlave] Attempt ${attempt} failed:`, error);
        messages.push({ role: 'user', content: `Execution failed with error: ${error.message}. Please fix it and try again.` });
      }
    }

    const { telemetry } = require('../../db/schema');
    await db.insert(telemetry).values({
      id: crypto.randomUUID(),
      agentId: this.agentInfo.id,
      taskId,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      durationMs: Date.now() - startTime,
      errorCount,
      createdAt: Date.now()
    });

    if (success) {
      await db.update(subtasks).set({
        status: 'completed',
        outputs: JSON.stringify({ result: finalResult })
      }).where(eq(subtasks.id, subtaskId));

      const memoryManager = new MemoryManager();
      await memoryManager.saveMemory('task', taskId, `Subtask: ${objective}\nResult: ${finalResult}`);

      await db.update(runs).set({
        completedAt: Date.now(),
        status: 'completed'
      }).where(eq(runs.id, runId));

      broadcastUpdate(`[Task ${taskId}] ${this.agentInfo.name} completed subtask: ${objective}`);
      return true;
    } else {
      await db.update(runs).set({
        completedAt: Date.now(),
        status: 'failed',
        error: 'Exceeded MAX_ATTEMPTS'
      }).where(eq(runs.id, runId));
      return false;
    }
  }
}
