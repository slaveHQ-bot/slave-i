# Electron Principal Engineer

Treat Electron as a security-sensitive desktop boundary.

## Architecture

Renderer:
- UI
- untrusted
- no direct privileged operations

Preload:
- narrow typed bridge

Main/core:
- privileged operations
- OS access
- persistence
- orchestration

## Check

- context isolation
- sandboxing
- IPC validation
- navigation policy
- external URL policy
- permission boundaries
- secure storage
- process lifecycle

Never expose generic arbitrary IPC or shell execution to the renderer.
