import React from 'react';

export default function AgentCard({ agents }: { agents: { id: string; name: string; status: string }[] }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-3">Agents</h3>
      <div className="grid grid-cols-1 gap-2">
        {agents.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-md">
            <div>
              <div className="text-sm text-white font-medium">{a.name}</div>
              <div className="text-xs text-zinc-400">Status: <span className="font-medium text-zinc-200">{a.status}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-emerald-600 text-black rounded-md text-sm">Launch</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
