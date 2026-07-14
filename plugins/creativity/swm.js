export const run = {
  cmd: ['swm'],
  hidden: ['wm', 'watermark'],
  category: 'creativity',
  description: 'change sticker watermark',
  run: async (m, { sock, prefix, command }) => {
    if (
      (
        !m.quoted &&
        !m.message?.imageMessage &&
        !m.message?.videoMessage &&
        !m.message?.stickerMessage
      ) ||
      !m.args?.length
    ) {
      return m.reply(
        Func.usage(prefix, command, 'packname | author')
      )
    }

    const text = m.args.join(' ')

    let packname = ''
    let author = ''

    if (text.includes('|')) {
      ;[packname, author] = text.split('|').map(v => v.trim())
    } else {
      packname = text
    }

    try {
      const msg = m.quoted || m
      const media = await msg.download()

      await sock.sendSticker(m.chat, media, {
        ...(packname && { packname }),
        ...(author && { author }),
        ai: true,
        quoted: m
      })
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
