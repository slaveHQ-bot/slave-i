# Contributing to Slave

## Development flow

1. Pull latest main.
2. Create a focused feature/fix branch.
3. Read relevant docs.
4. Implement the smallest coherent change.
5. Add/update tests.
6. Run validation.
7. Review the diff.
8. Commit with a descriptive message.
9. Push and open a PR.
10. Merge only after required checks pass.

## Suggested branch names

- feature/<name>
- fix/<name>
- refactor/<name>
- security/<name>
- docs/<name>

## Commit style

Prefer:
- feat:
- fix:
- refactor:
- test:
- docs:
- chore:
- security:

Keep commits focused.

## Architecture changes

If a change alters a major boundary, data model, security model, agent lifecycle, or provider abstraction:
- create/update an ADR
- update architecture docs
- add migration notes if required
