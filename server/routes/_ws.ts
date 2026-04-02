import type { Peer } from 'crossws'
import { registerPeer, unregisterPeer } from '../lib/ws-peers'

export { broadcastWS } from '../lib/ws-peers'

export default defineWebSocketHandler({
  open(peer) {
    console.log(`[WS] Connected: ${peer.id}`)
    registerPeer(peer)
    peer.send(JSON.stringify({ event: 'connected', data: { peerId: peer.id } }))
  },

  message(peer, rawMessage) {
    let msg: any
    try {
      const text = typeof rawMessage === 'string' ? rawMessage : Buffer.from(rawMessage as ArrayBuffer).toString('utf-8')
      msg = JSON.parse(text)
      console.log(`[WS] Raw message from ${peer.id}:`, msg?.event)
    } catch (e) {
      console.log(`[WS] Failed to parse message from ${peer.id}:`, e)
      return
    }

    switch (msg.event) {
      case 'breathing:sessionStarted': {
        console.log(`[WS] Breathing started: ${msg.data?.pattern}`)
        break
      }

      case 'breathing:roundProgress': {
        const { currentRound, totalRounds } = msg.data || {}
        console.log(`[WS] Breathing round: ${currentRound}/${totalRounds}`)
        
        if (totalRounds > 0) {
          // Percentage-based motivation for finite rounds
          const pct = currentRound / totalRounds
          let motivationalMsg = ''
          if (pct >= 0.5 && pct < 0.55) motivationalMsg = "You're halfway there! Keep going! 💪"
          else if (pct >= 0.75 && pct < 0.8) motivationalMsg = "Three quarters done! You're crushing it! 🔥"
          else if (pct >= 0.9 && pct < 0.95) motivationalMsg = "Almost there! Last round coming up! 🍑"
          else if (currentRound === totalRounds) motivationalMsg = "THIS IS THE LAST ONE! FINISH STRONG! 🎯"
          
          if (motivationalMsg) {
            peer.send(JSON.stringify({ event: 'breathing:motivation', data: { message: motivationalMsg } }))
          }
        } else {
          // Milestone-based motivation for endless mode
          let motivationalMsg = ''
          if (currentRound === 5) motivationalMsg = "5 rounds done! You're building stamina! 💪"
          else if (currentRound === 10) motivationalMsg = "10 rounds! You're on fire! 🔥"
          else if (currentRound === 15) motivationalMsg = "15 rounds! Absolute legend! 🍑"
          else if (currentRound === 20) motivationalMsg = "20 rounds! You're unstoppable! 🎯"
          else if (currentRound > 0 && currentRound % 10 === 0) motivationalMsg = `${currentRound} rounds! Keep going, champ! ✨`
          
          if (motivationalMsg) {
            peer.send(JSON.stringify({ event: 'breathing:motivation', data: { message: motivationalMsg } }))
          }
        }
        break
      }

      case 'breathing:sessionCompleted': {
        console.log(`[WS] Breathing completed: ${msg.data?.pattern}`)
        break
      }

      case 'breathing:paused': {
        console.log(`[WS] Breathing PAUSED by user`)
        // Send confirmation back to client
        peer.send(JSON.stringify({ event: 'breathing:pauseConfirmed', data: { timestamp: Date.now() } }))
        break
      }

      case 'breathing:resumed': {
        console.log(`[WS] Breathing RESUMED by user`)
        peer.send(JSON.stringify({ event: 'breathing:resumeConfirmed', data: { timestamp: Date.now() } }))
        break
      }
    }
  },

  close(peer) {
    console.log(`[WS] Disconnected: ${peer.id}`)
    unregisterPeer(peer.id)
  },
})
