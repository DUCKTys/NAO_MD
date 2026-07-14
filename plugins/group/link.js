export const run = {
    cmd: ['linkgc'],
    hidden: ['getlink'],
    category: 'group',
    settings: {
        group: true,
        botAdmin: true
    },
    description: 'get this group invite link',
    run: async (m, { sock }) => {
        m.reply(`https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`)
    }
}
