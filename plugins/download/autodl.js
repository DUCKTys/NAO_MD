import axios from "axios"

const patterns = {
  tiktok: /https?:\/\/(?:www\.)?(?:vt|vm|tiktok)\.[^\s]+|https?:\/\/(?:www\.)?tiktok\.com\/[^\s]+/i,
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i,
  facebook: /https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch)\/[^\s]+/i
}

function getJid(m) {
  return m.chat || m.from || m.key?.remoteJid || m.id || null
}

async function sendImage(sock, jid, url, quoted, caption = "") {
  return sock.sendMessage(
    jid,
    { image: { url }, caption },
    { quoted }
  )
}

async function sendVideo(sock, jid, url, quoted, caption = "") {
  return sock.sendMessage(
    jid,
    { video: { url }, caption },
    { quoted }
  )
}

async function sendAlbumImages(sock, jid, items, quoted) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item?.url) continue

    const caption = i === 0 ? "✅ Instagram Downloader" : ""
    await sock.sendMessage(
      jid,
      { image: { url: item.url }, caption },
      { quoted }
    )
  }
}

export const run = {
  event: async (m, { sock }) => {
    try {
      const API = "https://api.delirius.store"
      const text = (m.body || m.text || "").trim()
      if (!text) return false

      const jid = getJid(m)
      if (!jid) return false

      if (m.fromMe) return false

      // TikTok
      if (patterns.tiktok.test(text)) {
        await m.reply("⏳ Sedang mendownload TikTok...")

        const { data } = await axios.get(
  `${API}/download/tiktok?url=${encodeURIComponent(text)}`
)

        const media = data?.data?.meta?.media
        if (!Array.isArray(media) || !media.length) {
          return m.reply("❌ Data TikTok tidak ditemukan.")
        }

        const videoObj =
          media.find(v => v.type === "video" && v.hd) ||
          media.find(v => v.type === "video" && v.org) ||
          media.find(v => v.type === "video")

        const videoUrl = videoObj?.hd || videoObj?.org || videoObj?.url
        if (!videoUrl) return m.reply("❌ Link video TikTok tidak tersedia.")

        await sendVideo(sock, jid, videoUrl, m, "✅ TikTok Downloader")
        return true
      }

      // Instagram
      if (patterns.instagram.test(text)) {
        await m.reply("⏳ Sedang mendownload Instagram...")

        const { data } = await axios.get(
  `${API}/download/instagram?url=${encodeURIComponent(text)}`
)

        const list = data?.data
        if (!Array.isArray(list) || !list.length) {
          return m.reply("❌ Data Instagram tidak ditemukan.")
        }

        const images = list.filter(v => v.type === "image" && v.url)
        const videos = list.filter(v => v.type === "video" && v.url)

        if (images.length) {
          if (images.length === 1) {
            await sendImage(sock, jid, images[0].url, m, "✅ Instagram Downloader")
          } else {
            await sendAlbumImages(sock, jid, images, m)
          }
          return true
        }

        if (videos.length) {
          await sendVideo(sock, jid, videos[0].url, m, "✅ Instagram Downloader")
          return true
        }

        return m.reply("❌ Media Instagram tidak ditemukan.")
      }

      // Facebook
      if (patterns.facebook.test(text)) {
        await m.reply("⏳ Sedang mendownload Facebook...")

        const { data } = await axios.get(
  `${API}/download/facebook?url=${encodeURIComponent(text)}`
)

        const list = data?.list
        if (!Array.isArray(list) || !list.length) {
          return m.reply("❌ Data Facebook tidak ditemukan.")
        }

        const best =
          list.find(v => /hd/i.test(v.quality || "")) ||
          list[0]

        const videoUrl = best?.url
        if (!videoUrl) return m.reply("❌ Link video Facebook tidak tersedia.")

        await sendVideo(sock, jid, videoUrl, m, "✅ Facebook Downloader")
        return true
      }

      return false
    } catch (err) {
      console.error(err)
      return m.reply("❌ Gagal mendownload media.")
    }
  }
}