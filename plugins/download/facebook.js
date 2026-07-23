export const run = {
  cmd: ['facebook'],
  hidden: ['fb'],
  category: 'download',
  description: 'download video facebook',

  run: async (m, { sock, text }) => {
    try {
      if (!text) {
        return m.reply(
          'Masukkan link Facebook.\n\nContoh:\n.facebook https://facebook.com/share/r/xxxxx'
        )
      }

      m.react(config.emoji)

      const response = await fetch(
        `https://api.delirius.store/download/facebook?url=${encodeURIComponent(text)}`
      )

      const data = await response.json()

      if (!data.status) {
        return m.reply('Video tidak ditemukan.')
      }

      const video = data.list?.[0]?.url

      if (!video) {
        return m.reply('Link video tidak ditemukan.')
      }

      await sock.sendMessage(
        m.chat,
        {
          video: { url: video },
          caption: `🎥 Facebook Downloader

📺 Quality: ${data.list?.[0]?.quality || 'Unknown'}`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('Facebook Error:', e)
      m.reply('Terjadi kesalahan saat mengambil video.')
    }
  }
}
