import { defineEventHandler, readBody } from 'h3'
import { broadcastWS } from '../../lib/ws-peers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pattern = body.pattern || null
  
  if (pattern) {
    broadcastWS({
      event: 'breathing:open',
      data: {
        pattern,
        rounds: body.rounds,
        autoStartDelay: body.autoStartDelay,
      },
    })
  }
  
  return { success: true, pattern }
})
