import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function ProjectCard({ projects }: { projects: { id: string; name: string; updated: string }[] }) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-2 rounded-md">
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
      </CardContent>
    </Card>
  );
}
