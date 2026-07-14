export const run = {
  cmd: ['add'],
  category: 'group',
  settings: {
    admin: true,
    group: true
  },
  description: 'add members to group',
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

    const result = await sock.groupParticipantsUpdate(m.chat, targets, 'add');
    // m.reply(JSON.stringify(result, null, 2));
  }
}
