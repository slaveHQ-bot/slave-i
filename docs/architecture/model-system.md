# Model System

## Principle

Slave is model-agnostic and BYOK-first.

## Provider abstraction

Provider:
- authentication
- model discovery
- capabilities
- request
- streaming
- tool calling
- vision
- usage
- limits
- errors

Model:
- id
- provider
- capabilities
- context window
- pricing metadata if known
- availability
- user label

## Providers

Initial architecture should support:
- OpenAI
- Anthropic
- Google
- xAI
- Mistral
- OpenRouter
- local models
- custom OpenAI-compatible endpoints

Do not hardcode provider-specific logic into Main Slave.

## Routing

Route based on:
- task type
- capability
- context
- latency
- cost
- privacy
- user preference
- availability
- reliability

## Local models

Local inference is a first-class provider.

The system should discover local model capabilities where possible.

## Credentials

Secrets are stored through OS secure storage, not ordinary application tables.
