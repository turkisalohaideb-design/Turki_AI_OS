import React from 'react';

export default function ProjectCard({ projects }: { projects: { id: string; name: string; updated: string }[] }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-3">Recent Projects</h3>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center text-white">{p.name[0]}</div>
              <div>
                <div className="text-sm text-white">{p.name}</div>
                <div className="text-xs text-zinc-400">Updated {p.updated}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-300">Open</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
