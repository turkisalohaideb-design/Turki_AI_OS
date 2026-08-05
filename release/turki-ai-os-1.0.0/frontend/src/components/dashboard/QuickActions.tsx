import React from 'react';
import { Plus, Play, UploadCloud, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function QuickActions() {
  return (
    <Card className="p-0">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <Button className="w-full justify-start" variant="ghost">
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <Play className="w-4 h-4 mr-2" /> Run Agent
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <FilePlus className="w-4 h-4 mr-2" /> Import Files
          </Button>
          <Button className="w-full justify-start" variant="ghost">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Knowledge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
