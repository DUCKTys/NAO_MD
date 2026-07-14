import { exec } from 'child_process'
import util from 'util'

export const run = {
  cmd: ['exec'],
  hidden: ['ex'],
  category: 'owner',
  description: 'execute terminal command',
  settings: {
    owner: true
  },
  run: async (m, { text }) => {
    if (!text) return m.reply('enter terminal command.')

    exec(text, (error, stdout, stderr) => {
      if (stdout) return m.reply(util.format(stdout).trim())
      if (stderr) return m.reply(util.format(stderr).trim())
      if (error) return m.reply(util.format(error.message).trim())
    })
  }
}
