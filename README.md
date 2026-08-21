# Slave OS

Slave OS is a powerful, local-first, multi-agent operating system built on Electron and React. It provides a highly concurrent environment where specialized AI agents collaborate to execute complex workflows.

## Features

- **Dynamic Task Engine & DAG Execution**: 
  When you submit an intent to the `MainSlave` orchestrator, it dynamically breaks the task down into a Directed Acyclic Graph (DAG). Subtasks are executed concurrently based on their dependency resolution.
- **Agent Registry & Specialization**: 
  Instead of a monolithic AI worker, the OS utilizes an `AgentRegistry` of specialized experts (e.g., `CoderSlave` for file I/O, `TerminalSlave` for bash execution). Subtasks are intelligently routed to the best-equipped agent.
- **AI Error Recovery (Resilience)**:
  If a specialized agent makes a mistake (like executing invalid bash syntax), the engine catches the exception and feeds the error back to the agent, allowing it up to 3 attempts to self-correct before failing the node.
- **OS Memory Persistence**:
  Tasks, subtasks, agent capabilities, and run logs are preserved in a local SQLite database (`better-sqlite3` via Drizzle ORM). The context of previous tasks is summarized and passed back into the OS memory for continuous learning.
- **Beautiful Glassmorphic UI**:
  A modern, premium interface providing real-time visualization of the Task Graph (DAG), Memory Inspector, and active Agent Roster.

## Architecture

Slave OS is a standard turborepo monorepo consisting of:

- `apps/desktop/`: The Electron host environment and the React renderer interface.
- `packages/core/`: The core operating system runtime, including the `TaskEngine`, `AgentRuntime`, `AgentRegistry`, SQLite Schema, and Vercel AI SDK integration.

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)

### Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```

3. **Configure API Key**
   Once the desktop app opens, click the "Settings" gear in the sidebar. Enter your OpenAI API Key. It will be stored securely on your local device.

### Usage

1. **Submit an Intent**: In the "Main Orchestrator" chat window, type your goal (e.g., "Check my node version and write a hello world typescript file").
2. **Watch the DAG**: Switch to the **Task Graph** tab to watch the AI orchestrator break down your intent and spin up concurrent agents to handle the subtasks.
3. **Inspect Memories**: Switch to the **Memory** tab to view the insights and context the OS has saved from completed runs.
4. **View Agents**: Switch to the **Agents** tab to see the active roster of specialized agents available to the OS.

## Customization

To add a new specialized agent to Slave OS:
1. Create a new subclass of `BaseSlave` in `packages/core/src/engine/agents/`.
2. Define its specific system prompt and capabilities (tools).
3. Register the agent in `packages/core/src/engine/AgentRegistry.ts`.
4. The `MainSlave` orchestrator will instantly recognize the new capability and begin routing subtasks to your agent!

## License
MIT
# raw
# slave
