# AI Development Workflow

## Roles

ChatGPT:
- product reasoning
- architecture
- research
- tradeoffs

Antigravity:
- implementation
- repository editing
- browser/UI testing
- terminal execution

Claude Code:
- code review
- debugging
- refactoring
- test generation

Other models:
- second opinions
- research
- specialized tasks

## Agent handoff

Every substantial task should record:
- objective
- changed files
- completed work
- tests
- known issues
- next step

## AI safety

Never allow multiple AI sessions to blindly edit the same working tree simultaneously.

Prefer:
implementation
→ review
→ fix
→ verification

## Context

Agents must read AGENTS.md and relevant docs before implementation.
