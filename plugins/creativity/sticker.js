export const run = {
  cmd: ['sticker'],
  hidden: ['s'],
  category: 'creativity',
  description: 'create sticker',
  run: async (m, { sock, prefix, command }) => {
    if (
      !m.quoted &&
      !m.message?.imageMessage &&
      !m.message?.videoMessage
    ) {
      return m.reply(
        Func.usage(prefix, command, '(reply / send media)')
      )
    }

    try {
      const msg = m.quoted || m
      const mime = msg.type || ''

      if (!/image|video/.test(mime)) {
        return m.reply('Supported type : *[ image, video ]*')
      }

      const media = await msg.download()

      await sock.sendSticker(m.chat, media, {
        packname: config.sticker.packname || '',
        author: config.sticker.author || '',
        ai: true,
        quoted: m
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
