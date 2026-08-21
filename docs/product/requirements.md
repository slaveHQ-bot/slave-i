# Slave Product Requirements

## Core requirement

A user should be able to give Main Slave a natural-language goal without manually selecting agents, models, or tools.

## Core capabilities

### Main Slave
- understand intent
- retrieve context
- retrieve memory
- analyze required capabilities
- plan
- delegate
- parallelize
- recover
- verify
- learn
- communicate

### Specialized Slaves
- reusable capability-focused agents
- dynamic task-specific agents
- explicit capabilities
- explicit permissions
- model policies
- memory scopes

### Task system
- tasks separate from conversations
- DAG/task graph
- dependencies
- parallel execution
- cancellation
- retries
- checkpoints
- persistence
- lifecycle states

### Memory
- user memory
- project memory
- conversation memory
- task memory
- agent memory
- system/operational memory
- confidence
- importance
- provenance
- scope
- sensitivity
- expiration

### Personalization
- communication preferences
- execution preferences
- model preferences
- tool preferences
- project rules
- confirmation behavior

### Learning
- learn from corrections
- learn repeated workflows
- learn tool reliability
- learn model performance
- confidence-scored changes
- reversible/editable learning

### Models
- BYOK
- multiple providers
- custom endpoints
- local models
- streaming
- tool calling
- vision
- capability metadata
- model routing

### Tools
- unified registry
- schemas
- capability declarations
- permissions
- timeouts
- retries
- provenance
- versioning

### Integrations
- OAuth/account connections
- APIs
- MCP
- plugins
- local applications
- browser

### Accuracy
- evidence
- deterministic validation
- independent verification
- structured outputs
- confidence
- explicit failure states

### Local-first
Local:
- state
- memory
- settings
- permissions
- credentials references
- task state
- conversation history

Cloud access is optional and explicit.

## UX

Default UX is simple:
- one central task input
- streaming response
- progress when useful
- inspectable execution
- clear approval requests
- clear failures
- easy cancellation

Advanced users can inspect:
- plan
- agents
- models
- tools
- context
- memory
- permissions
- events
- verification
