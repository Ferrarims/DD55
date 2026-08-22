/**
 * Renderizador de precipitações atmosféricas (Chuva e Neve).
 */

export function drawRainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isNightBool: boolean,
  is3dMode: boolean,
  timeMs: number
) {
  // Leve filtro atmosférico azulado/úmido
  ctx.fillStyle = isNightBool ? 'rgba(15, 23, 42, 0.18)' : 'rgba(30, 58, 138, 0.08)';
  ctx.fillRect(0, 0, width, height);

  const rainDropCount = is3dMode ? 160 : 130;
  const slantX = is3dMode ? 0.35 : 0.22;
  const dropSpeed = 0.75;
  const dropLen = is3dMode ? 18 : 14;

  ctx.strokeStyle = isNightBool ? 'rgba(186, 230, 253, 0.45)' : 'rgba(147, 197, 253, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();

  for (let i = 0; i < rainDropCount; i++) {
    const seedX = (i * 997 + 123) % width;
    const seedY = (i * 613 + 456) % height;
    const speedMult = 0.85 + (i % 5) * 0.08;

    const curY = (seedY + timeMs * dropSpeed * speedMult) % (height + 40) - 20;
    const curX = (seedX + curY * slantX) % width;

    ctx.moveTo(curX, curY);
    ctx.lineTo(curX + dropLen * slantX, curY + dropLen);
  }
  ctx.stroke();

  // Pequenas ondulações/gotas caindo no chão
  ctx.strokeStyle = isNightBool ? 'rgba(186, 230, 253, 0.25)' : 'rgba(186, 230, 253, 0.45)';
  ctx.lineWidth = 1.0;
  const rippleCount = 14;
  for (let i = 0; i < rippleCount; i++) {
    const rippleTime = (timeMs * 0.002 + i * 0.3) % 1;
    const rx = (i * 733 + 89) % (width - 40) + 20;
    const ry = (i * 421 + 177) % (height - 60) + 30;
    const radius = rippleTime * (is3dMode ? 14 : 10);
    const alpha = (1 - rippleTime) * 0.5;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    if (is3dMode) {
      ctx.ellipse(rx, ry, radius * 1.6, radius * 0.8, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.restore();
  }
}

export function drawSnowOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isNightBool: boolean,
  is3dMode: boolean,
  timeMs: number
) {
  const frostGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.4,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  frostGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
  frostGrad.addColorStop(1, isNightBool ? 'rgba(147, 197, 253, 0.18)' : 'rgba(224, 242, 254, 0.22)');
  ctx.fillStyle = frostGrad;
  ctx.fillRect(0, 0, width, height);

  const snowCount = is3dMode ? 140 : 110;
  const fallSpeed = 0.12;

  for (let i = 0; i < snowCount; i++) {
    const seedX = (i * 853 + 71) % width;
    const seedY = (i * 479 + 233) % height;
    const sizeType = i % 4;
    const radius = sizeType === 3 ? 3.0 : sizeType === 2 ? 2.2 : sizeType === 1 ? 1.6 : 1.1;
    const speedMult = 0.6 + (i % 6) * 0.12;
    const swayOffset = Math.sin(timeMs * 0.0018 + i * 2.1) * (12 + (i % 8) * 3);

    const curY = (seedY + timeMs * fallSpeed * speedMult) % (height + 20) - 10;
    const curX = (seedX + swayOffset + (curY * 0.1)) % width;

    ctx.fillStyle = isNightBool
      ? (sizeType >= 2 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(224, 242, 254, 0.65)')
      : (sizeType >= 2 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(241, 245, 249, 0.8)');

    ctx.beginPath();
    ctx.arc(curX < 0 ? curX + width : curX, curY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
