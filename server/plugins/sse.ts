// This plugin is no longer needed as SSE state is in server/lib/sse.ts
// Keeping it as a no-op for backwards compatibility
export default defineNitroPlugin(() => {
  // SSE broadcast is now handled by server/lib/sse.ts
})
