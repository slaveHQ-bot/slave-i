# Git Worktree Workflow for Agents

Agents working in parallel must NEVER modify the same mutable working tree.

## Creation
To spawn an isolated environment for a feature or bugfix:
`git worktree add ../slave-feature-name -b feature/branch-name`

## Guidelines
- Isolate independent tasks (e.g. `worktree-agent-ui`, `worktree-agent-backend`).
- Do not create worktrees for tiny tasks (e.g., single file typo fixes).
- Clean up after integration: `git worktree remove ../slave-feature-name`.
