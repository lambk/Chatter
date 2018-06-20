<template lang="html">
  <div>
    <div v-if="!socket || !socket.connected" class="chat-overlay">
      <span>No Connection</span>
    </div>
    <div :class="{'blur': !socket || !socket.connected}">
      <div class="row">
        <form class="col-6 input-group" @submit.prevent="setName">
          <div class="input-group-prepend">
            <span class="input-group-text">Name</span>
          </div>
          <input type="text" class="form-control" v-model="nameInput" @input="nameInputChanged = true">
          <div class="input-group-append">
            <input type="submit" class="btn btn-success" :class="{'disabled' : !nameInputChanged || nameInput === ''}" value="Set">
          </div>
        </form>
        <div style="padding: 6px 0">
          <transition name="fade">
            <span v-if="nameSavedFlag" class="badge badge-success">Name Saved</span>
          </transition>
        </div>
      </div>
      <div class="chat-window">
        <div v-for="msg in messages" :key="msg.datetime" :owner="msg.sender" :class="{'own-msg': msg.isOwn}">
          <span v-if="msg.serverMsg"><i>{{msg.content}}</i></span>
          <span v-else class="msg-bubble"><b v-if="!msg.isOwn">{{msg.sender}}:</b> {{msg.content}}</span>
        </div>
      </div>
      <form class="input-group" @submit.prevent="sendMsg">
        <input type="text" class="form-control" v-model="msgInput" placeholder="Send a message">
        <div class="input-group-append">
          <input type="submit" class="btn btn-primary btn-block" :class="{'disabled': msgInput === ''}" style="width: 120px" value="Send">
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
      nameInput: '',
      nameInputChanged: false,
      nameSavedFlag: false
    }
  },
  props: ['socket'],
  mounted: function() {
    this.registerSocketEvents();
    this.getUserCount();
    this.nameInput = localStorage.getItem('name');
  },
  computed: {
    hasNameChanged: function() {
      return true;
    },
    hasConnection: function() {
      return this.socket && this.socket.connected;
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
          serverMsg: true,
          content: 'A user has just arrived'
        });
      })
    },
    setName: function() {
      if (this.nameInput === '') return;
      localStorage.setItem('name', this.nameInput);
      this.nameInputChanged = false;
      this.nameSavedFlag = true;
      let self = this;
      setTimeout(function() {
        self.nameSavedFlag = false;
      }, 3000);
    },
    sendMsg: function() {
      if (!this.hasConnection || this.msgInput === '') return;
      let data = {
        sender: localStorage.getItem('name'),
        content: this.msgInput,
        datetime: new Date().getTime()
      };
      this.socket.emit('sendMsg', data);
      data.isOwn = true;
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
          serverMsg: true,
          content: `${response.data.count + 1} users connected`,
          datetime: new Date().getTime()
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
