import React from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCard from '../components/dashboard/StatsCard';
import ModelCard from '../components/dashboard/ModelCard';
import AgentCard from '../components/dashboard/AgentCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import QuickActions from '../components/dashboard/QuickActions';
import { MODELS, AGENTS, PROJECTS, ACTIVITY } from '../components/dashboard/constants';

export default function DashboardPage() {
  const stats = [
    { label: 'CPU Usage', value: '42%', percent: 42 },
    { label: 'RAM Usage', value: '61%', percent: 61 },
    { label: 'GPU Usage', value: '27%', percent: 27 },
    { label: 'Disk Usage', value: '52%', percent: 52 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="pl-80 pr-6">
        <Header />

        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard stats={stats} />
              <ModelCard models={MODELS} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgentCard agents={AGENTS} />
              <ProjectCard projects={PROJECTS} />
            </div>

            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 max-h-72 overflow-auto">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
              <div className="space-y-3 text-sm text-zinc-300">
                {ACTIVITY.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-zinc-500" />
                    <div>
                      <div className="text-xs text-zinc-400">{a.time}</div>
                      <div className="text-sm text-white">{a.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <QuickActions />

            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
              <h4 className="text-sm font-semibold text-white mb-2">Overview</h4>
              <div className="text-sm text-zinc-300">Systems healthy. 3 models running. 2 agents idle.</div>
            </div>

            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
              <h4 className="text-sm font-semibold text-white mb-2">Storage</h4>
              <div className="text-sm text-zinc-300">512 GB used / 1 TB</div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
