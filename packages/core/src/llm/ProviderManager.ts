import { ProviderMetadata } from './types';
import { ProviderRegistry } from './ProviderRegistry';
import { CredentialService } from './CredentialService';
import { getDb, llmProviders, llmCredentials, llmModels } from '../db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class ProviderManager {
  private static instance: ProviderManager;

  private constructor() {}

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  /** Initialize the ProviderRegistry by loading all providers and credentials from the DB */
  public async loadProvidersFromDb(): Promise<void> {
    const db = getDb();
    const providers = await db.select().from(llmProviders);
    const registry = ProviderRegistry.getInstance();

    for (const p of providers) {
      const creds = await db.select().from(llmCredentials).where(eq(llmCredentials.providerId, p.id));
      const cred = creds.length > 0 ? creds[0] : undefined;
      const meta: ProviderMetadata = {
        id: p.id,
        type: p.type,
        name: p.name,
        enabled: p.enabled,
        priority: p.priority,
        baseUrl: p.baseUrl || undefined,
      };

      try {
        await registry.registerProvider(meta, cred?.encryptedData);
        console.log(`[ProviderManager] Loaded provider ${p.id} (${p.name})`);
      } catch (err: any) {
        console.error(`[ProviderManager] Failed to load provider ${p.id}: ${err.message}`);
      }
    }
  }

  public async addProvider(meta: ProviderMetadata, credentialPlaintext?: string): Promise<void> {
    const db = getDb();
    
    // Insert Provider
    await db.insert(llmProviders).values({
      id: meta.id,
      type: meta.type,
      name: meta.name,
      enabled: meta.enabled,
      priority: meta.priority || 0,
      baseUrl: meta.baseUrl || null,
      metadata: null,
    });

    let encryptedData: string | undefined;

    // Handle Credential
    if (credentialPlaintext) {
      const credId = `cred_${crypto.randomUUID()}`;
      encryptedData = await CredentialService.getInstance().encrypt(credentialPlaintext);
      const fingerprint = CredentialService.getInstance().maskKey(credentialPlaintext);

      await db.insert(llmCredentials).values({
        id: credId,
        providerId: meta.id,
        fingerprint,
        encryptedData,
      });
    }

    // Register in memory
    await ProviderRegistry.getInstance().registerProvider(meta, encryptedData);
  }

  public async updateProvider(id: string, updates: Partial<ProviderMetadata>): Promise<void> {
    const db = getDb();
    
    const setClause: any = {};
    if (updates.name !== undefined) setClause.name = updates.name;
    if (updates.enabled !== undefined) setClause.enabled = updates.enabled;
    if (updates.priority !== undefined) setClause.priority = updates.priority;
    if (updates.baseUrl !== undefined) setClause.baseUrl = updates.baseUrl || null;

    if (Object.keys(setClause).length > 0) {
      await db.update(llmProviders).set(setClause).where(eq(llmProviders.id, id));
    }

    // Since we updated DB, re-load the provider into memory if it exists
    const pRows = await db.select().from(llmProviders).where(eq(llmProviders.id, id));
    if (pRows.length > 0) {
      const p = pRows[0];
      const creds = await db.select().from(llmCredentials).where(eq(llmCredentials.providerId, p.id));
      const cred = creds.length > 0 ? creds[0] : undefined;
      const meta: ProviderMetadata = {
        id: p.id,
        type: p.type,
        name: p.name,
        enabled: p.enabled,
        priority: p.priority,
        baseUrl: p.baseUrl || undefined,
      };
      await ProviderRegistry.getInstance().registerProvider(meta, cred?.encryptedData);
    }
  }

  public async deleteProvider(id: string): Promise<void> {
    const db = getDb();
    
    // Delete in memory
    ProviderRegistry.getInstance().removeProvider(id);

    // Delete DB relations
    await db.delete(llmModels).where(eq(llmModels.providerId, id));
    await db.delete(llmCredentials).where(eq(llmCredentials.providerId, id));
    await db.delete(llmProviders).where(eq(llmProviders.id, id));
  }

  public async toggleProvider(id: string, enabled: boolean): Promise<void> {
    await this.updateProvider(id, { enabled });
  }

  public async setProviderPriority(id: string, priority: number): Promise<void> {
    await this.updateProvider(id, { priority });
  }
}
