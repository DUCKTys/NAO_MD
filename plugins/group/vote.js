export const run = {
  cmd: ['vote'],
  category: 'group',
  description: 'create group poll',
  settings: {
    group: true
  },
  run: async (m, { sock, prefix, command, text }) => {
    if (!text) {
      return m.reply(
        Func.usage(prefix, command, 'makan apa?, nasgor goreng, mi ayam, bakso')
      );
    }

    const args = text.split(',').map(v => v.trim()).filter(Boolean);

    if (args.length < 3) {
      return m.reply(
        Func.usage(prefix, command, 'makan apa?, nasgor goreng, mi ayam, bakso')
      );
    }

    const [name, ...options] = args;

    await sock.sendMessage(m.chat, {
      poll: {
        name,
        values: options,
        selectableCount: 1
      }
    })
  }
}
