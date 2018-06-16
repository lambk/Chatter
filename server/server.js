const express = require('express');
const socketio = require('socket.io');
const app = express();

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const io = socketio(server);
io.on('connection', (socket) => {
  console.log(`Socket connection established (id ${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnection (id ${socket.id})`);
  });

  socket.on('press', () => {
    console.log('Add one message received');
    io.sockets.emit('addOne');
  });
});
