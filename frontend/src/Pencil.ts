import type { Pos } from "./whiteboard";

export interface Stroke {
  points: Pos[];
  color: string;
  thickness: number;
  isEraser: boolean;
}

export interface TextItem {
  pos: Pos;
  text: string;
  color: string;
}

class Pencil {
  mousePos: Pos = { x: 0, y: 0 };
  paths: Stroke[] = [];
  texts: TextItem[] = [];
  pencilThickness = 2;

  updateMousePos(pos: Pos) {
    this.mousePos = pos;
  }

  startStroke(color: string, isEraser = false, thickness?: number) {
    this.paths.push({
      points: [],
      color: isEraser ? "eraser" : color,
      thickness: thickness ?? this.pencilThickness,
      isEraser,
    });
  }

  addPoint(pos: Pos) {
    const current = this.paths[this.paths.length - 1];
    if (current) current.points.push(pos);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const stroke of this.paths) {
      if (stroke.points.length < 2) continue;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = stroke.thickness * 6;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.thickness;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const mx = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
        const my = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mx, my);
      }
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    for (const item of this.texts) {
      ctx.fillStyle = item.color;
      ctx.font = "20px sans-serif";
      ctx.fillText(item.text, item.pos.x, item.pos.y);
    }
    ctx.restore();
  }
}

export default Pencil;