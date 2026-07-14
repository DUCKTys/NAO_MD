export const notify = async (sock, data, db, config) => {
  const { id, participants, action } = data

  const formatText = (text, values = {}) => {
    return text
      .replace(/@user/g, values.user || '')
      .replace(/@group/g, values.group || '')
      .replace(/@time/g, values.time || '')
  }

  const metadata = await sock.groupMetadata(id)

  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: config.tz
  })

  for (const participant of participants) {
    const mention = participant.phoneNumber
    const username = mention.split('@')[0]

    let text = ''

    if (action === 'add' || action === 'remove') {
      const type = action === 'add'
        ? 'welcome'
        : 'leave'

      const groupConfig = db.groups?.[id]?.[type]

      if (!groupConfig?.enabled) continue

      text = formatText(groupConfig.text, {
        user: `@${username}`,
        group: metadata.subject,
        time
      })
    }

    if (action === 'promote') {
      text = `@${username} is now an *admin*!`
    }

    if (action === 'demote') {
      text = `@${username} is no longer an *admin*.`
    }

    if (!text) continue

    await sock.sendMessage(id, {
      text,
      mentions: [mention]
    })
  }
}
