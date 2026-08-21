export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(private context: string) {}

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? JSON.stringify(meta) : '';
    console[level === 'debug' ? 'log' : level](`[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message} ${metaStr}`);
  }

  debug(msg: string, meta?: any) { this.log('debug', msg, meta); }
  info(msg: string, meta?: any) { this.log('info', msg, meta); }
  warn(msg: string, meta?: any) { this.log('warn', msg, meta); }
  error(msg: string, meta?: any) { this.log('error', msg, meta); }
}
