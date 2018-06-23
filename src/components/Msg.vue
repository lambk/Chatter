<template lang="html">
  <div :class="{'own-msg': src.isOwn}">
    <span v-if="src.type === 'user'" class="msg-bubble"><b v-if="!src.isOwn">{{src.sender}}:</b>{{src.content}}</span>
    <span v-else-if="src.type === 'server'"><i>{{src.content}}</i></span>
    <a v-else-if="src.type === 'prompt'" href="#" @click="greet">Say Hello 👋</a>
    <span v-else class="msg-bubble">{{src.content}}</span>
  </div>
</template>

<script>
export default {
  props: ['src'],
  methods: {
    greet: function() {
      this.$emit('greet');
    }
  }
}
</script>

<style lang="css" scoped>
.msg-bubble {
  display: inline-block;
  margin-bottom: 5px;
  max-width: 50%;

  padding: 3px 15px 3px 6px;
  border-radius: 5px 15px 15px 5px;
  background: #F3F3F3;
}

.own-msg {
  text-align: right;
}

.own-msg .msg-bubble {
  padding: 3px 6px 3px 15px;
  border-radius: 15px 5px 5px 15px;
  background: #85C1E9 !important;
}
</style>
