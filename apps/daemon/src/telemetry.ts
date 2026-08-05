type TelemetryEvent = { name: string; ts?: string; payload?: any };
const handlers: ((ev: TelemetryEvent) => void)[] = [];

export function addTelemetryHandler(h: (ev: TelemetryEvent) => void) { handlers.push(h); }
export function emitTelemetry(name: string, payload?: any) {
  const ev = { name, ts: new Date().toISOString(), payload };
  for (const h of handlers) {
    try { h(ev); } catch (e) { /* swallow */ }
  }
}

export default { addTelemetryHandler, emitTelemetry };
