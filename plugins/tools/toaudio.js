import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

export const run = {
  cmd: ['toaudio'],
  hidden: ['tomp3'],
  category: 'tools',
  description: 'convert video to audio',
  run: async (m, { prefix, command }) => {
    if (
      !(
        m.type === 'videoMessage' ||
        (m.quoted && m.quoted.type === 'videoMessage')
      )
    ) {
      return m.reply(Func.usage(prefix, command, '(reply / send video)'))
    }

    m.react(config.emoji)

    try {
      const media = m.quoted && m.quoted.type === 'videoMessage' ? m.quoted : m
      const buffer = await media.download()
      
      const tmpVid = path.join(process.cwd(), '.tmp', `tmp_${Date.now()}.mp4`)
      const tmpAud = path.join(process.cwd(), '.tmp', `tmp_${Date.now()}.mp3`)
      
      fs.writeFileSync(tmpVid, buffer)
      
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tmpVid} -vn -b:a 128k ${tmpAud}`, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      
      const audioBuffer = fs.readFileSync(tmpAud)
      
      await m.reply({
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
      })
      
      fs.unlinkSync(tmpVid)
      fs.unlinkSync(tmpAud)
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}
