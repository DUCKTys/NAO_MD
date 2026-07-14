export const run = {
  cmd: ['mode'],
  category: 'owner',
  description: 'manage bot settings',
  settings: {
    owner: true
  },
  run: async (m, { prefix, command, args }) => {
    const validModes = Object.keys(global.db.settings)

    if (args.length < 1) {
      let modeList = 'current settings:\n'

      for (const mode of validModes) {
        modeList += `- ${mode}: ${global.db.settings[mode] ? 'on' : 'off'}\n`
      }

      return m.reply(`${modeList}\nswitch mode:\n${prefix + command} self on`)
    }

    const input = args[0]
    const action = args[1]?.toLowerCase()

    const modeType = validModes.find(
      mode => mode.toLowerCase() === input?.toLowerCase()
    )

    if (!modeType) {
      return m.reply(`mode *${input}* not found. available modes: *${validModes.join(', ')}*`)
    }

    const formattedMode = modeType.charAt(0).toUpperCase() + modeType.slice(1)

    if (action === 'on') {
      global.db.settings[modeType] = true
      return m.reply(`${formattedMode} mode switched to: *[ on ]*`)
    } else if (action === 'off') {
      global.db.settings[modeType] = false
      return m.reply(`${formattedMode} mode switched to: *[ off ]*`)
    } else {
      return m.reply(`current status of *${modeType}* mode: *${global.db.settings[modeType] ? 'on' : 'off'}*\n\nchange the status by typing:\n*${prefix + command} ${modeType} on*\n*${prefix + command} ${modeType} off*`)
    }
  }
}
