import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import crypto from 'diffie-hellman'
import aesjs from 'aes-js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options: {
      username: '',
      storage: '',
      lifeDays: 0
    },
    rooms: [],
    key: '',
    wskey: ''
  },
  getters: {
    getUsername (state) {
      if (!state.options.username) {
        state.options.username = window.localStorage.getItem('username') ? window.localStorage.getItem('username') : ''
      }
      return state.options.username
    },
    getStorage (state) {
      if (!state.options.storage) {
        state.options.storage = window.localStorage.getItem('storage') ? window.localStorage.getItem('storage') : ''
      }
      return state.options.storage
    },
    getLife (state) {
      if (!state.options.lifeDays) {
        state.options.lifeDays = window.localStorage.getItem('lifeDays') ? +window.localStorage.getItem('lifeDays') : 0
      }
      if (state.options.lifeDays < 7) {
        return 'Day'
      }
      if (state.options.lifeDays < 30) {
        return 'Week'
      }
      if (state.options.lifeDays < 355) {
        return 'Month'
      }
      if (state.options.lifeDays < 1000) {
        return 'Year'
      }
      return 'Forever'
    },
    getKey (state) {
      return state.key
    }
  },
  mutations: {
    saveUsername (state, username) {
      state.options.username = username
      window.localStorage.setItem('username', username)
    },
    saveStorage (state, storage) {
      state.options.storage = storage
      window.localStorage.setItem('storage', storage)
    },
    saveLife (state, life) {
      switch (life) {
        case 'Day':
          state.options.lifeDays = 1
          break
        case 'Week':
          state.options.lifeDays = 7
          break
        case 'Month':
          state.options.lifeDays = 30
          break
        case 'Year':
          state.options.lifeDays = 355
          break
        default:
          state.options.lifeDays = 5000
          break
      }
      window.localStorage.setItem('lifeDays', state.options.lifeDays)
    }
  },
  actions: {
    async getRoom (context, id) {
      let room = _.find(context.state.rooms, { id })
      if (!room) {
        room = JSON.parse(window.localStorage.getItem(`room-${id}`))
        if (room) {
          room.id = id
          context.dispatch('addRoom', room)
        } else {
          const response = await fetch(`http://localhost:3000/api/room/visit/${id}`)
          const result = await response.json()
          if (result.id) {
            room = {
              id: result.id,
              store: result.store,
              messages: []
            }
            if (result.messages) {
              room.messages = result.messages
            }
            context.dispatch('addRoom', room)
          }
        }
      }
      return room
    },
    addRoom (context, { id, store = 'app', messages = [] }) {
      if (!id) {
        return
      }
      if (!_.find(context.state.rooms, { id })) {
        context.state.rooms.push({ id, store, messages })
      }
      if (store !== 'app' && !window.localStorage.getItem(`room-${id}`)) {
        window.localStorage.setItem(`room-${id}`, JSON.stringify({
          store,
          messages
        }))
      }
    },
    async addMessage (context, { id, message }) {
      const room = await context.dispatch('getRoom', id)
      if (!room.messages) {
        room.messages = []
      }
      let messagesFromLocalStorage = window.localStorage.getItem(`room-${id}`)
      if (messagesFromLocalStorage) {
        messagesFromLocalStorage = JSON.parse(messagesFromLocalStorage)
        messagesFromLocalStorage.messages.push(message)
        window.localStorage.setItem(`room-${id}`, JSON.stringify(messagesFromLocalStorage))
      }
      room.messages.push(message)
    },
    async getStoreOfRoom (context, id) {
      let room = await context.dispatch('getRoom', id)
      if (!room) {
        room = window.localStorage.getItem(`room-${id}`)
      }
      return room.store ? room.store : 'app'
    },
    async getMessages (context, id) {
      const room = await context.dispatch('getRoom', id)
      if (!room) {
        return []
      }
      if (room.messages && room.messages.length) {
        return room.messages
      }
      if (!room.password) {
        return []
      }
      const response = await fetch(`http://localhost:3000/api/messages/${room.id}?from=0&to=50`)
      const result = await response.json()
      room.messages = result.messages
      return room.messages ? room.messages : []
    },
    async generateKey (context) {
      const alice = crypto.createDiffieHellman(256)
      alice.generateKeys()
      const response = await fetch(`http://localhost:3000/api/key/generate?key=${alice.getPublicKey('hex')}&prime=${alice.getPrime('hex')}&generator=${alice.getGenerator('hex')}`)
      const result = await response.json()
      if (result.bobKey) {
        const bobKey = new Uint8Array(Math.ceil(result.bobKey.length / 2))
        for (let i = 0; i < bobKey.length; i++) bobKey[i] = parseInt(result.bobKey.substr(i * 2, 2), 16)
        const secret = alice.computeSecret(bobKey)
        context.state.key = secret
      }
    },
    async encrypt (context, { text, key = context.state.key }) {
      if (!key) {
        return ''
      }
      const textBytes = aesjs.utils.utf8.toBytes(text)
      const aesCtr = new aesjs.ModeOfOperation.ctr(key)
      const encryptedBytes = aesCtr.encrypt(textBytes)
      const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes)
      return encryptedHex
    },
    async decrypt (context, { text, key = context.state.key }) {
      if (!key) {
        return ''
      }
      const encryptedBytes = aesjs.utils.hex.toBytes(text)
      const aesCtr = new aesjs.ModeOfOperation.ctr(key)
      const decryptedBytes = aesCtr.decrypt(encryptedBytes)
      const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)
      return decryptedText
    }
  }
})
