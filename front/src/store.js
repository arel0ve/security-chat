import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    options: {
      username: '',
      storage: ''
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
    }
  },
  actions: {

  }
})
