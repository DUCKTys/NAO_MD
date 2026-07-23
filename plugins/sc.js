export const run = {
  cmd: ['sc'],
  category: 'info',
  description: 'share repository github',

  run: async (m, { sock }) => {
    const repo = 'https://github.com/DUCKTys/NAO_MD'

    await sock.sendMessage(
      m.chat,
      {
        image: {
          url: 'https://opengraph.githubassets.com/1/DUCKTys/NAO_MD'
        },
        caption: `*NAO MD Repository*

🔗 ${repo}

⭐ Jangan lupa support dengan memberikan star pada repository.`
      },
      { quoted: m }
    )
  }
}