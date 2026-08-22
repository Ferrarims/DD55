import { toIsometric } from '../isometricMath';

interface IsoFloatingText {
  x: number;
  y: number;
  progress: number;
  color: string;
  text: string;
}

interface RenderIsoFloatingTextsProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  floatingTexts: IsoFloatingText[];
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
}

export function renderIsoFloatingTexts({
  ctx,
  canvas,
  floatingTexts,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
}: RenderIsoFloatingTextsProps): void {
  floatingTexts.forEach(ft => {
    const { x: isoX, y: baseIsoY } = toIsometric(
      ft.x,
      ft.y,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    const isoY = baseIsoY - isoTileH * 0.5 - (ft.progress * isoTileH * 1.5);

    ctx.save();
    ctx.globalAlpha = 1 - Math.pow(ft.progress, 2);
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeText(ft.text, isoX, isoY);
    ctx.fillText(ft.text, isoX, isoY);
    ctx.restore();
  });
}
