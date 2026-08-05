import { NextResponse } from 'next/server'
import { z } from 'zod'

const DAEMON = process.env.DAEMON_URL || 'http://localhost:8080'

const ChatSchema = z.object({ input: z.any() })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = ChatSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid chat body' }, { status: 400 })

    const res = await fetch(`${DAEMON}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
    if (!res.ok) return NextResponse.json({ error: 'Daemon error' }, { status: 502 })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Daemon unavailable' }, { status: 503 })
  }
}
