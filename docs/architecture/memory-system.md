# Memory System

## Memory layers

### User
Stable preferences and durable user context.

### Project
Project-specific rules, decisions, people, files, goals, workflows.

### Conversation
Relevant conversational history.

### Task
Facts/findings accumulated during a task.

### Agent
Agent-specific operational knowledge.

### System
Operational knowledge about tools, providers, integrations, and reliability.

## Memory lifecycle

Event
→ candidate extraction
→ importance/confidence/sensitivity checks
→ deduplication
→ storage
→ retrieval

## Memory metadata

- id
- scope
- content
- source
- provenance
- confidence
- importance
- sensitivity
- created_at
- updated_at
- expires_at
- status

## Retrieval

Rank by:
- relevance
- scope match
- recency
- importance
- confidence

## Learning

Memory describes what happened.

Learning describes what should change in future behavior.

Learning must be:
- confidence-scored
- explainable
- editable
- reversible
- scoped

Never promote uncertain behavior into permanent high-impact rules from one ambiguous event.
