export const run = {
  cmd: ['stats'],
  hidden: ['statistics'],
  category: 'miscs',
  description: 'show bot statistics',
  run: async (m) => {
    const users = Object.values(db.users)
    const plugins = Object.entries(db.plugins || {})

    const totalUsers = users.length
    const totalChats = users.reduce(
      (sum, user) => sum + (user.totalChat || 0),
      0
    )

    const totalUsed = plugins.reduce(
      (sum, [, plugin]) => sum + (plugin.total || 0),
      0
    )
    const totalSuccess = plugins.reduce(
      (sum, [, plugin]) => sum + (plugin.success || 0),
      0
    )
    const totalError = plugins.reduce(
      (sum, [, plugin]) => sum + (plugin.error || 0),
      0
    )

    const formatTime = (timestamp) =>
      new Date(timestamp).toLocaleString('id-ID', {
        timeZone: config.tz,
        dateStyle: 'short',
        timeStyle: 'medium'
      }) + ' WIB'

    const mostUsed = [...plugins]
      .sort((a, b) => (b[1].total || 0) - (a[1].total || 0))
      .slice(0, 5)
      .map(
        ([name, plugin], i) => `${i + 1}. ${name}
   • Used : ${(plugin.total || 0).toLocaleString()}x
   • Success : ${(plugin.success || 0).toLocaleString()}
   • Error : ${(plugin.error || 0).toLocaleString()}`
      )
      .join('\n\n') || '-'

    const latest = [...plugins]
      .filter(([, plugin]) => plugin.lastUsed)
      .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
      .slice(0, 5)
      .map(
        ([name, plugin], i) => `${i + 1}. ${name}
   • ${formatTime(plugin.lastUsed)}`
      )
      .join('\n\n') || '-'

    const text = `
*Bot Statistics*

- Users : ${totalUsers.toLocaleString()}
- Chat Received : ${totalChats.toLocaleString()}

*Plugin Statistics*

- Total Hit : ${totalUsed.toLocaleString()}
- Success : ${totalSuccess.toLocaleString()}
- Error : ${totalError.toLocaleString()}

*Most Used Plugins*

${mostUsed}

*Recently Used Plugins*

${latest}
`.trim()

    await m.reply(text)
  }
}
