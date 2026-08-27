# SLAVE Solution Book — Agent Master Index

> START HERE. This is the navigation and execution contract for every coding agent working on SLAVE.

## Mission

Build SLAVE as a production-grade, open-source, local-first, BYOK, AI-first desktop environment. It must be a real agent system, not a static chatbot UI. The desktop must connect to the real agent/core runtime and expose real tools, computer use, tasks, scheduling, projects, memory, permissions, and extensibility.

## Golden Rule — Never Code Blindly

For **every** feature, bug fix, refactor, UI change, integration, or dependency change:

1. Locate every relevant folder/file/module/package/test.
2. Read and understand the existing implementation.
3. Trace callers, state, persistence, IPC/API boundaries, dependencies, and runtime flow.
4. Identify what is working, partial, duplicated, mocked, stale, or disconnected.
5. Compare the requested design with the current implementation.
6. Decide `KEEP`, `MODIFY`, `REPLACE`, or `CREATE`.
7. If the current implementation is more optimal, complete, reliable, performant, or better integrated, **KEEP IT** and wire/adapt it instead of rewriting it.
8. Implement the smallest safe change.
9. Wire the entire path: UI → IPC/API → service/domain → core/agent → provider/tool → persistence → events/state → UI.
10. Add validation, error, loading, empty, cancellation, and permission behavior.
11. Run focused tests.
12. Test every connection touched by the change.
13. Build/package the affected application.
14. Run regression/E2E tests.
15. Fix failures; never hide them with mocks, skipped tests, or fake success states.
16. Search for stale references, dead code, duplicate implementations, old branding, broken imports, and unused dependencies.
17. Update documentation/ADR when architecture changes.
18. Commit only after the feature genuinely works.

## Source-of-Truth Hierarchy

1. Working code + passing tests.
2. Current architecture and ADRs.
3. This index and implementation protocol.
4. Feature specifications.
5. Older plans/screenshots.

The plan must never force replacement of a superior existing implementation.

## Repository Map

```text
/
├── AGENT_ROSTER.md
├── SKILL_AUDIT.md
├── task.md                         # broad product/UI/agent specification
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── run.sh
├── apps/
│   ├── AGENTS.md
│   └── desktop/                    # desktop application
├── packages/
│   ├── AGENTS.md
│   └── core/                       # core/domain/runtime area
├── skills/                         # skills/capabilities
└── docs/
    ├── SLAVE-SOLUTION-INDEX.md     # this file — START HERE
    ├── SLAVE-SOLUTION-BOOK.md      # phases + roadmap
    ├── AGENT-CAPABILITY-SYNC.md    # cross-repository agent capability audit
    ├── AGENT-IMPLEMENTATION-PROTOCOL.md
    ├── FEATURE-REGISTRY.md
    ├── architecture/
    ├── security/
    ├── testing/
    ├── operations/
    └── decisions/
```

This map is a navigation baseline only. Never assume a file exists; inspect the current tree first. The repository currently contains `apps/desktop`, `packages/core`, `skills`, `task.md`, and workspace/package configuration.

## What to Read

| Work | Read first | Then inspect |
|---|---|---|
| Overall roadmap | `docs/SLAVE-SOLUTION-BOOK.md` | relevant phase + code |
| Agent capability synchronization | `docs/AGENT-CAPABILITY-SYNC.md` | `.agents` source + implementation |
| Agent implementation rules | `docs/AGENT-IMPLEMENTATION-PROTOCOL.md` | code + tests |
| Feature requirements | `docs/FEATURE-REGISTRY.md` | actual implementation |
| Existing full product spec | `task.md` | desktop/core |
| Agents | `AGENT_ROSTER.md` | agent modules |
| Skills | `SKILL_AUDIT.md` | `skills/` |
| Desktop | `apps/AGENTS.md` | `apps/desktop/` |
| Core | `packages/AGENTS.md` | `packages/core/` |
| Security | `docs/security/` | permissions/tools |
| Architecture | `docs/architecture/`, `docs/decisions/` | actual code |
| Testing | `docs/testing/` | test suites |
| Release | `docs/operations/` | build/package scripts |

## Agent Synchronization Contract

The reusable agent-governance repository is `slaveHQ-bot/.agents`. Its registry and roadmap describe target capabilities; they do **not** prove runtime implementation.

Every future agent audit must compare:

`agent definition → capability/lifecycle contract → roadmap category → implementation → tests/evals → Solution Book`

The current canonical `.agents` repository contains governance and capability documents but no discrete specialist-agent definition files in a dedicated agent directory. Until such definitions are discoverable, per-agent parity must be reported as `UNVERIFIED TARGET` rather than assumed.

### Synchronized orchestration requirements

The Solution Book must account for these agent-system requirements:

- common specialist lifecycle: capabilities, health, plan, execute, observe, evaluate, cancel
- capability-driven specialist selection using domain, tools, health, permissions, budget, dependencies, and evaluation history
- structured specialist results containing status, output, evidence/artifacts, actions, tools, warnings, errors, quality signals, and recommended next action
- sequential, parallel, conditional, dependent, retryable, approval-gated, scheduled, event-triggered, and human-escalated execution graphs
- configurable time, model/token, tool-call, concurrency, retry, and output/artifact budgets
- explicit failure taxonomy before automatic recovery
- evidence-based multi-agent review and final conflict resolution owned by Master SLAVE

These requirements are tracked in `docs/AGENT-CAPABILITY-SYNC.md` and must be mapped to implementation tasks before being marked complete.

### Known limitations and exclusions

- The agent registry is conceptual and cannot be treated as proof of implementation, registration, health, or test coverage.
- No per-agent feature/limitation parity can be claimed until discrete agent definitions are available from the canonical agent source.
- `docs/SLAVE-SOLUTION-BOOK.md` and `docs/SLAVE-SOLUTION-INDEX.md` are the implementation repository's canonical Solution Book documents; a generic `docs/SOLUTION_BOOK.md` or `docs/ROADMAP.md` must not be assumed to exist.
- The roadmap is target state. Current implementation status requires code and verification evidence.
- Concrete lifecycle method names, APIs, paths, registrations, and integrations must be verified in `slave-i` before implementation claims are made.
- Automatic retry/repair must remain bounded and cannot bypass authorization, permissions, secrets controls, or safety policy.
- Optional cloud and remote integrations must remain explicitly user-controlled and cannot become mandatory for local operation.

## Phase Index

0. Baseline, governance, CI, reproducible build/test
1. Deep VS Code/OpenClaw codebase archaeology
2. Remove inherited Microsoft/vendor auth and service blockers
3. SLAVE branding, black design system, official assets
4. Desktop/core/IPC/agent architecture boundaries
5. BYOK and provider abstraction
6. Real desktop ↔ agent-core integration
7. Production chat, context, commands, history
8. Tools and computer use
9. Tasks, nested execution, scheduling, automation
10. Projects, memory, local data, import/export
11. Customization, extensions, plugins, integrations
12. Windows/macOS/Linux packaging and distribution
13. Security, permissions, secrets, prompt-injection defenses
14. Full-system E2E/golden-user-journey verification
15. Performance, reliability, recovery, scalability
16. Documentation, release engineering, contribution system

## Stable Feature IDs

`PLAT-001` Desktop shell  
`PLAT-002` Navigation/workspaces  
`AUTH-001` Local profile/configuration  
`AUTH-002` Remove inherited vendor authentication  
`BRAND-001` Design tokens/theme  
`BRAND-002` Official logo/brand-kit integration  
`AI-001` Provider abstraction  
`AI-002` BYOK credentials  
`AI-003` Agent runtime bridge  
`AI-004` Streaming/events  
`CHAT-001` Chat lifecycle  
`CHAT-002` Context references  
`CHAT-003` Slash commands  
`AGENT-001` Agent registry  
`AGENT-002` Agent builder  
`AGENT-003` Master orchestration  
`AGENT-004` Multi-agent execution  
`TASK-001` Task lifecycle  
`TASK-002` Nested execution  
`TASK-003` Scheduler  
`TOOL-001` Tool registry  
`TOOL-002` Filesystem  
`TOOL-003` Terminal/code execution  
`TOOL-004` Browser  
`TOOL-005` Computer use  
`PERM-001` Permission engine  
`PERM-002` Approval requests  
`PERM-003` Autonomy modes  
`DATA-001` Local storage  
`DATA-002` Projects  
`DATA-003` Memory  
`DATA-004` Backup/import/export  
`FILE-001` File workspace  
`ART-001` Artifacts  
`KNOW-001` Knowledge/retrieval  
`EXT-001` Extensions/plugins  
`INT-001` Integrations/connections  
`OPS-001` Packaging/release  
`SEC-001` Threat model  
`SEC-002` Secret handling  
`SEC-003` Prompt-injection defenses  
`TEST-001` Test infrastructure  
`TEST-002` E2E journeys  
`PERF-001` Performance/reliability

## Universal Feature Workflow

```text
Feature ID
  ↓
Read requirement
  ↓
Find existing implementation
  ↓
Trace dependency/runtime graph
  ↓
KEEP / MODIFY / REPLACE / CREATE decision
  ↓
Implementation plan
  ↓
Core/domain changes
  ↓
UI changes
  ↓
IPC/API + events + state + persistence wiring
  ↓
Permissions/security
  ↓
Focused tests
  ↓
Connection/integration tests
  ↓
Build/package
  ↓
E2E/regression
  ↓
Fix
  ↓
Re-scan codebase
  ↓
Document
  ↓
Commit
```

## KEEP / MODIFY / REPLACE / CREATE

**KEEP:** existing behavior already satisfies the requirement or is better than the proposed design.

**MODIFY:** existing architecture is correct but needs SLAVE behavior, missing wiring, branding, persistence, security, or UX changes.

**REPLACE:** only when existing code is fundamentally incompatible, broken beyond reasonable repair, vendor-locked, unsafe, or architecturally unsuitable.

**CREATE:** only when the capability genuinely does not exist or cannot be safely derived from existing code.

## Feature Completion Record

Every completed feature must document:

- feature ID and expected behavior
- files/modules inspected
- existing implementation discovered
- KEEP/MODIFY/REPLACE/CREATE decision and reason
- files changed/created/deleted
- dependencies affected
- UI → core → tool/provider → storage connection
- permission/security impact
- focused tests
- integration tests
- build/package result
- E2E/regression result
- known limitations
- documentation/ADR updates

## Definition of Done

A feature is not done because a screen looks correct. It is done only when its real behavior works, all intended connections are wired, state/persistence is correct, permissions are enforced, errors are handled, tests pass, the application builds, and the existing system has been regression-checked.

## Branding Input Gate

When final branding is required, request the user's official assets instead of inventing a final identity:

- primary SLAVE logo SVG
- light/dark/monochrome/icon variants
- app icon/favicon SVG/source
- brand colors/brand kit
- fonts and licenses
- avatar/character assets if used
- wordmark rules
- splash/loading artwork
- Windows/macOS/Linux icons

Temporary assets may be used during development but must be marked provisional.

## Next Action for Any Agent

Read this file → read the relevant phase/feature document → read `docs/AGENT-CAPABILITY-SYNC.md` when agent behavior is involved → inspect the actual repository → trace the existing implementation → decide KEEP/MODIFY/REPLACE/CREATE → implement → wire → test → build → regression test → fix → document → commit.
