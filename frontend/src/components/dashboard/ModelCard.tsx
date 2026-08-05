import React from 'react';

export default function ModelCard({ models }: { models: { id: string; name: string; status: string }[] }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-3">Models</h3>
      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-zinc-800/40 p-2 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-zinc-700 flex items-center justify-center text-white font-medium">{m.name[0]}</div>
              <div>
                <div className="text-sm text-white font-medium">{m.name}</div>
                <div className="text-xs text-zinc-400">Model ID: {m.id}</div>
              </div>
            </div>
            <div>
              <span className={`px-2 py-1 text-xs rounded-full ${m.status === 'running' ? 'bg-emerald-600 text-black' : 'bg-zinc-700 text-zinc-300'}`}>
                {m.status === 'running' ? 'Running' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
