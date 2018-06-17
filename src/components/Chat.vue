<template lang="html">
  <div class="col-sm-11 col-md-9 col-lg-7" style="margin: auto">
    <div class="container-fluid">
      <div class="form-group row">
        <label for="nameTxt" class="col-2 col-form-label">Name</label>
        <input id="nameTxt" type="text" class="form-control col-10" v-model="nameInput">
      </div>
    </div>
    <div class="chat-window">
      <div v-for="msg in messages" name="chat-msg" :key="msg.datetime">
        <span><b>{{msg.sender}}: </b>{{msg.content}}</span>
      </div>
    </div>
    <form class="input-group" @submit.prevent="sendMsg">
      <input type="text" class="form-control" style="border-top-left-radius: 0" v-model="msgInput" placeholder="Send a message">
      <div class="input-group-append">
        <input type="submit" class="btn btn-primary btn-block" :class="{'disabled': !isFormValid}" style="width: 120px; border-top-right-radius: 0" value="Send">
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      messages: [],
      msgInput: '',
      nameInput: ''
    }
  },
  props: ['socket'],
  mounted: function() {
    this.registerSocketEvents();
  },
  computed: {
    isFormValid: function() {
      return this.nameInput.length !== 0 && this.msgInput.length !== 0;
    }
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
      this.socket.on('addMsg', function(data) {
        self.addMsg(data);
      });
    },
    sendMsg: function() {
      if (this.nameInput.length === 0 || this.msgInput.length === 0) return;
      let data = {
        sender: this.nameInput,
        content: this.msgInput,
        datetime: new Date().getTime()
      };
      this.socket.emit('sendMsg', data);
      this.messages.push(data);
      this.msgInput = '';
    },
    addMsg: function(data) {
      this.messages.push(data);
    }
  }
}
</script>

<style lang="css" scoped>
.chat-window {
  border: 1px solid grey;
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  height: 400px;
  overflow-y: scroll;

  padding: 10px;
  text-align: left;
}

[name=chat-msg] {
  border-radius: 3px 8px 8px 3px;
  background: #F3F3F3;
  padding: 3px 6px;
  margin-bottom: 5px;
}

[name=chat-msg]:nth-child(odd) {
  background: #FAFAFA;
}

form {
  margin: 0;
}
</style>
