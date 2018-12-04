<template>
  <ul :class="{'main': mode === 'main', 'menu': mode === 'menu'}">
    <li v-for="(li, index) of list" :key="index" v-on="{ click: li.click }">
      <input type="text" v-model="room" v-if="li.type === 'input'" :placeholder="li.text">
      <input type="password" v-model="password" v-else-if="li.type === 'password'" :placeholder="li.text">
      <input type="password" v-model="passwordRepeat" v-else-if="li.type === 'passwordRepeat'" :placeholder="li.text">
      <span v-else-if="li.type === 'button'" class="button">{{ li.text }}</span>
      <span v-else-if="li.type === 'info'" class="info">{{ li.text }}</span>
      <span v-else class="error">{{ li.text }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'MainMenu',
  props: {
    mode: String
  },
  data () {
    return {
      list: [ ],
      defaultList: [ ],
      room: '',
      password: '',
      passwordRepeat: ''
    }
  },
  created () {
    if (this.$route.path === '/about') {
      this.defaultList = [
        { text: 'Settings', type: 'button', click: this.settings },
        { text: 'Go To Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom },
        { text: 'Main', type: 'button', click: this.main }
      ]
    } else if (this.$route.path === '/settings') {
      this.defaultList = [
        { text: 'About', type: 'button', click: this.about },
        { text: 'Go To Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom },
        { text: 'Main', type: 'button', click: this.main }
      ]
    } else {
      this.defaultList = [
        { text: 'Settings', type: 'button', click: this.settings },
        { text: 'Go To Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom },
        { text: 'About', type: 'button', click: this.about }
      ]
    }
    this.list = this.defaultList
  },
  methods: {
    settings () {
      this.$router.push('/settings')
    },
    toRoom () {
      this.list = [
        { text: 'Room ID', type: 'input', click: this.doNothing },
        { text: 'Password of Room', type: 'password', click: this.doNothing },
        { text: 'Visit', type: 'button', click: this.visit },
        { text: 'Back', type: 'button', click: this.back }
      ]
    },
    async visit () {
      try {
        if (!this.room || !this.password) {
          return
        }
        const response = await fetch(`http://localhost:3000/api/room/${this.room}?password=${this.password}`)
        const result = await response.json()
        if (result.id) {
          this.$store.commit('addRoom', { id: result.id, password: this.password })
          this.$router.push(`/chat/${result.id}`)
        } else {
          this.list = [
            { text: result.message, type: 'error', click: this.doNothing },
            { text: result.id, type: 'info', click: this.doNothing },
            { text: 'Try Again', type: 'button', click: this.toRoom },
            { text: 'Back', type: 'button', click: this.back }
          ]
        }
      } catch (e) {
        console.log(e)
      }
    },
    createRoom () {
      this.list = [
        { text: 'Password of Room', type: 'password', click: this.doNothing },
        { text: 'Confirm Password', type: 'passwordRepeat', click: this.doNothing },
        { text: 'Create', type: 'button', click: this.create },
        { text: 'Back', type: 'button', click: this.back }
      ]
    },
    async create () {
      try {
        if (!this.password || !this.passwordRepeat || this.password !== this.passwordRepeat) {
          return
        }
        const response = await fetch('http://localhost:3000/api/room/', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
          }),
          body: JSON.stringify({
            password: this.password
          })
        })
        const result = await response.json()
        if (result.id) {
          this.$store.commit('addRoom', { id: result.id, password: this.password })
          this.list = [
            { text: result.message, type: 'info', click: this.doNothing },
            { text: result.id, type: 'info', click: this.doNothing },
            { text: 'Go To Room', type: 'button', click: this.redirectToRoom.bind(this, result.id) },
            { text: 'Back', type: 'button', click: this.back }
          ]
        } else {
          this.list = [
            { text: result.message, type: 'error', click: this.doNothing },
            { text: result.id, type: 'info', click: this.doNothing },
            { text: 'Try Again', type: 'button', click: this.createRoom },
            { text: 'Back', type: 'button', click: this.back }
          ]
        }
      } catch (e) {
        console.log(e)
      }
    },
    redirectToRoom (id) {
      this.$router.push(`/chat/${id}`)
    },
    back () {
      this.list = this.defaultList
    },
    main () {
      this.$router.push('/')
    },
    about () {
      this.$router.push('/about')
    },
    doNothing () { }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
ul {
  display: flex;
  justify-content: space-around;
  list-style-type: none;
  padding: 0;
  &.main {
    height: calc(100vh - 32px);
    flex-direction: column;
    li {
      margin: 12px;
      padding: 24px;
      font-size: 32px;
      align-self: center;
      border-radius: 12px;
      border: outset 3px #00AA00;
      cursor: pointer;
      width: 80%;
      input {
        width: 100%;
        background: #000;
        font-size: 32px;
        border: none;
        color: lime;
        &:focus {
          outline: 0;
        }
      }
      .button {
        color: lime;
      }
      .info {
        color: #009900;
        cursor: text;
        overflow-wrap: break-word;
      }
      .error {
        color: #990000;
        cursor: text;
      }
      @media (min-width: 768px) {
        width: 65%;
      }
      @media (min-width: 992px) {
        width: 50%;
      }
    }
  }
  &.menu {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    li {
      margin: 6px;
      padding: 12px;
      font-size: 16px;
      border-bottom: outset 3px #009900;
      cursor: pointer;
      width: calc(50% - 36px);
      input {
        width: 100%;
        background: #000;
        font-size: 16px;
        border: none;
        color: lime;
        &:focus {
          outline: 0;
        }
      }
      .button {
         cursor: pointer;
         color: lime;
      }
      .info {
        color: #009900;
        cursor: text;
        overflow-wrap: break-word;
      }
      .error {
        color: #990000;
        cursor: text;
      }
      @media (min-width: 768px) {
        width: calc(25% - 36px);
      }
    }
  }
}
</style>
