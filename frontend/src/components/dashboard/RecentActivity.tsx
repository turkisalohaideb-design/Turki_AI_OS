"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type ActivityItem = { id: string | number; time: string; text: string }

export default function RecentActivity() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<ActivityItem[]>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const r = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/activity')
        const data = await r.json()
        if (!mounted) return
        setItems(Array.isArray(data) ? (data as ActivityItem[]) : [])
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
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-72 overflow-auto">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : err ? (
          <div className="text-sm text-rose-400">Error loading activity: {err}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-400">No recent activity.</div>
        ) : (
          <div className="space-y-3 text-sm text-zinc-300">
            {items.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-zinc-500" />
                <div>
                  <div className="text-xs text-zinc-400">{a.time}</div>
                  <div className="text-sm text-white">{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
