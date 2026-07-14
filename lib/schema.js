import { JSONFilePreset } from 'lowdb/node'
import mongoose from 'mongoose'
import util from 'util'
import { models } from './models.js'
import config from '../config.js'

const RAW = Symbol('RAW')
let data
let isMongo = false
let localDbInstance
let DatabaseModel

if (config.database.url) {
  isMongo = true
  await mongoose.connect(config.database.url)

  const dbSchema = new mongoose.Schema({
    users: { type: Object, default: {} },
    groups: { type: Object, default: {} },
    settings: { type: Object, default: {} },
    plugins: { type: Object, default: {} }
  }, {
    minimize: false,
    strict: false
  })

  DatabaseModel = mongoose.models.Database || mongoose.model('Database', dbSchema)

  let doc = await DatabaseModel.findOne()
  if (!doc) {
    doc = await DatabaseModel.create({ users: {}, groups: {}, settings: {}, plugins: {} })
  }

  data = doc.toObject()
} else {
  localDbInstance = await JSONFilePreset(`${config.database.files}.json`, {
    users: {},
    groups: {},
    settings: {},
    plugins: {}
  })
  data = localDbInstance.data
}

const writeDB = () => {
  if (isMongo) {
    DatabaseModel.updateOne({}, {
      $set: {
        users: data.users,
        groups: data.groups,
        settings: data.settings,
        plugins: data.plugins
      }
    }).exec()
  } else {
    localDbInstance.write()
  }
}

const createProxy = (targetObj) => {
  const handler = {
    get(target, prop) {
      if (prop === RAW) return target
      const value = target[prop]
      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, handler)
      }
      return value
    },
    set(target, prop, value) {
      target[prop] = value
      writeDB()
      return true
    },
    deleteProperty(target, prop) {
      delete target[prop]
      writeDB()
      return true
    }
  }
  return new Proxy(targetObj, handler)
}

export const db = {
  users: createProxy(data.users),
  groups: createProxy(data.groups),
  settings: createProxy(data.settings),
  plugins: createProxy(data.plugins),

  init: async function (m) {
    if (m.sender && m.sender.endsWith('@s.whatsapp.net')) {
      if (!this.users[m.sender]) {
        this.users[m.sender] = { ...models.users, name: m.pushName, totalChat: 1 }
      } else {
        if (this.users[m.sender].name !== m.pushName) {
          this.users[m.sender].name = m.pushName
        }

        this.users[m.sender].totalChat = (this.users[m.sender].totalChat || 0) + 1

        Object.keys(models.users).forEach(key => {
          if (typeof this.users[m.sender][key] === 'undefined') {
            this.users[m.sender][key] = models.users[key]
          }
        })
      }
    }

    if (m.isGroup) {
      if (!this.groups[m.chat]) {
        this.groups[m.chat] = { ...models.groups }
      } else {
        Object.keys(models.groups).forEach(key => {
          if (typeof this.groups[m.chat][key] === 'undefined') {
            this.groups[m.chat][key] = models.groups[key]
          }
        })
      }
    }

    Object.keys(models.settings).forEach(key => {
      if (typeof this.settings[key] === 'undefined') {
        this.settings[key] = models.settings[key]
      }
    })
  },

  [util.inspect.custom]() {
    return {
      users: this.users[RAW],
      groups: this.groups[RAW],
      settings: this.settings[RAW],
      plugins: this.plugins[RAW]
    }
  }
}
