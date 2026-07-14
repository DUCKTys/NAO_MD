export const run = {
  cmd: ['ytmp4'],
  hidden: ['ytv'],
  category: 'download',
  description: 'download youtube video',
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
        `${config.api.baseUrl.zeline}/api/downloader/ytmp4?url=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
      )

      if (metadata.duration > 3600)
        return m.reply('video duration exceeds 60 minutes')

      await m.reply({
        video: { url: download.download_url },
        mimetype: 'video/mp4',
        fileName: `${metadata.title}.mp4`,
        caption:
          `#> YouTube Download\n` +
          `- title : ${metadata.title || '-'}\n` +
          `- uploader : ${metadata.uploader || '-'}\n` +
          `- duration : ${Func.toDate(metadata.duration)}\n` +
          `- views : ${Func.h2k(metadata.view_count || 0)}\n` +
          `- likes : ${Func.h2k(metadata.like_count || 0)}\n` +
          `- description : ${metadata.description || '-'}`
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
