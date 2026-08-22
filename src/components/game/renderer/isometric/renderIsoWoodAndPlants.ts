import { IsoPlantRenderParams } from './renderIsoCactus';
export { drawIsoCactus, type IsoPlantRenderParams } from './renderIsoCactus';
export { drawIsoTree } from './renderIsoTrees';

export function drawIsoFallenLog({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
  weather,
  isIndoorEnv,
}: IsoPlantRenderParams): void {
  const isHoriz = variant.includes('h') || w >= h;
  const logLen = Math.max(w, h);
  const baseY = objTopY + isoTileH * 0.55;
  const logRadius = isoTileW * 0.12 * Math.min(1.4, scale);
  const logVisualLen = isoTileW * (logLen * 0.75);

  // Sombra no Chão
  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY + 2, (logVisualLen / 2) + 6, isoTileH * 0.22 * logLen, isHoriz ? 0.35 : -0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // Corpo do Tronco de Madeira
  ctx.save();
  ctx.translate(objIsoX, baseY - logRadius * 0.5);
  ctx.rotate(isHoriz ? 0.35 : -0.35);

  // Casca do Tronco
  const logGrad = ctx.createLinearGradient(0, -logRadius, 0, logRadius);
  logGrad.addColorStop(0, '#78350f');
  logGrad.addColorStop(0.5, '#451a03');
  logGrad.addColorStop(1, '#291102');
  ctx.fillStyle = logGrad;
  ctx.fillRect(-logVisualLen / 2, -logRadius, logVisualLen, logRadius * 2);

  // Linhas de textura da casca
  ctx.strokeStyle = '#1c0a00';
  ctx.lineWidth = 1.2;
  for (let lx = -logVisualLen / 2 + 10; lx < logVisualLen / 2; lx += 14) {
    ctx.beginPath();
    ctx.moveTo(lx, -logRadius);
    ctx.lineTo(lx + 4, logRadius);
    ctx.stroke();
  }

  // Extremidades Cortadas do Tronco com Anéis de Crescimento
  ctx.beginPath();
  ctx.ellipse(-logVisualLen / 2, 0, logRadius * 0.6, logRadius, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b45309';
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-logVisualLen / 2, 0, logRadius * 0.3, logRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(logVisualLen / 2, 0, logRadius * 0.6, logRadius, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#92400e';
  ctx.fill();
  ctx.stroke();

  // Manchas de Musgo Verde no Tronco
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(-logVisualLen * 0.2, -logRadius * 0.6, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(logVisualLen * 0.15, -logRadius * 0.5, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cogumelinhos Vermelhos/Laranjas crescendo no tronco
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-logVisualLen * 0.1, -logRadius - 2, 3, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-logVisualLen * 0.1 - 0.5, -logRadius - 2, 1, 3);

  if (!isIndoorEnv && weather === 'snow') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -logRadius, logVisualLen * 0.45, logRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
