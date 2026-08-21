import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';
import { Skill } from '../../skills/Skill';
import { FrontendSkill } from '../../skills/FrontendSkill';
import { BackendSkill } from '../../skills/BackendSkill';
import { DatabaseSkill } from '../../skills/DatabaseSkill';
import { DevOpsSkill } from '../../skills/DevOpsSkill';
import { TestingSkill } from '../../skills/TestingSkill';
import { SecurityAuditSkill } from '../../skills/SecurityAuditSkill';

/**
 * CodeSlave — Full Engineering Agent (Tier 1: Execution)
 *
 * Dynamically selects which engineering skill to apply based on the
 * objective text. Multiple skills can be active simultaneously.
 *
 * Skills:
 *   frontend · backend · database · devops · testing · security_audit
 */
export class CodeSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'code_slave',
    name: 'Code Slave',
    description: 'Full engineering agent with composable skill system: frontend, backend, database, DevOps, testing, security. Selects the right skill per task.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      readFile: allTools.readFile,
      writeFile: allTools.writeFile,
      runCommand: allTools.runCommand,
      recompileAndRebootOS: allTools.recompileAndRebootOS
    };
  }

  /**
   * Override skill inference to include all engineering skills.
   * SkillRegistry.inferSkills() handles the objective-based selection.
   */
  protected buildSkillsForObjective(objective: string): Skill[] {
    const { SkillRegistry } = require('../../skills/SkillRegistry');
    const inferred = SkillRegistry.getInstance().inferSkills(objective);
    // If no skill matched, default to frontend + backend as a safe fallback for generic "code" tasks
    if (inferred.length === 0) {
      return [FrontendSkill, BackendSkill];
    }
    return inferred;
  }

  protected getSystemPrompt(): string {
    return `You are CodeSlave, the engineering specialist of the Slave OS.

## Core Role
You execute precise, production-quality engineering tasks.
You do NOT plan or orchestrate — you implement.

## Execution Approach
1. READ existing files to understand the codebase structure before modifying anything
2. Identify the minimal changes required — avoid unnecessary rewrites
3. WRITE the implementation with clean, maintainable code
4. VERIFY by running build/typecheck/test commands
5. FIX any errors that arise — don't give up after the first failure
6. REPORT what was done, what files were changed, and any remaining issues

## Active Skill System
Your system prompt is augmented with the relevant engineering skill(s) for this specific task.
Read the skill sections carefully — they contain domain-specific rules and patterns.

## General Rules
- Always read files before editing them
- Run \`tsc --noEmit\` after TypeScript changes
- Use \`git diff\` to confirm what changed
- Write clear git commit messages
- Never delete files unless explicitly asked
- If stuck after 2 attempts, explain the specific blocker clearly`;
  }
}
