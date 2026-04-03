import type { Peer } from 'crossws'

const peers = new Map<string, Peer>()

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

    switch (msg.event) {
      case 'breathing:sessionStarted': {
        console.log(`[WS] Breathing started: ${msg.data?.pattern}`)
        break
      }

      case 'breathing:roundProgress': {
        const { currentRound, totalRounds } = msg.data || {}
        console.log(`[WS] Breathing round: ${currentRound}/${totalRounds}`)
        break
      }

      case 'breathing:sessionCompleted': {
        console.log(`[WS] Breathing completed: ${msg.data?.pattern}`)
        break
      }

      case 'breathing:paused': {
        console.log(`[WS] Breathing paused`)
        break
      }

      case 'breathing:resumed': {
        console.log(`[WS] Breathing resumed`)
        break
      }
    }
  },

  close(peer) {
    console.log(`[WS] Disconnected: ${peer.id}`)
    peers.delete(peer.id)
  },
})
