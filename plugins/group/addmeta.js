export const run = {
  cmd: ['addmeta'],
  category: 'group',
  settings: {
    admin: true,
    group: true
  },
  description: 'add meta ai in group',
  run: async (m, { sock }) => {
    const result = await sock.groupParticipantsUpdate(
      m.chat,
      ["867051314767696@bot"],
      "add"
    )
    m.reply(JSON.stringify(result, null, 2))
  }
}
