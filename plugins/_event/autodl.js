export const run = {
  event: async (m, { sock }) => {
    if (!m.text) return false

    const text = m.text.trim()

    db.users[m.sender] ||= {}

    /*
     * HANDLE PILIHAN YOUTUBE
     */
    const ytSession = db.users[m.sender].ytSelect

    if (
      ytSession &&
      ytSession.expired > Date.now() &&
      ['1', '2'].includes(text)
    ) {
      const cmd = text === '1'
        ? 'ytmp3'
        : 'ytmp4'

      const url = ytSession.url

      delete db.users[m.sender].ytSelect

      for (const [, plugin] of globalThis.plugins.entries()) {
        const isCmd = plugin?.cmd?.includes(cmd)
        const isHidden = plugin?.hidden?.includes(cmd)

        if (!isCmd && !isHidden) continue

        try {
          await plugin.run(m, {
            sock,
            prefix: '.',
            command: cmd,
            text: url,
            args: [url]
          })

          return true
        } catch (e) {
          console.error(e)
          return false
        }
      }

      return false
    }

    /*
     * CEK URL
     */
    const isTikTok =
      text.includes('tiktok.com') ||
      text.includes('vt.tiktok.com')

    const isInstagram =
      text.includes('instagram.com')

    const isFacebook =
      text.includes('facebook.com') ||
      text.includes('fb.watch')

    const isYoutube =
      text.includes('youtube.com') ||
      text.includes('youtu.be')

    /*
     * YOUTUBE
     */
    if (isYoutube) {
      db.users[m.sender].ytSelect = {
        url: text,
        expired: Date.now() + 60000
      }

      await m.reply(
        [
          '🎥 *YouTube Downloader*',
          '',
          'Pilih format download:',
          '',
          '1. Audio MP3',
          '2. Video MP4',
          '',
          'Balas dengan angka *1* atau *2*',
          'Session berlaku 60 detik.'
        ].join('\n')
      )

      return true
    }

    /*
     * PLATFORM LAIN
     */
    let cmd = null

    if (isTikTok) {
      cmd = 'tiktok'
    } else if (isInstagram) {
      cmd = 'instagram'
    } else if (isFacebook) {
      cmd = 'facebook'
    }

    if (!cmd) return false

    for (const [, plugin] of globalThis.plugins.entries()) {
      const isCmd = plugin?.cmd?.includes(cmd)
      const isHidden = plugin?.hidden?.includes(cmd)

      if (!isCmd && !isHidden) continue

      try {
        await plugin.run(m, {
          sock,
          prefix: '.',
          command: cmd,
          text,
          args: [text]
        })

        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }

    return false
  }
}