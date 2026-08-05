// Helper to track spawned child processes so they can be killed on parent exit
import { ChildProcess } from 'child_process';

const active = new Set<ChildProcess>();

export function trackChild(p: ChildProcess) { active.add(p); }
export function untrackChild(p: ChildProcess) { active.delete(p); }
export function killAllActive(reason?: string) {
  for (const c of Array.from(active)) {
    try { c.kill(); } catch (e) { /* ignore */ }
  }
}

process.on('exit', () => killAllActive('parent-exit'));
process.on('SIGINT', () => { killAllActive('sigint'); process.exit(0); });
process.on('SIGTERM', () => { killAllActive('sigterm'); process.exit(0); });
