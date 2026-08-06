"use client"
import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import StatsCard from './StatsCard'
import ModelCard from './ModelCard'
import AgentCard from './AgentCard'
import ProjectCard from './ProjectCard'
import QuickActions from './QuickActions'
import RecentActivity from './RecentActivity'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="pl-80 pr-6">
        <Header />

        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard />
              <ModelCard />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgentCard />
              <ProjectCard />
            </div>

            <RecentActivity />
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
  )
}
