const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

app.get("/", (request, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static(__dirname));
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
server.listen(8001, () => {
  console.log("listening on *:8001");
});
