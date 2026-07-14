export const run = {
  cmd: ['currency'],
  hidden: ['cc', 'convert', 'kurs'],
  category: 'tools',
  description: 'convert currency rate',
  run: async (m, { sock, text, prefix, command }) => {
    try {
      if (!text) {
        return m.reply(Func.usage(prefix, command, '1 usd to idr'))
      }

      let amount, from, to

      const regex1 = /([0-9.]+)\s*([A-Za-z]{3})\s*(?:to)?\s*([A-Za-z]{3})/i
      const regex2 = /([A-Za-z]{3})\s*([A-Za-z]{3})\s*([0-9.]+)/i

      let match = text.match(regex1)

      if (match) {
        amount = parseFloat(match[1])
        from = match[2].toUpperCase()
        to = match[3].toUpperCase()
      } else {
        match = text.match(regex2)
        if (match) {
          from = match[1].toUpperCase()
          to = match[2].toUpperCase()
          amount = parseFloat(match[3])
        }
      }

      if (!amount || !from || !to) {
        return m.reply("Format salah. Contoh: USD IDR 10 atau 10 USD to IDR")
      }

      const res = await axios.get(`https://open.er-api.com/v6/latest/${from}`)
      const rate = res.data?.rates?.[to]

      if (!rate) {
        return m.reply("Kode mata uang tidak ditemukan.")
      }

      const result = amount * rate

      return m.reply(
`💱 Currency Converter
${amount} ${from} = ${result.toFixed(2)} ${to}`
      )

    } catch (err) {
      console.error(err.message)
      throw err
    }
  }
}
