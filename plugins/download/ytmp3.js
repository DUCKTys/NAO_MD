export const run = {
  cmd: ['ytmp3'],
  hidden: ['yta'],
  category: 'download',
  description: 'download youtube audio',
  run: async (m, { text, prefix, command }) => {
    if (
      !text ||
      (!Func.validUrl(text, 'youtu.be') &&
        !Func.validUrl(text, 'youtube.com'))
    )
      return m.reply(
        Func.usage(prefix, command, 'https://youtu.be/PrF3E-otC_E')
      )

    m.react(config.emoji)

    try {
      const {
        results: { metadata, download }
      } = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/downloader/ytmp3?url=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
      )

      if (metadata.duration > 3600)
        return m.reply('audio duration exceeds 60 minutes')

      await m.reply({
        image: { url: metadata.thumbnail },
        caption:
          `#> YouTube Download\n` +
          `- title : ${metadata.title || '-'}\n` +
          `- uploader : ${metadata.uploader || '-'}\n` +
          `- duration : ${Func.toDate(metadata.duration)}\n` +
          `- views : ${Func.h2k(metadata.view_count || 0)}\n` +
          `- likes : ${Func.h2k(metadata.like_count || 0)}\n` +
          `- description : ${metadata.description || '-'}`
      })

      await m.reply({
        audio: { url: download.download_url },
        mimetype: 'audio/mpeg',
        fileName: `${metadata.title}.mp3`
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
