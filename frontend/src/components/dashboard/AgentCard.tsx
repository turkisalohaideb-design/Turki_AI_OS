import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AgentCard({ agents }: { agents: { id: string; name: string; status: string }[] }) {
  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-2">
        {agents.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-2 rounded-md">
            <div>
              <div className="text-sm text-white font-medium">{a.name}</div>
              <div className="text-xs text-zinc-400">Status: <span className="font-medium text-zinc-200">{a.status}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{a.status}</Badge>
              <Button size="sm" variant="default">Launch</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
