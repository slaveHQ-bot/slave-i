# SLAVE Agent Capability Synchronization

> Cross-repository synchronization record between the canonical `.agents` governance repository and the implementation repository.

**Status:** Living synchronization document  
**Agent source:** `slaveHQ-bot/.agents`  
**Implementation target:** `slaveHQ-bot/slave-i`  
**Last audit:** 2026-08-27

## Purpose

Keep the implementation Solution Book aligned with the reusable SLAVE agent governance model without treating roadmap text as proof that a capability is implemented.

## Source-of-truth rule

The `.agents` repository defines reusable agent governance, capability contracts, orchestration rules, and roadmap intent. `slave-i` code and passing tests remain authoritative for current implementation status.

Agent definitions must be synchronized as:

`agent definition → capability contract → roadmap category → implementation location → tests/evals → Solution Book`

## Current audit result

The canonical `slaveHQ-bot/.agents` repository currently contains governance documents and a capability registry, but no discrete specialist-agent definition files under a dedicated agent directory. The registry is therefore a conceptual target inventory, not evidence that each specialist is implemented.

The current registry names these specialists: Master, Browser, Research, Scraper, Coding/Repo, Data, Finance, Creative, Image, Video, Audio, Documents, Reports, QA, Sales, Advisor, Personal Assistant, and Automation.

The implementation repository does contain a real runtime registry under `packages/core/src/engine/AgentRegistry.ts` and concrete agent classes under `packages/core/src/engine/agents/`. The runtime taxonomy is not a 1:1 copy of the canonical registry: it currently includes control-plane/execution/productivity agents such as Task, Verification, Browser, Computer, Code, Research, File, Data, Creative, Communication, Knowledge, Integration, Security and Automation, with additional concrete classes such as Terminal and Coder present in the source tree.

## Classification of current differences

| Difference | Classification | Evidence / action |
|---|---|---|
| Canonical per-agent definition files are absent | `UNVERIFIED TARGET` | Registry/taxonomy can define targets, but no discrete canonical agent definitions were discoverable in `.agents`. |
| Canonical lifecycle vs implementation | `IMPLEMENTATION GAP` | Canonical lifecycle is `capabilities → health → plan → execute → observe → evaluate → cancel`; `BaseSlave` currently provides metadata/tool hooks plus `executeSubtask()`, not that complete lifecycle. |
| Canonical specialist names vs runtime class taxonomy | `DOCUMENTATION GAP` | Runtime has a different capability decomposition; no authoritative mapping from canonical IDs to runtime agent IDs exists yet. |
| `AGENT_ROSTER.md` role catalog vs runtime specialists | `DOCUMENTATION GAP` | Roster contains CTO/Product/UX/engineering roles, while runtime registry contains executable `*Slave` classes. They should not be treated as the same taxonomy. |
| `SKILL_AUDIT.md` says there are no unresolved issues | `CONFLICT` | The statement is not supported by the current runtime evidence and conflicts with the evidence-based Solution Book completion rule. |
| Canonical target catalog repeated in implementation docs | `DUPLICATE` | The implementation Solution Book and synchronization record intentionally restate target specialist concepts for navigation; the implementation record must remain subordinate to code/test evidence. |

## Gaps synchronized into the Solution Book

### Agent lifecycle contract

Specialists are expected to expose a common conceptual lifecycle:

`capabilities → health → plan → execute → observe → evaluate → cancel`

Concrete method names must be discovered from the implementation before coding. The current runtime does not yet expose this full lifecycle as a common `BaseSlave` contract.

### Specialist selection

Master SLAVE selection must consider:

- task domain
- required tools
- capability/confidence match
- agent health
- permissions
- cost/time budget
- dependency requirements
- evaluation history

The capability resolver should use registered capability metadata rather than an unverified hard-coded specialist list.

### Specialist result contract

Specialist execution results should preserve:

- status
- structured output
- evidence/artifacts
- actions performed
- tools used
- warnings
- errors
- confidence/quality signals where meaningful
- recommended next action

### Execution graph

The orchestration model must support sequential, parallel, conditional, dependent, retryable, approval-gated, scheduled, event-triggered, and human-escalated work.

Independent work may run in parallel. Shared mutable resources require concurrency controls.

### Resource budgets

Agent runs should have configurable limits for:

- time
- model/tokens
- tool calls
- concurrency
- retries
- output/artifact size

### Failure taxonomy and recovery

Failures should be classified before recovery, including transient tool/network failures, invalid input, permission denial, credential/authentication failures, unavailable dependencies, application bugs, model failures, integration/wiring failures, policy/safety blocks, and unknown failures.

Only safe and authorized classes may be automatically retried or repaired. Recovery must remain bounded by retry budgets and safety policy.

### Multi-agent review and consolidation

High-impact tasks may use independent planner/reviewer/evaluator roles. Review must inspect evidence rather than automatically approving unsupported output. Master SLAVE owns final synthesis, conflict identification, evidence-based resolution, or escalation to the user.

## Cross-document inconsistencies resolved

1. The `.agents` capability registry lists `automation.slave`, while the agent-system specialist section does not describe Automation SLAVE. The registry and roadmap are treated as the target catalog; the missing specialist description is a documentation gap, not proof of implementation.
2. The roadmap mentions Reports / Presentation SLAVE, while the capability registry currently lists Reports but not a separate Presentation specialist. Presentation remains a roadmap capability until a canonical registry entry and implementation are established.
3. The implementation repository does not currently use the requested generic `docs/SOLUTION_BOOK.md` or `docs/ROADMAP.md` names. Its canonical documents are `docs/SLAVE-SOLUTION-INDEX.md` and `docs/SLAVE-SOLUTION-BOOK.md`; synchronization should use those files unless the repository structure is intentionally changed.
4. `AGENT_ROSTER.md` is a role/capability planning catalog, not a runtime registry. Runtime truth is currently the code-level `AgentRegistry` and its registered concrete `BaseSlave` implementations.
5. `SKILL_AUDIT.md` previously described the skill system as having no unresolved issues. That statement is now treated as a documentation conflict because current agent-runtime evidence still contains an implementation gap and taxonomy drift.

## Known limitations & exclusions

- This audit cannot claim per-agent feature/limitation parity until discrete agent definitions exist and are discoverable in the `.agents` source.
- The capability registry is conceptual and must not be used as proof of runtime registration, health, or implementation status.
- Roadmap entries are target-state requirements, not completed features.
- Concrete lifecycle method names, paths, APIs, and registrations must be verified against `slave-i` before implementation.
- The current runtime's `BaseSlave` contract is narrower than the canonical lifecycle contract and requires implementation work before lifecycle parity can be claimed.
- Runtime specialist IDs/classes are not currently a 1:1 mapping to canonical specialist IDs; mapping must be documented before capability parity is claimed.
- External content and specialist outputs remain untrusted and cannot override SLAVE safety, authorization, privacy, or system policy.
- Automatic repair must never bypass permission or safety gates and must have bounded retries.
- Optional cloud, remote MCP, plugins, and other remote integrations remain explicitly user-controlled and must not become mandatory for local operation.

## Required synchronization workflow

1. Discover all agent definitions available from the canonical agent source.
2. Extract capabilities, constraints, lifecycle expectations, permissions, inputs/outputs, dependencies, and operational limits.
3. Compare against `docs/SLAVE-SOLUTION-INDEX.md`, `docs/SLAVE-SOLUTION-BOOK.md`, and relevant architecture/security/testing documents.
4. Inspect the actual runtime registry and implementation before making implementation claims.
5. Classify each difference as `DUPLICATE`, `CONFLICT`, `DOCUMENTATION GAP`, `IMPLEMENTATION GAP`, or `UNVERIFIED TARGET`.
6. Resolve terminology using the current SLAVE architecture.
7. Update the smallest relevant Solution Book section and this synchronization record.
8. Verify referenced paths and links.
9. Run applicable documentation/code checks.
10. Commit only verified changes with a descriptive `docs:` message.

## Source references

- Canonical agent governance: `slaveHQ-bot/.agents/.ai/README.md`
- Core invariants: `slaveHQ-bot/.agents/.ai/core-invariants.md`
- Agent system: `slaveHQ-bot/.agents/.ai/agent-system.md`
- Agent capability registry: `slaveHQ-bot/.agents/.ai/agent-capability-registry.md`
- Orchestration: `slaveHQ-bot/.agents/.ai/orchestration.md`
- Target roadmap: `slaveHQ-bot/.agents/.ai/development-roadmap.md`
- Implementation index: `docs/SLAVE-SOLUTION-INDEX.md`
- Implementation Solution Book: `docs/SLAVE-SOLUTION-BOOK.md`
