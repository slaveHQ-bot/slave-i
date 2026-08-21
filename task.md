# Slave — Full Production UI/UX and Agentic Operating System Implementation Specification

## 1. Mission

Transform the existing Slave desktop application into a **fully working, production-grade agentic operating system**, not merely a chatbot UI.

Slave must combine:

- AI chat
- multi-agent orchestration
- browser automation
- desktop/computer automation
- projects
- persistent memory
- tasks
- scheduled automations
- files
- artifacts
- MCP
- plugins
- integrations
- BYOK model providers
- custom LLM endpoints
- model routing
- granular permissions
- execution monitoring
- human takeover
- audit logs
- developer tooling

The implementation must be **functional end-to-end**.

Do not create mock buttons, fake loading states, placeholder pages, static dashboards, or UI-only functionality.

Every implemented control should either work or clearly indicate that its backend capability has not yet been connected.

---

# 2. Product Principle

Slave should feel like:

> **An AI operating system where the user gives intent, Slave plans and executes the work through specialized agents, and the user can observe, control, interrupt, approve, and inspect everything.**

Do NOT build:

```text
ChatGPT clone + sidebar + agent list
```

Build:

```text
SLAVE OS

User Intent
    ↓
Master Slave
    ↓
Task / Plan
    ↓
Specialized Slaves
    ↓
Tools / MCP / Apps / Browser / Computer
    ↓
Verification
    ↓
Artifacts / Results / Actions
```

---

# 3. Implementation Rule

Before implementing each feature:

1. Inspect the existing architecture.
2. Reuse existing working functionality.
3. Do not unnecessarily rewrite working systems.
4. Create proper reusable components.
5. Create proper backend/domain services where needed.
6. Connect UI to real state.
7. Add validation.
8. Add error handling.
9. Add loading/empty/error states.
10. Add persistence.
11. Add keyboard accessibility.
12. Test the complete flow.
13. Remove mock/demo behavior.

Do not just make screenshots or static layouts.

---

# 4. Application Shell

Implement a responsive desktop application shell with:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Slave                              Search     ● Running     ⚙            │
├──────────────┬──────────────────────────────────────────┬───────────────┤
│ LEFT SIDEBAR │ MAIN WORKSPACE                           │ CONTEXT PANEL │
│              │                                          │               │
│ Navigation   │ Dynamic                                  │ Dynamic       │
│              │                                          │               │
└──────────────┴──────────────────────────────────────────┴───────────────┘
```

The three areas must be independently resizable where appropriate.

Support:

- collapsed sidebar
- expanded sidebar
- hidden context panel
- persistent context panel
- split views
- tabs
- full-screen workspaces
- multiple windows where Electron architecture permits it

Do not permanently force a three-column layout.

---

# 5. Primary Navigation

Implement:

```text
Home
Chat
Projects
Tasks
Agents
Browser
Files
Apps
Automations

Knowledge
Activity

MCP
Plugins
Connections

Settings
```

Every navigation item must have:

- icon
- tooltip
- active state
- keyboard navigation
- context menu where appropriate
- unread/running/error indicators where applicable

Do not use emoji as primary application navigation icons.

---

# 6. Home

Create a useful command center.

Show:

- personalized greeting
- universal command input
- recent projects
- active tasks
- running agents
- scheduled tasks
- recent artifacts
- recent activity
- attention-required items

Example structure:

```text
Good evening.

What are we working on?

[ Ask Slave anything... ]

Continue working
Recent projects
Running now
Upcoming
Recent artifacts
Needs attention
```

The Home page must be data-driven.

No hardcoded fake projects/tasks.

---

# 7. Universal Command Center

Implement:

```text
Cmd/Ctrl + K
```

as a global command/search system.

Search:

- chats
- projects
- tasks
- files
- artifacts
- agents
- memories
- tools
- MCP servers
- connections
- commands
- settings
- activity
- models

Support actions such as:

```text
pause all agents
stop current task
open browser
create project
create agent
switch model
search project
open task
show failed tasks
open settings
```

Results must be actionable.

---

# 8. Global Chat Input

Build a production-grade central input component.

Support:

- text
- multiline input
- streaming
- file upload
- image upload
- PDF upload
- drag/drop
- paste
- URLs
- voice dictation
- `@` mentions
- `/` commands
- model selection
- agent selection
- context selection
- send
- stop generation
- retry
- edit previous message

Do not overload the UI.

Advanced controls should appear progressively.

Default:

```text
Ask Slave...
```

---

# 9. @ Context System

Implement:

```text
@project
@file
@chat
@agent
@task
@artifact
@memory
@connection
```

When the user types `@`, show a searchable contextual picker.

Example:

```text
Analyze @competitor-report using @Research Slave
```

The references must resolve to actual internal objects.

Do not treat them as plain text.

---

# 10. Slash Command System

Implement `/` command discovery.

At minimum:

```text
/model
/agent
/search
/browser
/research
/file
/task
/schedule
/memory
/export
```

Commands should have:

- descriptions
- autocomplete
- keyboard navigation
- argument support
- validation
- execution

Create an extensible command registry so plugins can add commands later.

---

# 11. Chat

Implement production-grade conversations.

Support:

- streaming responses
- message editing
- regeneration
- retry
- stop
- copy
- attachments
- citations
- sources
- artifacts
- tool activity
- task creation
- agent execution
- message branching where architecture supports it
- chat rename
- archive
- pin
- duplicate
- move
- delete
- export

Chat history must persist.

Do not use temporary frontend state as the source of truth.

---

# 12. Chat Organization

Implement:

```text
Recent
Pinned
Projects
Other chats
```

Do not render unlimited chats simultaneously.

Use:

- virtualization
- search
- pagination/infinite loading
- grouping
- sorting
- filtering

---

# 13. Projects

Projects are persistent environments.

Each project must support:

```text
Overview
Chat
Tasks
Files
Knowledge
Agents
Automations
Activity
Memory
Connections
Settings
```

Project state must persist.

Projects should be able to define:

- default model
- default agents
- tools
- MCP servers
- memory scope
- file storage
- permissions
- automations

---

# 14. Project Overview

Display real data:

```text
Project
Status
Progress where measurable
Current work
Active agents
Recent tasks
Recent files
Recent artifacts
Recent activity
```

Never invent progress percentages.

Only show progress when the system can calculate meaningful progress.

---

# 15. Agents

Create a first-class agent management system.

Initial agents can include:

```text
Master Slave
Browser Slave
Research Slave
Coding Slave
Computer Slave
Data Slave
Creative Slave
Image Slave
Video Slave
Writer Slave
Analyst Slave
```

Do not assume every specialized agent must be enabled if its required tools/models are unavailable.

---

# 16. Agent Object Model

Every agent should have:

```text
id
name
description
type
instructions
model
provider
capabilities
tools
permissions
memoryScope
projectScope
status
configuration
version
createdAt
updatedAt
```

Persist all configuration.

---

# 17. Agent Detail Page

Implement:

```text
Agent

Status
Purpose
Model
Provider
Capabilities
Tools
Permissions
Memory
Projects
Recent Runs
Statistics
Settings
```

Actions:

```text
Run
Pause
Disable
Duplicate
Edit
Delete
Test
View logs
```

---

# 18. Agent Builder

Create a complete agent builder.

Fields:

```text
Name
Description
System instructions
Model
Provider
Capabilities
Tools
Memory scope
Permissions
Projects
Execution settings
```

Support:

- create
- edit
- duplicate
- delete
- enable/disable
- test
- version

Validate configuration before saving.

---

# 19. Master Slave

Implement a real orchestration layer.

Master Slave should:

1. receive user intent
2. understand context
3. determine task complexity
4. create task
5. build execution plan
6. select specialized agents
7. select models
8. assign tools
9. execute
10. monitor
11. handle failures
12. request permissions
13. verify results
14. produce artifacts/results
15. close the task

Do not hardcode a single fixed agent chain.

Use an extensible orchestration system.

---

# 20. Multi-Agent Execution

Implement actual agent execution state.

Example:

```text
Master Slave        ● Running
Research Slave      ● Running
Browser Slave       ● Running
Data Slave          ● Running
Writer Slave        ○ Waiting
```

Agents must be able to:

- execute independently
- pass structured results
- request tools
- request approval
- report status
- fail
- retry
- hand off work
- terminate
- resume

---

# 21. Task System

Separate Tasks from Chats.

Every significant autonomous operation should have a task object.

Task states:

```text
queued
planning
running
waiting_approval
paused
completed
failed
cancelled
```

Task object:

```text
id
title
description
projectId
conversationId
status
plan
agents
actions
artifacts
permissions
startedAt
completedAt
error
```

---

# 22. Task Center

Create:

```text
Running
Scheduled
Completed
Failed
Paused
```

Task cards must show:

- name
- status
- current phase
- agents
- action count
- elapsed time
- relevant project
- last activity

---

# 23. Execution Visualization

For running tasks, implement:

```text
EXECUTION

Master Slave
│
├── Research Slave
│   ├── Search
│   └── Sources
│
├── Browser Slave
│   ├── Navigate
│   └── Extract
│
├── Data Slave
│
└── Writer Slave
```

This must represent real execution state.

Clicking an agent should open its current activity.

---

# 24. Execution Activity

Every meaningful action should produce an activity event.

Example:

```text
23:11:04
Research Slave searched web

23:11:07
Browser Slave opened website

23:11:11
Pricing data extracted

23:11:13
Source verified

23:11:17
Dataset saved
```

Events must be stored sufficiently for debugging/auditing.

---

# 25. Action Inspection

Clicking an action should show:

```text
Agent
Action
Tool
Input
Reason / purpose
Result
Status
Duration
Timestamp
Related task
```

Do not expose private chain-of-thought.

Expose useful operational information rather than hidden reasoning.

---

# 26. Human Approval System

Implement granular approval requests.

Example:

```text
Slave wants to send an email.

Recipient:
...

Content:
...

[Allow once]
[Always allow]
[Deny]
```

Approval requests must be real backend state, not frontend popups only.

---

# 27. Permission System

Support permission levels:

```text
Global
Project
Agent
Tool
Task
Session
```

Categories:

```text
Filesystem
Browser
Computer
Network
Communication
Credentials
Applications
Code execution
MCP
Plugins
Financial actions
```

Example:

```text
Filesystem
✓ Read project
⚠ Write project
✕ Delete files
```

Implement actual enforcement.

UI permissions without backend enforcement are not acceptable.

---

# 28. Autonomy Levels

Implement:

```text
Manual
Assist
Balanced
Autonomous
```

Meaning:

### Manual

Ask before significant actions.

### Assist

Agent can execute low-risk actions.

### Balanced

Ask for sensitive/risky actions.

### Autonomous

Only interrupt for configured critical actions.

These modes must map to actual permission behavior.

---

# 29. Browser Workspace

Create a dedicated Browser workspace.

Support:

- browser sessions
- tabs
- navigation
- screenshots
- extraction
- click
- typing
- scrolling
- downloads
- CDP
- browser profiles
- authentication/session persistence where permitted
- agent control
- user takeover

---

# 30. Browser Execution UI

Use:

```text
┌──────────────────────────┬─────────────────────────────┐
│                          │ Agent activity              │
│        BROWSER           │                             │
│                          │ ✓ Navigate                  │
│                          │ ✓ Search                    │
│                          │ ● Extract                  │
│                          │                             │
└──────────────────────────┴─────────────────────────────┘
```

Implement:

```text
Pause
Take control
Return control to agent
Stop
```

---

# 31. Computer Workspace

Create computer-control functionality for supported systems.

Show:

```text
Desktop
Live view
Agent actions
```

Actions should support:

- screenshots
- mouse
- keyboard
- window/application interaction
- terminal where permitted
- application launch where permitted

All actions must respect permission controls.

---

# 32. Files

Create a real file workspace.

Support:

- upload
- drag/drop
- folders
- rename
- move
- delete
- preview
- indexing
- search
- metadata
- tagging
- versioning where implemented
- agent context
- project association

---

# 33. File Preview

When opening a file:

```text
File

Preview

Used in:
Chats
Tasks
Agents

Actions:
Ask Slave
Analyze
Edit
Compare
Export
```

Implement appropriate previews for common file types.

---

# 34. Artifacts

Treat outputs as first-class artifacts.

Support:

```text
Documents
Spreadsheets
Presentations
Images
Videos
Code
Websites
Datasets
Reports
```

Every generated artifact should have:

```text
id
type
name
project
task
creator
version
createdAt
updatedAt
location
metadata
```

---

# 35. Artifact Workspace

Artifacts should open in their appropriate editor/preview.

Provide:

```text
Open
Edit
Ask Slave
Export
Share
Version history
```

---

# 36. Knowledge

Separate Knowledge from raw Files.

Knowledge should support:

```text
Documents
Sources
Facts
Entities
Research
References
Memory
```

Implement indexing/retrieval through the actual backend architecture.

---

# 37. Memory

Implement multiple memory scopes:

```text
User memory
Project memory
Conversation memory
Task memory
Agent memory
System/integration learning where explicitly permitted
```

Every memory should have:

```text
content
scope
source
confidence where applicable
createdAt
updatedAt
```

Users must be able to:

- inspect
- edit
- delete
- forget
- disable memory

Provide:

```text
Forget everything
```

with appropriate confirmation.

---

# 38. Model Providers

Implement provider abstraction.

Support:

- multiple providers
- multiple API keys
- custom endpoints
- OpenAI-compatible endpoints
- model discovery
- model capability detection
- health checks
- rate-limit metadata where available
- provider enable/disable

Provider object:

```text
id
name
type
endpoint
credentialsReference
models
capabilities
status
createdAt
updatedAt
```

---

# 39. BYOK

BYOK must be a first-class feature.

Settings:

```text
Models & Providers

Anthropic
Connected

OpenAI
Connected

Google
Not configured

Custom Provider
Add provider
```

---

# 40. Secret Storage

Never store API keys in plain application state or plaintext database fields.

Use the platform's secure credential storage where possible.

Support:

- secure keychain
- encryption
- credential references
- masked values
- key rotation
- revoke
- test connection

Never log secrets.

Never display secrets in logs.

Never send secrets to models.

---

# 41. Model Selector

Implement a rich model picker.

```text
Auto
Recommended
Fast
Reasoning
Vision
Coding
Long Context
Custom
```

Show relevant capabilities and provider.

Do not hardcode model lists permanently.

Models should be dynamically discovered where provider APIs permit it.

---

# 42. Automatic Model Routing

Implement a routing layer that can consider:

```text
Task requirements
Capabilities
Context size
Latency
Cost
Provider availability
User preferences
Project preferences
Agent requirements
```

Allow manual override.

---

# 43. Connections

Create a dedicated connection manager.

Examples:

```text
Google
GitHub
Slack
Notion
Discord
Linear
Jira
Drive
Dropbox
```

Each connection must have:

```text
status
account
scopes
permissions
tools
lastUsed
disconnect
```

Never fake connection states.

---

# 44. MCP

Create first-class MCP management.

Sections:

```text
Installed
Available
Local
Remote
```

Each MCP server:

```text
Tools
Resources
Prompts
Configuration
Permissions
Logs
Status
```

MCP tools must integrate with the same permission and execution framework.

---

# 45. Plugins

Implement:

```text
Installed
Marketplace
Updates
Developer
```

Plugin metadata:

```text
name
version
publisher
capabilities
permissions
tools
connections
status
```

Plugins must be sandboxed/permissioned according to the application's architecture.

---

# 46. Automations

Create scheduled automation management.

Support:

- one-time
- recurring
- cron-style schedules
- event triggers
- webhook triggers
- file triggers
- integration triggers

Example:

```text
Daily competitor research
09:00

Trigger
↓
Research Slave
↓
Browser Slave
↓
Data Slave
↓
Writer Slave
↓
Save report
↓
Notify user
```

---

# 47. Automation Builder

Create a visual workflow editor.

Nodes:

```text
Trigger
Agent
Tool
Condition
Transform
Approval
Delay
File
Notification
Output
```

Support:

- connections
- configuration
- validation
- test run
- save
- versioning
- enable/disable

---

# 48. Notifications

Create a notification center.

Types:

```text
Info
Approval
Warning
Error
Critical
```

Examples:

```text
Task completed
Approval required
Task failed
Browser authentication required
Automation triggered
```

Don't spam the user.

---

# 49. Error Handling

Every failure must explain:

```text
What happened
Why
What can be done
Technical details
```

Example:

```text
Browser Slave couldn't access this page.

Reason:
Authentication required.

Actions:
[Authenticate]
[Retry]
[Use another browser]
[Take over]
[Stop task]

Technical details
```

---

# 50. Human Takeover

Every controllable agent must support:

```text
Pause
Take control
Return control
Stop
```

When user takes control:

```text
You are controlling Browser Slave.

[Return control to Slave]
```

Persist task state correctly while control changes.

---

# 51. Agent Handoffs

Agents must be able to pass structured outputs.

Example:

```text
Research Slave
      ↓
verified research result
      ↓
Data Slave
      ↓
validated dataset
      ↓
Writer Slave
      ↓
final report
```

Implement structured handoff metadata.

---

# 52. Sources and Citations

Research tasks should preserve source information.

Source object:

```text
url
title
accessedAt
sourceType
taskId
agentId
claims
```

Generated answers should be able to reference their sources.

---

# 53. Right Context Panel

Make the right panel contextual.

For task:

```text
Task
Status
Agents
Actions
Artifacts
Activity
```

For file:

```text
File
Preview
Related chats
Related tasks
Agents
Actions
```

For agent:

```text
Agent
Status
Model
Tools
Permissions
Memory
Runs
```

For project:

```text
Project
Files
Agents
Tasks
Memory
Activity
```

The panel must change based on selection.

---

# 54. Activity Center

Implement system-wide activity.

Filters:

```text
Project
Task
Agent
Tool
Model
User
Error
Permission
Date
```

Use real event data.

---

# 55. Audit Log

Implement security-sensitive audit logging.

Log events such as:

```text
Credential accessed
Permission granted
Permission denied
File modified
File deleted
Browser action
External communication
Agent started
Agent stopped
Model changed
Provider changed
MCP tool executed
```

Never log secret values.

---

# 56. Debugging and Replay

For completed/failed tasks, allow inspection.

Show:

```text
Timeline

Step 1
Navigate

Step 2
Search

Step 3
Extract

Step 4
Save
```

Where technically safe and possible, support restarting/retrying from a recoverable step.

---

# 57. Search

Implement global search across:

```text
Chats
Projects
Tasks
Files
Artifacts
Agents
Memories
Sources
Activity
Connections
```

Use appropriate indexing and pagination.

---

# 58. Keyboard System

Implement:

```text
Cmd/Ctrl + K       Command/Search
Cmd/Ctrl + N       New chat
Cmd/Ctrl + Shift + P   New project
Cmd/Ctrl + J       Tasks
Cmd/Ctrl + B       Sidebar
Cmd/Ctrl + Shift + B   Browser
Cmd/Ctrl + Enter   Execute/send
Esc                Stop/close
Cmd/Ctrl + /       Keyboard shortcuts
```

Make shortcuts configurable where appropriate.

---

# 59. Responsive Layout

Support:

### Normal

Sidebar + main + context.

### Focus

Sidebar + main.

### Fullscreen

Main workspace.

### Split

Chat + browser/artifact/task.

### Multi-window

Separate Browser/Artifact/Task windows where supported.

---

# 60. Tabs

Support workspace tabs for power users.

Examples:

```text
Chat
Browser
Task
Report
Code
```

Tabs should persist appropriately.

---

# 61. Beginner / Advanced UX

Do not expose every advanced configuration immediately.

Beginner experience:

```text
Ask Slave
Projects
Tasks
Files
```

Advanced features become available through:

```text
Agents
Models
Tools
MCP
Permissions
Memory
Execution
Developer
```

Do not remove functionality; progressively disclose it.

---

# 62. Visual Design

Use a premium dark-first desktop UI.

Direction:

- near-black base
- layered dark surfaces
- subtle borders
- restrained amber/gold accent
- strong typography
- high information density without clutter
- subtle motion
- consistent iconography

Do not copy Claude, Cowork, OpenClaw, VS Code, or any other product visually.

The design should feel distinctly Slave.

---

# 63. Design Tokens

Create centralized design tokens for:

```text
colors
backgrounds
surfaces
borders
text
muted text
accent
success
warning
error
spacing
radius
shadows
typography
motion
```

Do not hardcode visual values repeatedly throughout components.

---

# 64. Component System

Create reusable components for:

```text
Sidebar
TopBar
CommandPalette
ChatInput
Message
Attachment
AgentCard
AgentStatus
TaskCard
TaskTimeline
ExecutionTree
ActivityFeed
ApprovalDialog
PermissionPanel
ModelPicker
ProviderCard
FileTree
FilePreview
ArtifactCard
ContextPanel
NotificationCenter
Search
Tabs
SplitPane
Modal
Drawer
Dropdown
Tooltip
Toast
EmptyState
ErrorState
LoadingState
```

Do not duplicate UI implementations.

---

# 65. State Architecture

Separate:

```text
UI state
Domain state
Server/backend state
Persistent state
Execution state
```

Do not put the entire application state into one giant frontend store.

Use clear domain boundaries.

---

# 66. Event Architecture

Implement a proper event system for:

```text
task.started
task.updated
task.completed
task.failed

agent.started
agent.updated
agent.paused
agent.completed
agent.failed

tool.started
tool.completed
tool.failed

approval.requested
approval.approved
approval.denied

artifact.created
artifact.updated

file.created
file.updated

connection.updated
provider.updated
```

The UI should react to actual execution events.

---

# 67. Real-Time Updates

Use an appropriate real-time mechanism for the current architecture.

Execution UI must update without manual refresh.

When:

```text
Agent starts
```

UI immediately changes.

When:

```text
Tool completes
```

activity immediately updates.

When:

```text
Approval required
```

notification/approval UI immediately appears.

---

# 68. Persistence

Persist:

- users
- projects
- chats
- messages
- tasks
- agents
- agent runs
- tool executions
- providers
- models
- files
- artifacts
- memory
- automations
- connections
- MCP configuration
- plugins
- permissions
- audit events

Use the existing database architecture if sound; otherwise introduce proper persistent storage.

Do not rely on local component state for important data.

---

# 69. Validation

Implement validation everywhere.

Examples:

- invalid provider endpoint
- invalid API key
- duplicate provider
- invalid agent configuration
- missing required capability
- invalid automation
- invalid schedule
- invalid permissions
- missing project
- unavailable model

Show useful errors.

---

# 70. Loading States

Never use meaningless global spinners.

Show contextual state:

```text
Loading models...
Connecting to provider...
Indexing files...
Starting browser...
Launching agent...
Waiting for approval...
```

---

# 71. Empty States

Every page needs a meaningful empty state.

Examples:

```text
No projects yet.
[Create project]
```

```text
No agents configured.
Slave can create specialized agents automatically.
[Create agent]
```

No empty white/black blank screens.

---

# 72. Accessibility

Implement:

- keyboard navigation
- focus states
- semantic buttons
- tooltips
- accessible labels
- readable contrast
- reduced-motion support
- screen-reader-compatible controls where practical

---

# 73. Performance

The UI must remain responsive with:

- thousands of messages
- hundreds of tasks
- hundreds of files
- many activity events
- many agents
- long-running executions

Use:

- virtualization
- pagination
- lazy loading
- memoization
- efficient event subscriptions
- debounced search
- background indexing

---

# 74. Security

Security must be treated as a product feature.

Implement:

- secure credential storage
- permission enforcement
- audit logs
- secret redaction
- scoped credentials
- safe tool execution
- confirmation for risky operations
- safe external communication
- secure plugin/MCP boundaries
- no secret logging

---

# 75. Agent Safety Boundaries

Agents should not automatically:

- delete arbitrary files
- send communications
- purchase anything
- expose credentials
- install software
- execute unrestricted commands
- publish content

unless the configured permission policy explicitly allows it.

---

# 76. Developer Mode

Create:

```text
Developer

Logs
Agent traces
Event stream
Tool registry
MCP
API
Webhooks
Terminal
Environment
Diagnostics
```

Make technical information accessible without polluting normal UX.

---

# 77. Settings

Implement:

```text
General
Appearance
Chat
Models
Providers
Agents
Permissions
Memory
Browser
Computer
Files
MCP
Plugins
Connections
Automation
Notifications
Security
Privacy
Storage
Developer
Advanced
```

Every setting must actually affect application behavior.

---

# 78. Settings Search

Settings should be searchable.

Example:

```text
Search settings...
```

Typing:

```text
API key
```

should find provider credential settings.

Typing:

```text
memory
```

should find all relevant memory settings.

---

# 79. Notifications

Implement persistent notification history.

Support:

```text
mark read
mark all read
open related object
dismiss
notification preferences
```

---

# 80. Home Customization

Allow users to customize dashboard widgets:

```text
Continue working
Active tasks
Scheduled tasks
Recent files
Recent projects
Artifacts
System status
Usage
```

Persist customization.

---

# 81. Project Templates

Implement templates such as:

```text
Software Development
Research
Startup
Marketing
Content
Data Analysis
Automation
Personal Assistant
```

Templates can configure:

- folders
- agents
- tools
- memory
- automations
- default model

---

# 82. Universal Context

Every object should support contextual actions.

For a file:

```text
Ask Slave about this
Analyze
Use in task
Add to project
Share with agent
```

For an agent:

```text
Run
Use in task
Edit
Duplicate
View activity
```

For a task:

```text
Resume
Pause
Stop
Retry
View activity
Open artifacts
```

---

# 83. Artifact Editing

Support contextual AI actions:

```text
Rewrite
Explain
Shorten
Expand
Research
Fact-check
Translate
Improve
```

The actual action should operate on the selected artifact/content.

---

# 84. User Takeover

The user must always remain in control.

Provide obvious controls:

```text
Pause
Stop
Take control
Deny
Approve
```

Emergency:

```text
STOP ALL AGENTS
```

must be globally accessible when agents are active.

---

# 85. Do Not Fake Functionality

This is critical.

Do NOT implement:

```text
fake agent progress
fake model discovery
fake browser activity
fake task completion
fake connection status
fake MCP tools
fake automation execution
fake memory
fake API validation
fake audit logs
```

If a backend capability is unavailable, implement the UI state and connect it to a clearly defined service boundary, but do not pretend that the operation succeeded.

---

# 86. Production Quality

Before considering the implementation complete, verify:

```text
No hardcoded demo data
No broken navigation
No dead buttons
No fake loading
No missing error states
No unhandled promise errors
No secret leakage
No console errors
No TypeScript errors
No obvious accessibility issues
No broken persistence
No duplicate components
No inconsistent styling
```

---

# 87. Testing

Add tests appropriate to the existing stack.

At minimum test:

### Chat

- send message
- streaming
- attachments
- stop
- retry
- persistence

### Projects

- create
- rename
- delete/archive
- chat association
- files
- settings

### Agents

- create
- edit
- run
- stop
- permissions
- model selection

### Tasks

- create
- execute
- pause
- resume
- stop
- fail
- retry
- complete

### Providers

- add
- validate
- discover models
- select model
- remove

### Permissions

- allow
- deny
- approval
- enforcement

### Browser

- start session
- agent action
- pause
- takeover
- return control

### Memory

- create
- retrieve
- edit
- forget

### Automations

- create
- schedule
- enable
- disable
- execute

---

# 88. Implementation Strategy

Do not attempt to build everything as one giant UI change.

Implement in vertical slices.

## Phase 1 — Foundation

Build:

```text
Application shell
Navigation
Command palette
Design system
Routing
Persistent state
Error/loading/empty states
```

## Phase 2 — Core Chat

Build:

```text
Chat
Streaming
Attachments
@ context
/ commands
Model selector
Chat persistence
```

## Phase 3 — Agents

Build:

```text
Agent system
Master Slave
Agent builder
Agent execution
Agent statuses
Task system
```

## Phase 4 — Execution

Build:

```text
Execution tree
Activity
Approvals
Permissions
Human takeover
Audit log
```

## Phase 5 — Browser/Computer

Build:

```text
Browser
CDP
Browser agent
Computer agent
Takeover
```

## Phase 6 — Projects/Files/Artifacts

Build:

```text
Projects
Files
Knowledge
Artifacts
Memory
```

## Phase 7 — Integrations

Build:

```text
Providers
BYOK
Models
MCP
Plugins
Connections
```

## Phase 8 — Automation

Build:

```text
Tasks
Schedules
Automation builder
Triggers
Notifications
```

## Phase 9 — Developer

Build:

```text
Logs
Traces
Diagnostics
Tool registry
Webhooks
Developer settings
```

## Phase 10 — Polish

Perform:

```text
Performance
Accessibility
Security
Testing
Error handling
UX refinement
Visual consistency
```

---

# 89. Important Development Behavior

When working on this project:

- Inspect the existing codebase before changing architecture.
- Continue using existing working integrations.
- Fix root causes rather than patching symptoms.
- Build reusable components.
- Keep frontend/backend contracts explicit.
- Keep domain models strongly typed.
- Do not create duplicate state systems.
- Do not hardcode provider/model data if dynamic discovery is possible.
- Do not expose secrets.
- Do not create fake execution.
- Do not stop after making the UI visually similar to the specification.

When a feature is implemented, test the **complete user journey**.

Example:

```text
User creates provider
        ↓
API key securely stored
        ↓
Provider validated
        ↓
Models discovered
        ↓
Model appears in selector
        ↓
User sends chat
        ↓
Correct provider receives request
        ↓
Response streams
        ↓
Chat persists
```

Not merely:

```text
Provider page looks good.
```

---

# 90. Definition of Done

A feature is complete only when:

```text
UI
+
State
+
Backend/domain logic
+
Persistence
+
Validation
+
Error handling
+
Permissions
+
Loading states
+
Empty states
+
Real execution
+
Testing
```

are implemented where applicable.

---

# 91. Final UX Target

The finished Slave application should feel like:

```text
                  SLAVE
                    │
             "What do you need?"
                    │
                    ▼
                USER INTENT
                    │
                    ▼
              MASTER SLAVE
                    │
             ┌──────┼──────┐
             ▼      ▼      ▼
          Agents  Models  Memory
             │      │      │
             └──────┼──────┘
                    ▼
                  TASK
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Browser     Computer     Apps
        │           │           │
        └───────────┼───────────┘
                    ▼
                 TOOLS
                    │
             MCP / Plugins
                    │
                    ▼
                EXECUTION
                    │
             ┌──────┼──────┐
             ▼      ▼      ▼
          Activity Approval Audit
             │
             ▼
             RESULT
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
   Artifact Files Knowledge
```

The user should be able to move between these layers without losing context.

The **chat is the command interface**.

The **task is the unit of work**.

The **agent is the worker**.

The **tool is the capability**.

The **project is the persistent workspace**.

The **memory is the long-term context**.

The **artifact is the output**.

The **activity/audit system is the observability layer**.

The **permission system is the control layer**.

That should be the architectural and UX foundation for Slave.

---

# 92. Immediate Instruction

Start by inspecting the current Slave repository and mapping the existing implementation against this specification.

Create an internal implementation matrix:

```text
Feature
Current state
Existing components
Existing backend
Missing backend
Missing UI
Dependencies
Priority
Status
```

Then implement the highest-priority vertical slice.

Do **not** merely produce an implementation plan and stop.

**Start modifying the actual project and continue implementing the functionality.**

After each major subsystem:

1. run the relevant build/type checks
2. run tests
3. fix errors
4. inspect the UI
5. verify persistence
6. verify real backend behavior
7. continue to the next subsystem

Continue until the complete production-grade Slave experience described above is implemented as far as the existing environment and integrations allow.
