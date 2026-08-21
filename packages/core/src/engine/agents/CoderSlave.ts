import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';

export class CoderSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'coder_slave',
    name: 'Coder Agent',
    description: 'Expert at writing, reading, and refactoring source code files.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      readFile: allTools.readFile,
      writeFile: allTools.writeFile
    };
  }

  protected getSystemPrompt(): string {
    return `You are CoderSlave, an autonomous agent specialized in interacting with the filesystem.
You only have access to readFile and writeFile.
Accomplish the objective by creating or editing files. Think step-by-step.
Call the necessary tools and provide a final summary of your changes.`;
  }
}
