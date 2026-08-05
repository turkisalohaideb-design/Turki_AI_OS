import { turkiAgentDef } from './defs/turki-ai-os';
import { RuntimeAgentDef } from './types';

const BASE_AGENT_DEFS: RuntimeAgentDef[] = [
  // Only register the Turki AI OS adapter here; additional adapters can be added to this array.
  turkiAgentDef,
];

// Boot-time guard for duplicate ids
const ids = new Set<string>();
for (const def of BASE_AGENT_DEFS) {
  if (ids.has(def.id)) throw new Error(`Duplicate agent definition id: ${def.id}`);
  ids.add(def.id);
}

export const AGENT_DEFS = BASE_AGENT_DEFS;

export function getAgentDef(id: string): RuntimeAgentDef | undefined {
  return AGENT_DEFS.find((d) => d.id === id);
}

export function listAgentDefs(): RuntimeAgentDef[] {
  return [...AGENT_DEFS];
}
