<template lang="html">
  <div>
    <input type="button" @click="addOne" value="add">
    <div id="socket-output">
      <span>Count: {{count}}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['socket'],
  data () {
    return {
      count: 0
    }
  },
  mounted: function() {
    this.registerSocketEvents();
  },
  watch: {
    socket: function() {
      this.registerSocketEvents();
    }
  },
  methods: {
    registerSocketEvents: function() {
      if (this.socket === undefined) return;
      let self = this;
      this.socket.on('addOne', function() {
        self.count++;
      });
    },
    addOne: function() {
      this.socket.emit('press');
    }
  }
}
</script>

<style lang="css">
</style>
