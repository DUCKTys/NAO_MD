import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

const pkg = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), 'package.json'),
    'utf8'
  )
)

export const run = {
  cmd: ['menu'],
  hidden: ['m'],
  run: async (m, { sock }) => {
    const categories = {}

    for (const [, plugin] of globalThis.plugins.entries()) {
      if (!plugin.category || !plugin.cmd) continue

      if (!categories[plugin.category]) {
        categories[plugin.category] = []
      }

      for (const cmd of plugin.cmd) {
        categories[plugin.category].push({
          cmd,
          description: plugin.description || 'no description'
        })
      }
    }

    const time = moment().tz(config.tz).format('HH:mm:ss')

    let text = `Hi @${m.sender.split('@')[0]} !\n\n`
    text += '`bot info`\n'
    text += `- name : ${pkg.name}\n`
    text += `- version : ${pkg.version}\n`
    text += `- prefix : [ ${config.prefix.join(', ')} ]\n`
    text += `- time : ${time}\n\n`

    for (const cat of Object.keys(categories).sort()) {
      text += `*- menu ${cat}*\n`

      const cmds = categories[cat]
        .filter((v, i, arr) => arr.findIndex(x => x.cmd === v.cmd) === i)
        .sort((a, b) => a.cmd.localeCompare(b.cmd))

      cmds.forEach((item, i) => {
        const last = i === cmds.length - 1
        text += `${last ? ' └' : ' │'} • ${m.prefix || config.prefix[0]}${item.cmd} - (${item.description})\n`
      })

      text += '\n'
    }

    await sock.sendMessage(
      m.chat,
      {
        text: text.trim(),
        footer: pkg.name,
        offerText: pkg.version,
        offerUrl: 'https://saweria.co/ducktys',
        offerExpiration: Date.now() + 3_600_000,
        nativeFlow: [],
        interactiveAsTemplate: false,
        mentions: [m.sender]
      },
      {
        quoted: m
      }
    )
  }
}
