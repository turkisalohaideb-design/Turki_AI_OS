export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function now() { return new Date().toISOString(); }

export function log(level: LogLevel, msg: string, meta?: Record<string, any>) {
  const out = { ts: now(), level, msg, ...meta };
  try { process.stdout.write(JSON.stringify(out) + '\n'); } catch (e) { /* best-effort */ }
}

export const logger = {
  debug: (m: string, meta?: Record<string, any>) => log('debug', m, meta),
  info: (m: string, meta?: Record<string, any>) => log('info', m, meta),
  warn: (m: string, meta?: Record<string, any>) => log('warn', m, meta),
  error: (m: string, meta?: Record<string, any>) => log('error', m, meta),
};
