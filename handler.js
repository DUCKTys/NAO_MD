import { serialize } from './lib/serialize.js'
import { logger } from './lib/log.js'
import { getOrCreateQueue } from './core/queue.js'
import { checkPermissions } from './core/permissions.js'
import { executeCommand } from './core/executor.js'
import { notify } from './core/notify.js'

export const handler = async (sock, data) => {
  try {
    if (data.message) {
      const msg = await serialize(data, sock)

      await db.init(msg)

      logger(msg)

      if (db.settings.self && !msg.isOwner) return

      if (db.settings.accessOnly && !msg.isOwner) {
        if (!msg.isGroup) return
        if (!db.groups[msg.chat]?.access) return
      }

      if (db.settings.autoread) {
        await sock.readMessages([msg.key])
      }

      for (const [, plugin] of globalThis.plugins.entries()) {
        if (typeof plugin.event === 'function') {
          const stop = await plugin.event(msg, { sock })
          if (stop) return
        }
      }

      if (!msg.command) return

      for (const [pluginPath, plugin] of globalThis.plugins.entries()) {
        const isCmd = plugin?.cmd?.includes(msg.command)
        const isHidden = plugin?.hidden?.includes(msg.command)

        if (!isCmd && !isHidden) continue
        if (!checkPermissions(plugin, msg, config)) return

        msg.plugin = {
          path: pluginPath,
          name: plugin.name ?? pluginPath.split('/').pop().replace(/\.[^.]+$/, ''),
          description: plugin.description ?? '',
          cmd: plugin.cmd ?? [],
          hidden: plugin.hidden ?? [],
          settings: plugin.settings ?? {}
        }

        const queue = getOrCreateQueue(pluginPath)

        const task = () =>
          executeCommand(pluginPath, plugin, msg, sock, config)

        if (db.settings.queue) {
          queue.items.push({ task })

          const position =
            queue.items.length + (queue.running ? 1 : 0)

          const isOwnerPrivilege =
            plugin?.settings?.owner || msg.isOwner

          if (position > 1 && !isOwnerPrivilege) {
            msg.reply(
              `[ ! ] you are in queue *#${position}*,\nplease wait...`
            )
          }

          queue.process()
        } else {
          await task()
        }

        break
      }
    } else if (data.id && data.participants && data.action) {
      if (db.settings.self) return
      if (db.settings.accessOnly && !db.groups[data.id]?.access) return

      await notify(sock, data, db, config)
    }
  } catch (error) {
    console.error(error)
  }
}
