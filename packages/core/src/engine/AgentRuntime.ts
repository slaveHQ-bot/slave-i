import { getDb, subtasks, tasks } from '../db';
import { eq } from 'drizzle-orm';
import { AgentRegistry } from './AgentRegistry';
import { createLoopState, parseVerdictFromOutput, LoopState } from './LoopState';
import crypto from 'crypto';

const PHASE_PREFIX = {
  planning:   '🧠 [PLANNING]',
  executing:  '⚡ [EXECUTING]',
  verifying:  '🔍 [VERIFYING]',
  correcting: '🔄 [CORRECTING]',
  completed:  '✅ [COMPLETED]',
  failed:     '❌ [FAILED]'
};

export class AgentRuntime {
  private onStatusUpdate: (msg: string) => void;

  constructor(onStatusUpdate: (msg: string) => void) {
    this.onStatusUpdate = onStatusUpdate;
  }

  // ─── Public entry point ────────────────────────────────────────────────────
  async runTask(taskId: string, abortSignal?: AbortSignal) {
    const loop = createLoopState(taskId);
    await this._executeLoop(taskId, loop, abortSignal);
  }

  // ─── Autonomous loop: Execute → Verify → Correct → Repeat ─────────────────
  private async _executeLoop(taskId: string, loop: LoopState, abortSignal?: AbortSignal) {
    const db = getDb();

    for (let cycle = 0; cycle <= loop.maxCorrectionCycles; cycle++) {
      if (abortSignal?.aborted) throw new Error('AbortError');
      
      // ── Execute the current DAG ──────────────────────────────────────────
      loop.phase = 'executing';
      this.onStatusUpdate(`${PHASE_PREFIX.executing} Task ${taskId} — cycle ${cycle + 1}`);
      await this._runDag(taskId, abortSignal);

      // Check if the task itself failed at the DAG level
      const [taskRow] = await db.select().from(tasks).where(eq(tasks.id, taskId));
      if (taskRow?.status === 'failed') {
        loop.phase = 'failed';
        loop.completedAt = Date.now();
        this.onStatusUpdate(`${PHASE_PREFIX.failed} Task ${taskId} halted — a subtask could not be completed.`);
        return;
      }

      // ── Collect outputs from all completed subtasks ──────────────────────
      const allSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
      const completedSubs = allSubtasks.filter(s =>
        s.status === 'completed' && s.assignedSlave !== 'verification_slave'
      );

      if (completedSubs.length === 0) {
        loop.phase = 'completed';
        loop.completedAt = Date.now();
        loop.finalVerdict = 'PASS';
        loop.finalSummary = 'No executable subtasks were required.';
        this.onStatusUpdate(`${PHASE_PREFIX.completed} Task ${taskId} — nothing to verify.`);
        await db.update(tasks).set({ status: 'completed' }).where(eq(tasks.id, taskId));
        return;
      }

      // ── Verification pass ────────────────────────────────────────────────
      loop.phase = 'verifying';
      this.onStatusUpdate(`${PHASE_PREFIX.verifying} Task ${taskId} — VerificationSlave reviewing ${completedSubs.length} outputs...`);

      const outputSummary = completedSubs.map(s => {
        let result = '';
        try { result = JSON.parse(s.outputs || '{}').result || ''; } catch {}
        return `### Subtask: ${s.objective}\nAssigned to: ${s.assignedSlave}\nOutput:\n${result.slice(0, 800)}`;
      }).join('\n\n---\n\n');

      // Find original task objective
      const objective = taskRow?.intent || 'Unknown objective';

      // Create a verification subtask and run it
      const verifySubtaskId = crypto.randomUUID();
      await db.insert(subtasks).values({
        id: verifySubtaskId,
        taskId,
        objective: `Verify the following work was correctly done for the objective: "${objective}"\n\n${outputSummary}`,
        assignedSlave: 'verification_slave',
        status: 'queued',
        dependencies: JSON.stringify([])
      });

      const verificationAgent = AgentRegistry.getInstance().getAgent('verification_slave');
      let verificationOutput = '';

      if (verificationAgent) {
        await db.update(subtasks).set({ status: 'running' }).where(eq(subtasks.id, verifySubtaskId));
        const success = await verificationAgent.executeSubtask(
          verifySubtaskId,
          `Verify the following work was correctly done for the objective: "${objective}"\n\n${outputSummary}`,
          taskId,
          this.onStatusUpdate,
          abortSignal
        );

        if (success) {
          const [verifyRow] = await db.select().from(subtasks).where(eq(subtasks.id, verifySubtaskId));
          try {
            verificationOutput = JSON.parse(verifyRow?.outputs || '{}').result || '';
          } catch {}
        }
      }

      // ── Parse verdict ────────────────────────────────────────────────────
      const verdict = parseVerdictFromOutput(verificationOutput);

      this.onStatusUpdate(
        `${PHASE_PREFIX.verifying} Verdict: ${verdict.status} (confidence: ${verdict.confidence}%)${verdict.issues.length ? ` — Issues: ${verdict.issues.slice(0, 2).join('; ')}` : ''}`
      );

      if (verdict.status === 'PASS') {
        loop.phase = 'completed';
        loop.completedAt = Date.now();
        loop.finalVerdict = 'PASS';
        loop.finalSummary = verificationOutput.slice(0, 500);
        this.onStatusUpdate(`${PHASE_PREFIX.completed} Task ${taskId} verified successfully.`);
        await db.update(tasks).set({ status: 'completed' }).where(eq(tasks.id, taskId));
        return;
      }

      // ── Correction cycle ─────────────────────────────────────────────────
      if (cycle >= loop.maxCorrectionCycles) {
        // Exhausted correction attempts
        loop.phase = verdict.status === 'PARTIAL' ? 'completed' : 'failed';
        loop.completedAt = Date.now();
        loop.finalVerdict = verdict.status;
        loop.finalSummary = verificationOutput.slice(0, 500);
        const status = verdict.status === 'PARTIAL' ? 'completed' : 'failed';
        this.onStatusUpdate(
          verdict.status === 'PARTIAL'
            ? `${PHASE_PREFIX.completed} Task ${taskId} — partially complete. Max corrections reached.`
            : `${PHASE_PREFIX.failed} Task ${taskId} — failed after ${loop.maxCorrectionCycles} correction cycles.`
        );
        await db.update(tasks).set({ status }).where(eq(tasks.id, taskId));
        return;
      }

      // Create corrective subtasks
      loop.phase = 'correcting';
      this.onStatusUpdate(
        `${PHASE_PREFIX.correcting} Task ${taskId} — cycle ${cycle + 1}/${loop.maxCorrectionCycles}. Reason: ${verdict.recommendation.slice(0, 150)}`
      );

      // Re-queue failed subtasks with corrective context injected into the objective
      const failedSubs = allSubtasks.filter(s =>
        s.status === 'failed' || (verdict.issues.some(issue => s.objective?.includes(issue.slice(0, 30))))
      );

      if (failedSubs.length === 0) {
        // No specific subtasks identified — re-run all non-verification subtasks
        for (const sub of completedSubs) {
          const correctedObjective = `[CORRECTION CYCLE ${cycle + 1}] Previous attempt had issues: ${verdict.issues.join('; ')}. Fix: ${verdict.recommendation}\n\nOriginal objective: ${sub.objective}`;
          const newSubId = crypto.randomUUID();
          await db.insert(subtasks).values({
            id: newSubId,
            taskId,
            objective: correctedObjective,
            assignedSlave: sub.assignedSlave || 'code_slave',
            status: 'queued',
            dependencies: JSON.stringify([])
          });
        }
      } else {
        for (const sub of failedSubs) {
          const correctedObjective = `[CORRECTION CYCLE ${cycle + 1}] Previous attempt failed. Issues: ${verdict.issues.join('; ')}. Fix: ${verdict.recommendation}\n\nOriginal objective: ${sub.objective}`;
          const newSubId = crypto.randomUUID();
          await db.insert(subtasks).values({
            id: newSubId,
            taskId,
            objective: correctedObjective,
            assignedSlave: sub.assignedSlave || 'code_slave',
            status: 'queued',
            dependencies: JSON.stringify([])
          });
          // Reset task status to running so the DAG loop continues
          await db.update(tasks).set({ status: 'running' }).where(eq(tasks.id, taskId));
        }
      }

      loop.correctionCycles.push({
        cycle: cycle + 1,
        triggeredAt: Date.now(),
        reason: verdict.recommendation,
        verdicts: verdict.issues.map(issue => ({ subtaskId: '', objective: issue, assignedSlave: '', status: 'fail', issues: [issue], recommendation: verdict.recommendation })),
        newSubtaskIds: []
      });
    }
  }

  // ─── Inner DAG executor (parallel subtask runner) ──────────────────────────
  private async _runDag(taskId: string, abortSignal?: AbortSignal) {
    const db = getDb();
    this.onStatusUpdate(`⚡ [EXECUTING] Task ${taskId} — starting DAG execution.`);

    const MAX_CONCURRENT = 3;
    let runningPromises: Promise<boolean>[] = [];

    while (true) {
      const allSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

      // Only consider non-verification subtasks in this inner DAG pass
      const nonVerify = allSubtasks.filter(s => s.assignedSlave !== 'verification_slave');
      const pending = nonVerify.filter(s => s.status === 'queued' || s.status === 'running');
      if (pending.length === 0 && runningPromises.length === 0) break;

      const failed = nonVerify.filter(s => s.status === 'failed');
      if (failed.length > 0) {
        this.onStatusUpdate(`⚡ [EXECUTING] Task ${taskId} — halting DAG due to subtask failure.`);
        await db.update(tasks).set({ status: 'failed' }).where(eq(tasks.id, taskId));
        return;
      }

      const completedIds = new Set(nonVerify.filter(s => s.status === 'completed').map(s => s.id));
      const readySubtasks = nonVerify.filter(s => {
        if (s.status !== 'queued') return false;
        let deps: string[] = [];
        try { deps = JSON.parse(s.dependencies || '[]'); } catch {}
        return deps.every(depId => completedIds.has(depId));
      });

      while (runningPromises.length < MAX_CONCURRENT && readySubtasks.length > 0) {
        const sub = readySubtasks.shift()!;
        await db.update(subtasks).set({ status: 'running' }).where(eq(subtasks.id, sub.id));

        const agentId = sub.assignedSlave || 'code_slave';

        const { SwarmNode } = require('../network/SwarmNode');
        const node = SwarmNode.getInstance();
        const clients = node.server ? node.server.getConnectedClients() : [];

        if (node.isMaster && clients.length > 0) {
          const workerId = clients[Math.floor(Math.random() * clients.length)];
          this.onStatusUpdate(`⚡ [EXECUTING] Dispatching to remote worker ${workerId.slice(0, 8)}...`);

          const p = new Promise<boolean>((resolve) => {
            const handleMessage = (senderId: string, data: any) => {
              if (senderId === workerId && data.subtaskId === sub.id && data.action === 'subtaskResult') {
                node.server!.off('message', handleMessage);
                if (!data.success) {
                  db.update(subtasks).set({ status: 'failed' }).where(eq(subtasks.id, sub.id)).execute();
                }
                resolve(data.success);
              }
            };
            node.server!.on('message', handleMessage);
            node.server!.sendToClient(workerId, { action: 'executeSubtask', subtaskId: sub.id, objective: sub.objective, taskId, assignedSlave: agentId });
          });

          runningPromises.push(p.then(success => { runningPromises = runningPromises.filter(x => x !== p); return success; }));
        } else {
          const agent = AgentRegistry.getInstance().getAgent(agentId) || AgentRegistry.getInstance().getAgent('code_slave');
          if (!agent) {
            this.onStatusUpdate(`⚡ [EXECUTING] Error: Agent ${agentId} not found.`);
            await db.update(subtasks).set({ status: 'failed' }).where(eq(subtasks.id, sub.id));
            continue;
          }

          const p = agent.executeSubtask(sub.id, sub.objective, taskId, this.onStatusUpdate, abortSignal)
            .then(success => {
              runningPromises = runningPromises.filter(x => x !== p);
              if (!success) db.update(subtasks).set({ status: 'failed' }).where(eq(subtasks.id, sub.id)).execute();
              return success;
            });
          runningPromises.push(p);
        }
      }

      if (runningPromises.length > 0) {
        await Promise.race(runningPromises);
      } else if (pending.length > 0 && readySubtasks.length === 0) {
        this.onStatusUpdate(`⚡ [EXECUTING] Task ${taskId} — deadlock detected. Halting.`);
        await db.update(tasks).set({ status: 'failed' }).where(eq(tasks.id, taskId));
        return;
      }
    }

    this.onStatusUpdate(`⚡ [EXECUTING] Task ${taskId} — all subtasks executed.`);
  }
}
