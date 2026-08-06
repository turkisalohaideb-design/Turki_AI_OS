"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type ProjectInfo = { id: string; name: string; updated?: string }

export default function ProjectCard() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [projects, setProjects] = React.useState<ProjectInfo[]>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/projects')
        const data = await res.json()
        if (!mounted) return
        setProjects(Array.isArray(data) ? (data as ProjectInfo[]) : [])
      } catch (e: unknown) {
        setErr(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        ) : err ? (
          <div className="text-sm text-rose-400">Error loading projects: {err}</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-zinc-400">No projects available.</div>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-2 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-700 flex items-center justify-center text-white">{p.name?.[0] ?? 'P'}</div>
                  <div>
                    <div className="text-sm text-white">{p.name}</div>
                    <div className="text-xs text-zinc-400">Updated {p.updated}</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-300">Open</div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
