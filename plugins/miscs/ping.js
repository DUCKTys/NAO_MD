import os from 'os'

export const run = {
  cmd: ['ping'],
  hidden: ['p'],
  category: 'miscs',
  description: 'show server status',
  run: async (m, { sock }) => {

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1)

    const cap = `\`Server Information\`
* Running On : ${process.env.USER === "root" ? "VPS" : "HOSTING (PANEL)"}
* Cwd : ${process.cwd()}
* Hostname : ${os.hostname()}
* Node Version : ${process.version}

\`Management Server\`
* Bot Speed : ${Date.now() - m.timestamps} ms
* Uptime Bot : ${Func.toDate(process.uptime())}
* Uptime Server : ${Func.toDate(os.uptime())}
* Memory : ${Func.size(usedMem)} / ${Func.size(totalMem)} (${memPercent}%)
* CPU : ${os.cpus()[0].model} ( ${os.cpus().length} CORE )
* Release : ${os.release()}
* Type : ${os.type()}
* Arch : ${os.arch()}`

    await m.reply(cap)
  }
}
