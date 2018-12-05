<template>
  <div>
    <MainMenu mode="menu"/>
    <div class="room-head">
      <div class="head-label">Chat ID:&nbsp;</div>
      <div class="head-data">{{room.id }}</div>
      <div class="head-label">Connected IP:&nbsp;</div>
      <div class="head-data"
           :class="{ 'non-stable-ips': stableIPs === false, 'very-stable-ips': stableIPs === true }">
        {{connected}}
      </div>
    </div>
    <div class="current-message">
      <label for="message" >{{ username + ' >'}}</label>
      <input type="text" id="message" v-model="message" @keypress.enter="sendMessage">
    </div>
    <div v-for="(message, index) of messages" :key="index" class="old-messages">
      <div class="message-from">{{ message.from + ' >'}}</div>
      <div class="message-text">{{ message.text }}</div>
      <div class="message-date">{{ message.date }}</div>
    </div>
  </div>
</template>

<script>
import MainMenu from '../components/MainMenu'

export default {
  name: 'chat',
  components: {
    MainMenu
  },
  data () {
    return {
      username: '',
      message: '',
      room: {
        id: '',
        password: ''
      },
      connected: 0,
      stableIPs: null,
      messages: [ ],
      ws: null
    }
  },
  async created () {
    this.username = this.$store.getters.getUsername
    this.room.id = this.$route.params.id
    let verifiedRoom = await this.$store.dispatch('getRoom', this.room.id)
    if (!verifiedRoom) {
      const password = window.prompt(`Input password of ${this.room.id} room`, '')
      if (!password) {
        this.$router.push('/')
      }
      const response = await fetch(`http://localhost:3000/api/room/${this.room.id}?password=${password}`)
      const result = await response.json()
      if (result.id) {
        this.$store.commit('addRoom', { id: result.id, password })
        this.room = { id: result.id, password: this.password }
      } else {
        this.$router.push('/')
      }
    }
    this.messages = await this.$store.dispatch('getMessages', this.room.id)
    this.ws = new WebSocket('ws://localhost:40510')
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        action: 'connect',
        room: this.room.id
      }))
    }
    this.ws.onmessage = res => {
      res = JSON.parse(res.data)
      if (res.action === 'message') {
        this.messages.push({
          from: res.from,
          text: res.text,
          date: res.date
        })
        this.stableIPs = null
      } else if (res.action === 'new_user') {
        this.stableIPs = false
      } else if (res.action === 'removed_user') {
        this.stableIPs = true
      }
      this.connected = res.connected
    }
    window.onunload = () => {
      this.ws.close(1000, JSON.stringify({ room: this.room.id }))
      this.ws = null
    }
  },
  destroyed () {
    this.ws.close(1000, JSON.stringify({ room: this.room.id }))
    this.ws = null
  },
  methods: {
    async sendMessage () {
      this.ws.send(JSON.stringify({
        action: 'no_save',
        room: this.room.id,
        from: this.username,
        text: this.message
      }))
      this.message = ''
    }
  }
}
</script>

<style scoped lang="scss">
.room-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  .head-label {
    text-align: right;
  }
  .head-data {
    text-align: left;
  }
  .non-stable-ips {
    color: red;
  }
  .very-stable-ips {
    color: blue;
  }
}
.current-message {
  display: grid;
  grid-auto-columns: auto;
  input {
    background: #000;
    font-size: 16px;
    border: none;
    border-bottom: 2px solid #009900;
    color: lime;
    grid-column: 2 / 6;
    @media (min-width: 768px) {
      grid-column: 2 / 8;
    }
    @media (min-width: 992px) {
      grid-column: 2 / 10;
    }
    &:focus {
      outline: 0;
    }
  }
}
.old-messages {
  display: grid;
  grid-auto-columns: auto;
  grid-template-columns: 1fr 2fr 1fr;
  margin: 12px 0;
  text-align: left;
  grid-gap: 4px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 4fr 1fr;
  }
  @media (min-width: 992px) {
    grid-template-columns: 1fr 6fr 1fr;
  }
  .message-text {
    text-align: justify;
  }
  .message-date {
    text-align: right;
  }
}
</style>
