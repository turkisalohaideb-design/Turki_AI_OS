import { z } from 'zod'
import {
  ModelsArraySchema,
  AgentsArraySchema,
  ProjectsArraySchema,
  ActivityArraySchema,
  SystemStatusSchema,
} from './schemas'

async function timeoutableFetch(input: RequestInfo, init: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>, init: RequestInit = {}, retries = 2) {
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await timeoutableFetch(url, init, 10000)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data = await res.json()
      const parsed = schema.parse(data)
      return parsed
    } catch (err) {
      lastErr = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
      throw lastErr
    }
  }
  throw lastErr
}

export const api = {
  getModels: () => fetchJson('/api/models', ModelsArraySchema),
  getAgents: () => fetchJson('/api/agents', AgentsArraySchema),
  launchAgent: (id: string) => fetchJson('/api/agents/launch', z.object({ success: z.boolean() }), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }),
  getProjects: () => fetchJson('/api/projects', ProjectsArraySchema),
  getActivity: () => fetchJson('/api/activity', ActivityArraySchema),
  getSystemStatus: () => fetchJson('/api/system/status', SystemStatusSchema),
  chat: (payload: unknown) => fetchJson('/api/chat', z.any(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 3),
}
