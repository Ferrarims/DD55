export function draw2DBrickWall(
  ctx: CanvasRenderingContext2D,
  screenOrigX: number,
  screenOrigY: number,
  totalW: number,
  totalH: number
): void {
  const pad = 2;
  const wallX = screenOrigX + pad;
  const wallY = screenOrigY + pad;
  const wallW = totalW - pad * 2;
  const wallH = totalH - pad * 2;

  // Sombra projetada
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(wallX + 4, wallY + 4, wallW, wallH, 0);
  ctx.fill();

  // Bloco base
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(wallX, wallY, wallW, wallH, 0);
  ctx.fill();

  // Topo da muralha
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(wallX + 2, wallY + 2, wallW - 4, wallH - 4, 0);
  ctx.fill();
  
  // Grid de tijolos
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let ty = wallY + 6; ty < wallY + wallH; ty += 8) {
    ctx.beginPath();
    ctx.moveTo(wallX, ty);
    ctx.lineTo(wallX + wallW, ty);
    ctx.stroke();
  }
}

export function draw2DSandstoneMesa(
  ctx: CanvasRenderingContext2D,
  screenOrigX: number,
  screenOrigY: number,
  totalW: number,
  totalH: number,
  cellSize: number,
  centerX: number,
  centerY: number
): void {
  const pad = 4;
  const mesaX = screenOrigX + pad;
  const mesaY = screenOrigY + pad;
  const mesaW = totalW - pad * 2;
  const mesaH = totalH - pad * 2;

  // 1. Sombra projetada no solo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(mesaX + 5, mesaY + 6, mesaW, mesaH, 8);
  ctx.fill();

  // 2. Base da Formação de Arenito
  const baseGrad = ctx.createLinearGradient(mesaX, mesaY, mesaX + mesaW, mesaY + mesaH);
  baseGrad.addColorStop(0, '#92400e');
  baseGrad.addColorStop(0.5, '#78350f');
  baseGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.roundRect(mesaX, mesaY, mesaW, mesaH, 8);
  ctx.fill();
  ctx.strokeStyle = '#291102';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Estrato de relevo intermediário
  const midPad = Math.max(5, cellSize * 0.15);
  const midGrad = ctx.createLinearGradient(mesaX + midPad, mesaY + midPad, mesaX + mesaW - midPad, mesaY + mesaH - midPad);
  midGrad.addColorStop(0, '#b45309');
  midGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.roundRect(mesaX + midPad, mesaY + midPad, mesaW - midPad * 2, mesaH - midPad * 2, 6);
  ctx.fill();

  // 4. Platô Superior Elevado Dourado
  const innerPad = Math.max(9, cellSize * 0.28);
  const topGrad = ctx.createLinearGradient(mesaX + innerPad, mesaY + innerPad, mesaX + mesaW - innerPad, mesaY + mesaH - innerPad);
  topGrad.addColorStop(0, '#fbbf24');
  topGrad.addColorStop(0.6, '#f59e0b');
  topGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.roundRect(mesaX + innerPad, mesaY + innerPad, mesaW - innerPad * 2, mesaH - innerPad * 2, 4);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Textura sutil de fendas de arenito no platô
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(centerX - mesaW * 0.18, centerY - mesaH * 0.1);
  ctx.lineTo(centerX - mesaW * 0.05, centerY);
  ctx.lineTo(centerX + mesaW * 0.15, centerY - mesaH * 0.05);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - mesaW * 0.1, centerY + mesaH * 0.12);
  ctx.lineTo(centerX + mesaW * 0.12, centerY + mesaH * 0.15);
  ctx.stroke();
}
