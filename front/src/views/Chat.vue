<template>
  <div>
    <MainMenu mode="menu"/>
    <div class="room-head">
      <div class="head-label">Chat ID:</div>
      <div class="head-data">{{room.id }}</div>
      <div class="head-label pseudo-link" @click="toggleIPs">Connected IP:</div>
      <div class="head-data pseudo-link" @click="toggleIPs"
           :class="{ 'non-stable-ips': stableIPs === false, 'very-stable-ips': stableIPs === true }">
        {{connected}}
      </div>
    </div>
    <div v-if="showIPs">
      <div v-for="(IP, index) of IPs" :key="index" class="connected-ips">
        <div class="connected-username">{{ IP.username + ':' }}</div>
        <div class="connected-ip">{{ IP.IP }}</div>
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
import crypto from 'diffie-hellman'

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
        password: '',
        store: 'app'
      },
      connected: 0,
      stableIPs: null,
      IPs: [],
      showIPs: false,
      messages: [ ],
      ws: null,
      secret: ''
    }
  },
  watch: {
    $route: async function (newRoute, oldRoute) {
      if (this.ws) {
        this.ws.close(1000, JSON.stringify({ room: this.room.id }))
        this.ws = null
      }
      await this.createComponent(newRoute.params.id)
    }
  },
  async created () {
    await this.createComponent(this.$route.params.id)
  },
  destroyed () {
    if (this.ws) {
      this.ws.close(1000, JSON.stringify({ room: this.room.id }))
      this.ws = null
    }
  },
  methods: {
    async createComponent (id) {
      this.username = this.$store.getters.getUsername
      this.room.id = id
      let verifiedRoom = await this.$store.dispatch('getRoom', this.room.id)
      if (!verifiedRoom) {
        window.alert(`Room ${this.room.id} is not yet opened for you. \n
      You can go to this room from main menu if you know password.`)
        this.$router.push('/')
        if (this.ws) {
          this.ws.close(1000, JSON.stringify({ room: this.room.id }))
          this.ws = null
        }
        return
      }
      this.room.store = verifiedRoom.store
      this.messages = verifiedRoom.messages
      this.ws = new WebSocket('ws://localhost:40510')
      const alice = crypto.createDiffieHellman(256)
      this.ws.onopen = () => {
        alice.generateKeys()
        this.ws.send(JSON.stringify({
          action: 'connect',
          store: this.room.store,
          username: this.username,
          room: this.room.id,
          publicKey: alice.getPublicKey('hex'),
          prime: alice.getPrime('hex'),
          generator: alice.getGenerator('hex')
        }))
      }
      this.ws.onmessage = async res => {
        res = JSON.parse(res.data)
        if (res.action === 'connected') {
          const bobKey = new Uint8Array(Math.ceil(res.bobKey.length / 2))
          for (let i = 0; i < bobKey.length; i++) bobKey[i] = parseInt(res.bobKey.substr(i * 2, 2), 16)
          this.secret = alice.computeSecret(bobKey)
        } else if (res.action === 'message') {
          const text = await this.$store.dispatch('decrypt', { text: res.text, key: this.secret })
          this.messages = await this.$store.dispatch('addMessage', {
            id: this.room.id,
            message: {
              from: res.from,
              text,
              date: res.date
            }
          })
          this.stableIPs = null
        } else if (res.action === 'new_user') {
          this.stableIPs = false
          this.IPs = res.watchers
        } else if (res.action === 'removed_user') {
          this.stableIPs = true
          this.IPs = res.watchers
        }
        this.connected = res.connected
      }
      window.onunload = () => {
        this.ws.close(1000, JSON.stringify({ room: this.room.id }))
        this.ws = null
      }
    },
    toggleIPs () {
      this.showIPs = !this.showIPs
    },
    async sendMessage () {
      const text = await this.$store.dispatch('encrypt', { text: this.message, key: this.secret })
      this.ws.send(JSON.stringify({
        action: 'message',
        room: this.room.id,
        store: this.room.store,
        from: this.username,
        text
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
    padding-right: 6px;
  }
  .head-data {
    text-align: left;
    padding-left: 6px;
  }
  .non-stable-ips {
    color: red;
  }
  .very-stable-ips {
    color: blue;
  }
  .pseudo-link {
    cursor: pointer;
    text-decoration: underline;
  }
}
.connected-ips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  .connected-username {
    text-align: right;
    padding-right: 6px;
    color: #009900;
  }
  .connected-ip {
    text-align: left;
    padding-left: 6px;
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
