interface DrawDifficultTerrainParams {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  centerY: number;
  biome: string;
  weather: string;
  isNight: boolean;
  isIndoorEnv: boolean;
}

export function draw2DDifficultTerrain({
  ctx,
  centerX,
  centerY,
  biome,
  weather,
  isNight,
  isIndoorEnv,
}: DrawDifficultTerrainParams): void {
  if (!isIndoorEnv && weather === 'snow') {
    ctx.strokeStyle = isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY); ctx.lineTo(centerX + 4, centerY);
    ctx.moveTo(centerX, centerY - 4); ctx.lineTo(centerX, centerY + 4);
    ctx.moveTo(centerX - 2.5, centerY - 2.5); ctx.lineTo(centerX + 2.5, centerY + 2.5);
    ctx.moveTo(centerX - 2.5, centerY + 2.5); ctx.lineTo(centerX + 2.5, centerY - 2.5);
    ctx.stroke();
  } else if (biome === 'Floresta') {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (biome === 'Deserto') {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.quadraticCurveTo(centerX, centerY - 2, centerX + 5, centerY);
    ctx.stroke();
  } else if (biome === 'Pântano') {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (biome === 'Masmorra') {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 3, centerY - 3); ctx.lineTo(centerX + 3, centerY + 3);
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
