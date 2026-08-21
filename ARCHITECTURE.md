# Slave Architecture

## Product

Slave is a local-first personal agent operating system.

## Core model

User
→ Intent
→ Context + Memory
→ Capability analysis
→ Plan
→ Task graph
→ Slave team
→ Tools + Models
→ Verification
→ Learning/Memory
→ Result

## Major subsystems

- Desktop application
- Main Slave orchestrator
- Task engine
- Agent registry/runtime
- Capability registry
- Tool runtime
- Model/provider system
- Memory system
- Context engine
- Permission engine
- MCP runtime
- Integration runtime
- Browser/computer control
- Persistence
- Observability
- Verification

## Desktop boundary

Renderer:
- UI only
- untrusted
- no direct secrets
- no direct privileged OS operations

Main process/core:
- privileged orchestration
- database
- secrets integration
- tools
- agent runtime
- model providers
- permissions

## Initial stack

- Electron
- TypeScript
- React
- pnpm workspace
- SQLite
- Drizzle or equivalent typed database layer
- Zod or equivalent runtime validation
- Vitest
- Playwright

Use the smallest infrastructure that satisfies the requirement. Do not introduce distributed infrastructure prematurely.
