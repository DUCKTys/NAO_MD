export const run = {
  cmd: ['acc'],
  category: 'owner',
  description: 'manage group access',
  settings: {
    owner: true,
    group: true
  },
  run: async (m, { prefix, command, args }) => {
    const action = args[0]?.toLowerCase()
    const targetChat = args[1] || m.chat

    if (action === 'add') {
      if (global.db.groups[targetChat]?.access) {
        return m.reply('this group already has access.')
      }

      global.db.groups[targetChat].access = true
      return m.reply('access granted to this group.')
    }

    if (action === 'del') {
      if (!global.db.groups[targetChat]?.access) {
        return m.reply('this group does not have access.')
      }

      global.db.groups[targetChat].access = false
      return m.reply('access revoked from this group.')
    }
  }
}
