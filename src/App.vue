<template>
  <div id="app">
    <i v-if="socket && socket.connected">Socket connected</i>
    <router-view :socket="socket"/>
  </div>
</template>

<script>
import io from 'socket.io-client'

export default {
  name: 'App',
  data () {
    return {
      socket: undefined
    }
  },
  mounted: function() {
    if (window.location.hostname === 'localhost') {
      this.socket = io('localhost:4000');
    } else {
      this.socket = io();
    }
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
