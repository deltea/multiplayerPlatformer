const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

// Last player ID
server.lastPlayerID = 0;

let players = {};
app.use(express.static(__dirname));
app.get("/", (request, res) => {
  res.sendFile(__dirname + "/index.html");
});
io.on("connection", (socket) => {
  console.log("A user connected");
  players[socket.id] = {
    id: socket.id,
    x: 500,
    y: 800
  };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
  socket.on("playerMovement", function(data) {
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});
server.listen(8001);
