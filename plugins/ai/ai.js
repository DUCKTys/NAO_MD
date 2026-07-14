import axios from 'axios'
import moment from 'moment-timezone'

export const run = {
  cmd: ['ai'],
  category: 'ai',
  description: 'chat with ai',
  run: async (m, { text }) => {
    if (!text) return m.reply(Func.usage(m.prefix, m.command, 'halo'))

    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.api.key.gemini}`,
        {
          systemInstruction: {
            parts: [{
              text: `Kamu adalah asisten AI yang terhubung dengan WhatsApp. Waktu saat ini di zona ${config.tz} adalah ${moment().tz(config.tz).format('dddd, DD MMMM YYYY HH:mm:ss')}. Jawab dengan santai dan natural.`
            }]
          },
          tools: [{ googleSearch: {} }],
          contents: [{
            parts: [{ text }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      await m.reply(data.candidates[0].content.parts[0].text.trim())
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
