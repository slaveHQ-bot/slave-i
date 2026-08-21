# Skill Selection Protocol

The Main Agent (CTO/Orchestrator) determines the required skill composition for any given task.

## Selection Criteria
The Main Agent must determine skills based on:
- **Task type** (e.g., feature, bugfix, research)
- **Affected subsystem** (e.g., database, frontend)
- **Technologies involved** (e.g., React, SQLite, Electron)
- **Risk level**
- **Required verification**
- **Security sensitivity**
- **Performance sensitivity**

Do NOT rely only on keyword matching. Use semantic task classification.

## Composition Rules

Every task MUST include the `CORE` skills (elite-engineer, repo-explorer, task-executor, agent-protocol, evidence-reporter) unless explicitly exempted.

### Examples

**Frontend Task**:
`CORE` + `frontend` + `ui-ux` + `design-system` + `qa`

**Database Task**:
`CORE` + `database` + `memory` + `backend` + `qa` + `performance`

**LLM Task**:
`CORE` + `llm` + `agent-systems` + `security` + `qa`

**Security Task**:
`CORE` + `security` + `code-review` + `architecture-reviewer`

**Large Feature**:
`CORE` + `engineering-planner` + `architecture` + `domain skills` + `qa` + `security` + `review`

Agents must load only what is relevant to optimize context window and execution speed.
