import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {
  ping: () => ipcRenderer.invoke('ping'),
  submitIntent: (intent: string, options?: any) => ipcRenderer.invoke('submit-intent', intent, options),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  onTaskUpdate: (callback: (msg: string) => void) => {
    ipcRenderer.on('task-update', (_event, msg) => callback(msg));
  },
  getMemories: (scope?: string) => ipcRenderer.invoke('get-memories', scope),
  saveMemory: (scope: string, source: string, content: string, confidence?: number) => ipcRenderer.invoke('save-memory', scope, source, content, confidence),
  getActiveTasks: () => ipcRenderer.invoke('get-active-tasks'),
  getAgents: () => ipcRenderer.invoke('get-agents'),
  saveAgent: (agent: any) => ipcRenderer.invoke('save-agent', agent),
  analytics: {
    getStats: () => ipcRenderer.invoke('analytics.getStats'),
  },
  memory: {
    update: (id: string, content: string, confidence?: number) => ipcRenderer.invoke('update-memory', id, content, confidence),
    delete: (id: string) => ipcRenderer.invoke('delete-memory', id),
    forgetAll: () => ipcRenderer.invoke('forget-all-memories'),
  },
  plugins: {
    list: () => ipcRenderer.invoke('plugins.list'),
    install: (manifest: any) => ipcRenderer.invoke('plugins.install', manifest),
    uninstall: (id: string) => ipcRenderer.invoke('plugins.uninstall', id),
    toggle: (id: string, enabled: boolean) => ipcRenderer.invoke('plugins.toggle', id, enabled),
  },
  automations: {
    list: () => ipcRenderer.invoke('automations.list'),
    create: (data: any) => ipcRenderer.invoke('automations.create', data),
    toggle: (id: string, active: boolean) => ipcRenderer.invoke('automations.toggle', id, active),
    delete: (id: string) => ipcRenderer.invoke('automations.delete', id),
  },
  notifications: {
    onNotification: (callback: (notification: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('push-notification', handler);
      return () => ipcRenderer.removeListener('push-notification', handler);
    },
    action: (notificationId: string, actionId: string) => ipcRenderer.invoke('notifications.action', notificationId, actionId),
    requestPermission: () => ipcRenderer.invoke('notifications.requestPermission'),
  },
  activity: {
    getLogs: (filters?: any) => ipcRenderer.invoke('activity.getLogs', filters),
    onLog: (callback: (log: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('activity-log', handler);
      return () => ipcRenderer.removeListener('activity-log', handler);
    }
  },
  projects: {
    list:   ()                                  => ipcRenderer.invoke('projects.list'),
    create: (name: string, description: string) => ipcRenderer.invoke('projects.create', name, description),
    delete: (id: string)                        => ipcRenderer.invoke('projects.delete', id),
    rename: (id: string, name: string)          => ipcRenderer.invoke('projects.rename', id, name),
  },
  mcp: {
    listServers: () => ipcRenderer.invoke('mcp.listServers'),
    addServer: (serverData: any) => ipcRenderer.invoke('mcp.addServer', serverData),
    removeServer: (id: string) => ipcRenderer.invoke('mcp.removeServer', id),
    getTools: (serverId: string) => ipcRenderer.invoke('mcp.getTools', serverId),
  },
  providers: {
    list:           ()                  => ipcRenderer.invoke('llm.providers.list'),
    getModels:      (id: string)        => ipcRenderer.invoke('llm.providers.getModels', id),
    test:           (id: string)        => ipcRenderer.invoke('llm.providers.test', id),
    getCapabilities:(modelId: string)   => ipcRenderer.invoke('llm.providers.getCapabilities', modelId),
  },

  chat: {
    getConversations: () => ipcRenderer.invoke('llm.chat.getConversations'),
    getConversation: (id: string) => ipcRenderer.invoke('llm.chat.getConversation', id),
    createConversation: (title?: string) => ipcRenderer.invoke('llm.chat.createConversation', title),
    renameConversation: (id: string, title: string) => ipcRenderer.invoke('llm.chat.renameConversation', id, title),
    deleteConversation: (id: string) => ipcRenderer.invoke('llm.chat.deleteConversation', id),
    getMessages: (conversationId: string) => ipcRenderer.invoke('llm.chat.getMessages', conversationId),
    saveMessage: (conversationId: string, role: string, content: string) => ipcRenderer.invoke('llm.chat.saveMessage', conversationId, role, content),
    deleteMessage: (messageId: string) => ipcRenderer.invoke('llm.chat.deleteMessage', messageId),
    generateTitle: (providerId: string, modelId: string, prompt: string) => ipcRenderer.invoke('llm.chat.generateTitle', providerId, modelId, prompt),
    abortTask: (taskId: string) => ipcRenderer.invoke('llm.task.abort', taskId)
  }
};

try {
  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
      once: (channel: string, listener: (event: any, ...args: any[]) => void) => ipcRenderer.once(channel, listener),
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
      removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
      removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
    }
  });
  contextBridge.exposeInMainWorld('api', api);
} catch (error) {
  console.error(error);
}
