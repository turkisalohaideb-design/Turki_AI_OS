*** Begin Patch
*** Update File: apps/daemon/src/server.ts
@@
-import { checkPromptArgvBudget, checkWindowsCmdShimCommandLineBudget, checkWindowsDirectExeCommandLineBudget } from './runtimes/prompt-budget';
+import { checkPromptArgvBudget, checkWindowsCmdShimCommandLineBudget, checkWindowsDirectExeCommandLineBudget } from './runtimes/prompt-budget';
+import { trackChild, untrackChild } from './server.childs';
@@
   const child = spawn(def.bin, argv, spawnOptions);
+  trackChild(child);
+  emitTelemetry('run.started', { id: def.id, argv });
@@
   if (parser) {
     parser(child, onEvent).catch((err) => {
       onEvent({ type: 'error', error: err?.message || String(err) });
     }).finally(() => {
-      if (execTimer) clearTimeout(execTimer);
-      if (startupTimer) clearTimeout(startupTimer);
-      if (idleTimer) clearTimeout(idleTimer);
+      if (execTimer) clearTimeout(execTimer);
+      if (startupTimer) clearTimeout(startupTimer);
+      if (idleTimer) clearTimeout(idleTimer);
+      untrackChild(child);
+      emitTelemetry('run.finished', { id: def.id });
     });
   } else {
@@
     child.on('exit', (code, signal) => onEvent({ type: 'exit', code, signal }));
-
+    child.on('exit', (code, signal) => {
+      try { untrackChild(child); } catch (e) {}
+      emitTelemetry('run.exit', { id: def.id, code, signal });
+    });
*** End Patch