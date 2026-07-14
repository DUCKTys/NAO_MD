db.event ??= {}
db.event.tiktokSearch ??= {}

export const run = {
  cmd: ['tiktoksearch'],
  hidden: ['tts'],
  category: 'search',
  description: 'search tiktok videos',
  run: async (m, { text, command, prefix }) => {
    if (!text) {
      return m.reply(Func.usage(prefix, command, 'video cinematic'))
    }

    try {
      const {
        results: { results: videos = [] } = {}
      } = await Func.fetchJson(
        `${config.api.baseUrl.zeline}/api/search/tiktok?keywords=${encodeURIComponent(text)}&key=${config.api.key.zeline}`
      )

      if (!videos.length) {
        return m.reply('no results found')
      }

      const result = videos.slice(0, 10)

      const caption =
        `#> TikTok Search\n` +
        `- query : ${text}\n` +
        `- result : ${result.length}\n\n` +
        `#> Result Metadata\n` +
        result
          .map(
            ({ title, author, stats }, i) =>
              `${i + 1}.\n` +
              `- title : ${(title || '-').slice(0, 80)}\n` +
              `- author : ${author?.nickname || '-'}\n` +
              `- views : ${Func.h2k(stats?.play || 0)}`
          )
          .join('\n\n') +
        `\n\nreply with a number between 1-${result.length} to download.\n` +
        `expires in 1 minute.`

      const msg = await m.reply(caption)

      db.event.tiktokSearch[m.sender] = {
        videos: result,
        expired: Date.now() + 60000,
        messageId: msg.key.id
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
