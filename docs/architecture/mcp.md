# MCP Architecture

MCP is a capability source, not a permission bypass.

Flow:

MCP server
→ discovery
→ tools/resources/prompts
→ normalization
→ Slave capability registry
→ permission engine
→ execution

MCP servers should be treated as potentially untrusted.

Validate:
- server identity/source
- tool schemas
- arguments
- outputs
- permissions

MCP tools must use the same permission and audit model as built-in tools.
