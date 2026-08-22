interface IsoDungeonRenderParams {
  ctx: CanvasRenderingContext2D;
  objIsoX: number;
  objTopY: number;
  isoTileW: number;
  isoTileH: number;
  scale: number;
  variant: string;
  w: number;
  h: number;
}

export function drawIsoPillarOrAltar({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
  scale,
  variant,
  w,
  h,
}: IsoDungeonRenderParams): void {
  const isGrandAltar = w >= 2 || h >= 2 || variant.includes('altar') || variant.includes('grand');
  const pillarScale = scale;
  const baseY = objTopY + isoTileH * 0.55;
  const pillarH = isoTileH * (isGrandAltar ? 2.5 : 2.2) * (pillarScale / (isGrandAltar ? 1.8 : 1));
  const colR = isoTileW * (isGrandAltar ? 0.26 : 0.16) * (pillarScale / (isGrandAltar ? 1.8 : 1));
  const colW = colR * 2;
  const topPillarY = baseY - pillarH;

  // Sombra Projetada
  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY + 2, isoTileW * (isGrandAltar ? 0.75 : 0.35), isoTileH * (isGrandAltar ? 0.42 : 0.2), 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();

  // Pedestal em Camadas
  const baseW1 = isoTileW * (isGrandAltar ? 0.65 : 0.32);
  const baseH1 = isoTileH * (isGrandAltar ? 0.4 : 0.25);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY, baseW1, baseH1 * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY - baseH1 * 0.4, baseW1, baseH1 * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.ellipse(objIsoX, baseY - baseH1 * 0.5, baseW1 * 0.9, baseH1 * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coluna
  const shaftBottomY = baseY - baseH1 * 0.5;
  const shaftTopY = topPillarY + isoTileH * 0.25;
  const shaftH = shaftBottomY - shaftTopY;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(objIsoX - colR, shaftTopY, colW, shaftH);
  ctx.fillStyle = '#475569';
  ctx.fillRect(objIsoX - colR, shaftTopY, colW * 0.75, shaftH);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(objIsoX - colR, shaftTopY, colW * 0.45, shaftH);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(objIsoX - colR + 2, shaftTopY, colW * 0.18, shaftH);

  // Estrias da Coluna
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  [-0.6, -0.2, 0.2, 0.6].forEach(factor => {
    const grooveX = objIsoX + colR * factor;
    ctx.beginPath();
    ctx.moveTo(grooveX, shaftTopY);
    ctx.lineTo(grooveX, shaftBottomY);
    ctx.stroke();
  });

  // Capitel
  const capW = isoTileW * (isGrandAltar ? 0.68 : 0.34);
  const capH = isoTileH * (isGrandAltar ? 0.4 : 0.25);

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(objIsoX, topPillarY, capW, capH * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(objIsoX, topPillarY - 2, capW * 0.95, capH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Runa Mística Arcana
  ctx.strokeStyle = isGrandAltar ? '#a855f7' : '#38bdf8';
  ctx.shadowColor = isGrandAltar ? '#9333ea' : '#0284c7';
  ctx.shadowBlur = isGrandAltar ? 8 : 5;
  ctx.lineWidth = 1.5;
  const midY = shaftTopY + shaftH * 0.5;
  ctx.beginPath();
  ctx.arc(objIsoX, midY - 10, isGrandAltar ? 6 : 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function drawIsoCellBars({
  ctx,
  objIsoX,
  objTopY,
  isoTileW,
  isoTileH,
}: IsoDungeonRenderParams): void {
  const barH = isoTileH * 1.4;
  const baseY = objTopY + isoTileH * 0.5;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  for (let b = -2; b <= 2; b++) {
    const bx = objIsoX + b * (isoTileW * 0.1);
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.lineTo(bx, baseY - barH);
    ctx.stroke();
  }
}
