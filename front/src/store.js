import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options: {
      username: '',
      storage: '',
      lifeDays: 0
    },
    rooms: [ ]
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
    },
    addRoom (state, { id, password, store = 'app' }) {
      if (!id || !password) {
        return
      }
      if (_.find(state.rooms, { id })) {
        return
      }
      if (store !== 'app') {
        window.localStorage.setItem(`room-${id}`, JSON.stringify([]))
      }
      state.rooms.push({ id, password })
    },
    addMessage (state, { id, message }) {
      const room = _.find(state.rooms, { id })
      if (!room.messages) {
        room.messages = []
      }
      let messagesFromLocalStorage = window.localStorage.getItem(`room-${id}`);
      if (messagesFromLocalStorage) {
        messagesFromLocalStorage = JSON.parse(messagesFromLocalStorage)
        messagesFromLocalStorage.push(message)
        window.localStorage.setItem(`room-${id}`, JSON.stringify(messagesFromLocalStorage))
      }
      room.messages.push(message)
    }
  },
  actions: {
    getRoom (context, id) {
      return _.find(context.state.rooms, { id })
    },
    async getMessages (context, id) {
      const room = _.find(context.state.rooms, { id })
      if (!room || !room.password) {
        return
      }
      if (room.messages && room.messages.length) {
        return room.messages
      }
      if (window.localStorage.getItem(`room-${id}`)) {
        return JSON.parse(window.localStorage.getItem(`room-${id}`))
      }
      const response = await fetch(`http://localhost:3000/api/messages/${room.id}?password=${room.password}&from=0&to=10`)
      const result = await response.json()
      room.messages = result.messages
      return room.messages
    }
  }
})
