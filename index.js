const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// Last player ID
server.lastPlayerID = 0;

// Get all player instances
const getAllPlayers = () => {
  let players = [];
  console.log(`connected players: ${Object.keys(io.sockets.sockets)}`);
  Object.keys(io.sockets.sockets).forEach((socketID) => {
    let player = io.sockets.sockets[socketID].player;
    if (player) {
      players.push(player);
    }
  });
  return players;
}
app.get("/", (request, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static(__dirname));
let players = {};
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  socket.on("playerMovement", function(data) {
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].rotation = data.rotation;
    socket.broadcast.emit("playerMoved", socket.players[socket.id]);
  });
  socket.on("newPlayer", () => {
    socket.player = {
      id: server.lastPlayerID++,
      x: 500,
      y: 800
    };
    socket.emit("currentPlayers", socket.player);
    socket.broadcast.emit("newPlayer", socket.player);
  });
});
server.listen(8001);
