export async function fetchWithRetry(url: string, init: RequestInit = {}, retries = 3, backoff = 300) {
  let attempt = 0
  let lastError: unknown = undefined
  while (attempt <= retries) {
    try {
      const res = await fetch(url, init)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const error = new Error(`HTTP ${res.status}: ${text}`)
        ;(error as unknown as { status?: number }).status = res.status
        throw error
      }
      return res
    } catch (err: unknown) {
      lastError = err
      attempt += 1
      if (attempt > retries) break
      await new Promise((r) => setTimeout(r, backoff * attempt))
    }
  }
  throw lastError
}
