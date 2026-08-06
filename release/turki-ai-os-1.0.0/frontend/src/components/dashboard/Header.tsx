import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-transparent sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Turki AI OS</h2>
        <div className="relative w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="w-5 h-5 text-zinc-300" />
                <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">Turki Admin</div>
            <div className="text-xs text-zinc-400">Admin</div>
          </div>
          <Avatar>
            <AvatarFallback>TA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

