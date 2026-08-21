# Task Engine

## Purpose

The task engine turns goals into durable, observable execution.

## Core objects

Task:
- id
- parent_task_id
- conversation_id
- project_id
- goal
- constraints
- status
- autonomy level
- created_at
- updated_at

Subtask:
- id
- task_id
- objective
- dependencies
- assigned_slave
- required_capabilities
- status
- inputs
- outputs

Run:
- id
- task_id
- attempt
- started_at
- completed_at
- status
- error

## Task graph

Use a DAG for dependencies.

Independent nodes can execute concurrently subject to:
- resource limits
- permissions
- provider limits
- task policy

## States

created
queued
planning
planned
waiting_for_approval
running
waiting
blocked
verifying
completed
partially_completed
failed
cancelled

## Recovery

Support:
- retry
- alternative tool
- alternative Slave
- alternative model
- checkpoint resume
- user escalation

## Cancellation

Cancellation must propagate to active subtasks and tool execution where possible.

## Persistence

Long-running tasks must persist enough state to resume after application restart.
