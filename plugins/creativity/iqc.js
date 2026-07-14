import moment from 'moment-timezone'

export const run = {
  cmd: ['iqc'],
  hidden: ['iphonequoted'],
  category: 'creativity',
  description: 'create iphone quote',
  run: async (m, { text, prefix, command }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, 'kelaz kink'))

    m.react(config.emoji)

    try {
      await m.reply({
        image: await Func.fetchBuffer(
          `${config.api.baseUrl.zeline}/api/canvas/iqc?text=${encodeURIComponent(text)}&time=${moment().tz(config.tz).format('HH:mm')}&key=${config.api.key.zeline}`
        )
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
