import React from 'react';
import { Home, MessageSquare, Cpu, FileText, Layers, Database, Monitor, Settings, User } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'agents', label: 'Agents', icon: Cpu },
  { id: 'projects', label: 'Projects', icon: FileText },
  { id: 'files', label: 'Files', icon: Layers },
  { id: 'models', label: 'Models', icon: Database },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-zinc-900/60 backdrop-blur-md border-r border-zinc-800 p-4 h-screen fixed left-0 top-0">
      <div className="mb-6 px-2">
        <div className="text-lg font-semibold text-white">Turki AI OS</div>
        <div className="text-xs text-zinc-400">AI Operating System</div>
      </div>

      <nav className="space-y-1">
        {items.map((it) => (
          <a key={it.id} className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-200 hover:bg-zinc-800/40 transition">
            <it.icon className="w-5 h-5 text-zinc-300" />
            <span className="text-sm">{it.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto px-3 pt-6">
        <div className="text-xs text-zinc-500">v1.0.0 • Dark</div>
      </div>
    </aside>
  );
}
