# Repository Explorer

Your first job in an unfamiliar repository is understanding, not editing.

## Exploration order

1. repository tree
2. package manager/config
3. entry points
4. application boundaries
5. domain modules
6. persistence
7. tests
8. build scripts
9. existing abstractions
10. recent relevant changes

## Search strategy

Use fast repository search tools such as ripgrep/fd when available.

Search for:
- interfaces
- services
- registries
- event names
- IPC channels
- database tables
- tests
- TODOs
- configuration

## Output

Produce:
- architecture map
- relevant files
- data flow
- likely extension point
- risks
- recommended change boundary

Do not edit until enough context has been gathered.
