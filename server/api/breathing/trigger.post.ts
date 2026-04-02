import { defineEventHandler, readBody } from 'h3'
import { useNitroApp } from 'nitropack/runtime'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const body = await readBody(event)
  const pattern = body.pattern || null
  if (pattern) {
    nitroApp.sseBroadcast({ event: 'breathing:open', data: { pattern } })
  }
  return { success: true, pattern }
})
