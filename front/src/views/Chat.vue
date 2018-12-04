<template>
  <div>
    <MainMenu mode="menu"/>
    <h3>{{ 'Chat ' + $route.params.id }}</h3>
    <div class="current-message">
      <span>{{ username + ' >'}}</span>
      <input type="text" v-model="message">
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
      }
    }
  },
  async created () {
    this.username = this.$store.getters.getUsername
    this.room.id = this.$route.params.id
    let verifiedRoom = await this.$store.dispatch('getRoom', this.room.id)
    console.log(verifiedRoom)
    if (!verifiedRoom) {
      const password = window.prompt(`Input password of ${this.room.id} room`, '')
      if (!password) {
        this.$router.push('/')
      }
      const response = await fetch(`http://localhost:3000/api/room/${this.room.id}?password=${password}`)
      const result = await response.json()
      if (result.id) {
        this.$store.commit('addRoom', { id: result.id, password: this.password })
        this.room = { id: result.id, password: this.password }
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped lang="scss">
  hr {
    border: none;
    border-top: 1px solid #007700;
    color: #009900;
    overflow: visible;
    text-align: center;
    &::after {
      content: '⋱ settings ⋰';
      background: #000;
      position: relative;
      padding: 0 4px;
      top: -11px;
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
</style>
