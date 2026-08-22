/**
 * Funções utilitárias de desenho de entidades (HP, Condições, Cobertura, Texto Flutuante).
 */

export function drawEntityHealthBar(
  ctx: CanvasRenderingContext2D,
  barX: number,
  barY: number,
  barW: number,
  barH: number,
  currentHp: number,
  maxHp: number
): void {
  const hpPercent = Math.max(0, Math.min(1, currentHp / Math.max(1, maxHp)));

  ctx.fillStyle = '#000000';
  ctx.fillRect(barX, barY, barW, barH);

  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(barX, barY, barW * hpPercent, barH);
}

export function drawConditionIcons(
  ctx: CanvasRenderingContext2D,
  px: number,
  y: number,
  conditions: string[],
  fontSize: number
): void {
  if (!conditions || conditions.length === 0) return;

  let conditionIcons = '';
  if (conditions.includes('Amedrontado') || conditions.includes('Amedrontado_New')) conditionIcons += '😱';
  if (conditions.includes('Caído')) conditionIcons += '💥';
  if (conditions.includes('Atordoado')) conditionIcons += '💫';
  if (conditions.includes('Envenenado')) conditionIcons += '🤢';
  if (conditions.includes('Cego')) conditionIcons += '🙈';
  if (conditions.includes('Voando')) conditionIcons += '🕊️';
  if (conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled')) conditionIcons += '✊';
  if (conditions.some(c => c === 'Enfeitiçado' || c === 'Charmed')) conditionIcons += '💖';
  if (conditions.some(c => c === 'Surdo' || c === 'Deafened')) conditionIcons += '🔇';

  if (conditionIcons) {
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(conditionIcons, px, y);
  }
}

export function drawCoverBadge(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  radius: number,
  badgeText: string
): void {
  ctx.save();
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  const textWidth = ctx.measureText(badgeText).width + 8;
  ctx.fillRect(px - textWidth / 2, py - radius - 22, textWidth, 15);
  ctx.strokeRect(px - textWidth / 2, py - radius - 22, textWidth, 15);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(badgeText, px, py - radius - 14.5);
  ctx.restore();
}

export function drawFloatingText(
  ctx: CanvasRenderingContext2D,
  text: string,
  tx: number,
  ty: number,
  color: string,
  progress: number
): void {
  ctx.save();
  ctx.globalAlpha = 1 - Math.pow(progress, 2);
  ctx.fillStyle = color;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 4;
  ctx.strokeText(text, tx, ty);
  ctx.fillText(text, tx, ty);

  ctx.restore();
}
