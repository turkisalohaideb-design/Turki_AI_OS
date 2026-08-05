"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type Stat = {
  label: string
  value: string
  percent: number
}

export default function StatsCard() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<Stat[]>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/system/status')
        const data = await res.json()
        if (!mounted) return
        setStats([
          { label: 'CPU Usage', value: String(data?.cpu ?? '0%'), percent: Math.round(Number(data?.cpu_percent ?? 0)) },
          { label: 'RAM Usage', value: String(data?.ram ?? '0%'), percent: Math.round(Number(data?.ram_percent ?? 0)) },
          { label: 'GPU Usage', value: String(data?.gpu ?? '0%'), percent: Math.round(Number(data?.gpu_percent ?? 0)) },
          { label: 'Disk Usage', value: String(data?.disk ?? '0%'), percent: Math.round(Number(data?.disk_percent ?? 0)) },
        ])
      } catch (e: unknown) {
        setErr(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    const interval = setInterval(() => {
      void load()
    }, 3000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ) : err ? (
          <div className="text-sm text-rose-400">Error loading system status: {err}</div>
        ) : (
          stats.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-sm text-zinc-300 mb-1">
                <div>{s.label}</div>
                <div>{s.value}</div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${s.percent}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
