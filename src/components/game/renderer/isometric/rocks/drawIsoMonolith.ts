import { IsoRockRenderParams } from './types';

export function drawIsoMonolith({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
  biome,
  weather,
  isIndoorEnv,
}: IsoRockRenderParams): void {
  const isMonolith = w >= 3 || h >= 3 || variant.includes('monolith');
  const isLargeBoulder = w === 2 && h === 2;
  const rockScale = scale;
  const rockW = isoTileW * (isMonolith ? 1.3 : isLargeBoulder ? 0.92 : 0.72) * (rockScale / (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1));
  const rockH = isoTileH * (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1.3) * (rockScale / (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1));
  const rx = objIsoX;
  const ry = objTopY + isoTileH * 0.55;
  const topYPos = ry - rockH;

  // 1. Sombra Ampla
  ctx.beginPath();
  ctx.ellipse(rx, ry + 4, rockW * 1.15, isoTileH * (isMonolith ? 0.6 : isLargeBoulder ? 0.4 : 0.25), 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();

  // 2. Pedregulhos ao redor da base
  ctx.fillStyle = biome === 'Floresta' ? '#1e293b' : biome === 'Pântano' ? '#1e293b' : '#334155';
  ctx.beginPath();
  ctx.ellipse(rx - rockW * 0.65, ry + 2, rockW * 0.22, rockH * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(rx + rockW * 0.6, ry + 3, rockW * 0.26, rockH * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Face Esquerda (Iluminada)
  ctx.beginPath();
  ctx.moveTo(rx, topYPos);
  ctx.lineTo(rx - rockW * 0.85, topYPos + rockH * 0.25);
  ctx.lineTo(rx - rockW * 0.95, ry - rockH * 0.15);
  ctx.lineTo(rx - rockW * 0.7, ry + 2);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = biome === 'Floresta' ? '#475569' : biome === 'Pântano' ? '#334155' : '#64748b';
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Face Direita (Sombra)
  ctx.beginPath();
  ctx.moveTo(rx, topYPos);
  ctx.lineTo(rx + rockW * 0.85, topYPos + rockH * 0.22);
  ctx.lineTo(rx + rockW * 0.9, ry - rockH * 0.12);
  ctx.lineTo(rx + rockW * 0.7, ry + 3);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = biome === 'Floresta' ? '#1e293b' : biome === 'Pântano' ? '#0f172a' : '#334155';
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Crista / Topo Facetado
  ctx.beginPath();
  ctx.moveTo(rx, topYPos - rockH * 0.08);
  ctx.lineTo(rx - rockW * 0.5, topYPos + rockH * 0.12);
  ctx.lineTo(rx, topYPos + rockH * 0.2);
  ctx.lineTo(rx + rockW * 0.45, topYPos + rockH * 0.1);
  ctx.closePath();
  ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
    ? '#ffffff'
    : biome === 'Floresta' ? '#64748b' : biome === 'Pântano' ? '#475569' : '#94a3b8';
  ctx.fill();
  ctx.strokeStyle = (!isIndoorEnv && weather === 'snow') ? '#f1f5f9' : '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 6. Rachaduras e Veios Cristalinos
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(rx - rockW * 0.25, topYPos + rockH * 0.3);
  ctx.lineTo(rx - rockW * 0.1, topYPos + rockH * 0.55);
  ctx.lineTo(rx - rockW * 0.35, ry - rockH * 0.1);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(rx - rockW * 0.12, topYPos + rockH * 0.52, 3, 3);
  ctx.fillRect(rx - rockW * 0.22, topYPos + rockH * 0.35, 2.5, 2.5);

  // 7. Musgo e Vegetação
  if (biome === 'Floresta' || biome === 'Pântano') {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(rx - rockW * 0.3, topYPos + rockH * 0.35, rockW * 0.25, rockH * 0.12, 0.2, 0, Math.PI * 2);
    ctx.ellipse(rx + rockW * 0.25, ry - rockH * 0.25, rockW * 0.2, rockH * 0.1, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(rx - rockW * 0.3, topYPos + rockH * 0.32, 2, 2);
  }
}
