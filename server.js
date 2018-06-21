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
  console.log(`[CONN] Socket connection established (${socket.id})`);
  socket.broadcast.emit('addArrival');

  socket.on('disconnect', () => {
    console.log(`[DISC] Socket disconnection (${socket.id})`);
  });

  socket.on('sendMsg', (data) => {
    console.log(`[MSG] Sender: ${data.sender} (${socket.id}) Content: ${data.content}`);
    let emitData = {
      sender: data.sender ? data.sender : `user(${socket.id.slice(0,4)})`,
      content: data.content
    };
    socket.broadcast.emit('addMsg', emitData)
  });

  socket.on('nameChange', (data) => {
    console.log(`[NAME] ${data.old} changed their name to ${data.new}`);
    let emitData = {
      old: data.old ? data.old : `user(${socket.id.slice(0,4)})`,
      new: data.new
    };
    io.sockets.emit('nameChange', emitData);
  })
});

app.get('/api/usercount', (req, res) => {
  let size = Object.keys(io.sockets.connected).length;
  res.status(200).send({count: size});
});
