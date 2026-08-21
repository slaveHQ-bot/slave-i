import { EventEmitter } from 'events';
import { BaseSlave, AgentInfo } from './agents/BaseSlave';

// Tier 0 — Control Plane
import { TaskSlave } from './agents/TaskSlave';
import { VerificationSlave } from './agents/VerificationSlave';

// Tier 1 — Execution Slaves
import { BrowserSlave } from './agents/BrowserSlave';
import { ComputerSlave } from './agents/ComputerSlave';
import { CodeSlave } from './agents/CodeSlave';
import { ResearchSlave } from './agents/ResearchSlave';
import { FileSlave } from './agents/FileSlave';
import { DataSlave } from './agents/DataSlave';

// Tier 2 — Productivity Slaves
import { CreativeSlave } from './agents/CreativeSlave';
import { CommunicationSlave } from './agents/CommunicationSlave';
import { KnowledgeSlave } from './agents/KnowledgeSlave';
import { IntegrationSlave } from './agents/IntegrationSlave';
import { SecuritySlave } from './agents/SecuritySlave';
import { AutomationSlave } from './agents/AutomationSlave';

export interface AgentTierInfo extends AgentInfo {
  tier: 0 | 1 | 2;
  tierName: 'Control Plane' | 'Execution' | 'Productivity';
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, BaseSlave> = new Map();
  public readonly bus = new EventEmitter();

  private constructor() {
    // Tier 0 — Control Plane
    this.registerAgent(new TaskSlave());
    this.registerAgent(new VerificationSlave());

    // Tier 1 — Execution
    this.registerAgent(new BrowserSlave());
    this.registerAgent(new ComputerSlave());
    this.registerAgent(new CodeSlave());
    this.registerAgent(new ResearchSlave());
    this.registerAgent(new FileSlave());
    this.registerAgent(new DataSlave());

    // Tier 2 — Productivity
    this.registerAgent(new CreativeSlave());
    this.registerAgent(new CommunicationSlave());
    this.registerAgent(new KnowledgeSlave());
    this.registerAgent(new IntegrationSlave());
    this.registerAgent(new SecuritySlave());
    this.registerAgent(new AutomationSlave());
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerAgent(agent: BaseSlave) {
    this.agents.set(agent.agentInfo.id, agent);
  }

  public getAgent(id: string): BaseSlave | undefined {
    return this.agents.get(id);
  }

  public getAllAgents(): AgentInfo[] {
    const list: AgentInfo[] = [];
    for (const agent of this.agents.values()) {
      list.push(agent.agentInfo);
    }
    return list;
  }

  public getAllAgentsWithTier(): AgentTierInfo[] {
    const tier0 = ['task_slave', 'verification_slave'];
    const tier1 = ['browser_slave', 'computer_slave', 'code_slave', 'research_slave', 'file_slave', 'data_slave'];

    const list: AgentTierInfo[] = [];
    for (const agent of this.agents.values()) {
      const id = agent.agentInfo.id;
      let tier: 0 | 1 | 2 = 2;
      let tierName: 'Control Plane' | 'Execution' | 'Productivity' = 'Productivity';
      if (tier0.includes(id)) { tier = 0; tierName = 'Control Plane'; }
      else if (tier1.includes(id)) { tier = 1; tierName = 'Execution'; }
      list.push({ ...agent.agentInfo, tier, tierName });
    }
    return list;
  }

  public getAgentsByTier(tier: 0 | 1 | 2): BaseSlave[] {
    const tier0 = ['task_slave', 'verification_slave'];
    const tier1 = ['browser_slave', 'computer_slave', 'code_slave', 'research_slave', 'file_slave', 'data_slave'];
    const result: BaseSlave[] = [];
    for (const [id, agent] of this.agents.entries()) {
      if (tier === 0 && tier0.includes(id)) result.push(agent);
      else if (tier === 1 && tier1.includes(id)) result.push(agent);
      else if (tier === 2 && !tier0.includes(id) && !tier1.includes(id)) result.push(agent);
    }
    return result;
  }

  public publish(channel: string, message: any) {
    this.bus.emit(channel, message);
  }

  public subscribe(channel: string, callback: (message: any) => void) {
    this.bus.on(channel, callback);
    return () => this.bus.off(channel, callback);
  }
}
