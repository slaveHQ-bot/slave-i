# Context System

## Goal

Give each model only the information needed to perform its task.

## Context layers

Global rules
+ user context
+ project context
+ conversation context
+ task context
+ agent context
+ tool context
+ relevant memory
+ current execution state

## Do not

- dump the entire database into prompts
- dump all conversation history by default
- dump all memories
- expose irrelevant credentials or tool definitions

## Context provenance

Where practical, context items should have source/provenance metadata so the system can explain why information was supplied.

## Context budgets

The system should consider:
- model context limit
- relevance
- priority
- token cost
- freshness

Use summarization/compaction where appropriate.
