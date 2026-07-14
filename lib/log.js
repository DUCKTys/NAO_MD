import chalk from 'chalk'
import moment from 'moment-timezone'

export const logger = (m) => {
  const time = moment().tz(config.tz).format('HH:mm:ss')

  const scope = m.isGroup ? chalk.blue('◆ GROUP') : chalk.yellow('◆ PRIVATE')
  const user = chalk.cyan(m.sender.split('@')[0])
  const tag = m.command
    ? chalk.greenBright(m.prefix + m.command)
    : chalk.gray('msg')

  const text = chalk.white(m.body || '')

  console.log(
    chalk.gray(time),
    scope,
    user,
    '›',
    tag,
    '—',
    text
  )
}
