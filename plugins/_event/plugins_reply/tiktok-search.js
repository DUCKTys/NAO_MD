db.event ??= {}
db.event.tiktokSearch ??= {}

export const run = {
  event: async (m, { sock }) => {
    if (!m.text || !m.quoted) return false

    const session = db.event.tiktokSearch?.[m.sender]
    if (!session) return false

    if (Date.now() > session.expired) {
      delete db.event.tiktokSearch[m.sender]
      return false
    }

    if (m.quoted.key.id !== session.messageId) return false

    if (!/^(10|[1-9])$/.test(m.text.trim())) return false

    const video = session.videos[Number(m.text.trim()) - 1]
    if (!video) return false

    const videoUrl = video.media?.find(v => v.type === 'video')?.url
    if (!videoUrl) return false

    let caption = `#> TikTok Download\n`
    caption += `- title : ${video.title?.trim() || '-'}\n`
    caption += `- author : ${video.author?.nickname || '-'}\n`
    caption += `- region : ${video.region || '-'}\n`
    caption += `- views : ${Func.h2k(video.stats?.play || 0)}\n`
    caption += `- likes : ${Func.h2k(video.stats?.like || 0)}\n`
    caption += `- comment : ${Func.h2k(video.stats?.comment || 0)}`

    await sock.sendMessage(
      m.chat,
      {
        video: {
          url: videoUrl
        },
        caption
      },
      {
        quoted: m
      }
    )

    delete db.event.tiktokSearch[m.sender]

    return true
  }
}
