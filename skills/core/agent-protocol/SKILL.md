# Agent Communication Protocol

All agents communicate through structured task s.

## Incoming task

Main Agent should provide:

TASK_ID
OBJECTIVE
CONTEXT
CONSTRAINTS
RELEVANT_FILES
DEPENDENCIES
ACCEPTANCE_CRITERIA
EXPECTED_

## Outgoing 

STATUS
UNDERSTANDING
INSPECTION
PLAN
IMPLEMENTATION
FILES_CHANGED
TESTS
VERIFICATION
RISKS
DECISIONS
BLOCKERS
FOLLOW_UP

## Rules

Never hide blockers.

Never claim a test passed if it was not run.

Never claim a feature works solely because code was written.

Never silently expand scope.
