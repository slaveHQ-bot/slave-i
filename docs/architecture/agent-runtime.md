# Agent Runtime

## Agent types

1. Main Slave
2. Persistent specialized Slave
3. Dynamic task-specific Slave

## Agent definition

An agent definition should include:
- id
- name
- description
- capabilities
- tools
- model policy
- instructions
- memory scope
- permission policy
- version
- source
- status

## Lifecycle

created
→ initialized
→ ready
→ running
→ waiting/blocked
→ verifying
→ completed/failed/cancelled
→ destroyed for temporary agents

## Agent isolation

Agents receive scoped:
- context
- tools
- permissions
- memory

Do not expose the entire application state by default.

## Output contract

Every agent result should contain:
- status
- summary
- outputs/artifacts
- evidence where applicable
- errors
- confidence
- verification status
