<template lang="html">
  <div class="col-sm-11 col-md-9 col-lg-7" style="margin: auto">
    <div class="container-fluid">
      <div class="form-group row">
        <label for="nameTxt" class="col-2 col-form-label">Name</label>
        <input id="nameTxt" type="text" class="form-control col-10" v-model="nameInput">
      </div>
    </div>
    <div class="chat-window">
      <div v-for="msg in messages" :key="msg.datetime" :owner="msg.sender.id" :class="{'own-msg': msg.sender.id===socket.id}">
        <div class="msg-bubble col-9">
          <span><b v-if="msg.sender.id != socket.id">{{msg.sender.name}}:</b> {{msg.content}}</span>
        </div>
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
      return this.socket && this.socket.connected && this.nameInput.length !== 0 && this.msgInput.length !== 0;
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
      if (!this.isFormValid) return;
      let data = {
        sender: {
          name: this.nameInput,
          id: this.socket.id
        },
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

.msg-bubble {
  border-radius: 5px 15px 15px 5px;
  background: #F3F3F3;
  padding: 3px 6px;
  margin-bottom: 5px;
}

.msg-bubble:nth-child(odd) {
  background: #FAFAFA;
}

.own-msg > .msg-bubble {
  background: #85C1E9 !important;
  border-radius: 15px 5px 5px 15px;
  text-align: right;
  margin-left: auto;
}

form {
  margin: 0;
}
</style>
