import { CellData } from '../../../../game/types';

interface RenderIsoBlockFacesProps {
  ctx: CanvasRenderingContext2D;
  cell: CellData;
  mapC: number;
  mapR: number;
  isoX: number;
  isoY: number;
  isoTileW: number;
  isoTileH: number;
  biome: string;
  blockH: number;
  leftColor: string;
  rightColor: string;
}

export function renderIsoBlockFaces({
  ctx,
  cell,
  mapC,
  mapR,
  isoX,
  isoY,
  isoTileW,
  isoTileH,
  biome,
  blockH,
  leftColor,
  rightColor,
}: RenderIsoBlockFacesProps): void {
  if (blockH <= 0) return;

  const topY = isoY - blockH;

  // 1. Face Direita do Bloco 3D
  ctx.beginPath();
  ctx.moveTo(isoX, topY + isoTileH);
  ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
  ctx.lineTo(isoX + isoTileW / 2, isoY + isoTileH / 2);
  ctx.lineTo(isoX, isoY + isoTileH);
  ctx.closePath();
  ctx.fillStyle = rightColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.stroke();

  // Textura Pixel Art de Tijolos de Pedra na Masmorra (Face Direita)
  if (biome === 'Masmorra' && cell.terrain === 'wall') {
    const hRows = 3;
    const rowHeight = blockH / hRows;
    for (let r = 0; r < hRows; r++) {
      const y1 = topY + isoTileH + r * rowHeight;
      const y2 = Math.min(y1 + rowHeight, isoY + isoTileH);

      ctx.strokeStyle = '#0a0f1d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(isoX, y1);
      ctx.lineTo(isoX + isoTileW / 2, y1 - isoTileH / 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX, y1 + 1);
      ctx.lineTo(isoX + isoTileW / 2, y1 - isoTileH / 2 + 1);
      ctx.stroke();

      const tJoints = (r % 2 === 0) ? [0.33, 0.67] : [0.5];
      tJoints.forEach(t => {
        const jx = isoX + t * (isoTileW / 2);
        const jy1 = y1 - t * (isoTileH / 2);
        const jy2 = Math.min(y2 - t * (isoTileH / 2), isoY + isoTileH / 2 + (1 - t) * (isoTileH / 2));
        ctx.strokeStyle = '#070a14';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(jx, jy1);
        ctx.lineTo(jx, jy2);
        ctx.stroke();
      });
    }

    if ((mapR * 5 + mapC * 9) % 3 === 0) {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(isoX + isoTileW * 0.2, isoY + isoTileH * 0.7, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Face Esquerda do Bloco 3D
  ctx.beginPath();
  ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
  ctx.lineTo(isoX, topY + isoTileH);
  ctx.lineTo(isoX, isoY + isoTileH);
  ctx.lineTo(isoX - isoTileW / 2, isoY + isoTileH / 2);
  ctx.closePath();
  ctx.fillStyle = leftColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.stroke();

  // Textura Pixel Art de Tijolos de Pedra na Masmorra (Face Esquerda)
  if (biome === 'Masmorra' && cell.terrain === 'wall') {
    const hRows = 3;
    const rowHeight = blockH / hRows;
    for (let r = 0; r < hRows; r++) {
      const y1 = topY + isoTileH + r * rowHeight;
      const y2 = Math.min(y1 + rowHeight, isoY + isoTileH);

      ctx.strokeStyle = '#040711';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 2, y1 - isoTileH / 2);
      ctx.lineTo(isoX, y1);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 2, y1 - isoTileH / 2 + 1);
      ctx.lineTo(isoX, y1 + 1);
      ctx.stroke();

      const tJoints = (r % 2 === 1) ? [0.33, 0.67] : [0.5];
      tJoints.forEach(t => {
        const jx = isoX - (1 - t) * (isoTileW / 2);
        const jy1 = y1 - (1 - t) * (isoTileH / 2);
        const jy2 = Math.min(y2 - (1 - t) * (isoTileH / 2), isoY + isoTileH / 2 + t * (isoTileH / 2));
        ctx.strokeStyle = '#03050a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(jx, jy1);
        ctx.lineTo(jx, jy2);
        ctx.stroke();
      });
    }

    if ((mapR * 7 + mapC * 3) % 3 === 0) {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.ellipse(isoX - isoTileW * 0.2, isoY + isoTileH * 0.7, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
