import { toIsometric } from '../isometricMath';

interface RenderIsoLightingFXProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  entities: any[];
  torches: any[];
  droppedLoot: any[];
  restPoints: any[];
  isIndoorEnv: boolean;
  isNightOrDarkEnv: boolean;
  nightProgress: number;
  heroHasBlindFighting: () => boolean;
  getHeroLightRadiusInCells: () => number;
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
}

export function renderIsoLightingFX({
  ctx,
  canvas,
  entities,
  torches,
  droppedLoot,
  restPoints,
  isIndoorEnv,
  isNightOrDarkEnv,
  nightProgress,
  heroHasBlindFighting,
  getHeroLightRadiusInCells,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
}: RenderIsoLightingFXProps): void {
  const isDarkEnv3D = isNightOrDarkEnv;
  if (!isDarkEnv3D && nightProgress <= 0.02) return;

  const heroEntity = entities.find(e => e.type === 'hero' && !e.isDead);
  const activeLightRadiusInCells = getHeroLightRadiusInCells();
  const hasActiveLightSource = activeLightRadiusInCells > 0;
  const heroIsFlying = Boolean(heroEntity?.conditions?.includes('Voando'));

  const drawIsoLightCutout = (ctxTarget: CanvasRenderingContext2D, mapX: number, mapY: number, radiusCells: number, isFlying: boolean = false) => {
    const { x: isoX, y: rawIsoY } = toIsometric(
      mapX,
      mapY,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    let isoY = rawIsoY;
    if (isFlying) {
      isoY -= isoTileH * 1.5;
    }

    const rx = Math.max(isoTileW * 1.2, radiusCells * (isoTileW / 1.65));

    ctxTarget.save();
    ctxTarget.translate(isoX, isoY);
    ctxTarget.scale(1, 0.55);

    const grad = ctxTarget.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctxTarget.fillStyle = grad;
    ctxTarget.beginPath();
    ctxTarget.arc(0, 0, rx, 0, Math.PI * 2);
    ctxTarget.fill();
    ctxTarget.restore();
  };

  // 1. Criar máscara de saturação (Preto e Branco para visão no escuro)
  const desatCanvas = document.createElement('canvas');
  desatCanvas.width = canvas.width;
  desatCanvas.height = canvas.height;
  const dctx = desatCanvas.getContext('2d');

  if (dctx) {
    dctx.fillStyle = 'rgba(128, 128, 128, 1)';
    dctx.fillRect(0, 0, desatCanvas.width, desatCanvas.height);
    dctx.globalCompositeOperation = 'destination-out';

    if (heroEntity && hasActiveLightSource) {
      drawIsoLightCutout(dctx, heroEntity.x, heroEntity.y, activeLightRadiusInCells, heroIsFlying);
    }

    torches.forEach(t => {
      drawIsoLightCutout(dctx, t.x, t.y, 4.0, false);
    });

    droppedLoot.forEach(drop => {
      const itemName = (drop.item?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const isLightSource = drop.item?.isLightSource || itemName.includes('tocha') || itemName.includes('lanterna') || itemName.includes('facho') || itemName.includes('lampada') || itemName.includes('vela');
      if (isLightSource) {
        drawIsoLightCutout(dctx, drop.x, drop.y, 3.0, false);
      }
    });

    restPoints.forEach(rp => {
      if (!rp.isUsed) {
        const size = rp.size || 2;
        const centerX = rp.x + (size - 1) / 2;
        const centerY = rp.y + (size - 1) / 2;
        drawIsoLightCutout(dctx, centerX, centerY, 4.5, false);
      }
    });

    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.drawImage(desatCanvas, 0, 0);
    ctx.restore();
  }

  // 2. Máscara de escuridão / sombra profunda
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const mctx = maskCanvas.getContext('2d');

  if (mctx) {
    const baseDarkAlpha = isIndoorEnv ? 0.93 : 0.82;
    const darkAlpha = isIndoorEnv ? baseDarkAlpha : baseDarkAlpha * nightProgress;
    mctx.fillStyle = isIndoorEnv ? `rgba(2, 4, 12, ${darkAlpha})` : `rgba(5, 8, 22, ${darkAlpha})`;
    mctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    mctx.globalCompositeOperation = 'destination-out';

    if (heroEntity) {
      const darkvisionCells = heroEntity.hasDarkvision ? ((heroEntity.darkvisionRange || 18) / 1.5) : 0;
      const blindFightingCells = heroHasBlindFighting() ? 2.0 : 0;
      const totalVisionCells = Math.max(darkvisionCells, activeLightRadiusInCells, blindFightingCells);

      if (totalVisionCells > 0) {
        drawIsoLightCutout(mctx, heroEntity.x, heroEntity.y, totalVisionCells, heroIsFlying);
      }
    }

    torches.forEach(t => {
      drawIsoLightCutout(mctx, t.x, t.y, 4.0, false);
    });

    droppedLoot.forEach(drop => {
      const itemName = (drop.item?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const isLightSource = drop.item?.isLightSource || itemName.includes('tocha') || itemName.includes('lanterna') || itemName.includes('facho') || itemName.includes('lampada') || itemName.includes('vela');
      if (isLightSource) {
        drawIsoLightCutout(mctx, drop.x, drop.y, 3.0, false);
      }
    });

    restPoints.forEach(rp => {
      const size = rp.size || 2;
      const centerX = rp.x + (size - 1) / 2;
      const centerY = rp.y + (size - 1) / 2;
      drawIsoLightCutout(mctx, centerX, centerY, rp.isUsed ? 1.5 : 4.5, false);
    });

    ctx.drawImage(maskCanvas, 0, 0);
  }

  // 3. Camada de brilho e aura de luz dinâmica isométrica
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const drawIsoLightGlow = (mapX: number, mapY: number, radiusCells: number, colorCenter: string, colorEdge: string, isFlying: boolean = false) => {
    const { x: isoX, y: rawIsoY } = toIsometric(
      mapX,
      mapY,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    let isoY = rawIsoY;
    if (isFlying) {
      isoY -= isoTileH * 1.5;
    }

    const rx = Math.max(isoTileW * 1.2, radiusCells * (isoTileW / 1.65));

    ctx.save();
    ctx.translate(isoX, isoY);
    ctx.scale(1, 0.55);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, colorCenter);
    grad.addColorStop(0.65, colorEdge);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (heroEntity && hasActiveLightSource) {
    drawIsoLightGlow(heroEntity.x, heroEntity.y, activeLightRadiusInCells, 'rgba(251, 191, 36, 0.45)', 'rgba(245, 158, 11, 0.15)', heroIsFlying);
  }

  torches.forEach(t => {
    drawIsoLightGlow(t.x, t.y, 4.0, 'rgba(249, 115, 22, 0.55)', 'rgba(234, 88, 12, 0.2)', false);
  });

  restPoints.forEach(rp => {
    if (!rp.isUsed) {
      const size = rp.size || 2;
      const centerX = rp.x + (size - 1) / 2;
      const centerY = rp.y + (size - 1) / 2;
      drawIsoLightGlow(centerX, centerY, 4.5, 'rgba(245, 158, 11, 0.5)', 'rgba(217, 119, 6, 0.15)', false);
    }
  });

  ctx.restore();
}
