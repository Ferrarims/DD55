export interface Render2DLightingProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  entities: any[];
  torches: { x: number; y: number }[];
  droppedLoot: any[];
  cameraX: number;
  cameraY: number;
  cols: number;
  rows: number;
  cellSize: number;
  isIndoorEnv: boolean;
  activeRevelation?: string;
  heroHasBlindFighting: () => boolean;
  getHeroLightRadiusInCells: () => number;
}

export function render2DLighting({
  ctx,
  canvas,
  entities,
  torches,
  droppedLoot,
  cameraX,
  cameraY,
  cols,
  rows,
  cellSize,
  isIndoorEnv,
  activeRevelation,
  heroHasBlindFighting,
  getHeroLightRadiusInCells
}: Render2DLightingProps): void {
  const activeLightRadiusInCells = getHeroLightRadiusInCells();
  const activeLightRadius = cellSize * activeLightRadiusInCells;
  const hasActiveLightSource = activeLightRadiusInCells > 0;

  const heroEntity = entities.find(e => e.type === 'hero' && !e.isDead);

  // 1. Criar máscara de saturação (Preto e Branco para visão no escuro)
  const desatCanvas = document.createElement('canvas');
  desatCanvas.width = canvas.width;
  desatCanvas.height = canvas.height;
  const dctx = desatCanvas.getContext('2d');
  if (dctx) {
    dctx.fillStyle = 'rgba(128, 128, 128, 1)';
    dctx.fillRect(0, 0, desatCanvas.width, desatCanvas.height);
    dctx.globalCompositeOperation = 'destination-out';

    // Tocha/Lanterna EQUIPADA do herói
    if (heroEntity && hasActiveLightSource) {
      const hc = heroEntity.x - cameraX;
      const hr = heroEntity.y - cameraY;
      const hx = hc * cellSize + cellSize / 2;
      const hy = hr * cellSize + cellSize / 2;
      const grad = dctx.createRadialGradient(hx, hy, 0, hx, hy, activeLightRadius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dctx.fillStyle = grad;
      dctx.beginPath();
      dctx.arc(hx, hy, activeLightRadius, 0, Math.PI * 2);
      dctx.fill();
    }

    // Tochas na parede
    torches.forEach(t => {
      const c = t.x - cameraX;
      const r = t.y - cameraY;
      if (c >= 0 && c < cols && r >= 0 && r < rows) {
        const dx = c * cellSize + cellSize / 2;
        const dy = r * cellSize + cellSize / 2;
        const radius = cellSize * 4.0;
        const grad = dctx.createRadialGradient(dx, dy, 0, dx, dy, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        dctx.fillStyle = grad;
        dctx.beginPath();
        dctx.arc(dx, dy, radius, 0, Math.PI * 2);
        dctx.fill();
      }
    });

    // Drops com brilho de iluminação se forem fontes de iluminação ativas
    droppedLoot.forEach(drop => {
      const itemName = (drop.item?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const isLightSource = drop.item?.isLightSource || itemName.includes('tocha') || itemName.includes('lanterna') || itemName.includes('facho') || itemName.includes('lampada') || itemName.includes('vela');
      
      if (isLightSource) {
        const c = drop.x - cameraX;
        const r = drop.y - cameraY;
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          const dx = c * cellSize + cellSize / 2;
          const dy = r * cellSize + cellSize / 2;
          const radius = cellSize * 3.0;
          
          const grad = dctx.createRadialGradient(dx, dy, 0, dx, dy, radius);
          grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          dctx.fillStyle = grad;
          dctx.beginPath();
          dctx.arc(dx, dy, radius, 0, Math.PI * 2);
          dctx.fill();
        }
      }
    });

    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.drawImage(desatCanvas, 0, 0);
    ctx.restore();
  }

  // 2. Criar máscara de sombra / escuridão
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const mctx = maskCanvas.getContext('2d');

  if (mctx) {
    mctx.fillStyle = isIndoorEnv ? 'rgba(5, 7, 18, 0.92)' : 'rgba(7, 9, 24, 0.85)';
    mctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    mctx.globalCompositeOperation = 'destination-out';

    // Luz e Visão do Herói
    if (heroEntity) {
      const c = heroEntity.x - cameraX;
      const r = heroEntity.y - cameraY;
      const hx = c * cellSize + cellSize / 2;
      const hy = r * cellSize + cellSize / 2;

      const darkvisionRadius = heroEntity.hasDarkvision 
        ? cellSize * ((heroEntity.darkvisionRange || 18) / 1.5)
        : 0;

      const blindFightingRadius = heroHasBlindFighting() ? cellSize * 2.0 : 0;
      const radius = Math.max(darkvisionRadius, activeLightRadius, blindFightingRadius);

      if (radius > 0) {
        const grad = mctx.createRadialGradient(hx, hy, 0, hx, hy, radius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        mctx.fillStyle = grad;
        mctx.beginPath();
        mctx.arc(hx, hy, radius, 0, Math.PI * 2);
        mctx.fill();
      }
    }

    // Luz das Tochas de parede
    torches.forEach(t => {
      const c = t.x - cameraX;
      const r = t.y - cameraY;
      if (c < 0 || c >= cols || r < 0 || r >= rows) return;
      const tx = c * cellSize + cellSize / 2;
      const ty = r * cellSize + cellSize / 2;
      const flicker = Math.sin(Date.now() / 250) * 0.08;
      const radius = cellSize * (4.0 + flicker);

      const grad = mctx.createRadialGradient(tx, ty, 0, tx, ty, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      mctx.fillStyle = grad;
      mctx.beginPath();
      mctx.arc(tx, ty, radius, 0, Math.PI * 2);
      mctx.fill();
    });

    ctx.drawImage(maskCanvas, 0, 0);

    // 3. Adicionar brilho quente (overlay de cor)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    torches.forEach(t => {
      const c = t.x - cameraX;
      const r = t.y - cameraY;
      if (c < 0 || c >= cols || r < 0 || r >= rows) return;
      const tx = c * cellSize + cellSize / 2;
      const ty = r * cellSize + cellSize / 2;
      const flicker = Math.sin(Date.now() / 250) * 0.08;
      const radius = cellSize * (3.8 + flicker);

      const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, radius);
      grad.addColorStop(0, 'rgba(245, 120, 10, 0.35)');
      grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tx, ty, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (heroEntity) {
      const c = heroEntity.x - cameraX;
      const r = heroEntity.y - cameraY;
      const hx = c * cellSize + cellSize / 2;
      const hy = r * cellSize + cellSize / 2;

      if (activeRevelation === 'Consumo Radiante') {
        const auraRadius = cellSize * 4.0;
        const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, auraRadius);
        grad.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        grad.addColorStop(0.5, 'rgba(255, 255, 150, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(hx, hy, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (hasActiveLightSource) {
        const gradWarm = ctx.createRadialGradient(hx, hy, 0, hx, hy, activeLightRadius);
        gradWarm.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
        gradWarm.addColorStop(0.5, 'rgba(245, 158, 11, 0.10)');
        gradWarm.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradWarm;
        ctx.beginPath();
        ctx.arc(hx, hy, activeLightRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
