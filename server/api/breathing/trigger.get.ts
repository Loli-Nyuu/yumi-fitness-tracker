import { defineEventHandler } from 'h3'

let pendingTrigger: string | null = null

export default defineEventHandler(() => {
  const trigger = pendingTrigger
  pendingTrigger = null
  return { pattern: trigger }
})
