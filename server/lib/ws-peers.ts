// Shared WebSocket peer store and broadcast function
import type { Peer } from 'crossws'

const peers = new Map<string, Peer>()

export function registerPeer(peer: Peer) {
  peers.set(peer.id, peer)
}

export function unregisterPeer(peerId: string) {
  peers.delete(peerId)
}

export function broadcastWS(data: any) {
  console.log('[WS Broadcast] Sending:', data, 'Peers:', peers.size)
  const message = JSON.stringify(data)
  for (const [id, peer] of peers) {
    console.log('[WS Broadcast] Sending to peer:', id)
    try { peer.send(message) } catch (e) { console.error('[WS Broadcast] Error:', e) }
  }
}
