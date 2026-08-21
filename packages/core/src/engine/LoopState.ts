/**
 * LoopState — Autonomous Agent Loop Lifecycle Tracker
 *
 * Tracks every phase of the Understand→Act→Observe→Verify→Correct→Repeat→Finish loop.
 * Attached to each task run; serialized into the task's outputs column when complete.
 */

export type LoopPhase =
  | 'planning'
  | 'executing'
  | 'verifying'
  | 'correcting'
  | 'completed'
  | 'failed';

export interface SubtaskVerdict {
  subtaskId: string;
  objective: string;
  assignedSlave: string;
  status: 'pass' | 'partial' | 'fail';
  issues: string[];
  recommendation: string;
}

export interface CorrectionCycle {
  cycle: number;
  triggeredAt: number;
  reason: string;
  verdicts: SubtaskVerdict[];
  newSubtaskIds: string[];
}

export interface LoopState {
  taskId: string;
  phase: LoopPhase;
  startedAt: number;
  completedAt?: number;
  correctionCycles: CorrectionCycle[];
  maxCorrectionCycles: number;
  finalVerdict?: 'PASS' | 'PARTIAL' | 'FAIL';
  finalSummary?: string;
}

export function createLoopState(taskId: string): LoopState {
  return {
    taskId,
    phase: 'planning',
    startedAt: Date.now(),
    correctionCycles: [],
    maxCorrectionCycles: 2
  };
}

export function parseVerdictFromOutput(output: string): {
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  confidence: number;
  issues: string[];
  recommendation: string;
} {
  // Parse the structured verdict block from VerificationSlave's output
  // ```verdict\nSTATUS: PASS\nCONFIDENCE: 90\nISSUES: [...]\nRECOMMENDATION: ...\n```
  const statusMatch   = output.match(/STATUS:\s*(PASS|PARTIAL|FAIL)/i);
  const confMatch     = output.match(/CONFIDENCE:\s*(\d+)/i);
  const issuesMatch   = output.match(/ISSUES:\s*([\s\S]*?)(?=RECOMMENDATION:|$)/i);
  const recMatch      = output.match(/RECOMMENDATION:\s*([\s\S]*?)(?=```|$)/i);

  const status = (statusMatch?.[1]?.toUpperCase() || 'FAIL') as 'PASS' | 'PARTIAL' | 'FAIL';
  const confidence = parseInt(confMatch?.[1] || '50', 10);
  const issuesRaw = issuesMatch?.[1]?.trim() || '';
  const issues = issuesRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l !== '[]' && !l.startsWith('['));
  const recommendation = recMatch?.[1]?.trim() || '';

  return { status, confidence, issues, recommendation };
}
