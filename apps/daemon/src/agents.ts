import { AGENT_DEFS, getAgentDef, listAgentDefs } from './runtimes/registry';

export { AGENT_DEFS, getAgentDef, listAgentDefs };

// Convenience re-exports for the rest of the daemon to import from 'apps/daemon/src/agents'
export default {
  AGENT_DEFS,
  getAgentDef,
  listAgentDefs,
};
