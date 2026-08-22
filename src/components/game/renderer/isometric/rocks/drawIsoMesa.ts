import { IsoRockRenderParams } from './types';

export function drawIsoMesa({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
}: IsoRockRenderParams): void {
  const isLargeMesa = w >= 3 || h >= 3 || variant.includes('mesa');
  const isMediumMesa = (w === 2 && h === 2) || scale >= 1.6;
  const mesaScale = scale;
  const rx = objIsoX;
  const ry = objTopY + isoTileH * 0.55;
  const mesaW = isoTileW * (isLargeMesa ? 1.35 : isMediumMesa ? 0.95 : 0.7) * (mesaScale / (isLargeMesa ? 2.5 : isMediumMesa ? 1.8 : 1));
  const mesaH = isoTileH * (isLargeMesa ? 2.2 : isMediumMesa ? 1.6 : 1.1) * (mesaScale / (isLargeMesa ? 2.5 : isMediumMesa ? 1.8 : 1));
  const topYPos = ry - mesaH;

  // 1. Sombra Projetada no Chão
  ctx.beginPath();
  ctx.ellipse(rx, ry + 4, mesaW * 1.18, isoTileH * (isLargeMesa ? 0.65 : isMediumMesa ? 0.42 : 0.28), 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(69, 26, 3, 0.55)';
  ctx.fill();

  // 2. Base de cascalho e pedregulhos
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(rx - mesaW * 0.75, ry + 2, mesaW * 0.22, mesaH * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(rx + mesaW * 0.7, ry + 3, mesaW * 0.25, mesaH * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(rx - mesaW * 0.4, ry + 5, mesaW * 0.18, mesaH * 0.09, 0, 0, Math.PI * 2);
  ctx.ellipse(rx + mesaW * 0.35, ry + 6, mesaW * 0.2, mesaH * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Face Esquerda (Iluminada)
  ctx.beginPath();
  ctx.moveTo(rx, topYPos + mesaH * 0.12);
  ctx.lineTo(rx - mesaW * 0.85, topYPos + mesaH * 0.05);
  ctx.lineTo(rx - mesaW * 0.95, ry - mesaH * 0.15);
  ctx.lineTo(rx - mesaW * 0.8, ry + 2);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = '#d97706';
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const leftStrataCount = isLargeMesa ? 5 : 3;
  for (let s = 1; s <= leftStrataCount; s++) {
    const t = s / (leftStrataCount + 1);
    const sy1 = topYPos + mesaH * 0.08 + t * (ry - topYPos);
    const sy2 = topYPos + mesaH * 0.05 + t * (ry - topYPos);
    ctx.beginPath();
    ctx.moveTo(rx - mesaW * 0.85 * (1 - t * 0.1), sy2);
    ctx.lineTo(rx, sy1);
    ctx.strokeStyle = s % 2 === 0 ? '#b45309' : '#f59e0b';
    ctx.lineWidth = isLargeMesa ? 2.5 : 1.8;
    ctx.stroke();
  }

  // 4. Face Direita (Sombra)
  ctx.beginPath();
  ctx.moveTo(rx, topYPos + mesaH * 0.12);
  ctx.lineTo(rx + mesaW * 0.85, topYPos + mesaH * 0.05);
  ctx.lineTo(rx + mesaW * 0.95, ry - mesaH * 0.12);
  ctx.lineTo(rx + mesaW * 0.78, ry + 3);
  ctx.lineTo(rx, ry);
  ctx.closePath();
  ctx.fillStyle = '#92400e';
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const rightStrataCount = isLargeMesa ? 5 : 3;
  for (let s = 1; s <= rightStrataCount; s++) {
    const t = s / (rightStrataCount + 1);
    const sy1 = topYPos + mesaH * 0.08 + t * (ry - topYPos);
    const sy2 = topYPos + mesaH * 0.05 + t * (ry - topYPos);
    ctx.beginPath();
    ctx.moveTo(rx, sy1);
    ctx.lineTo(rx + mesaW * 0.85 * (1 - t * 0.1), sy2);
    ctx.strokeStyle = s % 2 === 0 ? '#78350f' : '#b45309';
    ctx.lineWidth = isLargeMesa ? 2.5 : 1.8;
    ctx.stroke();
  }

  // 5. Platô Superior da Mesa
  ctx.beginPath();
  ctx.moveTo(rx, topYPos - mesaH * 0.1);
  ctx.lineTo(rx - mesaW * 0.85, topYPos + mesaH * 0.05);
  ctx.lineTo(rx, topYPos + mesaH * 0.12);
  ctx.lineTo(rx + mesaW * 0.85, topYPos + mesaH * 0.05);
  ctx.closePath();
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(rx - mesaW * 0.25, topYPos + mesaH * 0.02, mesaW * 0.15, mesaH * 0.04, 0, 0, Math.PI * 2);
  ctx.ellipse(rx + mesaW * 0.3, topYPos + mesaH * 0.03, mesaW * 0.18, mesaH * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(rx - mesaW * 0.1, topYPos);
  ctx.lineTo(rx + mesaW * 0.15, topYPos + mesaH * 0.06);
  ctx.lineTo(rx + mesaW * 0.18, topYPos + mesaH * 0.35);
  ctx.stroke();

  if (isLargeMesa) {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(rx - mesaW * 0.35, topYPos - mesaH * 0.02, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(rx - mesaW * 0.35, topYPos - mesaH * 0.02 - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
