<template>
  <div>
    <MainMenu mode="menu"/>
    <h3>{{ 'Chat ' + $route.params.id }}</h3>
  </div>
</template>

<script>
import MainMenu from '../components/MainMenu'

export default {
  name: 'chat',
  components: {
    MainMenu
  }
}
</script>

<style scoped>

</style>
