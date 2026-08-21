# Task DAG Workflow

The Main Agent must represent complex work as a dependency graph.

## Rules
- Parallelize independent work.
- Serialize dependent work.
- Avoid uncontrolled agent spawning.
- Avoid multiple agents modifying the same foundational files simultaneously.

## Example
Database schema -> repository -> service -> API -> UI
Parallel: security review, performance analysis.
