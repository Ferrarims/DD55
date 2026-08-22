export function draw2DFallenLog(
  ctx: CanvasRenderingContext2D,
  screenOrigX: number,
  screenOrigY: number,
  totalW: number,
  totalH: number,
  origVariant: string,
  origW: number,
  origH: number,
  cellSize: number,
  centerX: number,
  centerY: number
): void {
  const isHoriz = origVariant.includes('h') || origW >= origH;
  const logX = screenOrigX + (isHoriz ? 4 : (cellSize - 16) / 2);
  const logY = screenOrigY + (isHoriz ? (cellSize - 16) / 2 : 4);
  const logW = isHoriz ? totalW - 8 : 16;
  const logH = isHoriz ? 16 : totalH - 8;

  // Sombra suave do tronco
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(logX + 3, logY + 4, logW, logH, 6);
  ctx.fill();

  // Corpo cilíndrico de madeira
  const woodGrad = ctx.createLinearGradient(logX, logY, isHoriz ? logX : logX + logW, isHoriz ? logY + logH : logY);
  woodGrad.addColorStop(0, '#5c2b09');
  woodGrad.addColorStop(0.3, '#78350f');
  woodGrad.addColorStop(0.7, '#92400e');
  woodGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(logX, logY, logW, logH, 6);
  ctx.fill();
  ctx.strokeStyle = '#291102';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Anéis de crescimento nas pontas
  ctx.fillStyle = '#b45309';
  if (isHoriz) {
    ctx.beginPath();
    ctx.ellipse(logX + 4, logY + logH / 2, 3, logH / 2 - 2, 0, 0, Math.PI * 2);
    ctx.ellipse(logX + logW - 4, logY + logH / 2, 3, logH / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(logX + logW / 2, logY + 4, logW / 2 - 2, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(logX + logW / 2, logY + logH - 4, logW / 2 - 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Tufos de musgo verde natural no tronco
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(centerX - (isHoriz ? logW * 0.2 : 0), centerY - (isHoriz ? 0 : logH * 0.2), isHoriz ? 6 : 3, isHoriz ? 3 : 6, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + (isHoriz ? logW * 0.2 : 0), centerY + (isHoriz ? 0 : logH * 0.2), isHoriz ? 7 : 3, isHoriz ? 3 : 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function draw2DLargeTree(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  totalH: number,
  centerX: number,
  centerY: number,
  biome: string,
  weather: string,
  isIndoorEnv: boolean
): void {
  const canopyR = (Math.min(totalW, totalH) / 2) - 4;

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

  // Ponto de luz no topo da copa
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

export function draw2DLargeRock(
  ctx: CanvasRenderingContext2D,
  screenOrigX: number,
  screenOrigY: number,
  totalW: number,
  totalH: number
): void {
  const pad = 4;
  const rX = screenOrigX + pad;
  const rY = screenOrigY + pad;
  const rW = totalW - pad * 2;
  const rH = totalH - pad * 2;

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
