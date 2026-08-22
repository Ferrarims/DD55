/**
 * Renderizadores de efeitos visuais de armas 2D (Corpo a Corpo e Projéteis à Distância).
 */

export function drawMeleeEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  hit?: boolean,
  cellSize: number = 40
): void {
  const angle = Math.atan2(dy - ay, dx - ax);

  ctx.save();
  ctx.globalAlpha = 1 - progress;

  // Desenhar arco de corte (Slash Arc) centralizado no defensor
  ctx.beginPath();
  const radius = cellSize * 0.45;
  const startAngle = angle - Math.PI / 3 - (progress * Math.PI / 4);
  const endAngle = angle + Math.PI / 3 + (progress * Math.PI / 4);
  ctx.arc(dx, dy, radius, startAngle, endAngle);
  ctx.strokeStyle = hit ? '#f59e0b' : '#94a3b8';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 12;
  ctx.shadowColor = hit ? '#f59e0b' : '#64748b';
  ctx.stroke();

  // Linha interna de brilho branco
  ctx.beginPath();
  ctx.arc(dx, dy, radius, startAngle + 0.1, endAngle - 0.1);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Linha reta de corte atravessando o alvo
  ctx.beginPath();
  ctx.moveTo(dx - Math.cos(angle - Math.PI / 2) * radius, dy - Math.sin(angle - Math.PI / 2) * radius);
  ctx.lineTo(dx + Math.cos(angle - Math.PI / 2) * radius, dy + Math.sin(angle - Math.PI / 2) * radius);
  ctx.strokeStyle = hit ? 'rgba(255, 255, 255, 0.9)' : 'rgba(200, 200, 200, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Faíscas de impacto
  if (hit) {
    const numSparks = 6;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (let i = 0; i < numSparks; i++) {
      const sparkAngle = angle + (i - numSparks / 2) * (Math.PI / 6);
      const startDist = cellSize * 0.1 * progress;
      const endDist = cellSize * 0.6 * progress;
      ctx.beginPath();
      ctx.moveTo(dx + Math.cos(sparkAngle) * startDist, dy + Math.sin(sparkAngle) * startDist);
      ctx.lineTo(dx + Math.cos(sparkAngle) * endDist, dy + Math.sin(sparkAngle) * endDist);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawRangedEffect(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  dx: number,
  dy: number,
  progress: number,
  hit?: boolean,
  cellSize: number = 40
): void {
  const px = ax + (dx - ax) * progress;
  const py = ay + (dy - ay) * progress;
  const angle = Math.atan2(dy - ay, dx - ax);

  ctx.save();

  // Rastro luminoso
  ctx.beginPath();
  const trailLength = cellSize * 0.5;
  const tx = px - Math.cos(angle) * trailLength;
  const ty = py - Math.sin(angle) * trailLength;

  const grad = ctx.createLinearGradient(tx, ty, px, py);
  grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
  grad.addColorStop(1, 'rgba(251, 191, 36, 0.85)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3.5;
  ctx.moveTo(tx, ty);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Flecha
  ctx.translate(px, py);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(cellSize * 0.22, 0);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cellSize * 0.12, -cellSize * 0.08);
  ctx.lineTo(cellSize * 0.22, 0);
  ctx.lineTo(cellSize * 0.12, cellSize * 0.08);
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(-cellSize * 0.27, -cellSize * 0.07);
  ctx.moveTo(-cellSize * 0.22, 0);
  ctx.lineTo(-cellSize * 0.27, cellSize * 0.07);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  if (progress > 0.75) {
    ctx.save();
    const impactProgress = (progress - 0.75) / 0.25;
    ctx.globalAlpha = 1 - impactProgress;

    ctx.beginPath();
    ctx.arc(dx, dy, cellSize * 0.35 * impactProgress, 0, Math.PI * 2);
    ctx.strokeStyle = hit ? '#f59e0b' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (hit) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      const numSparks = 4;
      for (let i = 0; i < numSparks; i++) {
        const sparkAngle = (i * Math.PI / 2) + (impactProgress * Math.PI / 4);
        const dist = cellSize * 0.4 * impactProgress;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + Math.cos(sparkAngle) * dist, dy + Math.sin(sparkAngle) * dist);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
