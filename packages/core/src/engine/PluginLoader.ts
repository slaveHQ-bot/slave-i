import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb, plugins } from '../db';
import { eq } from 'drizzle-orm';

export interface PluginManifest {
  name: string;
  version: string;
  publisher: string;
  capabilities: string[];
  permissions: string[];
  tools: any[];
  connections: string[];
}

export class PluginLoader {
  private static instance: PluginLoader;
  private pluginsPath: string = '';
  private pluginTools: Record<string, any> = {};

  private constructor() {}

  public static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  public init(pluginsPath: string) {
    this.pluginsPath = pluginsPath;
    if (!fs.existsSync(pluginsPath)) {
      fs.mkdirSync(pluginsPath, { recursive: true });
    }
    this.scanAndSyncPlugins();
  }

  private async scanAndSyncPlugins() {
    this.pluginTools = {};
    if (!this.pluginsPath || !fs.existsSync(this.pluginsPath)) return;

    const dirs = fs.readdirSync(this.pluginsPath, { withFileTypes: true });
    const db = getDb();
    const now = Date.now();

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const pluginDir = path.join(this.pluginsPath, dir.name);
        const manifestPath = path.join(pluginDir, 'plugin.json');
        
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const id = `${manifest.publisher}.${manifest.name}`.toLowerCase();
            
            // Register tools if available (stub implementation for Node modules)
            const indexPath = path.join(pluginDir, 'index.js');
            if (fs.existsSync(indexPath)) {
              const pluginModule = require(indexPath);
              if (pluginModule && typeof pluginModule.getTools === 'function') {
                Object.assign(this.pluginTools, pluginModule.getTools());
              }
            }

            // Upsert DB record
            const existing = await db.select().from(plugins).where(eq(plugins.id, id));
            
            const record = {
              name: manifest.name,
              version: manifest.version,
              publisher: manifest.publisher,
              capabilities: JSON.stringify(manifest.capabilities || []),
              permissions: JSON.stringify(manifest.permissions || []),
              tools: JSON.stringify(manifest.tools || []),
              connections: JSON.stringify(manifest.connections || []),
              status: 'installed',
              updatedAt: now
            };

            if (existing.length === 0) {
              await db.insert(plugins).values({ ...record, id, createdAt: now });
            } else {
              await db.update(plugins).set(record).where(eq(plugins.id, id));
            }
          } catch (e: any) {
            console.error(`[PluginLoader] Failed to load plugin ${dir.name}:`, e.message);
          }
        }
      }
    }
  }

  public async getPlugins() {
    const db = getDb();
    return await db.select().from(plugins);
  }

  public async togglePlugin(id: string, enabled: boolean) {
    const db = getDb();
    await db.update(plugins).set({ status: enabled ? 'installed' : 'disabled', updatedAt: Date.now() }).where(eq(plugins.id, id));
  }

  public async uninstallPlugin(id: string) {
    const db = getDb();
    await db.delete(plugins).where(eq(plugins.id, id));
    // In a real system, we'd also rm -rf the directory
  }

  public getPluginTools(): Record<string, any> {
    return this.pluginTools;
  }
}
