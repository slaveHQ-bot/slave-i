# Context Compaction Protocol

When a task involves exploring many files, running many tests, or generating extensive logs, the agent's context window will bloat.

## When to Compact
- The agent has been running for an extended time.
- The task is branching into a new subsystem.
- Significant test logs have been read.

## Compaction Procedure
Do NOT continue indefinitely. Create a compact context artifact in `.agent-work/context/<task-id>.md` containing:
- Goal
- Current State
- Important findings
- Architecture
- Changed files
- Decisions
- Remaining work

Then continue with a fresh context utilizing only this compact artifact.
