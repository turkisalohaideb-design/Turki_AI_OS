const http = require('http')
const url = require('url')

const port = process.env.PORT || 8080

function json(res, obj, code = 200) {
  const s = JSON.stringify(obj)
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(s)
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  const method = req.method
  const pathname = parsed.pathname

  if (method === 'GET' && pathname === '/api/system/status') {
    return json(res, {
      cpu: 'Intel Xeon',
      cpu_percent: Math.floor(Math.random() * 30) + 10,
      ram: '64GB',
      ram_percent: Math.floor(Math.random() * 60) + 20,
      gpu: 'NVIDIA RTX',
      gpu_percent: Math.floor(Math.random() * 50) + 5,
      disk: '1TB',
      disk_percent: Math.floor(Math.random() * 70) + 10,
    })
  }

  if (method === 'GET' && pathname === '/api/models') {
    return json(res, [
      { id: 'qwen3', name: 'Qwen3', status: 'running' },
      { id: 'llama3', name: 'Llama 3', status: 'offline' },
      { id: 'deepseek', name: 'DeepSeek', status: 'running' },
      { id: 'gpt', name: 'GPT', status: 'offline' },
    ])
  }

  if (method === 'GET' && pathname === '/api/agents') {
    return json(res, [
      { id: 'talent', name: 'Talent Acquisition', status: 'idle' },
      { id: 'hr', name: 'HR Assistant', status: 'running' },
      { id: 'legal', name: 'Legal', status: 'idle' },
      { id: 'finance', name: 'Finance', status: 'stopped' },
      { id: 'dev', name: 'Developer', status: 'running' },
      { id: 'research', name: 'Research', status: 'idle' },
    ])
  }

  if (method === 'POST' && pathname === '/api/agents/launch') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        return json(res, { success: true, launched: data.id || null })
      } catch (e) {
        return json(res, { error: 'invalid json' }, 400)
      }
    })
    return
  }

  if (method === 'GET' && pathname === '/api/projects') {
    return json(res, [
      { id: 'turki_ai_os', name: 'Turki_AI_OS', updated: new Date().toISOString() },
      { id: 'recruitment', name: 'Recruitment', updated: new Date().toISOString() },
      { id: 'kb', name: 'Knowledge Base', updated: new Date().toISOString() },
      { id: 'policies', name: 'Policies', updated: new Date().toISOString() },
    ])
  }

  if (method === 'GET' && pathname === '/api/activity') {
    return json(res, [
      { id: 1, time: new Date().toISOString(), text: 'Agent HR Assistant finished training dataset' },
      { id: 2, time: new Date().toISOString(), text: 'Project Turki_AI_OS updated UI components' },
    ])
  }

  if (method === 'POST' && pathname === '/api/chat') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      let parsed = {}
      try {
        parsed = JSON.parse(body || '{}')
      } catch (e) {}
      return json(res, { reply: 'This is a stub response from the daemon', echo: parsed })
    })
    return
  }

  json(res, { error: 'not found' }, 404)
})

server.listen(port, () => console.log(`Stub daemon listening on http://localhost:${port}`))

process.on('SIGINT', () => {
  console.log('Stub daemon shutting down')
  server.close(() => process.exit(0))
})
