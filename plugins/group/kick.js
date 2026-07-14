export const run = {
  cmd: ['kick'],
  category: 'group',
  settings: {
    admin: true,
    botAdmin: true,
    group: true
  },
  description: 'kick members from group',
  run: async (m, { sock, prefix, command, text }) => {
    let targets = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || m.mentionedJid || [];

    if (targets.length === 0 && m.quoted) {
      targets = [m.quoted.sender];
    }

    if (targets.length === 0 && text) {
      targets = text.split(' ')
        .map(n => n.replace(/\D/g, ''))
        .filter(n => n.length > 5)
        .map(n => n + '@s.whatsapp.net');
    }

    if (targets.length === 0) {
      return m.reply(Func.usage(prefix, command, '@someone'));
    }

    const result = await sock.groupParticipantsUpdate(m.chat, targets, 'remove');
    //m.reply(JSON.stringify(result, null, 2));
  }
}
