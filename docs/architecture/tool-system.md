# Tool System

## Tool registry

Every tool declares:
- id
- name
- description
- input schema
- output schema
- capabilities
- risk level
- permission requirements
- source
- version
- timeout
- retry policy
- availability

## Execution pipeline

Request
→ validate
→ authorize
→ execute
→ validate output
→ record event
→ return structured result

## Rules

Tool output is untrusted data.

Tool implementations must not silently bypass permission policy.

Tool failures must be structured.

Tool execution must be observable.

## Sources

Tools may originate from:
- built-in runtime
- MCP
- plugins
- integrations
- local OS
- browser
- APIs
