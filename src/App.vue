<template>
  <div id="app">
    <i v-if="socket && socket.connected">Socket connected</i>
    <router-view :socket="socket"/>
  </div>
</template>

<script>
import io from 'socket.io-client'
const port = process.env.PORT || 4000;

export default {
  name: 'App',
  data () {
    return {
      socket: undefined
    }
  },
  mounted: function() {
    this.socket = io(`http://localhost:${port}`);
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
