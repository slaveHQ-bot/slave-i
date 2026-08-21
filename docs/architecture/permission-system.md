# Permission System

## Permission levels

- always_allow
- allow_once
- allow_for_task
- allow_for_project
- allow_for_agent
- ask
- deny

## Policy inputs

Permission decisions can depend on:
- user
- project
- agent
- tool
- capability
- resource
- action risk
- task
- autonomy level

## High-risk actions

Examples:
- delete
- send
- publish
- financial
- install
- credential access
- arbitrary execution
- system changes

## Enforcement

Permission checks must happen at the privileged execution boundary.

UI-only permission checks are insufficient.

## Audit

Every security-sensitive decision should be recorded.
