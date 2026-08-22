import {
  drawTorchGlow,
  drawHazard2D,
  drawPowerup2D
} from '../drawHelpers';

export interface Render2DGroundPropsProps {
  ctx: CanvasRenderingContext2D;
  torches: { x: number; y: number }[];
  hazards: any[];
  powerups: any[];
  restPoints: any[];
  droppedLoot: any[];
  chests: any[];
  cameraX: number;
  cameraY: number;
  cols: number;
  rows: number;
  cellSize: number;
}

export function render2DGroundProps({
  ctx,
  torches,
  hazards,
  powerups,
  restPoints,
  droppedLoot,
  chests,
  cameraX,
  cameraY,
  cols,
  rows,
  cellSize
}: Render2DGroundPropsProps): void {
  // 1. Tochas no mapa
  torches.forEach(t => {
    const c = t.x - cameraX;
    const r = t.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawTorchGlow(ctx, px, py, cellSize);
  });

  // 2. Hazards (Armadilhas)
  hazards.forEach(hazard => {
    if (hazard.isHidden) return;
    const c = hazard.x - cameraX;
    const r = hazard.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawHazard2D(ctx, px, py, cellSize, hazard);
  });

  // 3. Power-ups no chão
  powerups.forEach(pw => {
    if (pw.isCollected) return;
    const c = pw.x - cameraX;
    const r = pw.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawPowerup2D(ctx, px, py, cellSize, pw);

    ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = `rgb(${pw.color})`;
    ctx.fillText(pw.name.toUpperCase().substring(0, 8), px, py + cellSize * 0.35);
  });

  // 4. Pontos de Descanso Longo (Acampamentos)
  restPoints.forEach(rp => {
    const size = rp.size || 2;
    const c = rp.x - cameraX;
    const r = rp.y - cameraY;
    if (c + size < 0 || c >= cols || r + size < 0 || r >= rows) return;
    const px = (c + size / 2) * cellSize;
    const py = (r + size / 2) * cellSize;
    const radius = (cellSize * size) * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    if (!rp.isUsed) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
      ctx.lineWidth = 2.5;
    } else {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1.5;
    }
    ctx.fill();
    ctx.stroke();

    const rpIcon = rp.icon || '⛺';
    ctx.font = `${cellSize * (size * 0.45)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rp.isUsed ? '🪵' : rpIcon, px, py - 4);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = rp.isUsed ? '#94a3b8' : '#fbbf24';
    ctx.fillText(rp.isUsed ? 'ACAMPAMENTO (USADO)' : '⛺ ACAMPAMENTO', px, py + cellSize * (size * 0.35));
    ctx.restore();
  });

  // 5. Itens de Loot no chão
  droppedLoot.forEach(loot => {
    if (loot.isCollected) return;
    const c = loot.x - cameraX;
    const r = loot.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;

    ctx.beginPath();
    ctx.arc(px, py, cellSize * 0.28, 0, Math.PI * 2);
    switch (loot.item.rarity) {
      case 'lendário':
        ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        break;
      case 'raro':
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        break;
      case 'incomum':
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        break;
      default:
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        break;
    }
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `${cellSize * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loot.item.icon, px, py - 2);

    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = loot.item.rarity === 'lendário' ? '#f472b6' : loot.item.rarity === 'raro' ? '#60a5fa' : loot.item.rarity === 'incomum' ? '#34d399' : '#fbbf24';
    const cleanName = loot.item.name.replace(/Peças de Ouro|PO/g, '').trim();
    ctx.fillText(cleanName.length > 8 ? cleanName.substring(0, 8) + '..' : cleanName, px, py + cellSize * 0.35);
  });

  // 6. Baús de Tesouro
  chests.forEach(chest => {
    const c = chest.x - cameraX;
    const r = chest.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;

    if (!chest.isOpened) {
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.35, 0, Math.PI * 2);
      switch (chest.rarity) {
        case 'lendário':
          ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
          break;
        case 'raro':
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
          break;
        default:
          ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          break;
      }
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = `${cellSize * 0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const chestIcon = chest.isOpened ? '🔓' : '📦';
    ctx.fillText(chestIcon, px, py - 2);

    if (!chest.isOpened) {
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = chest.rarity === 'lendário' ? '#f472b6' : chest.rarity === 'raro' ? '#60a5fa' : '#94a3b8';
      ctx.fillText(chest.rarity.toUpperCase(), px, py - cellSize * 0.4);
    }
  });
}
