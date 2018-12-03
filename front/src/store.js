import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: ''
  },
  getters: {
    getUsername (context) {
      if (!context.username) {
        context.username = window.localStorage.getItem('username') ? window.localStorage.getItem('username') : ''
      }
      return context.username
    }
  },
  mutations: {
    saveUsername (context, username) {
      context.username = username
      window.localStorage.setItem('username', username)
    }
  },
  actions: {

  }
})
