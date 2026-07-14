export const run = {
  cmd: ['wame'],
  category: 'group',
  description: 'create your whatsapp link',
  settings: {
    group: true
  },
  run: async (m, {
    text
  }) => {
    const number = (m.quoted ? m.quoted.sender : m.sender).split('@')[0];
    const chat = text || 'hai';
    m.reply(`https://wa.me/${number}?text=${encodeURIComponent(chat)}`);
  }
}
