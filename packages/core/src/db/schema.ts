import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  configuration: text('configuration'), // JSON string for tools, MCP, memory, etc.
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const connections = sqliteTable('connections', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(), // 'github', 'slack', 'google'
  status: text('status').notNull(),
  account: text('account'),
  scopes: text('scopes'), // JSON
  permissions: text('permissions'), // JSON
  lastUsed: integer('last_used'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'orchestrator', 'specialist', 'utility'
  instructions: text('instructions'),
  model: text('model'),
  provider: text('provider'),
  capabilities: text('capabilities'), // JSON
  tools: text('tools'), // JSON
  permissions: text('permissions'), // JSON
  memoryScope: text('memory_scope'), // JSON
  projectScope: text('project_scope'), // JSON
  status: text('status').notNull(), // 'active', 'inactive', 'paused'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const mcpServers = sqliteTable('mcp_servers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'local' or 'remote'
  command: text('command'), // for local stdio
  args: text('args'), // JSON for local stdio args
  env: text('env'), // JSON
  url: text('url'), // for remote SSE
  status: text('status').notNull(), // 'connected', 'disconnected', 'error'
  capabilities: text('capabilities'), // JSON of tools, resources, prompts
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  intent: text('intent').notNull(),
  title: text('title'),
  description: text('description'),
  projectId: text('project_id'),
  conversationId: text('conversation_id'),
  status: text('status').notNull(), // 'queued', 'planning', 'running', 'waiting_approval', 'paused', 'completed', 'failed', 'cancelled'
  plan: text('plan'),
  agents: text('agents'),
  actions: text('actions'),
  artifacts: text('artifacts'),
  permissions: text('permissions'),
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  error: text('error'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  metadata: text('metadata'), // JSON string
});

export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  objective: text('objective').notNull(),
  dependencies: text('dependencies'), // JSON array of subtask ids
  assignedSlave: text('assigned_slave'),
  status: text('status').notNull(), // 'queued', 'running', 'completed', 'failed'
  inputs: text('inputs'), // JSON
  outputs: text('outputs'), // JSON
});

export const memories = sqliteTable('memories', {
  id: text('id').primaryKey(),
  scope: text('scope').notNull(), // 'user', 'project', 'conversation', 'task', 'agent', 'system'
  source: text('source').notNull(), // agent ID or 'user'
  content: text('content').notNull(),
  confidence: real('confidence').notNull(), // 0.0 to 1.0
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const runs = sqliteTable('runs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  attempt: integer('attempt').notNull(),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at'),
  status: text('status').notNull(),
  error: text('error'),
});


export const telemetry = sqliteTable('telemetry', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  taskId: text('task_id').notNull(),
  promptTokens: integer('prompt_tokens').notNull(),
  completionTokens: integer('completion_tokens').notNull(),
  durationMs: integer('duration_ms').notNull(),
  errorCount: integer('error_count').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  publisher: text('publisher').notNull(),
  capabilities: text('capabilities').notNull(), // JSON
  permissions: text('permissions').notNull(), // JSON
  tools: text('tools').notNull(), // JSON
  connections: text('connections').notNull(), // JSON
  status: text('status').notNull(), // 'installed', 'disabled', 'error'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const automations = sqliteTable('automations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  triggerType: text('trigger_type').notNull(), // 'cron', 'event', 'webhook', 'file'
  triggerConfig: text('trigger_config').notNull(), // JSON
  targetIntent: text('target_intent').notNull(),
  status: text('status').notNull(), // 'active', 'paused'
  lastRunAt: integer('last_run_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at').notNull(),
  title: text('title'),
});

export const llmProviders = sqliteTable('llm_providers', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  priority: integer('priority').notNull().default(0),
  baseUrl: text('base_url'),
  metadata: text('metadata'),
});

export const llmCredentials = sqliteTable('llm_credentials', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').references(() => llmProviders.id).notNull(),
  fingerprint: text('fingerprint').notNull(),
  encryptedData: text('encrypted_data').notNull(),
});

export const llmModels = sqliteTable('llm_models', {
  id: text('id').notNull(), // This is the ID specific to the provider, like gpt-4o
  providerId: text('provider_id').references(() => llmProviders.id).notNull(),
  displayName: text('display_name').notNull(),
  metadata: text('metadata'), // Extra metadata (context window, pricing)
  capabilities: text('capabilities').notNull(), // JSON
  availability: text('availability').notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => conversations.id).notNull(),
  role: text('role').notNull(), // 'user', 'agent', 'system'
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
});
