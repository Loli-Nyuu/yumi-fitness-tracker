import { defineEventHandler, createEventStream } from 'h3'
import { addSSEListener, removeSSEListener } from './breathing/_state'

export default defineEventHandler(async (event) => {
  event.node.res.setHeader('Content-Type', 'text/event-stream')
  event.node.res.setHeader('Cache-Control', 'no-cache, no-transform')
  event.node.res.setHeader('Connection', 'keep-alive')
  event.node.res.flushHeaders()
  
  const send = (data: string) => {
    try {
      event.node.res.write(`data: ${data}\n\n`)
    } catch {}
  }
  
  addSSEListener(send)
  send(JSON.stringify({ event: 'connected' }))
  
  const keepAlive = setInterval(() => {
    send(JSON.stringify({ event: 'ping' }))
  }, 25000)
  
  event.node.res.on('close', () => {
    clearInterval(keepAlive)
    removeSSEListener(send)
  })
  
  return ''
})
