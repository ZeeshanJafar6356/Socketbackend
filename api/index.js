// backend/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const CONSTANTS = require("../constants.js");

const app = express();
const corsOptions = {
  origin: CONSTANTS.WEBSITE_URL, //(https://your-client-app.com)
};
app.use(cors(corsOptions));

app.get("/", async (req, res) => {
  res.json("success");
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: CONSTANTS.WEBSITE_URL,
    methods: ["GET", "POST"],
    secure: false,
    reconnect: true,
  },
});

const users = {}; // Store users by their socket ID
const rooms = {}; // Store rooms and their users

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join room
  socket.on("join room", (data) => {
    const { room, username } = data;
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(username);
    users[socket.id] = { username, room };

    io.to(room).emit("room users", rooms[room]);
  });

  // Handle chat message
  socket.on("chat message", (data) => {
    const { room, message } = data;
    io.to(room).emit("chat message", {
      username: users[socket.id].username,
      message,
    });
  });

  // List all rooms
  socket.on("list rooms", () => {
    const availableRooms = Array.from(io.sockets.adapter.rooms)
      .filter((room) => !room[1].has(room[0])) // Filter out rooms that are socket IDs
      .map((room) => room[0]);

    socket.emit("available rooms", availableRooms); // Send available rooms to the client
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const room = user.room;
      rooms[room] = rooms[room].filter(
        (username) => username !== user.username
      );
      io.to(room).emit("room users", rooms[room]);
      delete users[socket.id];
    }
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
