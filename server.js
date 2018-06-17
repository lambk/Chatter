const express = require('express');
const socketio = require('socket.io');
const static = require('serve-static');
const app = express();
app.use(static(__dirname + '/dist'));

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const io = socketio(server);
io.on('connection', (socket) => {
  console.log(`Socket connection established (${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnection (${socket.id})`);
  });

  socket.on('sendMsg', (data) => {
    console.log(`[Msg] Sender: ${data.sender} Content: ${data.content}`);
    socket.broadcast.emit('addMsg', data)
  });
});
