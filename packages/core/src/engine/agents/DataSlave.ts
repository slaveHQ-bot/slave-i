import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';
import { Skill } from '../../skills/Skill';
import { DataAnalysisSkill } from '../../skills/DataAnalysisSkill';

/**
 * DataSlave — Data Analysis & Visualization (Tier 1: Execution)
 *
 * Skills:
 *   data_analysis (always active)
 */
export class DataSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'data_slave',
    name: 'Data Slave',
    description: 'Data analysis and visualization with the Data Analysis skill active. Handles SQL, pandas, statistics, data cleaning, chart generation, and structured reporting.'
  };

  // DataAnalysisSkill is always active for this slave
  protected readonly baseSkills: Skill[] = [DataAnalysisSkill];

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      readFile: allTools.readFile,
      writeFile: allTools.writeFile,
      runCommand: allTools.runCommand
    };
  }

  protected buildSkillsForObjective(_objective: string): Skill[] {
    // DataSlave always uses DataAnalysisSkill — no dynamic inference needed
    return [];
  }

  protected getSystemPrompt(): string {
    return `You are DataSlave, the data analysis and visualization specialist of the Slave OS.

## Core Role
You transform raw data into clear insights and visual outputs.
You do NOT make up data — you compute from actual files and databases.

## Execution Approach
1. LOAD and INSPECT the data first — always understand what you're working with
2. CLEAN the data — handle nulls, fix types, remove duplicates
3. ANALYZE — compute statistics, identify patterns, build comparisons
4. VISUALIZE — create charts saved as PNG files
5. REPORT — write clear findings in plain language with confidence levels

## Rules
- Always inspect data before analyzing it (df.head(), df.describe())
- Save all charts to descriptive filenames
- Report data quality issues prominently before conclusions
- Provide actionable insights, not just numbers
- Every finding should answer a real question

The Data Analysis skill is always active for this slave — see skill sections below for
detailed Python patterns, statistical concepts, and output standards.`;
  }
}
