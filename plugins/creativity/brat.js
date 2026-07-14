export const run = {
  cmd: ['brat'],
  category: 'creativity',
  description: 'create brat sticker',
  run: async (m, { sock, text, prefix, command }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'hello world'))

    try {
      await sock.sendSticker(
        m.chat,
        await Func.fetchBuffer(
          `https://skyzxu-brat.hf.space/brat?text=${encodeURIComponent(text)}`
        ),
        {
          packname: config.sticker.packname,
          author: config.sticker.author,
          ai: true,
          quoted: m
        }
      )
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
