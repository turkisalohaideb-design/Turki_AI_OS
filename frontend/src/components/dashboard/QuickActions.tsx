import React from 'react';
import { Plus, Play, UploadCloud, FilePlus } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h4 className="text-sm font-semibold text-white mb-3">Quick Actions</h4>
      <div className="flex flex-col gap-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800">
          <Plus className="w-4 h-4" /> New Chat
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800">
          <Play className="w-4 h-4" /> Run Agent
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800">
          <FilePlus className="w-4 h-4" /> Import Files
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800">
          <UploadCloud className="w-4 h-4" /> Upload Knowledge
        </button>
      </div>
    </div>
  );
}
