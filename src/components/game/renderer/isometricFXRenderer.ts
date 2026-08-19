import { drawWeatherOverlay } from '../../../game/weatherEffects';
import { toIsometric } from './isometricMath';
import { UseCanvasRendererProps } from './rendererTypes';

interface DrawIsometricFXProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
  isIndoorEnv: boolean;
  isNightOrDarkEnv: boolean;
}

export function drawIsometricFX({
  ctx,
  canvas,
  props,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
  isIndoorEnv,
  isNightOrDarkEnv,
}: DrawIsometricFXProps): void {
  const {
    entities,
    biome,
    isNight,
    weather,
    weatherTime,
    torches,
    activeEffects,
    floatingTexts,
    droppedLoot,
    restPoints,
    getDamageTypeColor,
    heroHasBlindFighting,
    nightProgress,
    getHeroLightRadiusInCells,
  } = props;

  // Renderizar Floating Texts em 3D
  floatingTexts.forEach(ft => {
    const { x: isoX, y: baseIsoY } = toIsometric(
      ft.x,
      ft.y,
      centerC,
      centerR,
      canvas.width,
      canvas.height,
      isoTileW,
      isoTileH
    );
    const isoY = baseIsoY - isoTileH * 0.5 - (ft.progress * isoTileH * 1.5);

    ctx.save();
    ctx.globalAlpha = 1 - Math.pow(ft.progress, 2);
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeText(ft.text, isoX, isoY);
    ctx.fillText(ft.text, isoX, isoY);
    ctx.restore();
  });

  // Renderizar Efeitos Visuais de Ataque em 3D (Melee, Ranged, Baforada Dracônica)
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
      // Ataque Corpo a Corpo 3D (Golpe de Espada / Arco de Corte Isométrico + Faíscas)
      const angle = Math.atan2(dy - ay, dx - ax);
      ctx.save();
      ctx.globalAlpha = 1 - eff.progress;

      // Arco de Corte 3D Isométrico
      const radius = isoTileW * 0.55;
      const startAngle = angle - Math.PI / 3 - (eff.progress * Math.PI / 4);
      const endAngle = angle + Math.PI / 3 + (eff.progress * Math.PI / 4);
      ctx.save();
      ctx.translate(dx, dy);
      ctx.scale(1, 0.55); // Achatamento isométrico

      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.strokeStyle = eff.hit ? '#f59e0b' : '#94a3b8';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 16;
      ctx.shadowColor = eff.hit ? '#f59e0b' : '#64748b';
      ctx.stroke();

      // Brilho Núcleo Branco
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle + 0.1, endAngle - 0.1);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Faíscas e efeito de impacto 3D
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
      // Ataque à Distância 3D (Projétil / Flecha em Trajetória Parabólica 3D)
      const px = ax + (dx - ax) * eff.progress;
      const arcHeight = Math.sin(eff.progress * Math.PI) * (isoTileH * 1.8);
      const py = ay + (dy - ay) * eff.progress - arcHeight;

      const angle = Math.atan2((dy - arcHeight) - ay, dx - ax);

      ctx.save();

      // Rastro Luminoso do Projétil
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

      // Projétil / Cabeça da Flecha
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

      // Anel de Impacto ao Chegar ao Alvo
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
      // BAFORADA DRACÔNICA EM CONE 3D
      const angle = Math.atan2(dy - ay, dx - ax);
      const colors = getDamageTypeColor(eff.damageType);
      const maxRadius = isoTileW * 3.8;
      const currentRadius = maxRadius * Math.min(1, eff.progress * 1.25);
      const alpha = 1 - Math.pow(eff.progress, 1.8);
      const coneSpread = Math.PI / 3;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);

      ctx.translate(ax, ay);
      ctx.scale(1, 0.55); // Projeção isométrica da baforada

      // Preenchimento com Gradiente Radial de Baforada 3D
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

      // Borda Brilhante com Glow Isométrico
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors.glow;
      ctx.stroke();

      // Partículas Elementares em 3D
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
      // BAFORADA DRACÔNICA EM LINHA / FEIXE 3D
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

      // Feixe Isométrico com Gradiente
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

      // Núcleo Intenso de Energia Branca
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(endPx, endPy);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 0.38;
      ctx.stroke();

      // Partículas Elementares em Torno da Linha
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

  // =========================================================
  // MÁSCARA DE ESCURIDÃO E ILUMINAÇÃO DINÂMICA ISOMÉTRICA 3D
  // =========================================================
  const isDarkEnv3D = isNightOrDarkEnv;
  if (isDarkEnv3D || nightProgress > 0.02) {
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
      ctxTarget.scale(1, 0.55); // Achatamento elíptico isométrico

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
      dctx.fillStyle = 'rgba(128, 128, 128, 1)'; // Cinza médio
      dctx.fillRect(0, 0, desatCanvas.width, desatCanvas.height);
      dctx.globalCompositeOperation = 'destination-out';

      // Fontes de luz EQUIPADAS ativas do herói (ficam coloridas)
      if (heroEntity && hasActiveLightSource) {
        drawIsoLightCutout(dctx, heroEntity.x, heroEntity.y, activeLightRadiusInCells, heroIsFlying);
      }

      // Tochas na parede
      torches.forEach(t => {
        drawIsoLightCutout(dctx, t.x, t.y, 4.0, false);
      });

      // Drops apenas se forem fontes reais de iluminação (ex: tocha droppada)
      droppedLoot.forEach(drop => {
        const itemName = (drop.item?.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const isLightSource = drop.item?.isLightSource || itemName.includes('tocha') || itemName.includes('lanterna') || itemName.includes('facho') || itemName.includes('lampada') || itemName.includes('vela');
        if (isLightSource) {
          drawIsoLightCutout(dctx, drop.x, drop.y, 3.0, false);
        }
      });

      // Fogueiras de descanso
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

      // Visão total do Herói (Máximo entre fonte de luz equipada, visão no escuro e luta às cegas)
      if (heroEntity) {
        const darkvisionCells = heroEntity.hasDarkvision ? ((heroEntity.darkvisionRange || 18) / 1.5) : 0;
        const blindFightingCells = heroHasBlindFighting() ? 2.0 : 0;
        const totalVisionCells = Math.max(darkvisionCells, activeLightRadiusInCells, blindFightingCells);

        if (totalVisionCells > 0) {
          drawIsoLightCutout(mctx, heroEntity.x, heroEntity.y, totalVisionCells, heroIsFlying);
        }
      }

      // Tochas fixas no cenário
      torches.forEach(t => {
        drawIsoLightCutout(mctx, t.x, t.y, 4.0, false);
      });

      // Drops apenas se forem fontes de iluminação ativas (ex: tocha)
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

    // 3. CAMADA DE BRILHO E AURA DE LUZ DINÂMICA ISOMÉTRICA (Apenas fontes reais de iluminação)
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

    // Tochas (chama quente)
    torches.forEach(t => {
      drawIsoLightGlow(t.x, t.y, 4.0, 'rgba(249, 115, 22, 0.55)', 'rgba(234, 88, 12, 0.2)', false);
    });

    // Acampamentos / Fogueiras
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

  // Renderização Atmosférica de Clima no Modo 3D Pixel Art
  drawWeatherOverlay(
    ctx,
    canvas.width,
    canvas.height,
    weather,
    isNight,
    biome,
    true,
    weatherTime || performance.now()
  );
}
