import crypto from 'crypto';

export interface CryptoStrategy {
  encrypt(text: string): Promise<string> | string;
  decrypt(encrypted: string): Promise<string> | string;
}

export class CredentialService {
  private static instance: CredentialService;
  private strategy?: CryptoStrategy;

  private constructor() {}

  public static getInstance(): CredentialService {
    if (!CredentialService.instance) {
      CredentialService.instance = new CredentialService();
    }
    return CredentialService.instance;
  }

  public setStrategy(strategy: CryptoStrategy) {
    this.strategy = strategy;
  }

  public async encrypt(plaintext: string): Promise<string> {
    if (!this.strategy) throw new Error('Crypto strategy not configured');
    return this.strategy.encrypt(plaintext);
  }

  public async decrypt(encrypted: string): Promise<string> {
    if (!this.strategy) throw new Error('Crypto strategy not configured');
    return this.strategy.decrypt(encrypted);
  }

  public hash(plaintext: string): string {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
  }

  public maskKey(key: string): string {
    if (!key || key.length < 8) return '••••••••';
    const first4 = key.substring(0, 4);
    const last4 = key.substring(key.length - 4);
    return `${first4}••••••••••••••••${last4}`;
  }
}
