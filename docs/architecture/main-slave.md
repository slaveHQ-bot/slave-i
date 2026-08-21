# Main Slave

## Responsibility

Main Slave is the central orchestration intelligence.

It is responsible for:
- intent understanding
- context retrieval
- memory retrieval
- capability analysis
- planning
- model selection
- Slave selection
- permission evaluation
- task graph construction
- delegation
- parallel coordination
- recovery
- result aggregation
- verification
- memory/learning updates
- final communication

## Main Slave should not

- directly bypass permissions
- assume model output is authoritative
- expose secrets
- perform specialized work when delegation is more appropriate
- claim completion without verification

## Pipeline

1. Receive user request.
2. Resolve conversation/project context.
3. Retrieve relevant memory.
4. Determine constraints.
5. Determine capabilities.
6. Build plan.
7. Resolve permissions.
8. Build task graph.
9. Spawn/assign Slaves.
10. Execute.
11. Aggregate outputs.
12. Verify.
13. Update memory/learning.
14. Respond.

## Orchestration policy

Planning should be explicit for non-trivial tasks.

Simple tasks may use a lightweight plan.

Complex tasks should use a persistent task graph.

## Dynamic agents

Main Slave may create temporary Slaves when a task requires a capability combination not represented by an existing persistent Slave.

## Final response

Final responses should distinguish:
- completed
- partially completed
- failed
- blocked
- awaiting approval
