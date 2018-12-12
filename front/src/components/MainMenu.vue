<template>
  <ul :class="{'main': mode === 'main', 'menu': mode === 'menu'}">
    <li v-for="(li, index) of list" :key="index" v-on="{ click: li.click }">
      <input v-if="li.type === 'input'" type="text" v-model="room" :placeholder="li.text">
      <input v-else-if="li.type === 'password'" type="password" v-model="password" :placeholder="li.text">
      <input v-else-if="li.type === 'passwordRepeat'" type="password" v-model="passwordRepeat" :placeholder="li.text">
      <select v-else-if="li.type === 'select'" v-model="room">
        <option v-for="(room, index) of visitedRooms" :key="index" >{{ room }}</option>
      </select>
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
      passwordRepeat: '',
      visitedRooms: [ ]
    }
  },
  async created () {
    if (this.$route.path === '/about') {
      this.defaultList = [
        { text: 'Choose Visited Room', type: 'button', click: this.chooseRoom },
        { text: 'Go To Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom },
        { text: 'Settings', type: 'button', click: this.settings }
      ]
    } else if (this.$route.path === '/settings') {
      this.defaultList = [
        { text: 'Choose Visited Room', type: 'button', click: this.chooseRoom },
        { text: 'Go To Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom },
        { text: 'Main', type: 'button', click: this.main }
      ]
    } else {
      this.defaultList = [
        { text: 'Settings', type: 'button', click: this.settings },
        { text: 'Choose Visited Room', type: 'button', click: this.chooseRoom },
        { text: 'Open Unvisited Room', type: 'button', click: this.toRoom },
        { text: 'Create New Room', type: 'button', click: this.createRoom }
      ]
    }
    this.list = this.defaultList
  },
  methods: {
    settings () {
      this.$router.push('/settings')
    },
    async chooseRoom () {
      this.list = [
        { text: 'Your Rooms: ', type: 'info', click: this.doNothing },
        { text: '', type: 'select', click: this.doNothing },
        { text: 'Choose', type: 'button', click: this.choose },
        { text: 'Back', type: 'button', click: this.back }
      ]
      const response = await fetch('http://localhost:3000/api/room/opened')
      this.visitedRooms = await response.json()
    },
    choose () {
      if (this.room) {
        this.$router.push(`/chat/${this.room}`)
      }
    },
    toRoom () {
      this.list = [
        { text: 'Room ID', type: 'input', click: this.doNothing },
        { text: 'Password of Room', type: 'password', click: this.doNothing },
        { text: 'Visit', type: 'button', click: this.open },
        { text: 'Back', type: 'button', click: this.back }
      ]
    },
    async open () {
      try {
        if (!this.room || !this.password) {
          return
        }
        if (!this.$store.getters.getKey) {
          await this.$store.dispatch('generateKey')
        }
        const password = await this.$store.dispatch('encrypt', { text: this.password })
        const response = await fetch(`http://localhost:3000/api/room/open/${this.room}`, {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
          }),
          body: JSON.stringify({
            password
          })
        })
        const result = await response.json()
        if (result.id) {
          this.$store.dispatch('addRoom', { id: result.id, store: result.store })
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
        let store = this.$store.getters.getStorage
        if (!store) {
          store = 'app'
        }
        if (!this.$store.getters.getKey) {
          await this.$store.dispatch('generateKey')
        }
        const password = await this.$store.dispatch('encrypt', { text: this.password })
        const response = await fetch('http://localhost:3000/api/room/create', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/json; charset=utf-8'
          }),
          body: JSON.stringify({
            password,
            store
          })
        })
        const result = await response.json()
        if (result.id) {
          this.$store.dispatch('addRoom', { id: result.id, password: this.password, store: result.store })
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
      select {
        background: #000;
        color: lime;
        border: none;
        font-size: 18px;
        padding-bottom: 3px;
        &:focus {
          outline: 0;
          border-bottom: outset 3px #009900;
          padding-bottom: 0;
          transition: border-bottom 200ms, padding-bottom 200ms;
        }
        option {
          &:focus {
            outline: 0;
          }
        }
        @media (min-width: 768px) {
          font-size: 24px;
        }
        @media (min-width: 992px) {
          font-size: 32px;
        }
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
      select {
        background: #000;
        color: lime;
        border: none;
        font-size: 10px;
        padding-bottom: 3px;
        &:focus {
          outline: 0;
          border-bottom: outset 3px #009900;
          padding-bottom: 0;
          transition: border-bottom 200ms, padding-bottom 200ms;
        }
        option {
          &:focus {
            outline: 0;
          }
        }
        @media (min-width: 992px) {
          font-size: 14px;
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
