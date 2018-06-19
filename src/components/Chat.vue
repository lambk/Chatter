<template lang="html">
  <div>
    <div v-if="!socket || !socket.connected" class="chat-overlay">
      <span>No Connection</span>
    </div>
    <div :class="{'blur': !socket || !socket.connected}">
      <div class="col-6 input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">Name</span>
        </div>
        <input type="text" class="form-control" v-model="nameInput">
      </div>
      <div class="chat-window">
        <div v-for="msg in messages" :key="msg.datetime" :owner="msg.sender.id" :class="{'own-msg': msg.sender.id===socket.id}">
          <span class="msg-bubble"><b v-if="msg.sender.id != socket.id">{{msg.sender.name}}:</b> {{msg.content}}</span>
        </div>
      </div>
      <form class="input-group" @submit.prevent="sendMsg">
        <input type="text" class="form-control" v-model="msgInput" placeholder="Send a message">
        <div class="input-group-append">
          <input type="submit" class="btn btn-primary btn-block" :class="{'disabled': !isFormValid}" style="width: 120px" value="Send">
        </div>
      </form>
    </div>
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
    this.getUserCount();
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
      this.socket.on('addArrival', function(data) {
        self.addMsg({
          sender: {
            name: 'Server'
          },
          content: 'A user has just arrived'
        });
      })
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
    },
    getUserCount: function() {
      let url = (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '') + '/api/usercount';
      this.$http.get(url).then(function(response) {
        this.messages.push({
          sender: {
            name: 'Server'
          },
          content: `${response.data.count + 1} users connected`
        });
      }, function() {
        console.log('Error fetching usercount');
      });
    }
  }
}
</script>

<style lang="css" scoped>
.chat-window {
  height: 400px;
  overflow-y: auto;

  position: relative;
  padding: 15px;
  text-align: left;
}

.chat-overlay {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  z-index: 20;
}

.blur {
  -webkit-filter: blur(1px);
}

.chat-overlay span {
  display: block;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.msg-bubble {
  display: inline-block;
  margin-bottom: 5px;
  max-width: 50%;

  padding: 3px 15px 3px 6px;
  border-radius: 5px 15px 15px 5px;
  background: #F3F3F3;
}

.own-msg > .msg-bubble {
  padding: 3px 6px 3px 15px;
  border-radius: 15px 5px 5px 15px;
  background: #85C1E9 !important;
}

.own-msg {
  text-align: right;
}

form {
  margin: 0;
}
</style>
