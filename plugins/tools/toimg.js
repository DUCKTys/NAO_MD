export const run = {
  cmd: ['toimage'],
  hidden: ['toimg'],
  category: 'tools',
  description: 'convert sticker to image',
  run: async (m, { prefix, command }) => {

    if (
      !m.quoted &&
      !m.message?.stickerMessage
    ) {
      return m.reply(Func.usage(prefix, command, '(reply sticker)'))
    }

    try {
      const msg = m.quoted ? m.quoted : m
      const mime = msg.type || ''

      if (!/sticker/.test(mime)) {
        return m.reply('❌ Hanya support sticker!')
      }

      const buffer = await msg.download()

      await m.reply({
        image: buffer
      })

    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
