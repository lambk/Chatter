<template lang="html">
  <div>
    <div v-if="!connected && !starting" class="chat-overlay">
      <span>No Connection</span>
    </div>
    <div :class="{'blur': !connected && !starting}">
      <!-- Name input -->
      <div class="row">
        <form class="col-6 input-group" @submit.prevent="setName">
          <div class="input-group-prepend">
            <span class="input-group-text">Name</span>
          </div>
          <input type="text" class="form-control" v-model="nameInput.value" @input="nameInput.changed = true">
          <div class="input-group-append">
            <input type="submit" class="btn btn-success" :disabled="!nameInput.changed || nameInput.value === ''" value="Set">
          </div>
        </form>
        <div style="padding: 6px 0">
          <transition name="fade">
            <span v-if="nameInput.saved" class="badge badge-success">Name Saved</span>
          </transition>
        </div>
      </div>
      <!-- Chat window -->
      <div class="chat-window">
        <msg v-for="msg in messages" :src="msg" :key="msg.id" @greet="greet" @vote="vote"></msg>
      </div>
      <!-- Chat input -->
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
      nameInput: {
        value: 'rrr',
        changed: false,
        saved: false
      },
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
    this.nameInput.value = localStorage.getItem('name');
  },
  watch: {
    socket: function() {
      if (!this.socket) return; // When the socket variables becomes undefined -- shouldn't happen (there as caution)
      this.registerSocketEvents();
      let self = this;
      setTimeout(() => {
        self.addGreetingPrompt();
      }, 1000);
    },
    messages: function() {
      let chat = $('.chat-window');
      // Checks if the scroll is currently near the bottom
      let scrolledToBottom = chat[0].scrollHeight - chat.scrollTop() - chat.outerHeight() <= 100;
      if (scrolledToBottom) {
        // Updates the scroll position to the bottom
        this.$nextTick(function() {
          chat.scrollTop(chat[0].scrollHeight);
        });
      }
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
      this.socket.on('vote', function(data) {
        self.messages.forEach(function(el) {
          if (el.type === MSG_TYPE.USER && el.id === data.id) {
            if (data.isUpvote) el.votes++; else el.votes--;
          }
        });
      });
    },
    setName: function() {
      if (!this.nameInput.changed || this.nameInput.value === '') return;
      this.socket.emit('nameChange', {
        old: localStorage.getItem('name'),
        new: this.nameInput.value
      });
      localStorage.setItem('name', this.nameInput.value);
      this.nameInput.changed = false;
      this.nameInput.saved = true;
      let self = this;
      setTimeout(function() {
        self.nameInput.saved = false;
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
          type: MSG_TYPE.USER,
          id: crypto.randomBytes(10).toString('hex'),
          sender: localStorage.getItem('name'),
          content: this.msgInput
        };
        this.socket.emit('msg', data);
        data.isOwn = true;
        this.addMsg(data);
      }
      this.msgInput = '';
    },
    addMsg: function(data) {
      let msg;
      if (data.type === MSG_TYPE.USER) {
        msg = {
          type: data.type,
          id: data.id ? data.id : crypto.randomBytes(10).toString('hex'),
          votes: 0,
          upvoted: false,
          sender: data.sender,
          isOwn: data.isOwn,
          content: data.content
        }
      } else {
        msg = {
          type: data.type,
          content: data.content
        }
      }
      this.messages.push(msg);
    },
    getUserCount: function() {
      let url = (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '') + '/api/usercount';
      this.$http.get(url).then(function(response) {
        this.messages.push({
          id: crypto.randomBytes(10).toString('hex'),
          type: MSG_TYPE.SERVER,
          content: `${response.data.count} users connected`
        });
      }, function() {
        console.log('Error fetching usercount');
      });
    },
    showHelpMsg: function() {
      this.addMsg({
        type: MSG_TYPE.SERVER,
        content: `--Help--`
      });
      this.addMsg({
        type: MSG_TYPE.SERVER,
        content: `/count - Displays the current number of online users`
      });
    },
    addGreetingPrompt: function() {
      this.addMsg({
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
    },
    vote: function(id, isUpvote) {
      this.socket.emit('vote', {
        id: id,
        isUpvote: isUpvote
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
