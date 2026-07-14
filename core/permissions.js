export function checkPermissions(plugin, msg, config) {
  if (!plugin?.settings) return true
  if (plugin.settings.owner && !msg.isOwner) {
    msg.reply(config.msg.owner)
    return false
  }
  if (plugin.settings.group && !msg.isGroup) {
    msg.reply(config.msg.group)
    return false
  }
  if (plugin.settings.private && msg.isGroup) {
    msg.reply(config.msg.private)
    return false
  }
  if (msg.isGroup) {
    if (plugin.settings.admin && !msg.isAdmin) {
      msg.reply(config.msg.admin)
      return false
    }
    if (plugin.settings.botAdmin && !msg.isBotAdmin) {
      msg.reply(config.msg.botAdmin)
      return false
    }
  }
  return true
}