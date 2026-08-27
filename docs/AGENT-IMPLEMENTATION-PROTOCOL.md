# SLAVE Agent Implementation Protocol

This protocol is mandatory for every feature, bug fix, refactor, UI change, integration, and dependency change.

## 1. Investigate Before Coding

1. Read the relevant feature requirement in `docs/FEATURE-REGISTRY.md` and `task.md`.
2. Inspect the current repository tree.
3. Read relevant `AGENTS.md` instructions.
4. Find existing implementations by filename, symbol, route, command, event, schema, service, and dependency.
5. Read existing tests first.
6. Trace callers, state, persistence, IPC/API, providers, tools, and runtime registration.
7. Identify working, partial, mocked, duplicated, stale, and disconnected functionality.

Use this assessment:

```text
Requirement:
Existing implementation:
Existing tests:
Runtime path:
Persistence:
UI:
IPC/API:
Dependencies:
Problems:
Missing connections:
Decision: KEEP / MODIFY / REPLACE / CREATE
Reason:
```

## 2. Optimization Rule

The written plan defines the required outcome, not a mandatory rewrite. If the current implementation is more optimal, complete, reliable, performant, maintainable, or better integrated than the proposed implementation:

**KEEP IT. Wire/adapt it to SLAVE. Do not rewrite it merely to match the document.**

Never create a second implementation of an existing domain capability without proving the existing one cannot satisfy the requirement.

## 3. Implementation

After investigation:

1. Choose KEEP/MODIFY/REPLACE/CREATE.
2. Define the smallest safe change.
3. Implement domain/core behavior where appropriate.
4. Implement UI behavior.
5. Connect state and persistence.
6. Connect IPC/API boundaries.
7. Connect agent/provider/tool/integration paths.
8. Connect permissions and approval behavior.
9. Implement loading, empty, error, retry, timeout, and cancellation states.
10. Remove production mocks/fake success states.

## 4. Wiring Contract

Every feature must be traceable through:

```text
User action
 ↓
UI / command
 ↓
State/action
 ↓
IPC/API
 ↓
Desktop/core service
 ↓
Domain / agent runtime
 ↓
Provider / tool / integration
 ↓
Persistence (when required)
 ↓
Result / event / error
 ↓
IPC/API
 ↓
UI state
 ↓
User-visible result
```

If any required link is missing, the feature is incomplete.

## 5. Test Contract

After every meaningful implementation:

### Focused test
Test the changed function/component/service and normal + failure paths.

### Connection tests
Test every touched boundary:

- UI → state
- state → IPC/API
- IPC/API → service
- service → core/agent
- core → tool/provider
- result/event → UI
- persistence → reload/restart

### Build
Run the affected build/package process.

### Runtime
Launch the desktop app for desktop changes and verify the actual interaction.

### Regression
Run the broader relevant suite and critical E2E journey.

## 6. Failure Protocol

When anything fails:

1. Capture exact failure.
2. Find root cause.
3. Fix root cause.
4. Re-run focused tests.
5. Re-run integration tests.
6. Re-run build.
7. Re-run regression.
8. Check for secondary regressions.

Never fix a failure by skipping tests, weakening assertions without justification, hiding errors, replacing real functionality with mocks, or deleting coverage.

## 7. Safe Deletion / Refactor

Before deleting anything, search:

- imports/references
- dynamic references
- configuration
- IPC/events
- tests
- package dependencies
- runtime registration
- documentation

After deletion:

- search again
- remove dead dependencies
- rebuild
- test
- launch/verify runtime where relevant

## 8. Auth and Vendor-Service Removal

For inherited authentication/services:

1. Find UI entry points.
2. Find commands/actions.
3. Find service interfaces.
4. Find IPC/RPC.
5. Find token/state storage.
6. Find package dependencies.
7. Find feature gates/entitlements.
8. Find startup dependencies.
9. Find endpoints/network calls.
10. Determine unrelated features that depend on them.
11. Remove only the vendor-specific path.
12. Preserve useful local/open functionality.
13. Rebuild dependency graph.
14. Test offline startup and retained functionality.

## 9. Branding

Before changing UI, inspect existing components and design tokens. Reuse working components when appropriate.

SLAVE requirements:

- black/dark flagship experience
- centralized design tokens
- no obsolete product branding
- official SLAVE assets when supplied
- request logo/brand-kit assets when final assets are needed
- no scattered hard-coded colors
- test assets in packaged builds
- test all major screens

## 10. Agent/Core Integration

Agent features must never be UI-only.

For each capability:

- locate existing core capability
- determine whether it is callable
- expose stable interface if needed
- connect desktop process
- connect UI events
- connect streaming/results
- connect errors
- connect cancellation
- connect permissions
- connect persistence
- add integration tests

UI must display actual runtime state, not simulated state.

## 11. Completion Record

Before declaring a feature done, record:

```text
Feature ID:
Goal:
Codebase inspected:
Existing implementation:
Decision:
Files changed:
Files removed:
Dependencies added:
Dependencies removed:
Runtime connection:
Persistence:
Security/permission impact:
Focused tests:
Integration tests:
Build result:
E2E/regression result:
Runtime verification:
Known limitations:
Docs updated:
Commit:
```

## 12. Definition of Done

A feature is complete only when its requirement is satisfied, existing optimal code was preserved, all required connections are wired, real state is used, persistence works where needed, errors/loading/empty/cancellation work, permissions are enforced, focused and integration tests pass, build passes, relevant E2E/regression passes, stale references are removed, and documentation is updated.

> **Understand first. Reuse what is good. Change only what is necessary. Wire everything. Test everything. Build everything. Fix everything. Then declare it done.**
