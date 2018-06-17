const express = require('express');
const socketio = require('socket.io');
const static = require('serve-static');
const bodyParser = require('body-parser');
const app = express();
app.use(static(__dirname + '/dist'));
app.use(bodyParser.json());

/* Setup CORS for localhost (dev environment) */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
    console.log(`[Msg] Sender: ${data.sender.name} [${data.sender.id}] Content: ${data.content}`);
    socket.broadcast.emit('addMsg', data)
  });
});

app.get('/api/usercount', (req, res) => {
  let size = Object.keys(io.sockets.connected).length;
  res.status(200).send({count: size});
});
