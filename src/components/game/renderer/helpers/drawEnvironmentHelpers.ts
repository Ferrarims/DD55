import { BiomeType, WeatherType } from '../../../../game/types';

/**
 * Funções utilitárias de desenho do ambiente 2D (Tochas, Cactos, Árvores, Rochas, Terreno Difícil).
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

export function draw2DCactus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cScale: number
): void {
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.roundRect(cx - 5 * cScale, cy - 14 * cScale, 10 * cScale, 28 * cScale, 4 * cScale);
  ctx.fill();
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(cx - 13 * cScale, cy - 6 * cScale, 9 * cScale, 5 * cScale, 2 * cScale);
  ctx.roundRect(cx - 13 * cScale, cy - 12 * cScale, 5 * cScale, 8 * cScale, 2 * cScale);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(cx + 4 * cScale, cy - 2 * cScale, 9 * cScale, 5 * cScale, 2 * cScale);
  ctx.roundRect(cx + 8 * cScale, cy - 8 * cScale, 5 * cScale, 8 * cScale, 2 * cScale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(cx, cy - 14 * cScale, 2.5 * cScale, 0, Math.PI * 2);
  ctx.fill();
}

export function draw2DTree(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  canopyR: number,
  biome?: BiomeType | string,
  weather?: WeatherType | string,
  isIndoorEnv?: boolean
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY + 6, canopyR + 2, canopyR, 0, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.beginPath();
  ctx.arc(centerX, centerY, canopyR, 0, Math.PI * 2);
  ctx.strokeStyle = isSwamp ? '#042f2e' : '#064e3b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX - canopyR * 0.1, centerY - canopyR * 0.15, canopyR * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
    ? '#ffffff'
    : isSwamp ? 'rgba(94, 234, 212, 0.45)' : 'rgba(134, 239, 172, 0.45)';
  ctx.fill();

  if (!isIndoorEnv && weather === 'snow') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - canopyR * 0.25, centerY - canopyR * 0.3, canopyR * 0.4, 0, Math.PI * 2);
    ctx.arc(centerX + canopyR * 0.2, centerY - canopyR * 0.22, canopyR * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function draw2DRock(
  ctx: CanvasRenderingContext2D,
  rX: number,
  rY: number,
  rW: number,
  rH: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(rX + 4, rY + 5, rW, rH, 8);
  ctx.fill();

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
