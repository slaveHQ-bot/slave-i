# Release Process

## Principles

Releases must be reproducible.

Before release:
- tests pass
- typecheck passes
- lint passes
- build passes
- migrations are validated
- release notes exist
- security-sensitive changes are reviewed

## Versioning

Use semantic versioning unless product requirements require another scheme.

## Artifacts

Desktop builds should be generated through CI/reproducible scripts where practical.

## Rollback

Document:
- how to identify bad releases
- how to distribute fixes
- how migrations are handled
