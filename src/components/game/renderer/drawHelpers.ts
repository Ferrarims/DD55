import { BiomeType, WeatherType } from '../../../game/types';

/**
 * Funções Utilitárias Puras de Desenho 2D (Draw Helpers)
 * Isoladas para reuso e modularidade do renderizador do canvas.
 */

/**
 * Desenha a barra de vida de uma entidade acima da sua posição.
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

/**
 * Desenha ícones de condição/status (ex: 😱, 💥, 💫) acima da barra de vida da entidade.
 */
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

/**
 * Desenha o indicador de cobertura de uma entidade monstro.
 */
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

/**
 * Desenha uma tocha no mapa 2D.
 */
export function drawTorchGlow(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellSize: number
): void {
  ctx.beginPath();
  ctx.arc(px, py, cellSize * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.fill();

  ctx.font = `${cellSize * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔥', px, py);
}

/**
 * Desenha cactos 2D com braços e flor no topo.
 */
export function draw2DCactus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cScale: number
): void {
  ctx.fillStyle = '#15803d';
  // Corpo
  ctx.beginPath();
  ctx.roundRect(cx - 5 * cScale, cy - 14 * cScale, 10 * cScale, 28 * cScale, 4 * cScale);
  ctx.fill();
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Braço esquerdo
  ctx.beginPath();
  ctx.roundRect(cx - 13 * cScale, cy - 6 * cScale, 9 * cScale, 5 * cScale, 2 * cScale);
  ctx.roundRect(cx - 13 * cScale, cy - 12 * cScale, 5 * cScale, 8 * cScale, 2 * cScale);
  ctx.fill();
  ctx.stroke();
  // Braço direito
  ctx.beginPath();
  ctx.roundRect(cx + 4 * cScale, cy - 2 * cScale, 9 * cScale, 5 * cScale, 2 * cScale);
  ctx.roundRect(cx + 8 * cScale, cy - 8 * cScale, 5 * cScale, 8 * cScale, 2 * cScale);
  ctx.fill();
  ctx.stroke();
  // Flor rosa no topo
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(cx, cy - 14 * cScale, 2.5 * cScale, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Desenha árvore ancestral 2D multi-célula.
 */
export function draw2DTree(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  canopyR: number,
  biome?: BiomeType | string,
  weather?: WeatherType | string,
  isIndoorEnv?: boolean
): void {
  // Sombra suave da Copa
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY + 6, canopyR + 2, canopyR, 0, 0, Math.PI * 2);
  ctx.fill();

  // Camadas concêntricas e tufos orgânicos de folhagem
  const isSwamp = biome === 'Pântano';
  const tufts = [
    { dx: 0, dy: 0, r: canopyR * 0.95, col: isSwamp ? '#064e3b' : '#14532d' },
    { dx: -canopyR * 0.35, dy: -canopyR * 0.3, r: canopyR * 0.6, col: isSwamp ? '#0f766e' : '#16a34a' },
    { dx: canopyR * 0.35, dy: -canopyR * 0.25, r: canopyR * 0.55, col: isSwamp ? '#14b8a6' : '#22c55e' },
    { dx: -canopyR * 0.25, dy: canopyR * 0.35, r: canopyR * 0.58, col: isSwamp ? '#042f2e' : '#15803d' },
    { dx: canopyR * 0.3, dy: canopyR * 0.3, r: canopyR * 0.52, col: isSwamp ? '#0f766e' : '#14532d' },
    { dx: 0, dy: -canopyR * 0.15, r: canopyR * 0.42, col: isSwamp ? '#2dd4bf' : '#4ade80' },
  ];

  tufts.forEach(({ dx, dy, r, col }) => {
    ctx.beginPath();
    ctx.arc(centerX + dx, centerY + dy, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // Borda elegante da Copa
  ctx.beginPath();
  ctx.arc(centerX, centerY, canopyR, 0, Math.PI * 2);
  ctx.strokeStyle = isSwamp ? '#042f2e' : '#064e3b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ponto de luz no topo da copa (ou neve acumulada no clima de neve)
  ctx.beginPath();
  ctx.arc(centerX - canopyR * 0.1, centerY - canopyR * 0.15, canopyR * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
    ? '#ffffff'
    : isSwamp ? 'rgba(94, 234, 212, 0.45)' : 'rgba(134, 239, 172, 0.45)';
  ctx.fill();

  if (!isIndoorEnv && weather === 'snow') {
    // Cobertura de neve fofa sobre a copa da árvore
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - canopyR * 0.25, centerY - canopyR * 0.3, canopyR * 0.4, 0, Math.PI * 2);
    ctx.arc(centerX + canopyR * 0.2, centerY - canopyR * 0.22, canopyR * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Desenha rocha / monólito multi-célula 2D.
 */
export function draw2DRock(
  ctx: CanvasRenderingContext2D,
  rX: number,
  rY: number,
  rW: number,
  rH: number
): void {
  // Sombra suave da rocha
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(rX + 4, rY + 5, rW, rH, 8);
  ctx.fill();

  // Corpo da rocha com gradiente de ardósia/granito
  const stoneGrad = ctx.createLinearGradient(rX, rY, rX + rW, rY + rH);
  stoneGrad.addColorStop(0, '#64748b');
  stoneGrad.addColorStop(0.4, '#475569');
  stoneGrad.addColorStop(0.8, '#334155');
  stoneGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = stoneGrad;
  ctx.beginPath();
  ctx.roundRect(rX, rY, rW, rH, 8);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Facetas de relevo volumétrico da rocha
  ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.beginPath();
  ctx.moveTo(rX + 4, rY + 4);
  ctx.lineTo(rX + rW * 0.6, rY + 4);
  ctx.lineTo(rX + rW * 0.4, rY + rH * 0.5);
  ctx.lineTo(rX + 4, rY + rH * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(rX + 4, rY + 4);
  ctx.lineTo(rX + rW * 0.6, rY + 4);
  ctx.lineTo(rX + rW * 0.4, rY + rH * 0.5);
  ctx.stroke();
}

/**
 * Desenha uma armadilha / hazard 2D.
 */
export function drawHazard2D(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellSize: number,
  hazard: { name: string; icon: string; isTriggered?: boolean }
): void {
  ctx.beginPath();
  ctx.arc(px, py, cellSize * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = hazard.isTriggered ? 'rgba(100, 116, 139, 0.12)' : 'rgba(239, 68, 68, 0.08)';
  ctx.strokeStyle = hazard.isTriggered ? 'rgba(100, 116, 139, 0.3)' : 'rgba(239, 68, 68, 0.25)';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  ctx.font = `${cellSize * 0.45}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hazard.isTriggered ? '💥' : hazard.icon, px, py);

  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = hazard.isTriggered ? '#64748b' : '#ef4444';
  ctx.fillText(hazard.isTriggered ? 'DESATIVADA' : hazard.name.toUpperCase().substring(0, 8), px, py + cellSize * 0.35);
}

/**
 * Desenha powerups flutuantes com aura.
 */
export function drawPowerup2D(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellSize: number,
  pw: { icon: string; color: string }
): void {
  ctx.beginPath();
  ctx.arc(px, py, cellSize * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${pw.color}, 0.15)`;
  ctx.strokeStyle = `rgba(${pw.color}, 0.5)`;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();

  ctx.font = `${cellSize * 0.48}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pw.icon, px, py - 1);
}

/**
 * Desenha terreno difícil sutil no chão.
 */
export function drawDifficultTerrain2D(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  biome?: BiomeType | string,
  weather?: WeatherType | string,
  isNight?: boolean,
  isIndoorEnv?: boolean
): void {
  if (!isIndoorEnv && weather === 'snow') {
    ctx.strokeStyle = isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY);
    ctx.lineTo(centerX + 4, centerY);
    ctx.moveTo(centerX, centerY - 4);
    ctx.lineTo(centerX, centerY + 4);
    ctx.moveTo(centerX - 2.5, centerY - 2.5);
    ctx.lineTo(centerX + 2.5, centerY + 2.5);
    ctx.moveTo(centerX - 2.5, centerY + 2.5);
    ctx.lineTo(centerX + 2.5, centerY - 2.5);
    ctx.stroke();
  } else if (biome === 'Floresta') {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (biome === 'Deserto') {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.quadraticCurveTo(centerX, centerY - 2, centerX + 5, centerY);
    ctx.stroke();
  } else if (biome === 'Pântano') {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (biome === 'Masmorra') {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 3, centerY - 3);
    ctx.lineTo(centerX + 3, centerY + 3);
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Desenha texto flutuante (ex: números de dano, cura, etc.).
 */
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

/**
 * Desenha o alcance de teleporte do Passo das Nuvens (Golias).
 */
export function drawTeleportRange(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  cellSize: number
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(hx, hy, cellSize * 6.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
  ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.fill();
  ctx.stroke();

  // Desenhar círculo menor pulsante
  const pulse = Math.sin(Date.now() / 150) * 0.05 + 1.0;
  ctx.beginPath();
  ctx.arc(hx, hy, cellSize * 6.5 * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
