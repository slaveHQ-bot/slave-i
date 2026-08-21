# Resource & Routing Policy

## Resource Limits
- 16 GB RAM / 512 GB SSD.
- Default active workers: 2-4 implementation agents.
- Potentially +1 reviewer, +1 verifier.

Do not introduce heavyweight containers or dozens of agents. Prefer lightweight CLI tools.

## Model Routing (BYOK)
- Architecture/reasoning -> strongest model
- Complex implementation -> strong coding model
- Refactor/Documentation -> fast model
- Security review -> strong reasoning model
