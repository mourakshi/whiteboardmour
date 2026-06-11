# DrawSpace

A real-time collaborative whiteboard app where users can draw together in shared rooms.

## Features

- ✏️ Pencil tool with smooth curves
- 🖌️ Brush tool
- ▭ Rectangle tool
- T Text tool
- 🪣 Fill bucket
- ◻ Eraser
- 🎨 Color picker
- Stroke width selector
- Real-time sync between users in the same room
- Room creation and joining
- Active users counter
- Clean, minimal UI

## Tech Stack

**Frontend**
- TypeScript
- Vite
- Canvas API
- Socket.IO Client

**Backend**
- Node.js
- TypeScript
- Socket.IO

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

Open `http://localhost:5173/rooms.html` to create or join a room, then draw on the whiteboard.

## Deployment

- **Frontend**: Vercel
- **Backend**: Render

Set the environment variable in Vercel:
VITE_BACKEND_URL=https://your-backend.onrender.com

## Live Demo

[whiteboardmour.vercel.app](https://whiteboardmour-5pz1.vercel.app)

## Repo

[github.com/mourakshi/whiteboardmour](https://github.com/mourakshi/whiteboardmour)


