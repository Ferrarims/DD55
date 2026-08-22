import { draw2DCactus } from '../../drawHelpers';

interface Draw1x1ObstacleParams {
  ctx: CanvasRenderingContext2D;
  origObsType: string;
  origVariant: string;
  centerX: number;
  centerY: number;
  obsRadius: number;
  isIndoorEnv: boolean;
  weather: string;
  biome: string;
}

export function draw2D1x1Obstacle({
  ctx,
  origObsType,
  origVariant,
  centerX,
  centerY,
  obsRadius,
  isIndoorEnv,
  weather,
  biome,
}: Draw1x1ObstacleParams): void {
  if (origObsType === 'rock') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 3, obsRadius * 0.9, obsRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    const rGrad = ctx.createLinearGradient(centerX - obsRadius, centerY - obsRadius, centerX + obsRadius, centerY + obsRadius);
    rGrad.addColorStop(0, '#64748b');
    rGrad.addColorStop(0.6, '#475569');
    rGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, obsRadius * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#ffffff' : 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX - obsRadius * 0.25, centerY - obsRadius * 0.25, obsRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (origObsType === 'tree') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 3, obsRadius, obsRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    const tGrad = ctx.createRadialGradient(centerX - obsRadius * 0.2, centerY - obsRadius * 0.2, 2, centerX, centerY, obsRadius);
    if (origVariant === 'pine_tree') {
      tGrad.addColorStop(0, '#22c55e');
      tGrad.addColorStop(0.7, '#15803d');
      tGrad.addColorStop(1, '#064e3b');
    } else {
      tGrad.addColorStop(0, '#4ade80');
      tGrad.addColorStop(0.6, '#16a34a');
      tGrad.addColorStop(1, '#14532d');
    }
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, obsRadius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (!isIndoorEnv && weather === 'snow') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - obsRadius * 0.2, centerY - obsRadius * 0.25, obsRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (origObsType === 'cactus') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 3, obsRadius * 0.8, obsRadius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(centerX - 4, centerY - obsRadius * 0.85, 8, obsRadius * 1.7, 3);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(centerX - 9, centerY - 2, 6, 4, 1.5);
    ctx.roundRect(centerX - 9, centerY - 7, 4, 6, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(centerX + 3, centerY + 1, 6, 4, 1.5);
    ctx.roundRect(centerX + 5, centerY - 4, 4, 6, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(centerX, centerY - obsRadius * 0.85, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (biome === 'Masmorra' && origObsType === 'pillar') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 3, obsRadius, obsRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    const pGrad = ctx.createRadialGradient(centerX - 3, centerY - 3, 2, centerX, centerY, obsRadius);
    pGrad.addColorStop(0, '#94a3b8');
    pGrad.addColorStop(0.5, '#64748b');
    pGrad.addColorStop(1, '#334155');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, obsRadius * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (biome === 'Masmorra' && origObsType === 'cell_bars') {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let bar = -obsRadius * 0.7; bar <= obsRadius * 0.7; bar += 6) {
      ctx.beginPath();
      ctx.moveTo(centerX + bar, centerY - obsRadius * 0.8);
      ctx.lineTo(centerX + bar, centerY + obsRadius * 0.8);
      ctx.stroke();
    }
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - obsRadius * 0.8, centerY);
    ctx.lineTo(centerX + obsRadius * 0.8, centerY);
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY + 3, obsRadius, obsRadius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(centerX, centerY, obsRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
