import { io } from "socket.io-client";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import Whiteboard, { Tool } from "./whiteboard";

const canvas = document.createElement("canvas");
document.body.append(canvas);
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx = canvas.getContext("2d")!;
const whiteboard = new Whiteboard(canvas);
const socket = io(
  import.meta.env.PROD
    ? "https://whiteboardmour-backend.onrender.com"
    : "http://localhost:3000"
);

let currentRoomId: string | null = null;

const toolBtns = ["pencil", "brush", "rectangle", "text", "fill", "eraser"];

function setActive(id: string) {
  toolBtns.forEach((btn) => document.getElementById(btn)?.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  const cursors: Record<string, string> = {
    pencil: "crosshair", brush: "crosshair",
    rectangle: "crosshair", text: "text",
    fill: "cell", eraser: "cell",
  };
  canvas.style.cursor = cursors[id] ?? "crosshair";
}

document.getElementById("pencil")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.PENCIL); setActive("pencil");
});
document.getElementById("brush")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.BRUSH); setActive("brush");
});
document.getElementById("rectangle")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.RECTANGLE); setActive("rectangle");
});
document.getElementById("text")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.TEXT); setActive("text");
});
document.getElementById("fill")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.FILL); setActive("fill");
});
document.getElementById("eraser")?.addEventListener("click", () => {
  whiteboard.setTool(Tool.ERASER); setActive("eraser");
});
document.getElementById("clearBtn")?.addEventListener("click", () => {
  whiteboard.clear();
  socket.emit("clear", { room_id: currentRoomId });
});

const colorPicker = document.getElementById("colorPicker") as HTMLInputElement;
const colorSwatch = document.getElementById("colorSwatch") as HTMLDivElement;
colorPicker?.addEventListener("input", (e) => {
  const color = (e.target as HTMLInputElement).value;
  whiteboard.setColor(color);
  colorSwatch.style.background = color;
});

const strokeSelect = document.getElementById("strokeWidth") as HTMLSelectElement;
strokeSelect?.addEventListener("change", () => {
  whiteboard.pencil.pencilThickness = parseInt(strokeSelect.value);
});

whiteboard.addEventListener("state_change", () => {
  if (!currentRoomId) return;
  socket.emit("state_change", {
    room_id: currentRoomId,
    state: {
      pencil: whiteboard.pencil.paths,
      texts: whiteboard.pencil.texts,
      rectangle: whiteboard.rectangle.rects,
    },
  });
});

socket.on("state_change", (state) => {
  whiteboard.pencil.paths = state.pencil;
  whiteboard.pencil.texts = state.texts ?? [];
  whiteboard.rectangle.rects = state.rectangle;
});

socket.on("clear", () => whiteboard.clear());

socket.on("users_update", (users: string[]) => {
  const el = document.getElementById("users");
  if (el) el.textContent = `${users.length} online`;
});

const roomId = sessionStorage.getItem("room_id");
const roomName = sessionStorage.getItem("room_name");
if (roomId) {
  currentRoomId = roomId;
  socket.emit("join room", roomId);
  const banner = document.getElementById("roomBanner");
  const label = document.getElementById("roomLabel");
  if (banner && label) {
    banner.style.display = "flex";
    label.textContent = roomName ?? roomId;
  }
}

const animationLoop = () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  whiteboard.draw(ctx);
  whiteboard.update();
  requestAnimationFrame(animationLoop);
};
animationLoop();
