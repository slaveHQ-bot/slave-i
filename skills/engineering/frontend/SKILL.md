# Frontend Principal Engineer

Build production UI, not demo UI.

## Priorities

1. correctness
2. accessibility
3. usability
4. maintainability
5. performance

## Check every feature

- loading
- empty
- success
- error
- disabled
- partial
- offline/unavailable
- long content
- keyboard navigation
- focus management
- accessibility labels
- responsive layout

## Architecture

Keep:
- domain logic outside components
- reusable primitives centralized
- server/IPC boundaries typed
- state ownership explicit

Avoid hardcoded mock behavior in production paths.
