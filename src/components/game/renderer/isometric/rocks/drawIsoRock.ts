import { IsoRockRenderParams } from './types';

export function drawIsoRock({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  biome,
  weather,
  isIndoorEnv,
}: IsoRockRenderParams): void {
  const rockScale = scale;
  const rockW = isoTileW * 0.38 * rockScale;
  const rockH = isoTileH * 0.95 * rockScale;
  const rx = objIsoX;
  const ry = objTopY + isoTileH * 0.45;

  ctx.beginPath();
  ctx.ellipse(rx, ry + rockH * 0.1, rockW * 0.9, isoTileH * 0.22 * rockScale, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // Face Esquerda (Luz)
  ctx.beginPath();
  ctx.moveTo(rx, ry - rockH);
  ctx.lineTo(rx - rockW, ry - rockH * 0.4);
  ctx.lineTo(rx - rockW * 0.7, ry + rockH * 0.1);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = biome === 'Deserto' ? '#d97706' : '#64748b';
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Face Direita (Sombra)
  ctx.beginPath();
  ctx.moveTo(rx, ry - rockH);
  ctx.lineTo(rx + rockW, ry - rockH * 0.35);
  ctx.lineTo(rx + rockW * 0.8, ry + rockH * 0.15);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = biome === 'Deserto' ? '#b45309' : '#334155';
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Topo Facetado
  ctx.beginPath();
  ctx.moveTo(rx, ry - rockH);
  ctx.lineTo(rx - rockW * 0.5, ry - rockH * 0.75);
  ctx.lineTo(rx, ry - rockH * 0.5);
  ctx.lineTo(rx + rockW * 0.4, ry - rockH * 0.7);
  ctx.closePath();
  ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
    ? '#ffffff'
    : biome === 'Deserto' ? '#f59e0b' : '#94a3b8';
  ctx.fill();
}
