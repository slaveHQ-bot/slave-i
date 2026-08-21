import { TaskEngine } from './TaskEngine';
import { getTools } from '../llm/tools';
import { AgentRuntime } from './AgentRuntime';
import { MemoryManager } from '../db/MemoryManager';
import { AgentRegistry } from './AgentRegistry';

/**
 * MainSlave — The Orchestrator (Tier 0: Control Plane)
 *
 * Think: CTO / Project Manager / Conductor
 *
 * MainSlave NEVER writes code, browses the web, or executes tasks directly.
 * It understands intent, delegates to the right slaves, monitors progress,
 * and delivers a final verified result to the user.
 *
 * Flow:
 *   User Intent
 *     → Understand + Reformulate
 *     → Query KnowledgeSlave for context
 *     → Delegate planning to TaskSlave
 *     → Dispatch subtasks to AgentRuntime (parallel DAG execution)
 *     → Collect results
 *     → Delegate verification to VerificationSlave
 *     → Store learnings in KnowledgeSlave
 *     → Deliver final response to user
 */
export class MainSlave {
  private engine: TaskEngine;

  constructor() {
    this.engine = new TaskEngine();
  }

  abortTask(taskId: string) {
    this.engine.abortTask(taskId);
  }

  async receiveIntent(intent: string, options: { providerId: string, modelId: string, temperature?: number, maxTokens?: number, attachments?: any[] }, onStatusUpdate: (msg: string) => void) {
    onStatusUpdate(`🧠 [PLANNING] Received intent: "${intent.slice(0, 120)}"`); 
    const taskId = await this.engine.createTask(intent, JSON.stringify(options));
    await this.engine.updateTaskStatus(taskId, 'running');

    const controller = new AbortController();
    this.engine.registerController(taskId, controller);

    try {
      const { ProviderRegistry } = require('../llm/ProviderRegistry');
      const provider = ProviderRegistry.getInstance().getProvider(options.providerId);
      if (!provider) throw new Error(`Provider not found: ${options.providerId}`);

      const memoryManager = new MemoryManager();
      const contextSummary = await memoryManager.getRelevantContext(intent);
      const availableAgents = JSON.stringify(AgentRegistry.getInstance().getAllAgents(), null, 2);

      // Query Vector Store for semantic memories
      let ragContext = '';
      try {
        const { VectorStore } = require('../memory/VectorStore');
        const semanticMemories = await VectorStore.getInstance().search(intent, 5);
        if (semanticMemories.length > 0) {
          ragContext = `\n\n<long_term_memory>\n${JSON.stringify(semanticMemories, null, 2)}\n</long_term_memory>`;
        }
      } catch (e) { /* VectorStore optional */ }

      onStatusUpdate(`🧠 [PLANNING] Analyzing intent, querying memory, and building execution graph...`);

      const { content: plan } = await provider.chat({
        modelId: options.modelId,
        abortSignal: controller.signal,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        messages: [
          {
            role: 'system',

            content: `You are Main Slave — the master orchestrator of a personal AI operating system called Slave OS.

## Your Identity
You are the CTO, the project manager, the conductor. 
You THINK, DELEGATE, COORDINATE, VERIFY, and FINISH.
You NEVER execute tasks yourself.

## Your Responsibilities
1. Understand the user's intent — even if vague or poorly worded
2. Reformulate it into a clear, precise objective
3. Decide if the task is simple (one slave) or complex (multiple slaves with dependencies)
4. Create subtasks using createSubtaskTool, assigning each to the right slave
5. Run independent subtasks in PARALLEL where possible
6. After execution: verify results are correct and complete
7. Determine what learnings should be stored for future use
8. Deliver a clean, user-friendly final response — no internal complexity exposed

## The Slave Hierarchy
### Tier 0 — Control Plane (use these for coordination)
- task_slave: Breaks complex objectives into a dependency graph. Use for multi-step planning.
- verification_slave: Independently validates outputs. Use ALWAYS at the end of complex tasks.

### Tier 1 — Execution Workers (use these to DO the work)
- browser_slave: Web browsing, search, scraping, web research, forms
- computer_slave: OS automation, native apps, screenshots, mouse/keyboard
- code_slave: Programming, debugging, git, tests, build systems
- research_slave: Deep research, competitive analysis, fact-checking, reports
- file_slave: PDF/DOCX/XLSX/CSV manipulation, file conversion
- data_slave: SQL, datasets, statistics, data cleaning, charts

### Tier 2 — Productivity (use for specialized output)
- creative_slave: UI/UX, copywriting, presentations, branding, design
- communication_slave: Emails, Slack, meetings, professional writing
- knowledge_slave: Memory storage and retrieval — the system's brain
- integration_slave: APIs, MCP tools, SaaS, webhooks, connectors
- security_slave: Permissions, risky action review, audit logs
- automation_slave: Recurring tasks, cron jobs, background workflows

## Subtask Assignment Rules
- Simple factual question → research_slave (or answer directly if trivial)
- "Build/code/fix" → code_slave (with verification_slave after)
- "Research/find/compare" → research_slave → data_slave (if comparison needed)
- "Design/write/create content" → creative_slave or communication_slave
- "Browse/check a website" → browser_slave
- "Schedule/automate" → automation_slave
- "Store/remember" → knowledge_slave
- Complex multi-step → TaskSlave to plan first, then delegate to execution slaves

## Rules
- NEVER say "I'll do that" and then do it yourself
- Always assign work to the appropriate slave
- Run independent subtasks in parallel (no dependency = parallel)
- End every complex task with a verification_slave subtask
- Ask the user ONLY if genuinely stuck (not just for confirmation)
- Final response should be clean, user-facing — hide internal agent details

## Current Context
Task ID: ${taskId}
Available Agents: ${availableAgents}
Memory Context: ${contextSummary}${ragContext}`
          },
          {
            role: 'user',
            content: `User Intent: "${intent}"

Create the subtasks needed to fulfill this intent. Use createSubtaskTool for each subtask.
Be strategic — parallel where possible, sequential only when required.
Always end with verification_slave if the task produced any output.`
          }
        ],
        tools: getTools()
      });

      onStatusUpdate(`🧠 [PLANNING] Execution graph created for task ${taskId}. Handing off to autonomous loop...`);

      // Hand off to the autonomous Execute→Verify→Correct loop
      const runtime = new AgentRuntime(onStatusUpdate);
      runtime.runTask(taskId, controller.signal).catch(err => {
        if (err.name !== 'AbortError') {
          console.error(`[AgentRuntime] Failed for task ${taskId}:`, err);
          onStatusUpdate(`[Main Slave] Execution error for task ${taskId}: ${err.message}`);
        } else {
          onStatusUpdate(`[Main Slave] Task ${taskId} aborted.`);
        }
      }).finally(() => {
        this.engine.unregisterController(taskId);
      });

      return taskId;
    } catch (error: any) {
      this.engine.unregisterController(taskId);
      if (error.name === 'AbortError') {
        onStatusUpdate(`[Main Slave] Task ${taskId} aborted during planning.`);
        return taskId;
      }
      console.error(`[MainSlave] Failed to plan task ${taskId}:`, error);
      await this.engine.updateTaskStatus(taskId, 'failed');
      onStatusUpdate(`[Main Slave] Failed to create plan: ${error.message}`);
      throw error;
    }
  }
}
