function trackPluginUsage(pluginName, ok) {
  const pluginStats = global.db.plugins[pluginName]
  if (!pluginStats) return
  if (ok) {
    pluginStats.success++
  } else {
    pluginStats.error++
  }
}

export async function executeCommand(pluginPath, plugin, msg, sock, config) {
  const pluginName = plugin.cmd?.[0] ?? pluginPath.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')
  const shouldTrack = !plugin?.settings?.owner
  const isStats = pluginName === 'stats'

  if (shouldTrack && !isStats) {
    if (!global.db.plugins[pluginName]) {
      global.db.plugins[pluginName] = {
        total: 0,
        success: 0,
        error: 0,
        firstUsed: Date.now(),
        lastUsed: Date.now()
      }
    }
    global.db.plugins[pluginName].total++
    global.db.plugins[pluginName].lastUsed = Date.now()
  }

  let ok = false
  try {
    await plugin.run(msg, {
      sock,
      prefix: msg.prefix,
      command: msg.command,
      text: msg.args.join(' '),
      args: msg.args
    })
    ok = true
  } catch (error) {
    console.error(error)
    msg.reply(config.msg.error)
  } finally {
    if (shouldTrack && !isStats) {
      trackPluginUsage(pluginName, ok)
    }
  }
}
