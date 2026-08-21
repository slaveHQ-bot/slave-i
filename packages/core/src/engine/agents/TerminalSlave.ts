import { BaseSlave, AgentInfo } from './BaseSlave';
import { getWorkerTools } from '../../llm/workerTools';

export class TerminalSlave extends BaseSlave {
  readonly agentInfo: AgentInfo = {
    id: 'terminal_slave',
    name: 'Terminal Agent',
    description: 'Expert at executing bash commands and analyzing CLI output.'
  };

  protected getTools(onStatusUpdate: (msg: string) => void): Record<string, any> {
    const allTools = getWorkerTools(onStatusUpdate);
    return {
      runCommand: allTools.runCommand
    };
  }

  protected getSystemPrompt(): string {
    return `You are TerminalSlave, an autonomous agent specialized in the command line interface.
You only have access to the runCommand tool.
Execute bash commands to accomplish the objective. Think step-by-step.
If you get an error, read it and try fixing your command. Provide a final summary.`;
  }
}
