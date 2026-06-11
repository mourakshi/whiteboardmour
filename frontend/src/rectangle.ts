import type { Pos } from "./whiteboard";

export interface RectProps {
  pos: Pos;
  width: number;
  height: number;
  color: string;
}

class Rectangle {
  rects: RectProps[] = [];
  currentRect?: RectProps;
  mousePos: Pos = { x: 0, y: 0 };

  updateMouse(pos: Pos) {
    this.mousePos = pos;
  }

  update() {
    if (this.currentRect) {
      this.currentRect.width = this.mousePos.x - this.currentRect.pos.x;
      this.currentRect.height = this.mousePos.y - this.currentRect.pos.y;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const rect of this.rects) {
      ctx.strokeStyle = rect.color;
      ctx.beginPath();
      ctx.rect(rect.pos.x, rect.pos.y, rect.width, rect.height);
      ctx.stroke();
      ctx.closePath();
    }
    if (this.currentRect) {
      ctx.strokeStyle = this.currentRect.color;
      ctx.beginPath();
      ctx.rect(
        this.currentRect.pos.x,
        this.currentRect.pos.y,
        this.currentRect.width,
        this.currentRect.height
      );
      ctx.stroke();
      ctx.closePath();
    }
  }
}

export default Rectangle;