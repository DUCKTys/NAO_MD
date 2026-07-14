import { getContentType, jidNormalizedUser, downloadMediaMessage } from 'baileys'
import { fileTypeFromBuffer } from 'file-type'

export const serialize = async (raw, sock) => {
  if (!raw) return raw
  const m = {}

  m.key = raw.key
  m.message = raw.message
  m.id = raw.key.id
  m.timestamps = Number(raw.messageTimestamp) * 1000 || Date.now()
  m.chat = raw.key.remoteJid
  m.isGroup = m.chat.endsWith('@g.us')
  m.sender = jidNormalizedUser(m.isGroup ? (raw.key.participant || raw.key.remoteJid) : raw.key.remoteJidAlt)
  m.pushName = raw.pushName || 'User'

  m.isAdmin = false
  m.isBotAdmin = false
  m.isOwner = false

  let groupParticipants = null

  if (m.isGroup) {
    groupParticipants = (await sock.groupMetadata(m.chat).catch(() => null))?.participants ?? []
  }

  if (raw.message) {
    let msg = raw.message

    if (msg.viewOnceMessageV2) {
      msg = msg.viewOnceMessageV2.message
    } else if (msg.ephemeralMessage) {
      msg = msg.ephemeralMessage.message
    } else if (msg.viewOnceMessageV2Extension) {
      msg = msg.viewOnceMessageV2Extension.message
    }

    m.type = getContentType(msg)

    const _rawContent = msg[m.type] || {}

    if (m.type === 'documentMessage' && _rawContent.mimetype) {
      if (_rawContent.mimetype.startsWith('image/')) m.type = 'imageMessage'
      else if (_rawContent.mimetype.startsWith('video/')) m.type = 'videoMessage'
      else if (_rawContent.mimetype.startsWith('audio/')) m.type = 'audioMessage'
    }

    m.body = m.type === 'conversation' ? msg.conversation
      : m.type === 'extendedTextMessage' ? msg.extendedTextMessage.text
      : m.type === 'imageMessage' ? _rawContent.caption
      : m.type === 'videoMessage' ? _rawContent.caption
      : ''

    if (typeof m.body !== 'string') m.body = ''
    m.body = m.body.trim()

    m.quoted = null
    const contextInfo = _rawContent.contextInfo || {}
    m.mentions = contextInfo.mentionedJid || []

    let quotedMentions = []
    let quotedMsg = null
    let quotedType = null
    let quotedSender = contextInfo.participant ? jidNormalizedUser(contextInfo.participant) : null

    if (contextInfo.quotedMessage) {
      quotedMsg = contextInfo.quotedMessage
      quotedType = getContentType(quotedMsg)

      const _quotedRawContent = quotedMsg[quotedType] || {}
      if (quotedType === 'documentMessage' && _quotedRawContent.mimetype) {
        if (_quotedRawContent.mimetype.startsWith('image/')) quotedType = 'imageMessage'
        else if (_quotedRawContent.mimetype.startsWith('video/')) quotedType = 'videoMessage'
        else if (_quotedRawContent.mimetype.startsWith('audio/')) quotedType = 'audioMessage'
      }

      quotedMentions = _quotedRawContent.contextInfo?.mentionedJid || []
    }

    const allJids = [m.sender, quotedSender, ...m.mentions, ...quotedMentions].filter(Boolean)
    const hasLid = allJids.some(jid => jid.endsWith('@lid'))

    if (m.isGroup && hasLid && groupParticipants.length > 0) {
      try {
        const mapLidStr = (jid) => {
          if (jid && jid.endsWith('@lid')) {
            const member = groupParticipants.find(p => p.id === jid)
            return member && member.phoneNumber ? member.phoneNumber : jid
          }
          return jid
        }

        m.sender = mapLidStr(m.sender)
        if (raw.key.participant) raw.key.participant = m.sender

        if (quotedSender) {
          quotedSender = mapLidStr(quotedSender)
          contextInfo.participant = quotedSender
        }

        const replaceTextLid = (text, lidNum, phoneNum) => {
          if (typeof text === 'string') {
            return text.replace(new RegExp('@' + lidNum, 'g'), '@' + phoneNum)
          }
          return text
        }

        const mapLid = (jid, targetContent) => {
          if (jid.endsWith('@lid')) {
            const member = groupParticipants.find(p => p.id === jid)
            if (member && member.phoneNumber) {
              const lidNum = jid.split('@')[0]
              const phoneNum = member.phoneNumber.split('@')[0]

              if (targetContent === _rawContent) {
                m.body = replaceTextLid(m.body, lidNum, phoneNum)
              }

              if (targetContent) {
                if (targetContent.text) {
                  targetContent.text = replaceTextLid(targetContent.text, lidNum, phoneNum)
                }
                if (targetContent.caption) {
                  targetContent.caption = replaceTextLid(targetContent.caption, lidNum, phoneNum)
                }
                if (targetContent.conversation) {
                  targetContent.conversation = replaceTextLid(targetContent.conversation, lidNum, phoneNum)
                }
              }

              return member.phoneNumber
            }
          }
          return jid
        }

        m.mentions = m.mentions.map(jid => mapLid(jid, _rawContent))
        quotedMentions = quotedMentions.map(jid => mapLid(jid, quotedMsg?.[getContentType(quotedMsg)]))

        if (_rawContent.contextInfo?.mentionedJid) {
          _rawContent.contextInfo.mentionedJid = m.mentions
        }
        if (quotedMsg) {
          const _qc = quotedMsg[getContentType(quotedMsg)]
          if (_qc?.contextInfo?.mentionedJid) {
            _qc.contextInfo.mentionedJid = quotedMentions
          }
        }
      } catch (err) {
        console.log(err.message)
      }
    }

    m.prefix = config.prefix.find(p => m.body.startsWith(p)) || ''
    m.command = m.prefix ? m.body.slice(m.prefix.length).trim().split(' ')[0].toLowerCase() : ''
    m.args = m.prefix ? m.body.slice(m.prefix.length).trim().split(/ +/).slice(1) : m.body.trim().split(/ +/)
    if (m.args.length === 1 && m.args[0] === '') m.args = []
    m.text = m.args.join(' ').trim()
    m.isOwner = config.owner.includes(m.sender.split('@')[0]) || raw.key.fromMe

    if (m.isGroup && groupParticipants.length > 0) {
      try {
        const admins = []
        for (const p of groupParticipants) {
          if (p.admin) {
            if (p.id) admins.push(jidNormalizedUser(p.id))
            if (p.phoneNumber) admins.push(jidNormalizedUser(p.phoneNumber))
          }
        }

        const senderIds = [
          m.sender,
          raw.key.participant ? jidNormalizedUser(raw.key.participant) : null,
          raw.key.participantAlt ? jidNormalizedUser(raw.key.participantAlt) : null
        ].filter(Boolean)

        m.isAdmin = senderIds.some(id => admins.includes(id)) || m.isOwner

        const botIdNormalized = sock.user?.id ? jidNormalizedUser(sock.user.id) : ''
        const botNumberJid = config.botnumber ? `${config.botnumber}@s.whatsapp.net` : ''
        const botIds = [
          botIdNormalized,
          botIdNormalized.split('@')[0] + '@s.whatsapp.net',
          botIdNormalized.split('@')[0] + '@lid',
          botNumberJid
        ].filter(Boolean)

        m.isBotAdmin = botIds.some(id => admins.includes(id))
      } catch (err) {
        console.log('admin check error:', err.message)
      }
    }

    if (quotedMsg) {
      const _quotedRawContent = quotedMsg[quotedType] || {}

      const quotedKey = {
        remoteJid: m.chat,
        fromMe: quotedSender === jidNormalizedUser(sock.user.id),
        id: contextInfo.stanzaId,
        participant: quotedSender
      }

      const qm = {}

      qm.key = quotedKey
      qm.message = quotedMsg
      qm.id = m.id
      qm.timestamps = m.timestamps
      qm.chat = m.chat
      qm.isGroup = m.isGroup
      qm.sender = quotedSender
      qm.pushName = m.pushName
      qm.type = quotedType

      qm.body = quotedType === 'conversation' ? quotedMsg.conversation
        : quotedType === 'extendedTextMessage' ? quotedMsg.extendedTextMessage.text
        : quotedType === 'imageMessage' ? _quotedRawContent.caption
        : quotedType === 'videoMessage' ? _quotedRawContent.caption
        : ''

      if (typeof qm.body !== 'string') qm.body = ''
      qm.body = qm.body.trim()

      qm.mentions = quotedMentions

      qm.prefix = config.prefix.find(p => qm.body.startsWith(p)) || ''
      qm.command = qm.prefix ? qm.body.slice(qm.prefix.length).trim().split(' ')[0].toLowerCase() : ''
      qm.args = qm.prefix ? qm.body.slice(qm.prefix.length).trim().split(/ +/).slice(1) : qm.body.trim().split(/ +/)
      if (qm.args.length === 1 && qm.args[0] === '') qm.args = []
      qm.text = qm.args.join(' ').trim()

      qm.download = async () => {
        return await downloadMediaMessage(
          { key: quotedKey, message: quotedMsg },
          'buffer',
          {},
          { logger: console }
        )
      }

      qm.react = async (emoji) => {
        return sock.sendMessage(qm.chat, {
          react: {
            text: emoji,
            key: quotedKey
          }
        })
      }

      qm.reply = async (content, options = {}) => {
        if (typeof content === 'string') {
          return sock.sendMessage(qm.chat, { text: content, mentions: qm.mentions, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
        }
        if (Buffer.isBuffer(content)) {
          const type = await fileTypeFromBuffer(content)
          if (!type) {
            return sock.sendMessage(qm.chat, { document: content, mimetype: 'application/octet-stream', ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
          }
          if (type.mime.startsWith('image/')) {
            return sock.sendMessage(qm.chat, { image: content, mimetype: type.mime, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
          }
          if (type.mime.startsWith('video/')) {
            return sock.sendMessage(qm.chat, { video: content, mimetype: type.mime, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
          }
          if (type.mime.startsWith('audio/')) {
            return sock.sendMessage(qm.chat, { audio: content, mimetype: type.mime, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
          }
          return sock.sendMessage(qm.chat, { document: content, mimetype: type.mime, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
        }
        if (typeof content === 'object') {
          return sock.sendMessage(qm.chat, { ...content, ...options }, { quoted: { key: quotedKey, message: quotedMsg } })
        }
      }

      m.quoted = qm
    }
  }

  m.download = async () => {
    return await downloadMediaMessage(
      { key: m.key, message: m.message },
      'buffer',
      {},
      { logger: console }
    )
  }

  m.react = async (emoji) => {
    return sock.sendMessage(m.chat, {
      react: {
        text: emoji,
        key: m.key
      }
    })
  }

  m.reply = async (content, options = {}) => {
    if (typeof content === 'string') {
      return sock.sendMessage(m.chat, { text: content, mentions: m.mentions, ...options }, { quoted: raw })
    }
    if (Buffer.isBuffer(content)) {
      const type = await fileTypeFromBuffer(content)
      if (!type) {
        return sock.sendMessage(m.chat, { document: content, mimetype: 'application/octet-stream', ...options }, { quoted: raw })
      }
      if (type.mime.startsWith('image/')) {
        return sock.sendMessage(m.chat, { image: content, mimetype: type.mime, ...options }, { quoted: raw })
      }
      if (type.mime.startsWith('video/')) {
        return sock.sendMessage(m.chat, { video: content, mimetype: type.mime, ...options }, { quoted: raw })
      }
      if (type.mime.startsWith('audio/')) {
        return sock.sendMessage(m.chat, { audio: content, mimetype: type.mime, ...options }, { quoted: raw })
      }
      return sock.sendMessage(m.chat, { document: content, mimetype: type.mime, ...options }, { quoted: raw })
    }
    if (typeof content === 'object') {
      return sock.sendMessage(m.chat, { ...content, ...options }, { quoted: raw })
    }
  }

  return m
}
