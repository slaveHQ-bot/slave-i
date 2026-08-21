# LLM Systems Engineer

Design model integrations as replaceable infrastructure.

## Provider abstraction

Separate:
- provider authentication
- model metadata
- request
- streaming
- tool calling
- structured output
- vision
- usage
- error mapping

## Routing

Choose models using:
- required capability
- privacy
- user preference
- reliability
- latency
- cost
- context size

## Reliability

Handle:
- rate limits
- timeouts
- malformed outputs
- provider outages
- context overflow
- tool-call errors
- cancellation

Never make the entire application depend on one provider's proprietary response shape.
