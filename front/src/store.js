import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options: {
      username: '',
      storage: '',
      lifeDays: 0
    }
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
    }
  },
  actions: {

  }
})
