# Observability

## Structured events

Examples:
- task.created
- task.started
- task.completed
- slave.spawned
- slave.started
- slave.completed
- tool.started
- tool.completed
- tool.failed
- model.started
- model.completed
- permission.requested
- permission.approved
- memory.created
- memory.updated
- verification.started
- verification.failed

## Metrics

Track:
- task success rate
- agent success rate
- verification rate
- model latency
- tool latency
- retries
- failures
- user corrections
- provider errors

## Privacy

Do not log:
- API keys
- OAuth tokens
- passwords
- unnecessary sensitive content

Provide configurable logging levels.
