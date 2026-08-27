# SLAVE — Development Solution Book

> Master engineering plan for transforming the existing VS Code/OpenClaw-derived codebase into a fully branded, local-first, BYOK, AI-first SLAVE desktop platform.

**Status:** Master plan / living engineering specification  
**Repository:** `slaveHQ-bot/slave-i`  
**Primary principle:** Never declare a phase complete until its implementation, integration, tests, packaging, and regression checks pass.

---

## 0. Product Definition

SLAVE is an open-source, local-first AI computer agent and desktop environment. It should let the user interact with an AI agent that can reason, use tools, operate applications, work with files, execute code, browse, schedule work, and eventually act as an AI-first operating environment.

### Non-negotiable product principles

1. **100% open source** for the SLAVE-controlled product layer.
2. **Local-first:** user data, state, credentials, agent execution, and connections remain on the user's machine unless the user explicitly chooses a remote service.
3. **BYOK:** users provide and control their own model/API credentials.
4. **No inherited vendor lock-in:** VS Code/Microsoft authentication, telemetry, proprietary services, and marketplace assumptions must not become SLAVE requirements.
5. **Desktop-native:** the product must run as a real desktop application, not merely as a browser page served from localhost.
6. **Agent-first:** chat is the control surface for an actual agent runtime, not a decorative chatbot UI.
7. **User control:** dangerous actions require appropriate confirmation, and permissions are explicit and inspectable.
8. **Modular architecture:** provider, tool, agent, storage, UI, and integration layers must be replaceable.
9. **Test continuously:** every meaningful change is followed by focused tests, integration tests, and regression checks.
10. **Brand ownership:** no VS Code/OpenClaw product branding, auth flow, service dependency, or user-facing identity should remain where SLAVE replaces it.

---

# Phase 0 — Project Governance & Baseline

## Goal
Establish the engineering rules, repository structure, baseline build, and definition of done before changing behavior.

### Tasks

- [ ] Identify the exact upstream/base repositories and licenses.
- [ ] Record upstream commit/version used as the starting point.
- [ ] Inventory package managers, runtimes, build systems, native dependencies, and platform targets.
- [ ] Record current build, test, lint, typecheck, packaging, and launch commands.
- [ ] Produce a dependency inventory.
- [ ] Produce an architecture map: renderer/UI, main process, services, agent runtime, storage, IPC, extensions, updater, auth, telemetry, network, and integrations.
- [ ] Establish `docs/architecture/`, `docs/security/`, `docs/testing/`, `docs/operations/`, and `docs/decisions/`.
- [ ] Add contribution and development standards.
- [ ] Add a Definition of Done.
- [ ] Establish CI for install → lint → typecheck → unit tests → integration tests → build.

### Exit criteria

- Baseline build succeeds.
- Baseline tests are reproducible.
- Architecture and dependency inventory exists.
- CI can detect regressions before feature work proceeds.

---

# Phase 1 — Deep VS Code Codebase Understanding

## Goal
Understand what can be retained, what must be removed, and what must be replaced.

### Tasks

- [ ] Map VS Code workbench architecture and boot sequence.
- [ ] Identify Electron/main-process responsibilities.
- [ ] Identify renderer/workbench responsibilities.
- [ ] Map IPC/RPC boundaries.
- [ ] Map extension host and extension APIs.
- [ ] Map settings, profiles, storage, secrets, workspace state, and caches.
- [ ] Map update, crash reporting, telemetry, experiments, and remote-service code.
- [ ] Search for Microsoft account/authentication references.
- [ ] Search for Microsoft/Azure identity, token, entitlement, marketplace, gallery, telemetry, and remote-service dependencies.
- [ ] Search for OpenClaw-specific services and determine which are core runtime versus replaceable integration code.
- [ ] Identify all inherited assumptions that require an online account.
- [ ] Produce an `AUTH-SERVICE-DEPENDENCY-MAP.md`.
- [ ] Produce a `KEEP-REMOVE-REPLACE.md` matrix for major components.

### Decision rule

**Keep** mature, local, open components that do not force Microsoft/vendor identity or incompatible services. **Remove** inherited auth/service blockers. **Replace** product-specific components with SLAVE-owned equivalents.

### Exit criteria

No major subsystem is modified blindly. Every removal/replacement has an identified dependency chain and test plan.

---

# Phase 2 — VS Code Auth & Vendor-Service Extraction

## Goal
Remove inherited authentication and service coupling without breaking unrelated local functionality.

### Feature: Authentication independence

#### Tasks

- [ ] Remove Microsoft account sign-in UI and commands.
- [ ] Remove Microsoft identity/token acquisition code that is not required by retained open components.
- [ ] Remove auth-specific IPC contracts.
- [ ] Remove auth state from local storage schemas.
- [ ] Remove account-dependent startup paths.
- [ ] Remove auth-required feature gates.
- [ ] Remove auth-only dependencies from package manifests.
- [ ] Remove unused token/cache/keychain flows.
- [ ] Replace auth checks with SLAVE capability/permission checks where appropriate.
- [ ] Ensure the application starts fully offline with no account.

### Feature: Vendor-service independence

- [ ] Inventory telemetry/crash reporting and decide which must be removed or replaced.
- [ ] Remove mandatory vendor analytics.
- [ ] Remove vendor-specific marketplace requirements where incompatible with SLAVE.
- [ ] Remove online entitlement checks.
- [ ] Remove mandatory cloud configuration.
- [ ] Remove unnecessary remote endpoints.
- [ ] Ensure network access is opt-in and feature-specific.

### Tests after each extraction

- [ ] Cold start offline.
- [ ] Fresh profile startup.
- [ ] Existing local workspace opens.
- [ ] Settings persist.
- [ ] Extensions/components that do not require removed services still work.
- [ ] No auth UI appears.
- [ ] No hidden authentication request is made.
- [ ] Dependency scan confirms removed packages are no longer reachable.

### Exit criteria

SLAVE can install and operate locally without a Microsoft account or inherited vendor account/service dependency.

---

# Phase 3 — SLAVE Identity, Branding & Design System

## Goal
Replace inherited identity with a coherent SLAVE visual system.

### Branding input gate

Before final visual implementation, request from the user when needed:

- [ ] Primary SLAVE logo SVG.
- [ ] Logo variants: light, dark, monochrome, icon-only.
- [ ] Favicon/app icon/source SVG.
- [ ] Brand colors or brand-kit file.
- [ ] Typography/font requirements and licenses.
- [ ] Avatar/character assets if used.
- [ ] Product wordmark rules.
- [ ] Any existing splash/loading artwork.
- [ ] App icon assets for Windows/macOS/Linux.

**Do not invent a final logo or claim brand completion when the official assets have not been supplied. Use a temporary development mark only where necessary and mark it clearly as provisional.**

### Feature: SLAVE theme system

- [ ] Create a single source of truth for design tokens.
- [ ] Make the primary experience black/dark by default.
- [ ] Define background, surface, elevated surface, border, text, muted text, accent, success, warning, and danger tokens.
- [ ] Define spacing, radius, typography, icon sizing, and motion tokens.
- [ ] Remove inherited VS Code branding from product UI.
- [ ] Replace product names, logos, menus, titles, splash screens, and about dialogs.
- [ ] Ensure dark theme is consistent across workbench, chat, settings, dialogs, notifications, and onboarding.
- [ ] Ensure accessibility contrast remains acceptable.
- [ ] Add light theme only if product requirements call for it; black/dark remains the flagship experience.

### Tests

- [ ] Visual smoke test all primary screens.
- [ ] No old product branding in visible UI.
- [ ] No hard-coded colors bypassing design tokens in new UI.
- [ ] Assets load correctly in packaged builds.
- [ ] Windows/macOS/Linux icon assets validate.

---

# Phase 4 — SLAVE Core Architecture

## Goal
Create a clean boundary between the desktop shell and the AI/agent runtime.

### Target layers

```text
SLAVE Desktop
├── UI / Workbench
├── Chat & Agent UX
├── Command / Shortcut Layer
├── Desktop Shell
├── IPC / Capability Boundary
├── Agent Orchestrator
├── Model Provider Layer (BYOK)
├── Tool Runtime
├── Permission / Approval Engine
├── Task & Scheduler Engine
├── Memory / Session State
├── Local Storage
└── Integration Adapters
```

### Tasks

- [ ] Define stable internal interfaces between UI and agent runtime.
- [ ] Define typed IPC contracts.
- [ ] Define agent session lifecycle.
- [ ] Define model-provider interface.
- [ ] Define tool interface.
- [ ] Define tool execution result/event schema.
- [ ] Define permission/approval model.
- [ ] Define streaming event protocol.
- [ ] Define task/job schema.
- [ ] Define local persistence schema.
- [ ] Define error taxonomy.
- [ ] Define cancellation and timeout semantics.
- [ ] Define observability/logging that remains local by default.

### Critical requirement

The desktop UI must never simulate agent functionality. Every visible action must map to a real backend/core capability, and every core capability intended for users must have a reachable UI or documented API.

### Tests

- [ ] Unit test contracts.
- [ ] IPC round-trip tests.
- [ ] Agent lifecycle tests.
- [ ] Cancellation tests.
- [ ] Error propagation tests.
- [ ] Offline tests.

---

# Phase 5 — BYOK & Provider System

## Goal
Make model access user-owned and provider-agnostic.

### Feature: Provider abstraction

- [ ] Define provider interface.
- [ ] Support API key configuration without SLAVE-owned cloud accounts.
- [ ] Store secrets using OS-appropriate secure storage where available.
- [ ] Never write raw API keys to logs.
- [ ] Support model selection.
- [ ] Support provider/model capability metadata.
- [ ] Support streaming.
- [ ] Support tool/function calling where provider supports it.
- [ ] Handle provider errors and rate limits.
- [ ] Allow local models as a first-class provider path.

### Tests

- [ ] Provider configuration.
- [ ] Invalid key handling.
- [ ] Missing key handling.
- [ ] Streaming.
- [ ] Tool-call round trips.
- [ ] Secret redaction.
- [ ] Offline/local-model path.

---

# Phase 6 — Real Agent Runtime Integration

## Goal
Connect the SLAVE desktop directly to the modified OpenClaw-derived core and make the entire system actually functional.

### Feature: Agent bridge

- [ ] Trace every existing OpenClaw core capability.
- [ ] Expose required capabilities through SLAVE-owned interfaces.
- [ ] Connect chat submission to the real agent runtime.
- [ ] Connect streaming responses to the UI.
- [ ] Connect tool execution events to the UI.
- [ ] Connect errors to actionable UI states.
- [ ] Connect cancellation to actual runtime cancellation.
- [ ] Connect session history to persistent storage.
- [ ] Connect permissions/approvals to actual tool execution.
- [ ] Remove fake/mock paths from production flows.
- [ ] Remove duplicate implementations where UI and core each implement the same function incorrectly.

### Integration matrix

For every feature:

`UI action → IPC/API → service → agent/core → tool/provider → result/event → UI`

Each link must be verified with an automated integration test.

### Exit criteria

The desktop application is demonstrably connected to the real core. No critical UI control is decorative or disconnected.

---

# Phase 7 — Core Chat Experience

## Feature: Chat

### Tasks

- [ ] New chat.
- [ ] Persistent conversation history.
- [ ] Streaming responses.
- [ ] Stop/cancel generation.
- [ ] Retry.
- [ ] Rename chat.
- [ ] Delete/archive chat.
- [ ] Pin chat.
- [ ] Search chats.
- [ ] Project/workspace grouping.
- [ ] Message actions.
- [ ] Tool execution visibility.
- [ ] Approval prompts.
- [ ] Error recovery.
- [ ] Attach files when supported.
- [ ] Model/provider selection.
- [ ] Agent mode selection.

### UI structure

Left sidebar should support:

- Chat
- New Chat
- Schedule Task
- Customize
- Recent chats
- Project-wise chats
- Pinned chats
- All chats
- Rename / archive / delete / reorder
- Account/settings information

The chat composer should prioritize **mode selection**, not a task-position button. Task creation belongs in the dedicated scheduling/task experience.

### Tests

Every sidebar action and composer action must have at least one integration test and one UI smoke test.

---

# Phase 8 — Tool & Computer-Use System

## Goal
Make SLAVE capable of actually doing work on the computer.

### Feature: Tool framework

- [ ] Filesystem tools.
- [ ] Terminal/shell tools.
- [ ] Code/project tools.
- [ ] Browser/web tools.
- [ ] Application interaction tools.
- [ ] Clipboard tools.
- [ ] Process/system information tools.
- [ ] Screenshots/visual context where supported.
- [ ] Structured tool schemas.
- [ ] Tool discovery.
- [ ] Tool permission scopes.
- [ ] Tool confirmation policies.
- [ ] Tool audit events.
- [ ] Tool timeouts/cancellation.
- [ ] Sandboxing/isolation strategy where required.

### Safety requirements

- Destructive operations require confirmation according to policy.
- Secrets are never exposed unnecessarily to tools.
- Tool permissions are inspectable.
- The agent cannot silently escalate privileges.
- Every important action has an auditable local event.

---

# Phase 9 — Tasks, Scheduling & Automation

## Goal
Turn one-shot chat into persistent work.

### Feature: Task engine

- [ ] Create task.
- [ ] Run now.
- [ ] Schedule once.
- [ ] Schedule recurring task.
- [ ] Pause/resume.
- [ ] Cancel.
- [ ] Retry failed run.
- [ ] Task history.
- [ ] Run logs.
- [ ] Notifications.
- [ ] Agent/task configuration.
- [ ] Permissions remembered per task where safe.
- [ ] Failure recovery.

### Nested task model

Support:

`Task → Step → Subtask → Tool action`

Each execution node needs status, timestamps, inputs, outputs, errors, cancellation state, and parent relationship.

---

# Phase 10 — Memory, Projects & Local Data

## Goal
Make SLAVE useful across sessions while keeping data local-first.

### Tasks

- [ ] Conversation persistence.
- [ ] Project/workspace state.
- [ ] User preferences.
- [ ] Agent configuration.
- [ ] Local memory architecture.
- [ ] Explicit memory controls.
- [ ] Import/export.
- [ ] Backup/restore.
- [ ] Data directory documentation.
- [ ] Data deletion controls.
- [ ] Encryption strategy for sensitive local data.
- [ ] Migration/versioning strategy.

### Privacy tests

- [ ] Fresh install contains no user history.
- [ ] Offline mode works.
- [ ] Secrets do not enter chat logs accidentally.
- [ ] Export contains only expected data.
- [ ] Delete actually removes requested local data.

---

# Phase 11 — Customize / Extensions / Ecosystem

## Goal
Make SLAVE extensible without recreating vendor lock-in.

### Tasks

- [ ] Customize UI.
- [ ] Theme customization.
- [ ] Agent profiles.
- [ ] Tool enable/disable.
- [ ] Provider management.
- [ ] Keyboard shortcuts.
- [ ] Extension/plugin architecture review.
- [ ] Local extension installation.
- [ ] Extension permission model.
- [ ] Extension API documentation.
- [ ] Optional community registry architecture that does not become mandatory cloud infrastructure.

---

# Phase 12 — Desktop Packaging & Distribution

## Goal
Ship a reliable desktop application.

### Tasks

- [ ] Windows package.
- [ ] macOS package.
- [ ] Linux package.
- [ ] App icons.
- [ ] Installer/uninstaller.
- [ ] Data migration.
- [ ] Crash-safe startup/recovery.
- [ ] Auto-update architecture that is optional and transparent.
- [ ] Offline installation path.
- [ ] Version metadata.
- [ ] Release signing strategy.
- [ ] Reproducible build strategy where practical.

### Tests

- [ ] Clean install.
- [ ] Upgrade from previous version.
- [ ] Uninstall/reinstall.
- [ ] Offline launch.
- [ ] Workspace migration.
- [ ] Provider configuration migration.
- [ ] Recovery after interrupted update.

---

# Phase 13 — Security, Privacy & Permission Hardening

## Goal
Make SLAVE safe enough to operate a user's computer.

### Tasks

- [ ] Threat model.
- [ ] Agent/tool trust boundaries.
- [ ] Permission engine.
- [ ] Secret handling review.
- [ ] IPC authorization.
- [ ] Extension isolation.
- [ ] Command execution restrictions.
- [ ] Browser isolation strategy.
- [ ] Prompt-injection defenses.
- [ ] Untrusted-content handling.
- [ ] Sensitive-data redaction.
- [ ] Audit logging.
- [ ] Security regression suite.
- [ ] Dependency vulnerability scanning.

### Definition

Security is not a later polish phase. Any feature that can execute code, access files, browse, or control applications must ship with its permission model.

---

# Phase 14 — Full-System Verification

## Goal
Prove that the product works as one system rather than as isolated features.

### Test layers

1. Static analysis.
2. Type checking.
3. Unit tests.
4. Component tests.
5. IPC tests.
6. Agent-runtime integration tests.
7. Provider integration tests.
8. Tool integration tests.
9. UI tests.
10. End-to-end desktop tests.
11. Packaging tests.
12. Offline/privacy tests.
13. Security tests.
14. Performance/regression tests.

### Golden user journeys

- [ ] Install SLAVE.
- [ ] Launch without an account.
- [ ] Configure BYOK provider.
- [ ] Create project.
- [ ] Start chat.
- [ ] Ask agent to inspect project.
- [ ] Agent uses a real tool.
- [ ] Agent asks for approval when required.
- [ ] Agent completes task.
- [ ] Conversation persists after restart.
- [ ] Schedule an automation.
- [ ] Restart application.
- [ ] Scheduled task remains correct.
- [ ] Run completely offline where functionality permits.
- [ ] Export/delete local data.

---

# Phase 15 — Performance & Reliability

### Tasks

- [ ] Measure startup time.
- [ ] Measure chat first-token latency.
- [ ] Measure tool execution overhead.
- [ ] Detect memory leaks.
- [ ] Detect runaway agent loops.
- [ ] Add task timeouts.
- [ ] Add backpressure for streaming/events.
- [ ] Add recovery after agent crashes.
- [ ] Prevent UI freezes during long operations.
- [ ] Test large projects and long conversations.

---

# Phase 16 — Documentation & Release Engineering

### Required documentation

- [ ] README.
- [ ] Architecture guide.
- [ ] Developer setup.
- [ ] Build guide.
- [ ] Testing guide.
- [ ] Agent runtime guide.
- [ ] Provider/BYOK guide.
- [ ] Tool development guide.
- [ ] Extension API.
- [ ] Security model.
- [ ] Privacy model.
- [ ] Data/storage model.
- [ ] Contribution guide.
- [ ] Release guide.
- [ ] Troubleshooting guide.
- [ ] ADRs for major architectural decisions.

---

# Engineering Rule — Test After Every Change

For every task:

```text
Understand
  ↓
Change the smallest coherent unit
  ↓
Run focused test
  ↓
Run typecheck/lint
  ↓
Run relevant integration test
  ↓
Run regression suite
  ↓
Inspect UI/runtime behavior
  ↓
Commit with clear message
  ↓
Only then continue
```

For high-risk refactors, create a checkpoint commit before the change.

---

# Feature Completion Contract

A feature is **not complete** when its UI exists.

A feature is complete only when:

- [ ] UX exists.
- [ ] Backend/core capability exists.
- [ ] UI-to-core connection works.
- [ ] Persistence works if required.
- [ ] Errors are handled.
- [ ] Permissions are handled.
- [ ] Offline/local behavior is defined.
- [ ] Unit tests exist.
- [ ] Integration tests exist.
- [ ] E2E/smoke coverage exists for critical paths.
- [ ] Documentation exists.
- [ ] Branding is correct.
- [ ] No obsolete implementation remains.

---

# Refactor Safety Rules

1. Do not perform giant blind deletions.
2. Trace dependencies before removing a service.
3. Remove dead dependencies from manifests after code removal.
4. Search globally for references after each major removal.
5. Preserve useful local/open functionality.
6. Prefer small reversible commits.
7. Never replace a real function with a mock just to make tests pass.
8. Do not leave fake UI controls.
9. Do not silently add cloud services.
10. Do not add telemetry without an explicit product decision.
11. Keep secrets out of source control and logs.
12. Every architectural replacement gets an ADR.

---

# Target Repository Structure

```text
.
├── docs/
│   ├── SLAVE-SOLUTION-BOOK.md
│   ├── architecture/
│   ├── security/
│   ├── testing/
│   ├── operations/
│   └── decisions/
├── src/
│   ├── desktop/
│   ├── ui/
│   ├── agent/
│   ├── providers/
│   ├── tools/
│   ├── permissions/
│   ├── tasks/
│   ├── storage/
│   └── integrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── security/
└── assets/
    └── branding/
```

The exact structure may follow the existing codebase where that is technically superior; the principle is clear separation of concerns rather than directory renaming for its own sake.

---

# Master Dependency Strategy

### Remove

- Mandatory Microsoft identity.
- Unnecessary Microsoft cloud dependencies.
- Mandatory vendor telemetry.
- Vendor entitlement/account checks.
- Product-specific auth blockers.
- Any dependency that makes local/offline operation impossible without a clear SLAVE reason.

### Keep

- Mature open-source editor/workbench functionality.
- Local filesystem/workspace capabilities.
- Terminal and developer tooling where compatible.
- Extension infrastructure where licensing and architecture permit.
- Useful accessibility, keyboard, command, and editor systems.

### Replace

- Product identity → SLAVE identity.
- Account system → local SLAVE profile/configuration plus optional user-controlled credentials.
- AI provider coupling → BYOK provider abstraction.
- Agent UI → SLAVE agent experience.
- Vendor service dependencies → local or explicit user-configured integrations.
- Inherited telemetry → local diagnostics and explicit opt-in mechanisms if later required.

---

# Definition of the Finished SLAVE

The project is considered production-ready only when a new user can install SLAVE, launch it without creating a vendor account, configure their own model/provider credentials, open a project, chat with a real agent, allow the agent to use real tools, observe and control those actions, schedule persistent work, restart the application without losing state, and manage their local data — all through a coherent black SLAVE-branded desktop application.

The long-term platform then expands from **AI coding environment → AI computer agent → AI-first desktop environment → broader SLAVE ecosystem and mobile clients**.

---

# Current Execution Order

**Do not jump directly into adding flashy features. Execute in this order:**

1. Baseline and repository audit.
2. Complete VS Code architecture understanding.
3. Auth/vendor dependency map.
4. Remove inherited authentication blockers.
5. Remove unnecessary inherited services/dependencies.
6. Test and stabilize.
7. Establish SLAVE architecture boundaries.
8. Request/ingest official branding assets when needed.
9. Implement black SLAVE design system and branding.
10. Connect desktop UI to the real agent core.
11. Implement BYOK/provider layer.
12. Implement chat and session system.
13. Implement tools/computer use.
14. Implement permissions/security.
15. Implement tasks/scheduling.
16. Implement memory/projects/local data.
17. Implement customization/extensions.
18. Package for desktop platforms.
19. Full E2E/security/performance verification.
20. Release and continue the roadmap from a stable foundation.

**This document is the master execution contract. Every future feature should be added as `Phase → Feature → Task → Nested Task → Tests → Exit Criteria`, never as an untracked UI-only change.**
