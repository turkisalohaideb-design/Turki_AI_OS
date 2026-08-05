import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-transparent sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Turki AI OS</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input placeholder="Search..." className="pl-10 pr-4 py-2 rounded-md bg-zinc-800 text-zinc-100 text-sm border border-zinc-700 focus:outline-none" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md hover:bg-zinc-800">
          <Bell className="w-5 h-5 text-zinc-300" />
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">Turki Admin</div>
            <div className="text-xs text-zinc-400">Admin</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white">TA</div>
        </div>
      </div>
    </header>
  );
}
