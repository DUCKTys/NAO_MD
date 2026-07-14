db.event ??= {}
db.event.githubSearch ??= {}

export const run = {
  event: async (m, { sock }) => {
    if (!m.text || !m.quoted) return false

    const session = db.event.githubSearch?.[m.sender]
    if (!session) return false

    if (Date.now() > session.expired) {
      delete db.event.githubSearch[m.sender]
      return false
    }

    if (m.quoted.key.id !== session.messageId) return false

    if (!/^(10|[1-9])$/.test(m.text.trim())) return false

    const repo = session.repos[Number(m.text.trim()) - 1]
    if (!repo) return false

    const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`

    let caption = `#> GitHub Download\n`
    caption += `- repository : ${repo.full_name}\n`
    caption += `- author : ${repo.owner.login}\n`
    caption += `- stars : ${repo.stargazers_count.toLocaleString()}\n`
    caption += `- forks : ${repo.forks_count.toLocaleString()}\n`
    caption += `- url : ${repo.html_url}\n`
    caption += `- description : ${repo.description || '-'}`

    await sock.sendMessage(
      m.chat,
      {
        document: {
          url: zipUrl
        },
        mimetype: 'application/zip',
        fileName: `${repo.name}.zip`,
        caption
      },
      {
        quoted: m
      }
    )

    delete db.event.githubSearch[m.sender]

    return true
  }
}
