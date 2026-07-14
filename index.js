import * as Func from './lib/function.js'
globalThis.Func = Func
global.Func = Func

import configData from './config.js'
globalThis.config = configData
global.config = configData

import { db } from './lib/schema.js'
globalThis.db = db
global.db = db

import * as uploader from './lib/uploader.js'
globalThis.uploader = uploader
global.uploader = uploader

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from 'baileys'
import pino from 'pino'
import chalk from 'chalk'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import qrcode from 'qrcode-terminal'
import { handler } from './handler.js'
import { bindSocket } from './lib/baileys.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plugins = new Map()
globalThis.plugins = plugins

// Fungsi memuat seluruh plugin di awal startup
const loadPlugins = async (dir) => {
  const files = await fs.readdir(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) {
      await loadPlugins(fullPath)
    } else if (file.endsWith('.js')) {
      try {
        const moduleUrl = `${pathToFileURL(fullPath).href}?update=${Date.now()}`
        const module = await import(moduleUrl)
        
        // Mendukung format default export maupun penamaan run bawaan bot
        const activePlugin = module.run || module.default?.run || module.default
        if (activePlugin) {
          plugins.set(fullPath, activePlugin)
        }
      } catch (err) {
        console.error(chalk.red.bold(`[ ERROR ] Gagal meload plugin: ${fullPath}\n${err}`))
      }
    }
  }
}

// Fitur Pemantau Auto Reload (Hot Reload) dengan Deteksi Detail Error
const watchPlugins = () => {
  const watcher = chokidar.watch(path.join(__dirname, 'plugins'), { ignored: /^\./, persistent: true })
  
  watcher
    .on('add', async (filePath) => {
      if (filePath.endsWith('.js')) {
        setTimeout(async () => {
          try {
            const moduleUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`
            const module = await import(moduleUrl)
            const activePlugin = module.run || module.default?.run || module.default
            if (activePlugin) {
              plugins.set(filePath, activePlugin)
              console.log(chalk.green.bold(`[ AUTORELOAD - SUCCESS ] Plugin baru ditambahkan: ${path.basename(filePath)}`))
            }
          } catch (e) {
            console.log(chalk.red.bold(`\n[ AUTORELOAD - ERROR ] ❌ Gagal memuat plugin baru: ${path.basename(filePath)}`))
            console.log(chalk.red(e.stack || e.message) + '\n')
          }
        }, 500)
      }
    })
    .on('change', async (filePath) => {
      if (filePath.endsWith('.js')) {
        setTimeout(async () => {
          try {
            const moduleUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`
            const module = await import(moduleUrl)
            const activePlugin = module.run || module.default?.run || module.default
            if (activePlugin) {
              plugins.set(filePath, activePlugin)
              console.log(chalk.yellow.bold(`[ AUTORELOAD - SUCCESS ] Berhasil memperbarui file: ${path.basename(filePath)}`))
            }
          } catch (e) {
            console.log(chalk.red.bold(`\n[ AUTORELOAD - ERROR ] ❌ Terdeteksi codingan error pada file: ${path.basename(filePath)}`))
            console.log(chalk.red(e.stack || e.message) + '\n')
            console.log(chalk.blue.bold(`[ INFO ] Bot tetap berjalan menggunakan versi terakhir yang sukses (sebelum di-save). Silakan perbaiki error di atas.`))
          }
        }, 500)
      }
    })
    .on('unlink', (filePath) => {
      if (plugins.has(filePath)) {
        plugins.delete(filePath)
        console.log(chalk.red.bold(`[ AUTORELOAD ] File dihapus dari memory: ${path.basename(filePath)}`))
      }
    })
}

const startBot = async () => {
  await loadPlugins(path.join(__dirname, 'plugins'))
  watchPlugins()
  console.log(chalk.cyan.bold(`[ INFO ] Berhasil memuat ${plugins.size} plugin.`))
  const { state, saveCreds } = await useMultiFileAuthState(config.pairing.auth)
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: config.pairing.browser,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false
  })
  bindSocket(sock)
  if (!sock.authState.creds.registered && config.pairing.state) {
    const phoneNumber = config.pairing.number.toString()
    setTimeout(async () => {
      const code = await sock.requestPairingCode(phoneNumber, config.pairing.code)
      console.log(chalk.greenBright.bold(`[ ! ] Pairing Code : ${code.match(/.{1,4}/g)?.join('-')}`))
    }, 3000)
  }
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr && !config.pairing.state) {
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        startBot()
      } else {
        fs.removeSync(config.pairing.auth)
        startBot()
      }
    } else if (connection === 'open') {
      console.log(chalk.green.bold('Bot is ready to work!'))
    }
  })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    await handler(sock, messages[0])
  })
  sock.ev.on('group-participants.update', async (update) => {
    await handler(sock, update)
  })
}

process.on('uncaughtException', () => {})
process.on('unhandledRejection', () => {})

startBot()