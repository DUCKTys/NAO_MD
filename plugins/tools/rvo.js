export const run = {
  cmd: ['rvo'],
  hidden: ['vv'],
  category: 'tools',
  description: 'send view once media',
  run: async (m, { prefix, command }) => {
    const q = m.quoted

    if (!q?.message) {
      return m.reply(Func.usage(prefix, command, '(reply view once)'))
    }

    const inner = q.message
    const msg =
      inner.videoMessage ||
      inner.imageMessage ||
      inner.audioMessage

    if (!msg || msg.viewOnce !== true) {
      return m.reply('Mimetype not supported!')
    }

    try {
      const buffer = await q.download()

      if (inner.videoMessage) {
        await m.reply({ video: buffer })
      } else if (inner.imageMessage) {
        await m.reply({ image: buffer })
      } else if (inner.audioMessage) {
        await m.reply({ audio: buffer })
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
