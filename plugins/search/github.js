import axios from 'axios'

db.event ??= {}
db.event.githubSearch ??= {}

export const run = {
  cmd: ['githubsearch'],
  hidden: ['ghs'],
  category: 'search',
  description: 'search github repositories',
  run: async (m, { text, command, prefix }) => {
    try {
      if (!text) {
        return m.reply(Func.usage(prefix, command, 'whatsapp bot'))
      }

      const { data } = await axios.get(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=10`
      )

      if (!data.items?.length) {
        return m.reply('no repositories found')
      }

      let caption = `#> GitHub Search\n`
      caption += `- query : ${text}\n`
      caption += `- result : ${data.items.length}\n\n`
      caption += `#> Result Metadata\n`

      data.items.forEach((repo, i) => {
        caption += `${i + 1}.\n`
        caption += `- repository : ${repo.full_name}\n`
        caption += `- author : ${repo.owner.login}\n`
        caption += `- stars : ${Func.h2k(repo.stargazers_count || 0)}\n`
        caption += `- forks : ${Func.h2k(repo.forks_count || 0)}\n\n`
      })

      caption += `reply with a number between 1-${data.items.length} to download.\n`
      caption += `expires in 1 minute.`

      const msg = await m.reply(caption.trim())

      db.event.githubSearch[m.sender] = {
        repos: data.items,
        expired: Date.now() + 60000,
        messageId: msg.key.id
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
