import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import { join } from 'path';
import { initDb, MainSlave, initModelProvider, PluginLoader, SwarmNode, AgentRegistry as AR, AgentRegistry, MemoryManager, getDb, tasks, subtasks, CredentialService, ProviderRegistry, ProviderManager, ModelManager, ChatManager } from '@slave/core';
import { desc } from 'drizzle-orm';
import fs from 'fs';
import crypto from 'crypto';

let mainSlave: MainSlave;
let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  const userData = app.getPath('userData');
  const dbPath = join(userData, 'slave.sqlite');
  const configPath = join(userData, 'config.json');

  console.log('Initializing DB at', dbPath);
  const db = initDb(dbPath);

  // Initialize schema if not exists
  const sqlite = (db as any).session.client;
  await sqlite.executeMultiple(`
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, configuration TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS connections (id TEXT PRIMARY KEY, provider TEXT NOT NULL, status TEXT NOT NULL, account TEXT, scopes TEXT, permissions TEXT, last_used INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS mcp_servers (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, command TEXT, args TEXT, env TEXT, url TEXT, status TEXT NOT NULL, capabilities TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, type TEXT NOT NULL, instructions TEXT, model TEXT, provider TEXT, capabilities TEXT, tools TEXT, permissions TEXT, memory_scope TEXT, project_scope TEXT, status TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, intent TEXT NOT NULL, title TEXT, description TEXT, project_id TEXT, conversation_id TEXT, status TEXT NOT NULL, plan TEXT, agents TEXT, actions TEXT, artifacts TEXT, permissions TEXT, started_at INTEGER, completed_at INTEGER, error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, metadata TEXT);
    CREATE TABLE IF NOT EXISTS subtasks (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, objective TEXT NOT NULL, dependencies TEXT, assigned_slave TEXT, status TEXT NOT NULL, inputs TEXT, outputs TEXT);
    DROP TABLE IF EXISTS memories;
    CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY, scope TEXT NOT NULL, source TEXT NOT NULL, content TEXT NOT NULL, confidence REAL NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, attempt INTEGER NOT NULL, started_at INTEGER NOT NULL, completed_at INTEGER, status TEXT NOT NULL, error TEXT);
    CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, title TEXT);
    CREATE TABLE IF NOT EXISTS telemetry (id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, task_id TEXT NOT NULL, prompt_tokens INTEGER NOT NULL, completion_tokens INTEGER NOT NULL, duration_ms INTEGER NOT NULL, error_count INTEGER NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS plugins (id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT NOT NULL, publisher TEXT NOT NULL, capabilities TEXT NOT NULL, permissions TEXT NOT NULL, tools TEXT NOT NULL, connections TEXT NOT NULL, status TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS automations (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, trigger_type TEXT NOT NULL, trigger_config TEXT NOT NULL, target_intent TEXT NOT NULL, status TEXT NOT NULL, last_run_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS llm_providers (id TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, priority INTEGER NOT NULL DEFAULT 0, base_url TEXT, metadata TEXT);
    CREATE TABLE IF NOT EXISTS llm_credentials (id TEXT PRIMARY KEY, provider_id TEXT NOT NULL, fingerprint TEXT NOT NULL, encrypted_data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS llm_models (id TEXT NOT NULL, provider_id TEXT NOT NULL, display_name TEXT NOT NULL, metadata TEXT, capabilities TEXT NOT NULL, availability TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, type TEXT NOT NULL, agent_id TEXT, task_id TEXT, description TEXT NOT NULL, created_at INTEGER NOT NULL);
  `);
  
  const { sql } = await import('drizzle-orm');
  // Safe alter table for existing DBs
  try { await db.run(sql`ALTER TABLE llm_providers ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;`); } catch (e) {}
  
  // Phase 1 Tasks Schema Expansion
  const newTasksCols = ['title', 'description', 'project_id', 'conversation_id', 'plan', 'agents', 'actions', 'artifacts', 'permissions', 'started_at', 'completed_at', 'error'];
  for (const col of newTasksCols) {
    try { await db.run(sql.raw(`ALTER TABLE tasks ADD COLUMN ${col} TEXT;`)); } catch (e) {}
  }

  CredentialService.getInstance().setStrategy({
    encrypt: (text) => {
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.encryptString(text).toString('base64');
      }
      return Buffer.from(text).toString('base64'); // Fallback ONLY if encryption is strictly unavailable on host OS
    },
    decrypt: (encrypted) => {
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
      }
      return Buffer.from(encrypted, 'base64').toString('utf8');
    }
  });

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.openAiKey) {
        initModelProvider(config.openAiKey);
      }
    } catch (e) {}
  }

  PluginLoader.getInstance().init(join(userData, 'plugins'));

  // Init Network Topology (Phase 17)
  const SWARM_PORT = 8080;
  const SWARM_SECRET = 'slave-os-secret'; // Hardcoded for POC
  SwarmNode.getInstance().initServer(SWARM_PORT, SWARM_SECRET);

  mainSlave = new MainSlave();

  AR.getInstance().subscribe('OS_REBOOT_REQUEST', (payload: any) => {
    console.log(`[OS] Intercepted Reboot Request: ${payload.reason}. Initiating shutdown sequence...`);
    SwarmNode.getInstance().server?.stop();
    SwarmNode.getInstance().client?.disconnect();
    app.relaunch();
    app.exit(0);
  });

  AR.getInstance().subscribe('EYE_ACTIVE', (payload: any) => {
    if (mainWindow) {
      mainWindow.webContents.send('eye-active', payload.active);
    }
  });

  ipcMain.handle('ping', () => 'pong');
  
  ipcMain.handle('get-config', () => {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
  });

  ipcMain.handle('set-config', (_, config) => {
    fs.writeFileSync(configPath, JSON.stringify(config));
    if (config.openAiKey) {
      initModelProvider(config.openAiKey);
    }
    return true;
  });

  ipcMain.handle('submit-intent', async (event, intent: string, options?: { providerId: string, modelId: string, temperature?: number, maxTokens?: number, attachments?: any[] }) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      const onStatusUpdate = (msg: string) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('task-update', msg);
        }
      };

      const taskId = await mainSlave.receiveIntent(intent, options || { providerId: 'openai', modelId: 'gpt-4o' }, onStatusUpdate);
      return { success: true, taskId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  const memoryManager = new MemoryManager();

  ipcMain.handle('get-memories', async (_, scope?: string) => {
    if (scope) return await memoryManager.getMemoriesByScope(scope);
    return await memoryManager.getAllMemories();
  });

  ipcMain.handle('save-memory', async (_, scope: string, source: string, content: string, confidence?: number) => {
    await memoryManager.saveMemory(scope, source, content, confidence);
    return true;
  });

  ipcMain.handle('update-memory', async (_, id: string, content: string, confidence?: number) => {
    await memoryManager.updateMemory(id, content, confidence);
    return true;
  });

  ipcMain.handle('delete-memory', async (_, id: string) => {
    await memoryManager.deleteMemory(id);
    return true;
  });

  ipcMain.handle('forget-all-memories', async () => {
    await memoryManager.forgetAll();
    return true;
  });

  ipcMain.handle('get-active-tasks', async () => {
    const db = getDb();
    const recentTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(5);
    const recentSubtasks = await db.select().from(subtasks);
    return { tasks: recentTasks, subtasks: recentSubtasks };
  });

  ipcMain.handle('get-agents', async () => {
    const db = getDb();
    const { agents } = await import('@slave/core/dist/db/schema.js');
    try {
      const allAgents = await db.select().from(agents);
      if (allAgents.length === 0) {
        return AgentRegistry.getInstance().getAllAgents();
      }
      return allAgents;
    } catch (e) {
      return AgentRegistry.getInstance().getAllAgents();
    }
  });

  ipcMain.handle('save-agent', async (_, agentData: any) => {
    const db = getDb();
    const { agents } = await import('@slave/core/dist/db/schema.js');
    const now = Date.now();
    const isNew = !agentData.id;
    const id = agentData.id || require('crypto').randomUUID();

    const record = {
      id,
      name: agentData.name,
      description: agentData.description || '',
      type: agentData.type || 'specialist',
      instructions: agentData.instructions || '',
      model: agentData.model || '',
      provider: agentData.provider || '',
      capabilities: JSON.stringify(agentData.capabilities || []),
      tools: JSON.stringify(agentData.tools || []),
      permissions: JSON.stringify(agentData.permissions || []),
      memoryScope: JSON.stringify(agentData.memoryScope || []),
      projectScope: JSON.stringify(agentData.projectScope || []),
      status: 'active',
      updatedAt: now,
    };

    if (isNew) {
      await db.insert(agents).values({ ...record, createdAt: now });
    } else {
      const { eq } = await import('drizzle-orm');
      await db.update(agents).set(record).where(eq(agents.id, id));
    }
    return { ...record, createdAt: isNew ? now : undefined };
  });

  ipcMain.handle('get-telemetry', async () => {
    const db = getDb();
    const { telemetry } = await import('@slave/core/dist/db/schema.js');
    try {
      const records = await db.select().from(telemetry).orderBy(desc(telemetry.createdAt)).limit(100);
      return records;
    } catch (e) {
      return [];
    }
  });

  // ── Plugins Handlers ──────────────────────────────────────────────────────
  ipcMain.handle('plugins.list', async () => {
    return await PluginLoader.getInstance().getPlugins();
  });
  ipcMain.handle('plugins.install', async (_, manifest: any) => {
    // In a real implementation this would download/unzip the plugin.
    // For V1 we're just syncing it manually via the loader UI mock.
    return true;
  });
  ipcMain.handle('plugins.uninstall', async (_, id: string) => {
    await PluginLoader.getInstance().uninstallPlugin(id);
    return true;
  });
  ipcMain.handle('plugins.toggle', async (_, id: string, enabled: boolean) => {
    await PluginLoader.getInstance().togglePlugin(id, enabled);
    return true;
  });

  // ── Automations Handlers ──────────────────────────────────────────────────
  ipcMain.handle('automations.list', async () => {
    const { AutomationManager } = await import('@slave/core');
    return await AutomationManager.getInstance().listAutomations();
  });
  ipcMain.handle('automations.create', async (_, data: any) => {
    const { AutomationManager } = await import('@slave/core');
    return await AutomationManager.getInstance().createAutomation(data);
  });
  ipcMain.handle('automations.toggle', async (_, id: string, active: boolean) => {
    const { AutomationManager } = await import('@slave/core');
    await AutomationManager.getInstance().toggleAutomation(id, active);
    return true;
  });
  ipcMain.handle('automations.delete', async (_, id: string) => {
    const { AutomationManager } = await import('@slave/core');
    await AutomationManager.getInstance().deleteAutomation(id);
    return true;
  });
  // ── Notifications Handlers ────────────────────────────────────────────────
  ipcMain.handle('notifications.action', async (_, notificationId: string, actionId: string) => {
    console.log(`[NotificationAction] Notification ${notificationId} Action ${actionId} clicked.`);
    // Future integration point for resolving approvals or taking over
    return true;
  });

  // Global helper to push notifications to the renderer
  (global as any).pushNotification = (payload: any) => {
    mainWindow?.webContents.send('push-notification', payload);
  };

  // ── MCP Handlers ──────────────────────────────────────────────────────────
  ipcMain.handle('mcp.listServers', async () => {
    const { McpManager } = await import('@slave/core');
    return await McpManager.getInstance().listServers();
  });

  ipcMain.handle('mcp.addServer', async (_, serverData: any) => {
    const { McpManager } = await import('@slave/core');
    return await McpManager.getInstance().addServer(serverData);
  });

  ipcMain.handle('mcp.removeServer', async (_, id: string) => {
    const { McpManager } = await import('@slave/core');
    return await McpManager.getInstance().removeServer(id);
  });

  ipcMain.handle('mcp.getTools', async (_, serverId: string) => {
    const { McpManager } = await import('@slave/core');
    return await McpManager.getInstance().getTools(serverId);
  });

  ipcMain.handle('get-swarm-clients', () => {
    const node = SwarmNode.getInstance();
    if (node.server) {
      return node.server.getConnectedClients();
    }
    return [];
  });

  ipcMain.handle('activity.getLogs', async (_, filters?: any) => {
    const db = getDb();
    const sqlite = (db as any).session.client;
    // Basic filter logic (mocked up SQL parsing for simplicity here)
    let query = 'SELECT * FROM activities ORDER BY created_at DESC LIMIT 100';
    if (filters?.agent_id) {
      query = `SELECT * FROM activities WHERE agent_id = '${filters.agent_id}' ORDER BY created_at DESC LIMIT 100`;
    }
    const res = await sqlite.execute(query);
    return res.rows;
  });

  ipcMain.handle('llm.providers.list', () => {
    return ProviderRegistry.getInstance().getProviders();
  });

  ipcMain.handle('llm.providers.add', async (_, providerMeta, credentialPlaintext) => {
    await ProviderManager.getInstance().addProvider(providerMeta, credentialPlaintext);
    return true;
  });

  ipcMain.handle('llm.providers.delete', async (_, id) => {
    await ProviderManager.getInstance().deleteProvider(id);
    return true;
  });

  ipcMain.handle('llm.providers.toggle', async (_, id, enabled: boolean) => {
    await ProviderManager.getInstance().toggleProvider(id, enabled);
    return true;
  });

  ipcMain.handle('llm.providers.setPriority', async (_, id, priority: number) => {
    await ProviderManager.getInstance().setProviderPriority(id, priority);
    return true;
  });

  ipcMain.handle('llm.providers.test', async (_, id) => {
    return await ProviderRegistry.getInstance().testConnection(id);
  });

  ipcMain.handle('llm.models.list', () => {
    return ModelManager.getInstance().getModelsFromDb();
  });

  ipcMain.handle('llm.models.refresh', async (_, providerId) => {
    await ModelManager.getInstance().refreshModelsForProvider(providerId);
    return ModelManager.getInstance().getModelsForProvider(providerId);
  });

  // Load existing providers from DB on startup
  try {
    await ProviderManager.getInstance().loadProvidersFromDb();
  } catch (err) {
    console.error('Failed to load providers from DB', err);
  }

  ipcMain.handle('llm.chat.getConversations', async () => {
    return await ChatManager.getInstance().getConversations();
  });

  ipcMain.handle('llm.chat.getConversation', async (_, id: string) => {
    return await ChatManager.getInstance().getConversation(id);
  });

  ipcMain.handle('llm.chat.createConversation', async (_, title?: string) => {
    return await ChatManager.getInstance().createConversation(title);
  });

  ipcMain.handle('llm.chat.renameConversation', async (_, id: string, title: string) => {
    await ChatManager.getInstance().renameConversation(id, title);
    return true;
  });

  ipcMain.handle('llm.chat.deleteConversation', async (_, id: string) => {
    await ChatManager.getInstance().deleteConversation(id);
    return true;
  });

  ipcMain.handle('llm.chat.getMessages', async (_, conversationId: string) => {
    return await ChatManager.getInstance().getMessages(conversationId);
  });

  ipcMain.handle('llm.chat.saveMessage', async (_, conversationId: string, role: 'user' | 'agent' | 'system', content: string) => {
    return await ChatManager.getInstance().saveMessage(conversationId, role, content);
  });

  ipcMain.handle('llm.chat.deleteMessage', async (_, messageId: string) => {
    await ChatManager.getInstance().deleteMessage(messageId);
    return true;
  });

  ipcMain.handle('llm.chat.generateTitle', async (_, providerId: string, modelId: string, prompt: string) => {
    try {
      const provider = ProviderRegistry.getInstance().getProvider(providerId);
      if (!provider) return 'New Chat';
      const response = await provider.chat({
        modelId,
        messages: [
          { role: 'system', content: 'You are a title generator. Generate a 3-5 word title for the following prompt. Return ONLY the title string.' },
          { role: 'user', content: prompt }
        ],
        maxTokens: 10
      });
      return response.content?.trim().replace(/^["']|["']$/g, '') || 'New Chat';
    } catch (e) {
      return 'New Chat';
    }
  });

  ipcMain.handle('llm.task.abort', async (_, taskId: string) => {
    try {
      mainSlave.abortTask(taskId);
      return true;
    } catch (e) {
      return false;
    }
  });

  // ── Analytics ────────────────────────────────────────────────────────────
  ipcMain.handle('analytics.getStats', async () => {
    try {
      const db = getDb();
      const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(200);
      const totalTasks     = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      const failedTasks    = allTasks.filter(t => t.status === 'failed').length;
      const runningTasks   = allTasks.filter(t => t.status === 'running').length;

      // Aggregate token usage from metadata
      let totalTokens = 0;
      let estimatedCostUsd = 0;
      const byModel: Record<string, { tokens: number; cost: number; requests: number }> = {};
      for (const task of allTasks) {
        try {
          const meta = task.metadata ? JSON.parse(task.metadata) : {};
          if (meta.usage) {
            const tokens = (meta.usage.totalTokens ?? 0) as number;
            const cost   = (meta.usage.costUsd ?? 0)    as number;
            const model  = (meta.modelId ?? 'unknown')  as string;
            totalTokens += tokens;
            estimatedCostUsd += cost;
            if (!byModel[model]) byModel[model] = { tokens: 0, cost: 0, requests: 0 };
            byModel[model].tokens   += tokens;
            byModel[model].cost     += cost;
            byModel[model].requests += 1;
          }
        } catch (_e) {}
      }

      return {
        totalTasks, completedTasks, failedTasks, runningTasks,
        totalTokens, estimatedCostUsd, byModel,
        recentTasks: allTasks.slice(0, 50).map(t => ({
          id: t.id,
          objective: t.intent,
          status: t.status,
          createdAt: new Date(Number(t.createdAt)).toISOString(),
          metadata: t.metadata,
        })),
      };
    } catch (e: any) {
      return { totalTasks: 0, completedTasks: 0, failedTasks: 0, runningTasks: 0, totalTokens: 0, estimatedCostUsd: 0, byModel: {}, recentTasks: [] };
    }
  });


  // ── Desktop notifications ─────────────────────────────────────────────────
  ipcMain.handle('notifications.requestPermission', () => true);

  // ── Provider capability detection ─────────────────────────────────────────
  ipcMain.handle('llm.providers.getCapabilities', (_, modelId: string) => {
    return ProviderRegistry.getInstance().getModelCapabilities(modelId);
  });

  ipcMain.handle('llm.providers.getModels', async (_, providerId: string) => {
    try {
      const adapter = ProviderRegistry.getInstance().getProvider(providerId);
      return await adapter.getModels();
    } catch (_e) { return []; }
  });

  // ── Projects (simple in-memory map backed by config) ─────────────────────
  const projectsMap = new Map<string, { id: string; name: string; description: string; createdAt: string }>();
  ipcMain.handle('projects.list',   ()                              => Array.from(projectsMap.values()));
  ipcMain.handle('projects.create', (_, name: string, description: string) => {
    const id = crypto.randomUUID();
    const p = { id, name, description, createdAt: new Date().toISOString() };
    projectsMap.set(id, p);
    return p;
  });
  ipcMain.handle('projects.delete', (_, id: string)                => { projectsMap.delete(id); return true; });
  ipcMain.handle('projects.rename', (_, id: string, name: string)  => {
    const p = projectsMap.get(id);
    if (p) { p.name = name; projectsMap.set(id, p); }
    return true;
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
  if (process.env.VITE_DEV_SERVER_URL) {
    try {
      process.kill(process.ppid);
    } catch(e) {}
  }
});

