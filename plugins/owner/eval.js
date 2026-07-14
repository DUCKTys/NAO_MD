import util from 'util'

const safeStringify = (obj) => {
  const seen = new WeakSet()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') return undefined
    if (value instanceof Uint8Array) return `<Buffer ${value.length} bytes>`
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return value
  }, 2)
}

export const run = {
  cmd: ['eval'],
  hidden: ['ev'],
  category: 'owner',
  description: 'execute javascript code',
  settings: {
    owner: true
  },
  run: async (m, { sock, command, text }) => {
    if (!text) return m.reply('enter javascript code.')

    try {
      const evalCmd = (command === 'ev')
        ? (async () => { return eval(`(${text})`) })()
        : (async () => { return eval(`(async () => { ${text} })()`) })()

      let evaled = await eval(evalCmd)

      if (typeof evaled !== 'string') {
        evaled = safeStringify(evaled)
      }

      await m.reply(String(evaled))
    } catch (e) {
      await m.reply(util.format(e))
    }
  }
}
