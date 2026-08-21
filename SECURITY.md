# Slave Security Model

## Threat model

Assume:
- model output can be wrong or malicious
- tool arguments can be malicious
- websites can contain prompt injection
- MCP/plugin providers may be untrusted
- files may be malicious
- credentials are high-value secrets
- local IPC boundaries can be attacked by compromised components

## Principles

- least privilege
- explicit capability grants
- explicit permission decisions
- secure credential storage
- renderer isolation
- input validation
- output validation
- auditability
- sandboxing where possible
- safe defaults

## Secrets

API keys and OAuth tokens must not be stored in ordinary plaintext database fields.

Use OS secure storage where available.

Never:
- commit secrets
- log secrets
- expose secrets to renderer
- include secrets in prompts
- send secrets to unrelated providers

## Model output

Model output is data, not authority.

Never allow model text alone to:
- bypass permissions
- grant itself capabilities
- execute arbitrary commands
- access credentials

## Tools

Every tool must declare:
- capabilities
- risk level
- input schema
- output schema
- permission requirements
- timeout/retry behavior

## High-risk operations

Examples:
- deleting files
- sending messages/email
- financial actions
- publishing
- installing software
- changing system settings
- credential access
- arbitrary code execution

These require explicit policy controls and, where configured, user approval.

## Audit

Security-sensitive operations must be auditable with:
- actor
- agent
- task/run ID
- capability
- tool
- target
- timestamp
- permission decision
- result
