/**
 * Funções utilitárias de desenho de objetos e magias 2D (Hazards/Armadilhas, Powerups, Teleporte).
 */

export function drawHazard2D(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellSize: number,
  hazard: { name: string; icon: string; isTriggered?: boolean }
): void {
  ctx.beginPath();
  ctx.arc(px, py, cellSize * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = hazard.isTriggered ? 'rgba(100, 116, 139, 0.12)' : 'rgba(239, 68, 68, 0.08)';
  ctx.strokeStyle = hazard.isTriggered ? 'rgba(100, 116, 139, 0.3)' : 'rgba(239, 68, 68, 0.25)';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  ctx.font = `${cellSize * 0.45}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hazard.isTriggered ? '💥' : hazard.icon, px, py);

  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = hazard.isTriggered ? '#64748b' : '#ef4444';
  ctx.fillText(hazard.isTriggered ? 'DESATIVADA' : hazard.name.toUpperCase().substring(0, 8), px, py + cellSize * 0.35);
}

export function drawPowerup2D(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellSize: number,
  pw: { icon: string; color: string }
): void {
  ctx.beginPath();
  ctx.arc(px, py, cellSize * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${pw.color}, 0.15)`;
  ctx.strokeStyle = `rgba(${pw.color}, 0.5)`;
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();

  ctx.font = `${cellSize * 0.48}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pw.icon, px, py - 1);
}

export function drawTeleportRange(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  cellSize: number
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(hx, hy, cellSize * 6.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
  ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.fill();
  ctx.stroke();

  const pulse = Math.sin(Date.now() / 150) * 0.05 + 1.0;
  ctx.beginPath();
  ctx.arc(hx, hy, cellSize * 6.5 * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
