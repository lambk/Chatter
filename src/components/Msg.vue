<template lang="html">
  <div>
    <div v-if="src.type === 'user' && src.isOwn" class="own-msg">
      <span v-if="src.votes" href="#" class="reaction">{{src.votes}}👍</span>
      <span class="msg-bubble">{{src.content}}</span>
    </div>
    <div v-else-if="src.type === 'user'">
      <span class="msg-bubble"><b>{{src.sender}}: </b>{{src.content}}</span>
      <span href="#" class="reaction">
        <span v-if="src.votes" :class="{upvoted: src.upvoted}">+{{src.votes}}</span>
        <a href="#" @click="vote(src.id, src.upvoted); src.upvoted = !src.upvoted">👍</a>
      </span>
    </div>
    <span v-else-if="src.type === 'server'"><i>{{src.content}}</i></span>
    <a v-else-if="src.type === 'prompt'" href="#" @click="greet">Say Hello 👋</a>
    <span v-else-if="src.type === 'notification'" class="msg-bubble">{{src.content}}</span>
  </div>
</template>

<script>
export default {
  props: ['src'],
  methods: {
    greet: function() {
      this.$emit('greet');
    },
    vote: function(id, upvoted) {
      if (upvoted) {
        this.$emit('vote', id, false);
      } else {
        this.$emit('vote', id, true);
      }
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

.reaction {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 -10px;
  z-index: 5;
  font-size: 0.7rem;
  background: white;
  padding: 2px 4px;
  border-radius: 40%;
  box-shadow: 0 0 8px #eee;
}

.upvoted {
  color: green;
  font-size: 0.9rem;
}
</style>
