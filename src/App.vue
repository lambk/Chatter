<template>
  <div id="app">
    <h1>Chatter</h1>
    <div class="col-sm-11 col-md-9 col-lg-7 chat-container" style="margin: auto">
      <router-view :socket="socket" :connected="hasConnection"/>
    </div>
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
  computed: {
    hasConnection: function() {
      return this.socket && this.socket.connected;
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
@font-face {
  font-family: palanquin;
  src: url('./assets/palanquin/palanquin-light.ttf');
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2, h3 {
  font-family: palanquin;
}

body {
  background-image: url('./assets/clouds.jpeg');
  object-fit: contain;
}

.chat-container {
  background: rgba(255, 255, 255, 0.5);
  padding: 25px 20px;
  border-radius: 10px
}
</style>
