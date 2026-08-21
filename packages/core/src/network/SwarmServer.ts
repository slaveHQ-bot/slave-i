import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import crypto from 'crypto';

export class SwarmServer extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private secretKey: string;
  private port: number;

  constructor(port: number, secretKey: string) {
    super();
    this.port = port;
    this.secretKey = secretKey;
  }

  public start() {
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const auth = url.searchParams.get('auth');

      if (auth !== this.secretKey) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      const clientId = crypto.randomUUID();
      this.clients.set(clientId, ws);
      this.emit('clientConnected', clientId);

      ws.on('message', (message: any) => {
        try {
          const data = JSON.parse(message.toString());
          this.emit('message', clientId, data);
        } catch (e) {
          console.error('Failed to parse message from client:', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.emit('clientDisconnected', clientId);
      });
    });

    console.log(`[SwarmServer] Listening on port ${this.port}`);
  }

  public getConnectedClients() {
    return Array.from(this.clients.keys());
  }

  public sendToClient(clientId: string, data: any) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  public stop() {
    if (this.wss) {
      this.wss.close();
    }
  }
}
