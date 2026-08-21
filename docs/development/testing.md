# Testing Strategy

## Layers

### Unit
Pure logic:
- routing
- memory ranking
- permission evaluation
- task state transitions
- schemas
- parsers

### Integration
- database
- provider adapters
- tool runtime
- MCP
- permissions
- agent runtime

### E2E
- desktop UI
- task creation
- streaming
- approval
- cancellation
- agent execution
- persistence
- recovery

## Rule

Every bug fix should add a regression test when practical.

## CI

Every PR should run:
- install
- lint
- typecheck
- tests
- build where applicable
