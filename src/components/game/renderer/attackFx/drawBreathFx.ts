import { getDamageTypeColor } from '../../../../game/combatUtils';

/**
 * Renderizadores de efeitos visuais de baforada dracônica 2D (Cone e Linha).
 */

export function drawBreathConeEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  damageType?: string,
  cellSize: number = 40
): void {
  const angle = Math.atan2(dy - ay, dx - ax);
  const colors = getDamageTypeColor(damageType);
  const maxRadius = cellSize * 4.0;
  const currentRadius = maxRadius * Math.min(1, progress * 1.25);
  const alpha = 1 - Math.pow(progress, 1.8);
  const coneSpread = Math.PI / 3;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.arc(ax, ay, currentRadius, angle - coneSpread / 2, angle + coneSpread / 2);
  ctx.closePath();

  const grad = ctx.createRadialGradient(ax, ay, 0, ax, ay, currentRadius);
  grad.addColorStop(0, colors.primary);
  grad.addColorStop(0.6, colors.secondary);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 18;
  ctx.shadowColor = colors.glow;
  ctx.stroke();

  const particleCount = 16;
  ctx.fillStyle = colors.particle;
  for (let i = 0; i < particleCount; i++) {
    const pAngle = angle + (Math.sin(i * 13 + progress * 12) * (coneSpread / 2));
    const pDist = currentRadius * (0.15 + (i / particleCount) * 0.85);
    const px = ax + Math.cos(pAngle) * pDist;
    const py = ay + Math.sin(pAngle) * pDist;
    const pSize = (1 - progress) * (3 + (i % 3) * 2.5);

    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawBreathLineEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  damageType?: string,
  cellSize: number = 40
): void {
  const angle = Math.atan2(dy - ay, dx - ax);
  const colors = getDamageTypeColor(damageType);
  const maxLen = cellSize * 7.0;
  const currentLen = maxLen * Math.min(1, progress * 1.3);
  const alpha = 1 - Math.pow(progress, 1.8);
  const lineWidth = cellSize * 0.75;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);

  const endPx = ax + Math.cos(angle) * currentLen;
  const endPy = ay + Math.sin(angle) * currentLen;

  const grad = ctx.createLinearGradient(ax, ay, endPx, endPy);
  grad.addColorStop(0, colors.secondary);
  grad.addColorStop(0.7, colors.primary);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(endPx, endPy);
  ctx.strokeStyle = grad;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 22;
  ctx.shadowColor = colors.glow;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(endPx, endPy);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lineWidth * 0.35;
  ctx.stroke();

  const particleCount = 14;
  ctx.fillStyle = colors.particle;
  for (let i = 0; i < particleCount; i++) {
    const pDist = currentLen * (i / particleCount);
    const offset = Math.sin(i * 9 + progress * 16) * (lineWidth * 0.4);
    const px = ax + Math.cos(angle) * pDist - Math.sin(angle) * offset;
    const py = ay + Math.sin(angle) * pDist + Math.cos(angle) * offset;
    const pSize = (1 - progress) * (3 + (i % 3) * 2.5);

    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
