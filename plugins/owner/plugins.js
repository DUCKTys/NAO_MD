import fs from 'fs-extra'
import path from 'path'

export const run = {
  cmd: ['plugins'],
  category: 'owner',
  description: 'manage plugins',
  settings: {
    owner: true
  },
  run: async (m, { args }) => {
    const action = args[0]?.toLowerCase()
    let pluginPath = args[1]

    if (!action || !pluginPath) {
      return m.reply(`format: ${m.prefix}${m.command} <add/del/get> <file>`)
    }

    if (!pluginPath.endsWith('.js')) {
      pluginPath += '.js'
    }

    const targetPath = path.join(process.cwd(), 'plugins', pluginPath)

    if (action === 'add') {
      if (!m.quoted || !m.quoted.text) {
        return m.reply('reply plugin code.')
      }

      if (!m.quoted.text.includes('export const run')) {
        return m.reply('invalid plugin format. must contain export const run.')
      }

      await fs.ensureDir(path.dirname(targetPath))
      await fs.writeFile(targetPath, m.quoted.text)

      return m.reply(`plugin saved: ${pluginPath}`)

    } else if (action === 'del' || action === 'delete') {
      if (!fs.existsSync(targetPath)) {
        return m.reply('file not found.')
      }

      await fs.unlink(targetPath)

      return m.reply(`plugin deleted: ${pluginPath}`)

    } else if (action === 'get') {
      if (!fs.existsSync(targetPath)) {
        return m.reply('file not found.')
      }

      const content = await fs.readFile(targetPath, 'utf-8')

      if (content.length > 60000) {
        const buffer = Buffer.from(content)
        return m.reply(buffer, {
          fileName: pluginPath
        })
      }

      return m.reply(content)

    } else {
      return m.reply('invalid action. use add, del, or get.')
    }
  }
}
