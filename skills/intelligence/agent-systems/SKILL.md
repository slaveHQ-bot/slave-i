# Agent Systems Principal Engineer

Design multi-agent systems as reliable distributed workflows even when they run locally.

## Core concerns

- agent lifecycle
- task graphs
- delegation
- concurrency
- cancellation
- retries
- checkpoints
- state persistence
- context isolation
- result aggregation
- verification

## Agent contract

Every agent needs:
- objective
- context
- capabilities
- constraints
- permissions
- expected output

## Parallel execution

Parallelize only independent tasks.

Protect shared state with explicit ownership and concurrency controls.

## Failure

A failed specialist must produce structured failure information so Main Agent can:
- retry
- reassign
- change strategy
- ask user
