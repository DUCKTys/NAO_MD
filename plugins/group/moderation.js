export const run = {
  cmd: ['moderation'],
  hidden: ['gcset', 'groupsettings'],
  category: 'group',
  settings: {
    group: true,
    admin: true,
    botAdmin: false
  },
  description: 'manage group settings',
  run: async (m, { prefix, command, args }) => {
    const group = global.db.groups[m.chat]

    const hiddenModes = ['access']

    const validModes = Object.keys(group)
      .filter(key =>
        typeof group[key] === 'boolean' &&
        !hiddenModes.includes(key)
      )

    const textModes = ['welcome', 'leave']

    const placeholder = `available placeholder:
@user -> mention user
@group -> group name
@time -> current time in ${config.tz}`

    if (args.length < 1) {
      let modeList = 'current settings:\n'

      for (const mode of validModes) {
        modeList += `- ${mode}: ${group[mode] ? 'on' : 'off'}\n`
      }

      modeList += '\ntext settings:\n'

      for (const mode of textModes) {
        modeList += `- ${mode}: ${group[mode]?.enabled ? 'on' : 'off'}\n`
      }

      return m.reply(
        `${modeList}\nswitch mode:\n${prefix + command} antilink on\n\nchange text:\n${prefix + command} welcome text hello @user\n\n${placeholder}`
      )
    }

    const modeType = args[0]?.toLowerCase()
    const action = args[1]?.toLowerCase()

    if (validModes.includes(modeType)) {
      if (action === 'on') {
        group[modeType] = true
        return m.reply(`${modeType} mode switched to : *[ on ]*`)
      }

      if (action === 'off') {
        group[modeType] = false
        return m.reply(`${modeType} mode switched to : *[ off ]*`)
      }

      return m.reply(
        `current status of *${modeType}* mode: *${group[modeType] ? 'on' : 'off'}*\n\nchange the status by typing:\n*${prefix + command} ${modeType} on*\n*${prefix + command} ${modeType} off*`
      )
    }

    if (textModes.includes(modeType)) {
      if (!group[modeType]) {
        return m.reply(`${modeType} settings not found.`)
      }

      if (action === 'on') {
        group[modeType].enabled = true
        return m.reply(`${modeType} notification switched to : *[ on ]*`)
      }

      if (action === 'off') {
        group[modeType].enabled = false
        return m.reply(`${modeType} notification switched to : *[ off ]*`)
      }

      if (action === 'text') {
        const text = args.slice(2).join(' ')

        if (!text) {
          return m.reply(
            `example:\n${prefix + command} ${modeType} text 👋 welcome @user to @group at @time\n\n${placeholder}`
          )
        }

        group[modeType].text = text

        return m.reply(
          `${modeType} text updated.\n\n${placeholder}`
        )
      }

      return m.reply(
        `current status of *${modeType}* notification: *${group[modeType].enabled ? 'on' : 'off'}*\n\nchange status:\n*${prefix + command} ${modeType} on*\n*${prefix + command} ${modeType} off*\n\nchange text:\n*${prefix + command} ${modeType} text your message*\n\n${placeholder}`
      )
    }

    return m.reply(
      `mode *${modeType}* not found. available modes: *${[...validModes, ...textModes].join(', ')}*`
    )
  }
}
