# Feature Development Workflow

## Main Agent

1. Define user outcome.
2. Inspect current architecture.
3. Create acceptance criteria.
4. Build task graph.
5. Identify parallel work.

## Specialists

Parallel where safe:
- architecture
- backend
- database
- UI
- tests

Then:
integration
→ code review
→ security review if needed
→ QA
→ Main Agent verification

## Final gate

Feature is accepted only when:
- acceptance criteria met
- relevant tests pass
- architecture remains coherent
- risks are known
- Main Agent verifies the result
