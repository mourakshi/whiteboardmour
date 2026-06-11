import Pencil from "./Pencil";
import Rectangle from "./rectangle";

export interface Pos {
  x: number;
  y: number;
}

export const enum Tool {
  PENCIL,
  BRUSH,
  RECTANGLE,
  TEXT,
  ERASER,
  FILL,
  NO_TOOL,
}

class Whiteboard extends EventTarget {
  activeTool: Tool = Tool.NO_TOOL;
  pencil = new Pencil();
  rectangle = new Rectangle();
  mouseDown = false;
  color = "#000000";
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement) {
    super();
    this.offscreen = document.createElement("canvas");
    this.offscreen.width = canvas.width;
    this.offscreen.height = canvas.height;
    this.offCtx = this.offscreen.getContext("2d")!;

    canvas.onmousedown = (e) => {
      this.mouseDown = true;
      const pos = { x: e.clientX, y: e.clientY - 52 };

      if (this.activeTool === Tool.PENCIL) {
        this.pencil.startStroke(this.color, false, this.pencil.pencilThickness);
      } else if (this.activeTool === Tool.BRUSH) {
        this.pencil.startStroke(this.color, false, this.pencil.pencilThickness * 4);
      } else if (this.activeTool === Tool.ERASER) {
        this.pencil.startStroke(this.color, true, this.pencil.pencilThickness);
      } else if (this.activeTool === Tool.RECTANGLE) {
        this.rectangle.currentRect = {
          pos: { x: e.clientX, y: e.clientY - 52 },
          width: 0,
          height: 0,
          color: this.color,
        };
      } else if (this.activeTool === Tool.TEXT) {
        const text = prompt("Enter text:");
        if (text) {
          this.pencil.texts.push({ pos, text, color: this.color });
          this.dispatchEvent(new Event("state_change"));
        }
      } else if (this.activeTool === Tool.FILL) {
        this.floodFill(Math.round(e.clientX), Math.round(e.clientY - 52), this.color);
        this.dispatchEvent(new Event("state_change"));
      }
    };

    canvas.onmouseup = () => {
      this.mouseDown = false;
      if (this.activeTool === Tool.RECTANGLE && this.rectangle.currentRect) {
        this.rectangle.rects.push(this.rectangle.currentRect);
        this.rectangle.currentRect = undefined;
      }
      this.dispatchEvent(new Event("state_change"));
    };

    canvas.addEventListener("mousemove", (e) => {
      if (!this.mouseDown) return;
      const pos = { x: e.clientX, y: e.clientY - 52 };
      if (
        this.activeTool === Tool.PENCIL ||
        this.activeTool === Tool.BRUSH ||
        this.activeTool === Tool.ERASER
      ) {
        this.pencil.updateMousePos(pos);
        this.pencil.addPoint(pos);
      } else if (this.activeTool === Tool.RECTANGLE) {
        this.rectangle.updateMouse(pos);
      }
      this.dispatchEvent(new Event("state_change"));
    });
  }

  private floodFill(startX: number, startY: number, fillColor: string) {
    const ctx = this.offCtx;
    const w = this.offscreen.width;
    const h = this.offscreen.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const idx = (x: number, y: number) => (y * w + x) * 4;
    const target = data.slice(idx(startX, startY), idx(startX, startY) + 4);

    const fill = parseInt(fillColor.slice(1), 16);
    const fr = (fill >> 16) & 255;
    const fg = (fill >> 8) & 255;
    const fb = fill & 255;

    const matches = (x: number, y: number) => {
      const i = idx(x, y);
      return (
        Math.abs(data[i] - target[0]) < 30 &&
        Math.abs(data[i + 1] - target[1]) < 30 &&
        Math.abs(data[i + 2] - target[2]) < 30 &&
        Math.abs(data[i + 3] - target[3]) < 30
      );
    };

    const stack = [[startX, startY]];
    const visited = new Uint8Array(w * h);

    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      if (visited[y * w + x]) continue;
      if (!matches(x, y)) continue;

      visited[y * w + x] = 1;
      const i = idx(x, y);
      data[i] = fr;
      data[i + 1] = fg;
      data[i + 2] = fb;
      data[i + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    this.pencil.paths.push({
      points: [],
      color: "__fill__",
      thickness: 1,
      isEraser: false,
      fillSnapshot: ctx.getImageData(0, 0, w, h),
    } as any);
  }

  setTool(tool: Tool) {
    this.activeTool = tool;
  }

  setColor(color: string) {
    this.color = color;
  }

  clear() {
    this.pencil.paths = [];
    this.pencil.texts = [];
    this.rectangle.rects = [];
    this.rectangle.currentRect = undefined;
    this.offCtx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
    this.dispatchEvent(new Event("state_change"));
  }

  update() {
    this.rectangle.update();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.offCtx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
    this.pencil.draw(this.offCtx);
    this.rectangle.draw(this.offCtx);
    ctx.drawImage(this.offscreen, 0, 0);
  }
}

export default Whiteboard;