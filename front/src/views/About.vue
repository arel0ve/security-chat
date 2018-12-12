<template>
  <div class="about">
    <MainMenu mode="menu"/>
    <h1>About Safe Chat</h1>
    <h3>This is Safe Chat. Why is it safe? Because we use encryption.</h3>
    <p>Every time, when you reload your page and go to some your room, or create new,
    we with using algorithm of Diffie-Hellmann create for you exclusive security key of 32 bytes.
    And no one, including usself, can not know this key. With this key we encrypt
    passwords of your rooms with using AES-256. And this key
    will reload every time when you will reload you page.
    In same way with using Diffie-Hellmann and AES-256 we encrypt your messages in any your room.
    And each room has different password. It's really safe, isn't?</p>
    <p>And that is not all. You and only you, as creator of room can choose place where your messages will be saved.
    That means, if you choose, for example, Application Store in settings and create new room,
    messages from it will not be saved anywhere, and disappear forever when every user connected to room
    reload or close his chat page. Your messages are private, and no one can read it, including government of course.
    We don't save your messages in database if you don't ask about it.
    That's why please be careful if you want to save messages in database or local storage,
    because it will be vulnerable if someone break your computer, or our database, or you, or us.</p>
  </div>
</template>

<script>
import MainMenu from '@/components/MainMenu'

export default {
  components: {
    MainMenu
  }
}
</script>

<style scoped lang="scss">
h3, p {
  text-align: justify;
}
</style>
