// Nitro plugin to set up shared SSE broadcast system
const listeners: Array<(data: string) => void> = []

export default defineNitroPlugin((nitroApp) => {
  // Expose global SSE functions
  nitroApp.sseListeners = listeners
  
  nitroApp.sseBroadcast = (data: any) => {
    const message = JSON.stringify(data)
    for (const listener of listeners) {
      try { listener(message) } catch {}
    }
  }
})

// Make types available
declare module 'nitropack' {
  interface NitroApp {
    sseListeners: Array<(data: string) => void>
    sseBroadcast: (data: any) => void
  }
}
