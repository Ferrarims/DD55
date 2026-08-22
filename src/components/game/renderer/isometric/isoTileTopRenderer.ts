import { CellData } from '../../../../game/types';

interface RenderIsoTileTopProps {
  ctx: CanvasRenderingContext2D;
  cell: CellData;
  mapC: number;
  mapR: number;
  isoX: number;
  topY: number;
  isoTileW: number;
  isoTileH: number;
  biome: string;
  blockH: number;
  topColor: string;
}

export function renderIsoTileTop({
  ctx,
  cell,
  mapC,
  mapR,
  isoX,
  topY,
  isoTileW,
  isoTileH,
  biome,
  blockH,
  topColor,
}: RenderIsoTileTopProps): void {
  // 3. Face Superior do Bloco 3D (Diamante Lit Top)
  ctx.beginPath();
  ctx.moveTo(isoX, topY);
  ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
  ctx.lineTo(isoX, topY + isoTileH);
  ctx.lineTo(isoX - isoTileW / 2, topY + isoTileH / 2);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();

  // Borda de Bisel Pixel Art nas Arestas Superiores
  ctx.strokeStyle = blockH > 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Textura de Lajotas de Pedra Realistas e Capas no Bioma Masmorra
  if (biome === 'Masmorra') {
    if (cell.terrain === 'wall') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(isoX, topY);
      ctx.lineTo(isoX, topY + isoTileH);
      ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
      ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
      ctx.lineTo(isoX, topY);
      ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#080d1a';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 4, topY + isoTileH / 4);
      ctx.lineTo(isoX + isoTileW / 4, topY + isoTileH * 0.75);
      ctx.moveTo(isoX - isoTileW / 4, topY + isoTileH * 0.75);
      ctx.lineTo(isoX + isoTileW / 4, topY + isoTileH / 4);
      ctx.stroke();

      ctx.strokeStyle = '#090e1c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX, topY + 2);
      ctx.lineTo(isoX + isoTileW / 2 - 2, topY + isoTileH / 2);
      ctx.lineTo(isoX, topY + isoTileH - 2);
      ctx.lineTo(isoX - isoTileW / 2 + 2, topY + isoTileH / 2);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 4 + 1, topY + isoTileH / 4 + 1);
      ctx.lineTo(isoX, topY + 3);
      ctx.lineTo(isoX + isoTileW / 4 - 1, topY + isoTileH / 4 + 1);
      ctx.moveTo(isoX - isoTileW / 2 + 3, topY + isoTileH / 2);
      ctx.lineTo(isoX - isoTileW / 4 + 1, topY + isoTileH / 4 + 1);
      ctx.stroke();

      const seed = (mapR * 17 + mapC * 31) % 10;
      if (seed === 0 || seed === 5) {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(isoX, topY + isoTileH / 2, 3, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (seed === 2) {
        ctx.strokeStyle = '#050811';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(isoX - 3, topY + isoTileH * 0.3);
        ctx.lineTo(isoX + 2, topY + isoTileH * 0.45);
        ctx.lineTo(isoX - 1, topY + isoTileH * 0.65);
        ctx.stroke();
      } else if (seed === 8) {
        const runeY = topY + isoTileH / 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(isoX, runeY, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(isoX - 2, runeY);
        ctx.lineTo(isoX + 2, runeY);
        ctx.moveTo(isoX, runeY - 2);
        ctx.lineTo(isoX, runeY + 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Indicadores de Terreno Difícil
  if (cell.terrain === 'difficult') {
    const gy = topY + isoTileH * 0.5;
    if (biome === 'Deserto') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(isoX - 4, gy - 6, 2, 8);
      ctx.fillRect(isoX, gy - 9, 2, 11);
      ctx.fillRect(isoX + 4, gy - 5, 2, 7);
    } else if (biome === 'Pântano') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(isoX - 4, gy, 4, 0, Math.PI);
      ctx.arc(isoX + 4, gy, 4, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(isoX - 4, gy - 2, 2, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(isoX, gy - 4, 2, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(isoX + 4, gy - 2, 2, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
