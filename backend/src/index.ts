import { Server } from "socket.io";
import { randomUUID } from "crypto";

interface Room {
  roomName: string;
  users: string[];
  room_id: string;
}

const io = new Server({ cors: { origin: "*" } });
const rooms: Room[] = [];

io.on("connection", (socket) => {
  socket.on("create room", (roomName) => {
    const room_id = randomUUID();
    rooms.push({ roomName, users: [], room_id });
    socket.join(room_id);
    socket.emit("room created", room_id);
  });

  socket.on("get rooms", (cb) => {
    cb(rooms.map((r) => ({ name: r.roomName, id: r.room_id })));
  });

  socket.on("join room", (room_id: string) => {
    const room = rooms.find((r) => r.room_id === room_id);
    if (room) {
      room.users.push(socket.id);
      socket.join(room_id);
      socket.emit("room joined", room_id);
      io.to(room_id).emit("users_update", room.users);
    }
  });

  socket.on("state_change", ({ room_id, state }) => {
    socket.to(room_id).emit("state_change", state);
  });

  socket.on("clear", ({ room_id }) => {
    io.to(room_id).emit("clear");
  });

  socket.on("disconnect", () => {
    rooms.forEach((room) => {
      const before = room.users.length;
      room.users = room.users.filter((id) => id !== socket.id);
      if (room.users.length !== before) {
        io.to(room.room_id).emit("users_update", room.users);
      }
    });
  });
});

io.listen(3000);
console.log("server started on port 3000");