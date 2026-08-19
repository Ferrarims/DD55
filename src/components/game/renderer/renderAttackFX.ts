import { getDamageTypeColor } from '../../../game/combatUtils';
import { drawWeatherOverlay } from '../../../game/weatherEffects';
import { WeatherType, BiomeType } from '../../../game/types';

/**
 * Motor de Efeitos Visuais de Ataque e Clima (Attack & Weather FX Renderer)
 * Isolado para renderizar animações de combate (corpo a corpo, projéteis, baforadas dracônicas) e clima.
 */

export interface ActiveEffectData {
  type: 'melee' | 'ranged' | 'breath_cone' | 'breath_line' | string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  hit?: boolean;
  damageType?: string;
}

/**
 * Renderiza um efeito visual de ataque corpo a corpo (Melee Slash Arc).
 */
export function drawMeleeEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  hit?: boolean,
  cellSize: number = 40
): void {
  const angle = Math.atan2(dy - ay, dx - ax);

  ctx.save();
  ctx.globalAlpha = 1 - progress;

  // Desenhar arco de corte (Slash Arc) centralizado no defensor
  ctx.beginPath();
  const radius = cellSize * 0.45;
  const startAngle = angle - Math.PI / 3 - (progress * Math.PI / 4);
  const endAngle = angle + Math.PI / 3 + (progress * Math.PI / 4);
  ctx.arc(dx, dy, radius, startAngle, endAngle);
  ctx.strokeStyle = hit ? '#f59e0b' : '#94a3b8';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 12;
  ctx.shadowColor = hit ? '#f59e0b' : '#64748b';
  ctx.stroke();

  // Linha interna de brilho branco
  ctx.beginPath();
  ctx.arc(dx, dy, radius, startAngle + 0.1, endAngle - 0.1);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Linha reta de corte atravessando o alvo
  ctx.beginPath();
  ctx.moveTo(dx - Math.cos(angle - Math.PI / 2) * radius, dy - Math.sin(angle - Math.PI / 2) * radius);
  ctx.lineTo(dx + Math.cos(angle - Math.PI / 2) * radius, dy + Math.sin(angle - Math.PI / 2) * radius);
  ctx.strokeStyle = hit ? 'rgba(255, 255, 255, 0.9)' : 'rgba(200, 200, 200, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Se acertou o ataque, criar faíscas/sangue se espalhando
  if (hit) {
    const numSparks = 6;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (let i = 0; i < numSparks; i++) {
      const sparkAngle = angle + (i - numSparks / 2) * (Math.PI / 6);
      const startDist = cellSize * 0.1 * progress;
      const endDist = cellSize * 0.6 * progress;
      ctx.beginPath();
      ctx.moveTo(dx + Math.cos(sparkAngle) * startDist, dy + Math.sin(sparkAngle) * startDist);
      ctx.lineTo(dx + Math.cos(sparkAngle) * endDist, dy + Math.sin(sparkAngle) * endDist);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Renderiza um efeito visual de projétil à distância (Ranged Arrow / Bolt).
 */
export function drawRangedEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  hit?: boolean,
  cellSize: number = 40
): void {
  const px = ax + (dx - ax) * progress;
  const py = ay + (dy - ay) * progress;
  const angle = Math.atan2(dy - ay, dx - ax);

  ctx.save();

  // Desenhar rastro luminoso do projétil
  ctx.beginPath();
  const trailLength = cellSize * 0.5;
  const tx = px - Math.cos(angle) * trailLength;
  const ty = py - Math.sin(angle) * trailLength;

  const grad = ctx.createLinearGradient(tx, ty, px, py);
  grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
  grad.addColorStop(1, 'rgba(251, 191, 36, 0.85)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3.5;
  ctx.moveTo(tx, ty);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Desenhar a flecha/pena
  ctx.translate(px, py);
  ctx.rotate(angle);

  // Haste da flecha
  ctx.beginPath();
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(cellSize * 0.22, 0);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ponta da flecha
  ctx.beginPath();
  ctx.moveTo(cellSize * 0.12, -cellSize * 0.08);
  ctx.lineTo(cellSize * 0.22, 0);
  ctx.lineTo(cellSize * 0.12, cellSize * 0.08);
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  // Penas traseiras
  ctx.beginPath();
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(-cellSize * 0.27, -cellSize * 0.07);
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(-cellSize * 0.27, cellSize * 0.07);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Explosão/impacto sutil ao chegar perto do alvo
  if (progress > 0.75) {
    ctx.save();
    const impactProgress = (progress - 0.75) / 0.25;
    ctx.globalAlpha = 1 - impactProgress;

    ctx.beginPath();
    ctx.arc(dx, dy, cellSize * 0.35 * impactProgress, 0, Math.PI * 2);
    ctx.strokeStyle = hit ? '#f59e0b' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (hit) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      const numSparks = 4;
      for (let i = 0; i < numSparks; i++) {
        const sparkAngle = (i * Math.PI / 2) + (impactProgress * Math.PI / 4);
        const dist = cellSize * 0.4 * impactProgress;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + Math.cos(sparkAngle) * dist, dy + Math.sin(sparkAngle) * dist);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

/**
 * Renderiza efeito de baforada dracônica em cone (Breath Cone).
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

/**
 * Renderiza efeito de baforada dracônica em linha (Breath Line).
 */
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

/**
 * Renderiza a lista de todos os efeitos ativos de combate (activeEffects).
 */
export function renderActiveEffects(
  ctx: CanvasRenderingContext2D,
  activeEffects: ActiveEffectData[],
  cameraX: number,
  cameraY: number,
  cellSize: number
): void {
  if (!activeEffects || activeEffects.length === 0) return;

  activeEffects.forEach(eff => {
    const ax = (eff.startX - cameraX) * cellSize + cellSize / 2;
    const ay = (eff.startY - cameraY) * cellSize + cellSize / 2;
    const dx = (eff.endX - cameraX) * cellSize + cellSize / 2;
    const dy = (eff.endY - cameraY) * cellSize + cellSize / 2;

    if (eff.type === 'melee') {
      drawMeleeEffect(ctx, ax, ay, dx, dy, eff.progress, eff.hit, cellSize);
    } else if (eff.type === 'ranged') {
      drawRangedEffect(ctx, ax, ay, dx, dy, eff.progress, eff.hit, cellSize);
    } else if (eff.type === 'breath_cone') {
      drawBreathConeEffect(ctx, ax, ay, dx, dy, eff.progress, eff.damageType, cellSize);
    } else if (eff.type === 'breath_line') {
      drawBreathLineEffect(ctx, ax, ay, dx, dy, eff.progress, eff.damageType, cellSize);
    }
  });
}

/**
 * Renderiza os efeitos de clima no canvas.
 */
export function renderWeatherFX(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: WeatherType,
  weatherTime: number,
  isIndoorEnv: boolean,
  isNightOrDarkEnv: boolean,
  biome?: BiomeType
): void {
  drawWeatherOverlay(ctx, width, height, weather, isNightOrDarkEnv, biome || 'Floresta', false, weatherTime);
}
