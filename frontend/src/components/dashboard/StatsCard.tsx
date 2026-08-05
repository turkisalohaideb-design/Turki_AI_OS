import React from 'react';

type Stat = {
  label: string;
  value: string;
  percent: number;
};

export default function StatsCard({ stats }: { stats: Stat[] }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-3">System Status</h3>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-sm text-zinc-300 mb-1">
              <div>{s.label}</div>
              <div>{s.value}</div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${s.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
