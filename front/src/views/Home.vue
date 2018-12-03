<template>
  <div class="home">
    <MainMenu :mode="mode"/>
  </div>
</template>

<script>
// @ is an alias to /src
import MainMenu from '@/components/MainMenu.vue'

export default {
  name: 'home',
  components: {
    MainMenu
  },
  data () {
    return {
      mode: String
    }
  },
  created () {
    if (this.$route.path === '/') {
      this.mode = 'main'
    } else {
      this.mode = 'menu'
    }
  }
}
</script>
