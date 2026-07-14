export const run = {
  cmd: ['owner'],
  category: 'miscs',
  description: 'show owner contact',
  run: async (m, { sock }) => {
    const contacts = config.owner.map(number => {
      number = String(number).replace(/\D/g, '')
      const jid = `${number}@s.whatsapp.net`
      return {
        name: db.users[jid]?.name || number,
        number
      }
    })

    await sock.sendContact(
      m.chat,
      contacts,
      {
        quoted: m
      }
    )
  }
}
