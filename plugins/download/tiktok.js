export const run = {
  cmd: ['tiktok'],
  hidden: ['tt', 'ttdl'],
  category: 'download',
  description: 'download tiktok post',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'tiktok.com'))
      return m.reply(
        Func.usage(prefix, command, 'https://vt.tiktok.com/ZSQqVxbbM/')
      )

    m.react(config.emoji)

    try {
      const { results } = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/downloader/tiktok?url=${encodeURIComponent(Func.extractUrl(text))}&key=${config.api.key.zeline}`
      )

      const caption =
        `#> TikTok Download\n` +
        `- title : ${results.title || '-'}\n` +
        `- author : ${results.author?.nickname || '-'}\n` +
        `- region : ${results.region || '-'}\n` +
        `- views : ${Func.h2k(results.stats?.play || 0)}\n` +
        `- likes : ${Func.h2k(results.stats?.like || 0)}\n` +
        `- comment : ${Func.h2k(results.stats?.comment || 0)}`

      if (results.type === 'slide') {
        const images = results.media
          .filter(({ type }) => type === 'image')
          .map(({ url }) => url)

        if (images.length > 1)
          return sock.sendAlbum(m.chat, images, {
            caption,
            delay: 1000,
            quoted: m
          })

        return m.reply({
          image: { url: images[0] },
          caption
        })
      }

      await m.reply({
        video: {
          url: results.media.find(({ type }) => type === 'video').url
        },
        caption
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
