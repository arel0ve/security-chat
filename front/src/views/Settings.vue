<template>
  <div>
    <MainMenu mode="menu"/>
    <form class="settings">
      <hr>
      <div class="form-content">
        <label for="username">Username</label>
        <input id="username" v-model="username" @change="saveUsername" placeholder="Username">
        <label for="storage">Place of storage</label>
        <select id="storage" v-model="storage" @change="saveStorage">
          <option>Application Store</option>
          <option>Local Storage</option>
          <option>Database</option>
        </select>
        <label for="life" v-if="storage === 'Database'">Shelf life</label>
        <select id="life" v-if="storage === 'Database'" v-model="life" @change="saveLife">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
          <option>Year</option>
          <option>Forever</option>
        </select>
      </div>
    </form>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu'

export default {
  components: {
    MainMenu
  },
  data () {
    return {
      username: '',
      storage: '',
      life: ''
    }
  },
  async created () {
    this.username = this.$store.getters.getUsername
    this.storage = this.$store.getters.getStorage
    this.life = this.$store.getters.getLife
  },
  methods: {
    saveUsername () {
      this.$store.commit('saveUsername', this.username)
    },
    saveStorage () {
      this.$store.commit('saveStorage', this.storage)
    },
    saveLife () {
      this.$store.commit('saveLife', this.life)
    }
  }
}
</script>

<style scoped lang="scss">
.settings {
  margin-top: 32px;
  width: 100%;
  position: relative;
  @media (min-width: 768px) {
    width: 75%;
    left: 12.5%;
  }
  @media (min-width: 992px) {
    width: 50%;
    left: 25%
  }
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
  .form-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    font-size: 24px;
    width: 100%;
    justify-content: space-evenly;
    input {
      width: 100%;
      background: #000;
      border: none;
      border-radius: 3px;
      color: lime;
      font-size: 24px;
      padding-left: 5px;
      padding-bottom: 3px;
      &:focus {
        outline: 0;
        border-bottom: outset 3px #009900;
        padding-bottom: 0;
        transition: border-bottom 200ms, padding-bottom 200ms;
      }
    }
    select {
      background: #000;
      color: lime;
      border: none;
      font-size: 24px;
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
    }
  }
}
</style>
