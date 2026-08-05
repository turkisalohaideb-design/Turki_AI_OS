Add this adapter to the daemon runtime registry

If the project follows the Open Design layout, append your def export to BASE_AGENT_DEFS in apps/daemon/src/runtimes/registry.ts.

Example change (append to BASE_AGENT_DEFS):

  import { exampleAgentDef } from './defs/example-cli';

  const BASE_AGENT_DEFS: RuntimeAgentDef[] = [
    // existing defs ...
    exampleAgentDef,
  ];

Notes:
- Ensure the `id` is unique across all defs.
- If your repo uses a different path for registry.ts, add the import and push the def into the array there.
- If registry.ts does not exist in this repo, follow the project's own runtime registry conventions.
