export const run = {
  cmd: ['instagram'],
  hidden: ['ig', 'igdl'],
  category: 'download',
  description: 'download instagram post',
  run: async (m, { sock, prefix, command, text }) => {
    if (!text || !Func.validUrl(text, 'instagram.com'))
      return m.reply(
        Func.usage(prefix, command, 'https://www.instagram.com/p/xxxx')
      )

    m.react(config.emoji)

    try {
      const { results } = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/downloader/ig?url=${encodeURIComponent(Func.extractUrl(text))}&key=${config.api.key.zeline}`
      )

      const caption = `#> Instagram Download\n- media : ${results.length}`

      if (results.length > 1)
        return sock.sendAlbum(
          m.chat,
          results.map(({ url }) => url),
          {
            caption,
            delay: 1000,
            quoted: m
          }
        )

      const { type, url } = results[0]

      await m.reply({
        [type]: { url },
        caption
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
