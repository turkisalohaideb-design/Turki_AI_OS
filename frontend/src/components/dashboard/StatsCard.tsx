import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

type Stat = {
  label: string;
  value: string;
  percent: number;
};

export default function StatsCard({ stats }: { stats: Stat[] }) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
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
      </CardContent>
    </Card>
  );
}
