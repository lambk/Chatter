<template lang="html">
  <div>
    <div v-if="!connected && !starting" class="chat-overlay">
      <span>No Connection</span>
    </div>
    <div :class="{'blur': !connected && !starting}">
      <div class="row">
        <form class="col-6 input-group" @submit.prevent="setName">
          <div class="input-group-prepend">
            <span class="input-group-text">Name</span>
          </div>
          <input type="text" class="form-control" v-model="nameInput" @input="nameInputChanged = true">
          <div class="input-group-append">
            <input type="submit" class="btn btn-success" :disabled="!nameInputChanged || nameInput === ''" value="Set">
          </div>
        </form>
        <div style="padding: 6px 0">
          <transition name="fade">
            <span v-if="nameSavedFlag" class="badge badge-success">Name Saved</span>
          </transition>
        </div>
      </div>
      <div class="chat-window">
        <msg v-for="msg in messages" :src="msg" :key="msg.id" @greet="greet"></msg>
      </div>
      <form class="input-group" @submit.prevent="sendMsg">
        <input type="text" class="form-control" v-model="msgInput" placeholder="Send a message">
        <div class="input-group-append">
          <input type="submit" class="btn btn-primary btn-block" :disabled="msgInput === ''" style="width: 120px" value="Send">
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Msg from './Msg.vue'
import crypto from 'crypto'

const MSG_TYPE = {
  SERVER: 'server',
  USER: 'user',
  PROMPT: 'prompt',
  NOTIFICATION: 'notification'
};

export default {
  data () {
    return {
      messages: [],
      msgInput: '',
      nameInput: '',
      nameInputChanged: false,
      nameSavedFlag: false,
      starting: true
    }
  },
  props: ['socket', 'connected'],
  components: {
    Msg
  },
  mounted: function() {
    // Prevent 'No Connection' overlay from appearing until after 0.5s
    let self = this;
    setTimeout(() => {
      self.starting = false
    }, 500);
    // Fill form with name from the last session
    this.nameInput = localStorage.getItem('name');
  },
  watch: {
    socket: function() {
      if (!this.socket) return; // When the socket variables becomes undefined -- shouldn't happen (there as caution)
      this.registerSocketEvents();
      let self = this;
      setTimeout(() => {
        self.addGreetingPrompt();
      }, 1000);
    }
  },
  methods: {
    registerSocketEvents: function() {
      let self = this;
      this.socket.on('connect', () => {
        self.getUserCount();
      });
      this.socket.on('msg', function(data) {
        self.addMsg(data);
      });
      this.socket.on('arrival', function(data) {
        self.addMsg({
          type: MSG_TYPE.SERVER,
          content: 'A user has just arrived'
        });
      });
      this.socket.on('nameChange', function(data) {
        self.addMsg({
          type: MSG_TYPE.SERVER,
          content: `${data.old} has changed their name to ${data.new}`
        });
      });
      this.socket.on('greet', function(data) {
        self.addMsg({
          type: MSG_TYPE.NOTIFICATION,
          content: `${data.sender} says Hello! 👋`
        });
      });
    },
    setName: function() {
      if (!this.nameInputChanged || this.nameInput === '') return;
      this.socket.emit('nameChange', {
        old: localStorage.getItem('name'),
        new: this.nameInput
      });
      localStorage.setItem('name', this.nameInput);
      this.nameInputChanged = false;
      this.nameSavedFlag = true;
      let self = this;
      setTimeout(function() {
        self.nameSavedFlag = false;
      }, 3000);
    },
    sendMsg: function() {
      if (!this.connected || this.msgInput === '') return;
      if (this.msgInput === '/count') {
        this.getUserCount();
      } else if (this.msgInput === '/help') {
        this.showHelpMsg();
      } else {
        let data = {
          id: crypto.randomBytes(10).toString('hex'),
          sender: localStorage.getItem('name'),
          content: this.msgInput
        };
        this.socket.emit('msg', data);
        data.type = MSG_TYPE.USER;
        data.isOwn = true;
        this.messages.push(data);
      }
      this.msgInput = '';
    },
    addMsg: function(data) {
      this.messages.push(data);
    },
    getUserCount: function() {
      let url = (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '') + '/api/usercount';
      this.$http.get(url).then(function(response) {
        this.messages.push({
          id: crypto.randomBytes(10).toString('hex'),
          type: MSG_TYPE.SERVER,
          content: `${response.data.count} users connected`,
          datetime: new Date().getTime()
        });
      }, function() {
        console.log('Error fetching usercount');
      });
    },
    showHelpMsg: function() {
      this.messages.push({
        type: MSG_TYPE.SERVER,
        content: `--Help--`
      });
      this.messages.push({
        type: MSG_TYPE.SERVER,
        content: `/count - Displays the current number of online users`
      });
    },
    addGreetingPrompt: function() {
      this.messages.push({
        type: MSG_TYPE.PROMPT
      });
    },
    greet: function() {
      for (let i = 0; i < this.messages.length; i++) {
        if (this.messages[i].type === MSG_TYPE.PROMPT) {
          this.messages.splice(i, 1);
        }
      }
      this.socket.emit('greet', {
        sender: localStorage.getItem('name')
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

.fade-enter-active {
  transition: opacity 0.3s;
}

.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
