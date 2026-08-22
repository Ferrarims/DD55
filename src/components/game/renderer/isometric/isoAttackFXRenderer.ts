import { toIsometric } from '../isometricMath';

interface RenderIsoAttackFXProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  activeEffects: any[];
  entities: any[];
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
  getDamageTypeColor: (type: string) => any;
}

export function renderIsoAttackFX({
  ctx,
  canvas,
  activeEffects,
  entities,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
  getDamageTypeColor,
}: RenderIsoAttackFXProps): void {
  activeEffects.forEach(eff => {
    const { x: ax, y: rawAy } = toIsometric(
      eff.startX,
      eff.startY,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    let ay = rawAy + isoTileH * 0.2;

    const { x: dx, y: rawDy } = toIsometric(
      eff.endX,
      eff.endY,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    let dy = rawDy + isoTileH * 0.2;

    // Ajustar elevação caso o atacante ou defensor esteja voando (3m de altura)
    const attackerEnt = entities.find(e => !e.isDead && e.x === eff.startX && e.y === eff.startY);
    if (attackerEnt?.conditions?.includes('Voando')) {
      ay -= isoTileH * 1.5;
    }
    const defenderEnt = entities.find(e => !e.isDead && e.x === eff.endX && e.y === eff.endY);
    if (defenderEnt?.conditions?.includes('Voando')) {
      dy -= isoTileH * 1.5;
    }

    if (eff.type === 'melee') {
      const angle = Math.atan2(dy - ay, dx - ax);
      ctx.save();
      ctx.globalAlpha = 1 - eff.progress;

      const radius = isoTileW * 0.55;
      const startAngle = angle - Math.PI / 3 - (eff.progress * Math.PI / 4);
      const endAngle = angle + Math.PI / 3 + (eff.progress * Math.PI / 4);
      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(1, 0.55);

      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.strokeStyle = eff.hit ? '#f59e0b' : '#94a3b8';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 16;
      ctx.shadowColor = eff.hit ? '#f59e0b' : '#64748b';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle + 0.1, endAngle - 0.1);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      if (eff.hit) {
        const numSparks = 8;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < numSparks; i++) {
          const sparkAngle = angle + (i - numSparks / 2) * (Math.PI / 5);
          const startDist = isoTileW * 0.1 * eff.progress;
          const endDist = isoTileW * 0.7 * eff.progress;
          ctx.beginPath();
          ctx.moveTo(dx + Math.cos(sparkAngle) * startDist, dy + Math.sin(sparkAngle) * startDist * 0.55);
          ctx.lineTo(dx + Math.cos(sparkAngle) * endDist, dy + Math.sin(sparkAngle) * endDist * 0.55);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (eff.type === 'ranged') {
      const px = ax + (dx - ax) * eff.progress;
      const arcHeight = Math.sin(eff.progress * Math.PI) * (isoTileH * 1.8);
      const py = ay + (dy - ay) * eff.progress - arcHeight;

      const angle = Math.atan2((dy - arcHeight) - ay, dx - ax);

      ctx.save();
      const trailLength = isoTileW * 0.6;
      const tx = px - Math.cos(angle) * trailLength;
      const ty = py - Math.sin(angle) * trailLength;

      const grad = ctx.createLinearGradient(tx, ty, px, py);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0.9)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.translate(px, py);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(-isoTileW * 0.2, 0);
      ctx.lineTo(isoTileW * 0.2, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(isoTileW * 0.1, -isoTileH * 0.12);
      ctx.lineTo(isoTileW * 0.22, 0);
      ctx.lineTo(isoTileW * 0.1, isoTileH * 0.12);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      ctx.restore();

      if (eff.progress > 0.75) {
        ctx.save();
        const impactProgress = (eff.progress - 0.75) / 0.25;
        ctx.globalAlpha = 1 - impactProgress;
        ctx.beginPath();
        ctx.ellipse(dx, dy, isoTileW * 0.45 * impactProgress, isoTileH * 0.3 * impactProgress, 0, 0, Math.PI * 2);
        ctx.strokeStyle = eff.hit ? '#f59e0b' : '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    } else if (eff.type === 'breath_cone') {
      const angle = Math.atan2(dy - ay, dx - ax);
      const colors = getDamageTypeColor(eff.damageType);
      const maxRadius = isoTileW * 3.8;
      const currentRadius = maxRadius * Math.min(1, eff.progress * 1.25);
      const alpha = 1 - Math.pow(eff.progress, 1.8);
      const coneSpread = Math.PI / 3;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);

      ctx.translate(ax, ay);
      ctx.scale(1, 0.55);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, currentRadius, angle - coneSpread / 2, angle + coneSpread / 2);
      ctx.closePath();

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
      grad.addColorStop(0, colors.primary);
      grad.addColorStop(0.65, colors.secondary);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors.glow;
      ctx.stroke();

      const particleCount = 22;
      ctx.fillStyle = colors.particle;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = angle + (Math.sin(i * 13 + eff.progress * 12) * (coneSpread / 2));
        const pDist = currentRadius * (0.12 + (i / particleCount) * 0.88);
        const px = Math.cos(pAngle) * pDist;
        const py = Math.sin(pAngle) * pDist;
        const pSize = (1 - eff.progress) * (4 + (i % 4) * 3);

        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if (eff.type === 'breath_line') {
      const angle = Math.atan2(dy - ay, dx - ax);
      const colors = getDamageTypeColor(eff.damageType);
      const maxLen = isoTileW * 6.5;
      const currentLen = maxLen * Math.min(1, eff.progress * 1.3);
      const alpha = 1 - Math.pow(eff.progress, 1.8);
      const lineWidth = isoTileH * 0.9;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);

      const endPx = ax + Math.cos(angle) * currentLen;
      const endPy = ay + Math.sin(angle) * currentLen;

      const grad = ctx.createLinearGradient(ax, ay, endPx, endPy);
      grad.addColorStop(0, colors.secondary);
      grad.addColorStop(0.7, colors.primary);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(endPx, endPy);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 24;
      ctx.shadowColor = colors.glow;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(endPx, endPy);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 0.38;
      ctx.stroke();

      const particleCount = 18;
      ctx.fillStyle = colors.particle;
      for (let i = 0; i < particleCount; i++) {
        const pDist = currentLen * (i / particleCount);
        const offset = Math.sin(i * 9 + eff.progress * 16) * (lineWidth * 0.45);
        const px = ax + Math.cos(angle) * pDist - Math.sin(angle) * offset;
        const py = ay + Math.sin(angle) * pDist + Math.cos(angle) * offset;
        const pSize = (1 - eff.progress) * (3.5 + (i % 3) * 3);

        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  });
}
