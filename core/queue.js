if (!globalThis.cmdQueues) {
  globalThis.cmdQueues = new Map()
}

export function getOrCreateQueue(pluginPath) {
  if (!globalThis.cmdQueues.has(pluginPath)) {
    globalThis.cmdQueues.set(pluginPath, {
      items: [],
      running: false,
      async process() {
        if (this.running || this.items.length === 0) return
        this.running = true
        const { task } = this.items.shift()
        try {
          await task()
        } catch (e) {
          console.error(e)
        }
        this.running = false
        this.process()
      }
    })
  }
  return globalThis.cmdQueues.get(pluginPath)
}