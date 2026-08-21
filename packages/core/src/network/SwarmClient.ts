import WebSocket from 'ws';
import { EventEmitter } from 'events';

export class SwarmClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private secretKey: string;

  constructor(url: string, secretKey: string) {
    super();
    this.url = url;
    this.secretKey = secretKey;
  }

  public connect() {
    const authUrl = `${this.url}?auth=${this.secretKey}`;
    this.ws = new WebSocket(authUrl);

    this.ws.on('open', () => {
      console.log(`[SwarmClient] Connected to Master at ${this.url}`);
      this.emit('connected');
    });

    this.ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        this.emit('message', data);
      } catch (e) {
        console.error('Failed to parse message from master:', e);
      }
    });

    this.ws.on('close', () => {
      console.log('[SwarmClient] Disconnected from Master.');
      this.emit('disconnected');
    });

    this.ws.on('error', (error: any) => {
      console.error('[SwarmClient] Connection error:', error.message);
    });
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
