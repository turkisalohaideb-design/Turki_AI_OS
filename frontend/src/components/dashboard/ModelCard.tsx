import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ModelCard({ models }: { models: { id: string; name: string; status: string }[] }) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>Models</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {models.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-transparent p-2 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-zinc-700 flex items-center justify-center text-white font-medium">{m.name[0]}</div>
              <div>
                <div className="text-sm text-white font-medium">{m.name}</div>
                <div className="text-xs text-zinc-400">Model ID: {m.id}</div>
              </div>
            </div>
            <div>
              <Badge variant={m.status === 'running' ? 'default' : 'outline'}>
                {m.status === 'running' ? 'Running' : 'Offline'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
