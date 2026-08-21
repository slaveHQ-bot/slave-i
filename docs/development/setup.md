# Development Setup

## Recommended base

- Ubuntu
- Git
- GitHub CLI
- Node.js
- pnpm
- Python/uv where needed
- Docker only when needed
- tmux
- ripgrep/fd/fzf/jq

## Repository

Canonical working directory:

~/dev/slave

Keep experiments outside the main repository.

## Initial validation

The project should expose simple commands:

pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm check

`pnpm check` should be the primary pre-commit validation command and should run the appropriate fast checks.
