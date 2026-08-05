*** Begin Patch
*** Update File: apps/daemon/src/server.ts
@@
 export type AgentDetectionResult = {
   id: string;
   available: boolean;
   path?: string;
   version?: string;
-  diagnostics?: string[];
+  diagnostics?: string[];
+  models?: { id: string; label?: string }[];
+  auth?: 'ok' | 'unauth' | 'unknown';
 };
@@
   await Promise.all(
     AGENT_DEFS.map(async (def) => {
       const res: AgentDetectionResult = { id: def.id, available: false };
       try {
@@
-        if (stdout.trim()) {
-          res.available = true;
-          res.version = stdout.trim().split('\n')[0];
-          res.path = def.bin;
-        } else {
-          res.available = true;
-          res.path = def.bin;
-        }
+        if (stdout.trim()) {
+          res.available = true;
+          res.version = stdout.trim().split('\n')[0];
+          res.path = def.bin;
+        } else {
+          res.available = true;
+          res.path = def.bin;
+        }
+
+        // Concurrently run authProbe and listModels when declared
+        // authProbe: set res.auth = 'ok' | 'unauth' | 'unknown'
+        const probes: Promise<void>[] = [];
+        if (def.authProbe) {
+          const probeArgs = def.authProbe.args || [];
+          probes.push(
+            (async () => {
+              try {
+                const c = spawn(def.bin, probeArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
+                let out = '';
+                if (c.stdout) c.stdout.on('data', (b) => (out += b.toString()));
+                await withTimeout(new Promise((r) => c.once('close', r)), def.authProbe.timeoutMs || timeouts.versionProbeTimeoutMs, () => { try { c.kill(); } catch {} });
+                const txt = (out || '').toLowerCase();
+                if (txt.includes('ok') || txt.includes('authenticated') || txt.includes('true')) res.auth = 'ok';
+                else if (txt.includes('unauth') || txt.includes('not') || txt.includes('false')) res.auth = 'unauth';
+                else res.auth = 'unknown';
+              } catch (e) {
+                res.auth = 'unknown';
+              }
+            })(),
+          );
+        }
+
+        if ((def as any).listModels && (def as any).listModels.listCommandArgs) {
+          const args = (def as any).listModels.listCommandArgs as string[];
+          probes.push(
+            (async () => {
+              try {
+                const c = spawn(def.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
+                let out = '';
+                if (c.stdout) c.stdout.on('data', (b) => (out += b.toString()));
+                await withTimeout(new Promise((r) => c.once('close', r)), timeouts.versionProbeTimeoutMs, () => { try { c.kill(); } catch {} });
+                const lines = (out || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
+                const models: { id: string; label?: string }[] = [];
+                for (const l of lines) {
+                  const parts = l.split('\t');
+                  if (parts.length >= 2) models.push({ id: parts[0], label: parts[1] });
+                  else models.push({ id: l, label: l });
+                }
+                res.models = models;
+              } catch (e) {
+                // ignore model discovery failures; leave models undefined
+              }
+            })(),
+          );
+        }
+
+        // await probes but do not fail detection on probe errors
+        if (probes.length) await Promise.all(probes.map((p) => p.catch(() => undefined)));
*** End Patch