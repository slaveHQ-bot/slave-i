import { SwarmServer } from './SwarmServer';
import { SwarmClient } from './SwarmClient';

export class SwarmNode {
  private static instance: SwarmNode;
  public server: SwarmServer | null = null;
  public client: SwarmClient | null = null;
  public isMaster: boolean = true;

  private constructor() {}

  public static getInstance(): SwarmNode {
    if (!SwarmNode.instance) {
      SwarmNode.instance = new SwarmNode();
    }
    return SwarmNode.instance;
  }

  public initServer(port: number, secretKey: string) {
    this.isMaster = true;
    this.server = new SwarmServer(port, secretKey);
    this.server.start();
  }

  public initClient(url: string, secretKey: string) {
    this.isMaster = false;
    this.client = new SwarmClient(url, secretKey);
    this.client.connect();
  }
}
