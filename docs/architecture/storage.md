# Storage Architecture

## Initial local storage

Use SQLite for structured application state.

Suggested areas:
- users/preferences
- projects
- conversations
- messages
- tasks
- runs
- agents
- tools
- models/providers
- permissions
- memories
- integrations metadata
- events
- artifacts metadata

## Filesystem

Use filesystem storage for large artifacts:
- attachments
- generated files
- screenshots
- recordings
- exports

SQLite stores references and metadata.

## Migrations

Schema changes require versioned migrations.

Never rely on manually edited production databases.

## Backup

Design export/backup early enough that users can recover their local state.
