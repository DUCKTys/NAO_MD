export const run = {
  cmd: ['remini'],
  hidden: ['upscale', 'hd'],
  category: 'ai',
  description: 'enhance image quality',
  run: async (m, { prefix, command }) => {
    if (
      !(
        m.type === 'imageMessage' ||
        (m.quoted && m.quoted.type === 'imageMessage')
      )
    )
      return m.reply(Func.usage(prefix, command, '(reply / send image)'))

    m.react(config.emoji)

    try {
      const media =
        m.quoted?.type === 'imageMessage' ? m.quoted : m

      await m.reply({
        image: await Func.fetchBuffer(
          `${config.api.baseUrl.zeline}/api/ai/remini?url=${
            await uploader.uguu(await media.download())
          }&key=${config.api.key.zeline}`
        )
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
