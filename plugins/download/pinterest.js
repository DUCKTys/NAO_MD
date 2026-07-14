export const run = {
  cmd: ['pinterest'],
  hidden: ['pin'],
  category: 'download',
  description: 'download or search pinterest post',
  run: async (m, { prefix, command, sock, text }) => {
    if (!text)
      return m.reply(Func.usage(prefix, command, '(send query / url)'))

    m.react(config.emoji)

    try {
      if (
        Func.validUrl(text, 'pin.it') ||
        Func.validUrl(text, 'pinterest.com')
      ) {
        const {
          results: { title, author, media }
        } = await Func.fetchJson(
          `${config.api.baseUrl.zeline}/api/downloader/pinterest?url=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
        )

        const caption =
          `#> Pinterest Download\n` +
          `- title : ${title || '-'}\n` +
          `- author : ${author || 'unknown'}\n` +
          `- media : ${media.length}`

        if (media.length > 1)
          return sock.sendAlbum(
            m.chat,
            media.map(({ url }) => url),
            {
              caption,
              delay: 1000,
              quoted: m
            }
          )

        const { type, url } = media[0]

        return m.reply({
          [type === 'video' ? 'video' : 'image']: { url },
          caption
        })
      }

      const {
        results: { data = [] }
      } = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/search/pinterest?query=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
      )

      if (!data.length) return m.reply('no results found')

      const result = data.slice(0, 4)

      await (result.length > 1
        ? sock.sendAlbum(
            m.chat,
            result.map(({ image }) => image),
            {
              caption:
                `#> Pinterest Search\n` +
                `- query : ${text}\n` +
                `- result : ${result.length}\n\n` +
                `#> Result Metadata\n` +
                result
                  .map(
                    ({ title, upload_by, upload_date }, i) =>
                      `${i + 1}.\n- title : ${title || '-'}\n- author : ${upload_by || 'unknown'}\n- time : ${upload_date}`
                  )
                  .join('\n\n'),
              delay: 1000,
              quoted: m
            }
          )
        : m.reply({
            image: { url: result[0].image },
            caption:
              `#> Pinterest Search\n` +
              `- query : ${text}\n` +
              `- result : 1\n\n` +
              `#> Result Metadata\n` +
              `1.\n- title : ${result[0].title || '-'}\n` +
              `- author : ${result[0].upload_by || 'unknown'}\n` +
              `- time : ${result[0].upload_date}`
          }))
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
