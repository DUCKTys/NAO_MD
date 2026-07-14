import 'dotenv/config'

export default {
  pairing: {
    state: true,
    number: process.env.BOT,
    code: 'DUCKTYS0',
    browser: ['Mac OS', 'Safari', '14.0.0'],
    auth: 'session'
  },

  owner: process.env.OWNER
    ? process.env.OWNER.split(',')
    : [],

  prefix: ['.', '?', '!', '/'],

  sticker: {
    packname: 'NAO_MD',
    author: '087815632486'
  },

  emoji: '🍃', // for reaction waiting
  msg: {
    wait: '[ + ] Executing command...',
    owner: '[ ! ] Access denied. Owner only.',
    premium: '[ ! ] Premium access required.',
    group: '[ ! ] This feature is only available in groups.',
    admin: '[ ! ] Admin privileges required.',
    botAdmin: '[ ! ] Bot needs admin privileges.',
    private: '[ ! ] This feature is only available in private chat.',
    error: '[ x ] An unexpected error occurred.'
  },

  api: {
    baseUrl: {
      zeline: 'https://api.zeline.eu.cc'
    },
    key: {
      gemini: process.env.GEMINI_KEY,
      zeline: 'free'
    }
  },

  database: {
    url: process.env.DATABASE_URL,
    files: 'localdb' // local db name file
  },
  
  tz: 'Asia/Jakarta'
}
