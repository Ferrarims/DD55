import { UseCanvasRendererProps } from './rendererTypes';

interface DrawIsometricObjectsProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  mapC: number;
  mapR: number;
  centerC: number;
  centerR: number;
  isoX: number;
  topY: number;
  isoTileW: number;
  isoTileH: number;
}

export function drawIsometricObjects({
  ctx,
  canvas,
  props,
  mapC,
  mapR,
  centerC,
  centerR,
  isoX,
  topY,
  isoTileW,
  isoTileH,
}: DrawIsometricObjectsProps): void {
  const { torches, chests, droppedLoot, powerups, hazards, restPoints } = props;

  // Renderizar Tochas no Bloco 3D Isométrico
  const torch = torches.find(t => t.x === mapC && t.y === mapR);
  if (torch) {
    ctx.font = `${isoTileH * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔥', isoX, topY + isoTileH * 0.3);

    // Brilho quente da chama em 3D
    const torchGlow = ctx.createRadialGradient(isoX, topY + isoTileH * 0.3, 0, isoX, topY + isoTileH * 0.3, isoTileW * 0.6);
    torchGlow.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
    torchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = torchGlow;
    ctx.beginPath();
    ctx.arc(isoX, topY + isoTileH * 0.3, isoTileW * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Baús de Tesouro 3D
  const chest = chests.find(ch => ch.x === mapC && ch.y === mapR);
  if (chest) {
    ctx.font = `${isoTileH * 0.95}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chest.isOpened ? '🔓' : '📦', isoX, topY + isoTileH * 0.3);
  }

  // Itens de Loot Droppados 3D
  const loot = droppedLoot.find(l => !l.isCollected && l.x === mapC && l.y === mapR);
  if (loot) {
    ctx.font = `${isoTileH * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loot.item.icon, isoX, topY + isoTileH * 0.3);
  }

  // Power-ups / Armadilhas / Acampamentos 3D
  const pw = powerups.find(p => !p.isCollected && p.x === mapC && p.y === mapR);
  if (pw) {
    ctx.font = `${isoTileH * 0.85}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pw.icon, isoX, topY + isoTileH * 0.3);
  }

  const hazard = hazards.find(hz => !hz.isHidden && hz.x === mapC && hz.y === mapR);
  if (hazard) {
    ctx.font = `${isoTileH * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hazard.isTriggered ? '💥' : hazard.icon, isoX, topY + isoTileH * 0.3);
  }

  // Acampamento 3D (Renderizado no ladrilho mais frontal do 2x2 para respeitar o algoritmo do pintor de profundidade)
  const rest = restPoints.find(rp => {
    const size = rp.size || 2;
    const origX = rp.x;
    const origY = rp.y;
    return size === 2 ? (mapC === origX + 1 && mapR === origY + 1) : (mapC === origX && mapR === origY);
  });
  if (rest) {
    const size = rest.size || 2;
    const centerGridX = rest.x + (size - 1) / 2;
    const centerGridY = rest.y + (size - 1) / 2;
    const centerRelC = centerGridX - centerC;
    const centerRelR = centerGridY - centerR;
    const restIsoX = canvas.width / 2 + (centerRelC - centerRelR) * (isoTileW / 2);
    const restIsoY = canvas.height / 2 + (centerRelC + centerRelR) * (isoTileH / 2) + isoTileH * 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(restIsoX, restIsoY, isoTileW * 1.0, isoTileH * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = rest.isUsed ? 'rgba(71, 85, 105, 0.4)' : 'rgba(245, 158, 11, 0.35)';
    ctx.fill();
    ctx.strokeStyle = rest.isUsed ? '#64748b' : '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const restIcon = rest.icon || '⛺';
    ctx.font = `${isoTileH * 1.3}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rest.isUsed ? '🪵' : restIcon, restIsoX, restIsoY - isoTileH * 0.15);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = rest.isUsed ? '#94a3b8' : '#fbbf24';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(rest.isUsed ? 'ACAMPAMENTO USADO' : '⛺ ACAMPAMENTO', restIsoX, restIsoY + isoTileH * 0.65);
    ctx.restore();
  }
}
