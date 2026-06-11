import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const createBtn = document.getElementById("create_btn");
const roomNameInput = document.getElementById("name") as HTMLInputElement;
const roomsDiv = document.getElementById("rooms");

const loadRooms = () => {
  socket.emit("get rooms", (list: { name: string; id: string }[]) => {
    if (!roomsDiv) return;
    if (list.length === 0) {
      roomsDiv.hidden = true;
      return;
    }
    roomsDiv.hidden = false;
    roomsDiv.innerHTML = list
      .map(
        (r) => `
      <div class="flex items-center justify-between p-2 border-b border-gray-300">
        <span class="text-gray-700">${r.name}</span>
        <button onclick="joinRoom('${r.id}', '${r.name}')" ...>Join</button>
      </div>`
      )
      .join("");
  });
};

createBtn?.addEventListener("click", () => {
  const name = roomNameInput.value.trim();
  if (name) {
    socket.emit("create room", name);
    roomNameInput.value = "";
  }
});

socket.on("room created", () => loadRooms());
socket.on("connect", () => loadRooms());

(window as any).joinRoom = (room_id: string, room_name: string) => {
  sessionStorage.setItem("room_id", room_id);
  sessionStorage.setItem("room_name", room_name);
  window.location.href = "/";
};