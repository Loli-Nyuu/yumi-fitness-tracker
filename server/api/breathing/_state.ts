// Shared SSE broadcast state
const listeners: Array<(data: string) => void> = []

export function addSSEListener(listener: (data: string) => void) {
  listeners.push(listener)
}

export function removeSSEListener(listener: (data: string) => void) {
  const idx = listeners.indexOf(listener)
  if (idx !== -1) listeners.splice(idx, 1)
}

export function broadcastSSE(data: any) {
  const message = JSON.stringify(data)
  for (const listener of listeners) {
    try { listener(message) } catch {}
  }
}
