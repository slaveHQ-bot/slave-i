# Capability System

## Purpose

Agents request capabilities rather than arbitrary access.

## Examples

filesystem.read
filesystem.write
browser.navigate
browser.click
browser.download
terminal.execute
git.read
git.write
email.read
email.send
calendar.read
calendar.write
computer.observe
computer.control
database.read
database.write

## Capability record

- id
- name
- description
- risk_level
- required_permissions
- provider/source
- version

## Capability matching

Main Slave selects agents/tools by required capabilities.

Agent names are not the primary routing mechanism.

## Capability graph

Capability
→ Agent
→ Tool
→ Integration/provider

## Least privilege

Grant only capabilities required by the task.

Capabilities should be scoped to:
- task
- project
- agent
- resource
- duration
