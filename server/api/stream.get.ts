import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp() as any
  if (!nitroApp.sseListeners) nitroApp.sseListeners = []
  
  event.node.res.setHeader('Content-Type', 'text/event-stream')
  event.node.res.setHeader('Cache-Control', 'no-cache, no-transform')
  event.node.res.setHeader('Connection', 'keep-alive')
  event.node.res.setHeader('Access-Control-Allow-Origin', '*')
  event.node.res.flushHeaders()
  
  const send = (data: string) => {
    try {
      event.node.res.write(`data: ${data}\n\n`)
    } catch {}
  }
  
  nitroApp.sseListeners.push(send)
  send(JSON.stringify({ event: 'connected' }))
  
  const keepAlive = setInterval(() => {
    send(JSON.stringify({ event: 'ping' }))
  }, 25000)
  
  event.node.res.on('close', () => {
    clearInterval(keepAlive)
    const idx = (nitroApp.sseListeners || []).indexOf(send)
    if (idx !== -1) nitroApp.sseListeners.splice(idx, 1)
  })
  
  // Return empty to prevent further processing
  return ''
})
