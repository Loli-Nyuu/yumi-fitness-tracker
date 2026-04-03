import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pattern = body.pattern || null
  
  if (pattern) {
    // Access the global peers from the WS handler
    const peers = (globalThis as any).__wsPeers
    if (peers) {
      const message = JSON.stringify({
        event: 'breathing:open',
        data: {
          pattern,
          rounds: body.rounds,
          autoStartDelay: body.autoStartDelay,
        },
      })
      for (const [, peer] of peers) {
        try { peer.send(message) } catch {}
      }
    }
  }
  
  return { success: true, pattern }
})
