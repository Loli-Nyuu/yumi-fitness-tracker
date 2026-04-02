import type { Peer } from 'crossws'

const peers = new Map<string, Peer>()
const sessionState = new Map<number, {
  status: 'waiting' | 'active' | 'paused' | 'completed'
  currentExerciseIndex: number
  timerStart: number | null
  timerType: string | null
  repCount: number
  setCount: number
}>()

export default defineWebSocketHandler({
  open(peer) {
    console.log(`[WS] Connected: ${peer.id}`)
    peers.set(peer.id, peer)
    peer.send(JSON.stringify({ event: 'connected', data: { peerId: peer.id } }))
  },

  message(peer, rawMessage) {
    const msg = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage

    console.log(`[WS] Message from ${peer.id}:`, msg.event)

    switch (msg.event) {
      case 'session:join': {
        const sessionId = msg.data.sessionId
        peer.ctx = { sessionId }
        if (!sessionState.has(sessionId)) {
          sessionState.set(sessionId, {
            status: 'waiting',
            currentExerciseIndex: 0,
            timerStart: null,
            timerType: null,
            repCount: 0,
            setCount: 0,
          })
        }
        broadcast({ event: 'session:joined', data: { peerId: peer.id, sessionId } }, sessionId)
        break
      }

      case 'session:start': {
        const sessionId = msg.data.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.status = 'active'
          broadcast({ event: 'session:started', data: { sessionId, startTime: Date.now() } }, sessionId)
        }
        break
      }

      case 'timer:start': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.timerStart = Date.now()
          state.timerType = msg.data.type
          broadcast({ event: 'timer:started', data: { type: msg.data.type, exerciseId: msg.data.exerciseId } }, sessionId)
        }
        break
      }

      case 'timer:stop': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state && state.timerStart) {
          const elapsed = Math.floor((Date.now() - state.timerStart) / 1000)
          broadcast({ event: 'timer:stopped', data: { elapsed, type: state.timerType } }, sessionId)
          state.timerStart = null
          state.timerType = null
        }
        break
      }

      case 'rep:complete': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.repCount++
          broadcast({ event: 'rep:count', data: { current: state.repCount, target: msg.data.target } }, sessionId)
        }
        break
      }

      case 'set:complete': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.setCount++
          state.repCount = 0
          broadcast({ event: 'set:complete', data: { set: state.setCount, total: msg.data.total } }, sessionId)
        }
        break
      }

      case 'break:request': {
        const sessionId = peer.ctx?.sessionId
        broadcast({ event: 'break:requested', data: { duration: msg.data.duration || 60, requestedBy: peer.id } }, sessionId)
        break
      }

      case 'modify:request': {
        const sessionId = peer.ctx?.sessionId
        broadcast({ event: 'modify:requested', data: { reason: msg.data.reason, requestedBy: peer.id } }, sessionId)
        break
      }

      case 'exercise:next': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.currentExerciseIndex++
          state.repCount = 0
          state.setCount = 0
          broadcast({ event: 'exercise:changed', data: { index: state.currentExerciseIndex } }, sessionId)
        }
        break
      }

      case 'session:complete': {
        const sessionId = peer.ctx?.sessionId
        const state = sessionState.get(sessionId)
        if (state) {
          state.status = 'completed'
          broadcast({ event: 'session:completed', data: { sessionId } }, sessionId)
        }
        break
      }

      case 'message': {
        // General chat message between coach and trainee
        const sessionId = peer.ctx?.sessionId
        broadcast({ event: 'message', data: { from: peer.id, text: msg.data.text } }, sessionId)
        break
      }
    }
  },

  close(peer) {
    console.log(`[WS] Disconnected: ${peer.id}`)
    peers.delete(peer.id)
    // Notify session peers
    const sessionId = peer.ctx?.sessionId
    if (sessionId) {
      broadcast({ event: 'peer:disconnected', data: { peerId: peer.id } }, sessionId)
    }
  },
})

function broadcast(data: any, sessionId?: number) {
  const message = JSON.stringify(data)
  for (const [id, peer] of peers) {
    if (sessionId && peer.ctx?.sessionId === sessionId) {
      peer.send(message)
    } else if (!sessionId) {
      peer.send(message)
    }
  }
}
