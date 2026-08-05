"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type Agent = { id: string; name: string; status: string }

export default function AgentCard() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [agents, setAgents] = React.useState<Agent[]>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/agents')
        const data = await res.json()
        if (!mounted) return
        setAgents(Array.isArray(data) ? (data as Agent[]) : [])
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

  const launchAgent = async (id: string) => {
    try {
      await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + `/api/agents/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      // refresh list
      const res = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/agents')
      const data = await res.json()
      setAgents(Array.isArray(data) ? (data as Agent[]) : [])
    } catch (e) {
      console.error('Launch failed', e)
      setErr(String(e))
    }
  }

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        ) : err ? (
          <div className="text-sm text-rose-400">Error loading agents: {err}</div>
        ) : agents.length === 0 ? (
          <div className="text-sm text-zinc-400">No agents available.</div>
        ) : (
          agents.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 rounded-md">
              <div>
                <div className="text-sm text-white font-medium">{a.name}</div>
                <div className="text-xs text-zinc-400">Status: <span className="font-medium text-zinc-200">{a.status}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{a.status}</Badge>
                <Button size="sm" variant="default" onClick={() => launchAgent(a.id)}>Launch</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
