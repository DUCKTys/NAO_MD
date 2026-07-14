import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const repo = 'itsmekaa/zeline'
const branch = '2.0-stable'
const exclude = ['.env']

const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')

export const run = {
  cmd: ['update'],
  hidden: ['upd'],
  category: 'owner',
  description: 'update bot files',
  settings: {
    owner: true
  },
  run: async (m, { sock }) => {
    const sent = await m.reply('checking for updates...')

    const apiUrl = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`
    const res = await fetch(apiUrl)
    const data = await res.json()

    if (!data.tree) {
      await sock.sendMessage(m.chat, {
        text: 'failed to fetch repository tree.',
        edit: sent.key
      })
      return
    }

    const files = data.tree.filter(
      f => f.type === 'blob' && !exclude.includes(path.basename(f.path))
    )

    let updated = []
    let failed = []

    for (const file of files) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${file.path}`
        const r = await fetch(rawUrl)

        if (!r.ok) throw new Error(`http ${r.status}`)

        const content = await r.text()
        const localPath = path.resolve(process.cwd(), file.path)

        const localExists = fs.existsSync(localPath)

        if (localExists) {
          const localContent = fs.readFileSync(localPath, 'utf8')

          if (sha256(localContent) === sha256(content)) continue
        }

        fs.mkdirSync(path.dirname(localPath), { recursive: true })
        fs.writeFileSync(localPath, content, 'utf8')
        updated.push(file.path)

      } catch {
        failed.push(file.path)
      }
    }

    if (!updated.length) {
      let msg = `update completed\n\nno files were changed`

      if (failed.length) {
        msg += `\n\nfailed (${failed.length}):\n${failed.map(f => `- ${f}`).join('\n')}`
      }

      await sock.sendMessage(m.chat, {
        text: msg.trim(),
        edit: sent.key
      })

      return
    }

    let msg = `update completed\n\n`
    msg += `updated (${updated.length}):\n${updated.map(f => `- ${f}`).join('\n')}\n\n`

    if (failed.length) {
      msg += `failed (${failed.length}):\n${failed.map(f => `- ${f}`).join('\n')}\n\n`
    }

    msg += `restarting...`

    await sock.sendMessage(m.chat, {
      text: msg.trim(),
      edit: sent.key
    })

    setTimeout(() => process.exit(0), 2000)
  }
}
