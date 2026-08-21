# Failure Recovery Protocol

Agents must distinguish:
- TRANSIENT FAILURE -> retry
- BAD IMPLEMENTATION -> diagnose and fix
- MISSING INFORMATION -> research
- ARCHITECTURAL CONFLICT -> escalate to Main Agent
- TOOL FAILURE -> alternative tool
- UNSAFE OPERATION -> stop and escalate

Never blindly retry indefinitely.
