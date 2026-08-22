import { BiomeType } from '../types';

/**
 * Renderizador de efeitos atmosféricos (Vento, Tempestade com Relâmpagos e Neblina).
 */

export function drawWindOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isNightBool: boolean,
  biome: BiomeType,
  timeMs: number
) {
  const gustCount = 12;
  ctx.strokeStyle = isNightBool ? 'rgba(203, 213, 225, 0.25)' : 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.8;

  for (let i = 0; i < gustCount; i++) {
    const gustCycle = (timeMs * 0.0006 + i * 0.16) % 1;
    const startX = gustCycle * (width + 300) - 200;
    const startY = ((i * 389 + 50) % (height - 80)) + Math.sin(timeMs * 0.003 + i) * 15;
    const gustLen = 90 + (i % 4) * 40;

    ctx.save();
    ctx.globalAlpha = Math.sin(gustCycle * Math.PI) * 0.8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + gustLen * 0.35, startY - 8,
      startX + gustLen * 0.7, startY + 8,
      startX + gustLen, startY
    );
    ctx.stroke();
    ctx.restore();
  }

  const leafCount = 36;
  for (let i = 0; i < leafCount; i++) {
    const leafCycle = (timeMs * 0.0008 * (1 + (i % 4) * 0.2) + i * 0.1) % 1;
    const lx = leafCycle * (width + 200) - 100;
    const ly = ((i * 547 + 73) % height) + Math.sin(timeMs * 0.004 + i) * 25;
    const rot = timeMs * 0.006 + i * 1.5;

    let leafColor = '#84cc16';
    if (biome === 'Deserto') leafColor = '#f59e0b';
    else if (biome === 'Pântano') leafColor = '#0d9488';
    else if (i % 3 === 0) leafColor = '#eab308';
    else if (i % 3 === 1) leafColor = '#f97316';

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.fillStyle = leafColor;
    ctx.globalAlpha = 0.85;

    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawStormOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isNightBool: boolean,
  is3dMode: boolean,
  timeMs: number
) {
  ctx.fillStyle = isNightBool ? 'rgba(2, 6, 23, 0.42)' : 'rgba(15, 23, 42, 0.28)';
  ctx.fillRect(0, 0, width, height);

  const heavyRainCount = is3dMode ? 240 : 180;
  const slantX = 0.45;
  const dropSpeed = 1.15;
  const dropLen = is3dMode ? 26 : 20;

  ctx.strokeStyle = isNightBool ? 'rgba(199, 210, 254, 0.55)' : 'rgba(165, 180, 252, 0.75)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();

  for (let i = 0; i < heavyRainCount; i++) {
    const seedX = (i * 797 + 91) % width;
    const seedY = (i * 521 + 317) % height;
    const speedMult = 0.9 + (i % 4) * 0.15;

    const curY = (seedY + timeMs * dropSpeed * speedMult) % (height + 50) - 25;
    const curX = (seedX + curY * slantX) % width;

    ctx.moveTo(curX, curY);
    ctx.lineTo(curX + dropLen * slantX, curY + dropLen);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(224, 231, 255, 0.3)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 8; i++) {
    const windCycle = (timeMs * 0.001 + i * 0.22) % 1;
    const wx = windCycle * (width + 300) - 150;
    const wy = (i * 613) % height;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 120, wy + 15);
    ctx.stroke();
  }

  const cyclePeriod = 5500;
  const cycleTime = timeMs % cyclePeriod;
  const isLightningActive = cycleTime < 320;

  if (isLightningActive) {
    const flashStage = cycleTime / 320;
    let flashIntensity = 0;
    if (flashStage < 0.2) {
      flashIntensity = flashStage / 0.2;
    } else if (flashStage < 0.45) {
      flashIntensity = 1.0;
    } else {
      flashIntensity = 1.0 - (flashStage - 0.45) / 0.55;
    }

    ctx.save();
    ctx.fillStyle = `rgba(240, 249, 255, ${0.55 * flashIntensity})`;
    ctx.fillRect(0, 0, width, height);

    const boltStartX = (width * 0.3) + ((Math.floor(timeMs / cyclePeriod) * 317) % (width * 0.45));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(boltStartX, 0);

    let curBx = boltStartX;
    let curBy = 0;
    const segments = 10;
    const segHeight = (height * 0.7) / segments;

    for (let s = 1; s <= segments; s++) {
      const segProgress = s / segments;
      if (segProgress > flashStage * 1.5) break;

      const jitter = (Math.sin(s * 17 + timeMs * 0.05) * 28);
      curBx += jitter;
      curBy += segHeight;
      ctx.lineTo(curBx, curBy);

      if (s === 4 || s === 7) {
        ctx.moveTo(curBx, curBy);
        ctx.lineTo(curBx + jitter * 1.5, curBy + segHeight * 0.8);
        ctx.moveTo(curBx, curBy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}

export function drawFogOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isNightBool: boolean,
  timeMs: number
) {
  const fogBankCount = 8;
  const fogSpeed = 0.015;

  for (let i = 0; i < fogBankCount; i++) {
    const bankCycle = (timeMs * fogSpeed * 0.001 + i * 0.28) % 1;
    const cx = bankCycle * (width + 600) - 300;
    const cy = ((i * 431 + 80) % height) + Math.sin(timeMs * 0.001 + i) * 20;
    const radiusX = 220 + (i % 4) * 60;
    const radiusY = 130 + (i % 3) * 40;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusX);
    const alphaCenter = isNightBool ? 0.28 : 0.35;
    grad.addColorStop(0, `rgba(226, 232, 240, ${alphaCenter})`);
    grad.addColorStop(0.55, `rgba(203, 213, 225, ${alphaCenter * 0.45})`);
    grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const fogVignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.35,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  fogVignette.addColorStop(0, 'rgba(203, 213, 225, 0)');
  fogVignette.addColorStop(1, isNightBool ? 'rgba(15, 23, 42, 0.45)' : 'rgba(226, 232, 240, 0.45)');
  ctx.fillStyle = fogVignette;
  ctx.fillRect(0, 0, width, height);
}
