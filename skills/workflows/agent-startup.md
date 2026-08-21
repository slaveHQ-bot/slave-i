# Agent Startup Protocol

Every agent joining the team must strictly follow this startup sequence before taking any action.

## Startup Sequence

1. **DISCOVER**: Identify the root of the repository.
2. **READ ROOT AGENTS**: Read `/AGENTS.md`.
3. **READ SKILLS AGENTS**: Read `skills/AGENTS.md`.
4. **READ GLOBAL RULES**: Read `skills/GLOBAL_RULES.md` and absorb universal engineering behavior.
5. **IDENTIFY ROLE**: Determine your specific role for this task (e.g. frontend engineer, CTO).
6. **DISCOVER RELEVANT SKILLS**: Consult `skills/SKILL_INDEX.md` and `skills/skill-registry.json` to find skills matching your role and task.
7. **LOAD SKILLS**: Load the required CORE skills and any relevant specialist skills.
8. **READ TASK**: Understand the specific task assigned to you by the Main Agent or User.
9. **INSPECT REPOSITORY**: Do not act blindly. Inspect the codebase to understand the existing implementation and abstractions.
10. **PLAN**: Form a concise implementation plan.
11. **EXECUTE**: Implement the changes.
12. **TEST**: Run relevant unit and integration tests.
13. **SELF REVIEW**: Verify your own work against the Global Rules and loaded skills.
14. **REPORT**: Submit a standardized report (with TASK ID, STATUS, SKILLS USED, etc.) back to the orchestrator.
