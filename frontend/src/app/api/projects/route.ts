import { NextResponse } from 'next/server'
import { ProjectsArraySchema } from '@/lib/schemas'

const DAEMON = process.env.DAEMON_URL || 'http://localhost:8080'

export async function GET() {
  try {
    const res = await fetch(`${DAEMON}/api/projects`)
    if (!res.ok) return NextResponse.json({ error: 'Daemon error' }, { status: 502 })
    const data = await res.json()
    const parsed = ProjectsArraySchema.safeParse(data)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid daemon response' }, { status: 502 })
    return NextResponse.json(parsed.data)
  } catch {
    return NextResponse.json({ error: 'Daemon unavailable' }, { status: 503 })
  }
}
