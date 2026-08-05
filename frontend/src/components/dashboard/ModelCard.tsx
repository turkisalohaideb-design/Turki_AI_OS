import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type ModelInfo = { id: string; name: string; status?: string }

export default function ModelCard() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [models, setModels] = React.useState<ModelInfo[]>([])

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchWithRetry((process.env.NEXT_PUBLIC_DAEMON_URL || 'http://localhost:8080') + '/api/models')
        const data = await res.json()
        if (!mounted) return
        setModels(Array.isArray(data) ? (data as ModelInfo[]) : [])
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
        <CardTitle>Models</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        ) : err ? (
          <div className="text-sm text-rose-400">Error loading models: {err}</div>
        ) : models.length === 0 ? (
          <div className="text-sm text-zinc-400">No models found.</div>
        ) : (
          models.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-transparent p-2 rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-zinc-700 flex items-center justify-center text-white font-medium">{m.name?.[0] ?? 'M'}</div>
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
