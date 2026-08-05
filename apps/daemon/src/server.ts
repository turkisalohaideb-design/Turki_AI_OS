*** Begin Patch
*** Update File: apps/daemon/src/server.ts
@@
-import { AGENT_DEFS, getAgentDef } from './runtimes/registry';
+import { AGENT_DEFS, getAgentDef } from './runtimes/registry';
+import { logger } from './logging';
+import { emitTelemetry } from './telemetry';
@@
 export async function detectAgents(): Promise<AgentDetectionResult[]> {
   const results: AgentDetectionResult[] = [];
   const timeouts = getTimeouts();
+  const maxRetries = Number(process.env.DAEMON_DETECT_RETRIES || 2);
@@
-      try {
+      try {
         // spawn version probe
-        const child = spawn(def.bin, def.versionArgs || ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
+        let child: any = null;
+        let attempt = 0;
+        let stdout = '';
+        for (; attempt < maxRetries; attempt++) {
+          try {
+            child = spawn(def.bin, def.versionArgs || ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
+            stdout = '';
+            if (child.stdout) child.stdout.on('data', (b: Buffer) => (stdout += b.toString()));
+            await withTimeout(new Promise((r) => child.once('close', r)), timeouts.versionProbeTimeoutMs, () => { try { child.kill(); } catch {} });
+            // success if we reached here
+            break;
+          } catch (e) {
+            logger.warn('version probe failed, retrying', { id: def.id, attempt, err: e?.message || String(e) });
+            if (attempt + 1 >= maxRetries) throw e;
+            // small backoff
+            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
+          }
+        }
-        let stdout = '';
-        if (child.stdout) {
-          child.stdout.on('data', (b) => (stdout += b.toString()));
-        }
-
-        // wait for close with timeout
-        await withTimeout(new Promise((resolve) => child.once('close', resolve)), timeouts.versionProbeTimeoutMs, () => {
-          try { child.kill(); } catch {};
-        });
+        // stdout captured above
@@
-        // Concurrently run authProbe and listModels when declared
+        logger.info('detected agent', { id: def.id, path: def.bin, version: res.version });
+        emitTelemetry('agent.detected', { id: def.id, path: def.bin, version: res.version });
+
+        // Concurrently run authProbe and listModels when declared
*** End Patch