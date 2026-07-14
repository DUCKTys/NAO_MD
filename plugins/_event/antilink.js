export const run = {
  event: async (m, { sock }) => {
    if (!m.isGroup || !m.text || !db.groups[m.chat].antilink) return false

    const url = Func.validUrl(m.text, 'whatsapp.com')

    if (!url) return false

    if (m.isBotAdmin && !m.isAdmin) {
      await sock.sendMessage(m.chat, { delete: m.key })
      return true
    }

    return false
  }
}
