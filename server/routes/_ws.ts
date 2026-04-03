import type { Peer } from 'crossws'

const peers = new Map<string, Peer>()

export function broadcastWS(data: any) {
  const message = JSON.stringify(data)
  for (const [, peer] of peers) {
    try { peer.send(message) } catch {}
  }
}

export default defineWebSocketHandler({
  open(peer) {
    console.log(`[WS] Connected: ${peer.id}`)
    peers.set(peer.id, peer)
    peer.send(JSON.stringify({ event: 'connected', data: { peerId: peer.id } }))
  },

  message(peer, rawMessage) {
    let msg: any
    try {
      const text = typeof rawMessage === 'string' ? rawMessage : Buffer.from(rawMessage as ArrayBuffer).toString('utf-8')
      msg = JSON.parse(text)
    } catch {
      return
    }

    console.log(`[WS] Message from ${peer.id}:`, msg?.event)
  },

  close(peer) {
    console.log(`[WS] Disconnected: ${peer.id}`)
    peers.delete(peer.id)
  },
})

// Export for use by other modules - this won't work across Nitro modules
// but we'll use a workaround in the trigger endpoint
;(globalThis as any).__wsPeers = peers
