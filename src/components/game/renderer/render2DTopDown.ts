import { UseCanvasRendererProps } from './rendererTypes';
import {
  drawEntityHealthBar,
  drawConditionIcons,
  drawCoverBadge,
  drawTorchGlow,
  draw2DCactus,
  drawHazard2D,
  drawPowerup2D,
  drawFloatingText,
  drawTeleportRange
} from './drawHelpers';
import { renderActiveEffects, renderWeatherFX } from './renderAttackFX';

/**
 * Motor de Renderização 2D Top-Down Clássico.
 * Trata toda a renderização 2D de terreno, iluminação, visibilidade, entidades e efeitos no canvas.
 */
export function render2DTopDown(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  props: UseCanvasRendererProps
): void {
  const {
    grid, entities, activeEntityIndex, biome, isNight, weather, weatherTime, torches, character,
    activeEffects, floatingTexts, droppedLoot, chests, hazards, powerups, restPoints, cols, rows,
    activeRevelation, isTeleportTargetMode, isGoliath,
    activeLargeForm, getEntitySizeInSquares, RACES_REFERENCE,
    activeEntity, getEntityCover, shouldHideEntityDetails,
    isIndoor, heroHasBlindFighting, nightProgress,
    getHeroLightRadiusInCells, isEntityVisible, isEntityVisibleByBlindFightingOnly
  } = props;

  const isIndoorEnv = biome === 'Caverna' || biome === 'Masmorra';
  const isNightOrDarkEnv = isIndoorEnv || (nightProgress > 0 && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

  const cellSize = Math.floor(canvas.width / cols);
  canvas.height = cellSize * rows;

  // Clear background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. PASSO 1: Desenhar Terrenos e Pisos da Matriz (Chão e Grid Base)
  const hero = entities.find(e => e.type === 'hero');
  const heroX = hero ? hero.x : 75;
  const heroY = hero ? hero.y : 75;
  const cameraX = Math.max(0, Math.min(150 - cols, heroX - Math.floor(cols / 2)));
  const cameraY = Math.max(0, Math.min(150 - rows, heroY - Math.floor(rows / 2)));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const mapR = r + cameraY;
      const mapC = c + cameraX;
      const cell = grid[mapR]?.[mapC];
      if (!cell) continue;

      const px = c * cellSize;
      const py = r * cellSize;

      // Cores de fundo do bioma (Passo 1: Piso e Terrenos)
      if (cell.terrain === 'wall') {
        if (biome === 'Masmorra') {
          if (cell.obstacleType === 'cell_bars') {
            ctx.fillStyle = '#0f172a';
          } else if (cell.obstacleType === 'pillar') {
            ctx.fillStyle = '#334155';
          } else {
            ctx.fillStyle = '#1e293b';
          }
        } else if (!isIndoorEnv && weather === 'snow') {
          // Fundo de parede/obstáculo no clima de neve
          ctx.fillStyle = isNight ? '#94a3b8' : '#e2e8f0';
        } else {
          // Em biomas abertos, o fundo sob a parede/obstáculo tem a cor do piso natural
          ctx.fillStyle = biome === 'Floresta' ? '#14532d' : biome === 'Pântano' ? '#164e63' : biome === 'Deserto' ? '#b45309' : '#1e293b';
        }
      } else if (cell.terrain === 'difficult') {
        if (biome === 'Masmorra') {
          ctx.fillStyle = cell.dungeonFeature === 'cell' ? '#0f172a' : '#283141';
        } else if (!isIndoorEnv && weather === 'snow') {
          // Terreno difícil no clima de neve (neve profunda / gelo compacto)
          ctx.fillStyle = isNight ? '#64748b' : '#cbd5e1';
        } else {
          ctx.fillStyle = biome === 'Floresta' ? '#166534' : biome === 'Deserto' ? '#9a3412' : biome === 'Pântano' ? '#0e7490' : '#27272a';
        }
      } else if (cell.terrain === 'water') {
        ctx.fillStyle = '#0369a1';
      } else {
        if (biome === 'Masmorra') {
          if (cell.dungeonFeature === 'cell') {
            ctx.fillStyle = '#0b1120';
          } else if (cell.dungeonFeature === 'hall') {
            ctx.fillStyle = '#1e293b';
          } else if (cell.dungeonFeature === 'vault') {
            ctx.fillStyle = '#1e2436';
          } else if (cell.dungeonFeature === 'corridor') {
            ctx.fillStyle = '#131b29';
          } else {
            ctx.fillStyle = '#192231';
          }
        } else if (!isIndoorEnv && weather === 'snow') {
          // ❄️ Piso normal no clima de neve: manto branco gélido com leve textura
          const snowSeed = (mapR * 13 + mapC * 17) % 3;
          ctx.fillStyle = isNight
            ? (snowSeed === 0 ? '#cbd5e1' : snowSeed === 1 ? '#94a3b8' : '#cbd5e1')
            : (snowSeed === 0 ? '#ffffff' : snowSeed === 1 ? '#f8fafc' : '#f1f5f9');
        } else {
          ctx.fillStyle = biome === 'Floresta' ? '#14532d' : biome === 'Pântano' ? '#164e63' : biome === 'Deserto' ? '#b45309' : '#1e293b';
        }
      }

      ctx.fillRect(px, py, cellSize, cellSize);

      // Sombreamento 3D abaixo de paredes na Masmorra (Sombra projetada no piso)
      if (biome === 'Masmorra' && cell.terrain !== 'wall') {
        const topNeighbor = grid[mapR - 1]?.[mapC];
        if (topNeighbor && topNeighbor.terrain === 'wall') {
          ctx.save();
          const shadowGrad = ctx.createLinearGradient(px, py, px, py + cellSize * 0.4);
          shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
          shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = shadowGrad;
          ctx.fillRect(px, py, cellSize, cellSize * 0.4);
          ctx.restore();
        }
      }

      // Renderizar Textura de Placas de Pedra no Piso dos Salões e Corredores da Masmorra
      if (biome === 'Masmorra' && cell.terrain === 'normal') {
        ctx.save();
        if (cell.dungeonFeature === 'hall') {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + cellSize * 0.5, py);
          ctx.lineTo(px + cellSize * 0.5, py + cellSize);
          ctx.moveTo(px, py + cellSize * 0.5);
          ctx.lineTo(px + cellSize, py + cellSize * 0.5);
          ctx.stroke();
        } else if (cell.dungeonFeature === 'corridor') {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py + cellSize * 0.5);
          ctx.lineTo(px + cellSize, py + cellSize * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Renderizar Textura de Tijolos / Blocos de Pedra Cinza em Paredes de Masmorra simples
      if (biome === 'Masmorra' && cell.terrain === 'wall' && (!cell.obstacleWidth || cell.obstacleWidth === 1) && (!cell.obstacleHeight || cell.obstacleHeight === 1) && cell.obstacleType !== 'cell_bars' && cell.obstacleType !== 'pillar') {
        ctx.save();
        const stoneGrad = ctx.createLinearGradient(px, py, px + cellSize, py + cellSize);
        stoneGrad.addColorStop(0, '#475569');
        stoneGrad.addColorStop(0.5, '#334155');
        stoneGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(px, py, cellSize, cellSize);

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        const rH = cellSize / 3;
        ctx.beginPath();
        ctx.moveTo(px, py + rH);
        ctx.lineTo(px + cellSize, py + rH);
        ctx.moveTo(px, py + rH * 2);
        ctx.lineTo(px + cellSize, py + rH * 2);
        ctx.stroke();

        ctx.beginPath();
        const offset1 = (mapR * 17 + mapC * 3) % 2 === 0 ? cellSize * 0.5 : cellSize * 0.25;
        const offset2 = (mapR * 13 + mapC * 7) % 2 === 0 ? cellSize * 0.4 : cellSize * 0.7;
        ctx.moveTo(px + offset1, py);
        ctx.lineTo(px + offset1, py + rH);
        ctx.moveTo(px + offset2, py + rH);
        ctx.lineTo(px + offset2, py + rH * 2);
        ctx.moveTo(px + offset1, py + rH * 2);
        ctx.lineTo(px + offset1, py + cellSize);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py + 1);
        ctx.lineTo(px + cellSize, py + 1);
        ctx.moveTo(px + 1, py);
        ctx.lineTo(px + 1, py + cellSize);
        ctx.stroke();
        ctx.restore();
      }

      // Borda sutil do quadrado do Grid
      ctx.strokeStyle = (!isIndoorEnv && weather === 'snow')
        ? (isNight ? '#64748b' : '#cbd5e1')
        : (biome === 'Floresta' ? '#15803d' : biome === 'Pântano' ? '#0891b2' : biome === 'Deserto' ? '#78350f' : '#334155');
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, cellSize, cellSize);
    }
  }

  // 2. PASSO 2: Desenhar Obstáculos Multi-Célula e 1x1 (Acima do Chão com Arte Vetorial 2D Polida)
  const renderedObstacleOrigins = new Set<string>();
  const margin = 4;
  const minR = Math.max(0, cameraY - margin);
  const maxR = Math.min(150, cameraY + rows + margin);
  const minC = Math.max(0, cameraX - margin);
  const maxC = Math.min(150, cameraX + cols + margin);

  for (let mapR = minR; mapR < maxR; mapR++) {
    for (let mapC = minC; mapC < maxC; mapC++) {
      const cell = grid[mapR]?.[mapC];
      if (!cell) continue;

      if (cell.terrain === 'wall') {
        const w = cell.obstacleWidth || 1;
        const h = cell.obstacleHeight || 1;
        const origX = cell.obstacleOriginX ?? mapC;
        const origY = cell.obstacleOriginY ?? mapR;
        const originKey = `${origX},${origY}`;

        // Desenhar apenas uma vez a partir da célula de origem
        if (renderedObstacleOrigins.has(originKey)) continue;
        renderedObstacleOrigins.add(originKey);

        const origCell = grid[origY]?.[origX] || cell;
        const origW = origCell.obstacleWidth || w;
        const origH = origCell.obstacleHeight || h;
        const origScale = origCell.obstacleScale || cell.obstacleScale || (Math.max(origW, origH) > 1 ? Math.max(origW, origH) * 0.85 : 1.0);
        const origVariant = origCell.obstacleVariant || cell.obstacleVariant || 'standard';
        const origObsType = origCell.obstacleType || cell.obstacleType || (biome === 'Floresta' ? 'tree' : biome === 'Deserto' ? 'cactus' : biome === 'Pântano' ? 'tree' : 'rock');

        const screenOrigX = (origX - cameraX) * cellSize;
        const screenOrigY = (origY - cameraY) * cellSize;
        const totalW = origW * cellSize;
        const totalH = origH * cellSize;
        const centerX = screenOrigX + totalW / 2;
        const centerY = screenOrigY + totalH / 2;
        const maxDim = Math.max(origW, origH);

        ctx.save();

        if (origObsType === 'fallen_log') {
          // 🪵 TRONCO CAÍDO 2D (Multi-célula 1x2, 2x1, 1x3, 3x1)
          const isHoriz = origVariant.includes('h') || origW >= origH;
          const logX = screenOrigX + (isHoriz ? 4 : (cellSize - 16) / 2);
          const logY = screenOrigY + (isHoriz ? (cellSize - 16) / 2 : 4);
          const logW = isHoriz ? totalW - 8 : 16;
          const logH = isHoriz ? 16 : totalH - 8;

          // Sombra suave do tronco
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.roundRect(logX + 3, logY + 4, logW, logH, 6);
          ctx.fill();

          // Corpo cilíndrico de madeira
          const woodGrad = ctx.createLinearGradient(logX, logY, isHoriz ? logX : logX + logW, isHoriz ? logY + logH : logY);
          woodGrad.addColorStop(0, '#5c2b09');
          woodGrad.addColorStop(0.3, '#78350f');
          woodGrad.addColorStop(0.7, '#92400e');
          woodGrad.addColorStop(1, '#451a03');
          ctx.fillStyle = woodGrad;
          ctx.beginPath();
          ctx.roundRect(logX, logY, logW, logH, 6);
          ctx.fill();
          ctx.strokeStyle = '#291102';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Anéis de crescimento nas pontas
          ctx.fillStyle = '#b45309';
          if (isHoriz) {
            ctx.beginPath();
            ctx.ellipse(logX + 4, logY + logH / 2, 3, logH / 2 - 2, 0, 0, Math.PI * 2);
            ctx.ellipse(logX + logW - 4, logY + logH / 2, 3, logH / 2 - 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.ellipse(logX + logW / 2, logY + 4, logW / 2 - 2, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(logX + logW / 2, logY + logH - 4, logW / 2 - 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Tufos de musgo verde natural no tronco
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.ellipse(centerX - (isHoriz ? logW * 0.2 : 0), centerY - (isHoriz ? 0 : logH * 0.2), isHoriz ? 6 : 3, isHoriz ? 3 : 6, 0, 0, Math.PI * 2);
          ctx.ellipse(centerX + (isHoriz ? logW * 0.2 : 0), centerY + (isHoriz ? 0 : logH * 0.2), isHoriz ? 7 : 3, isHoriz ? 3 : 7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (origObsType === 'brick_wall') {
          // 🧱 MURALHA DE TIJOLOS 2D (Multi-célula)
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
            ctx.beginPath(); ctx.moveTo(wallX, ty); ctx.lineTo(wallX + wallW, ty); ctx.stroke();
          }
        } else if ((origObsType as string) === 'monolith' || origVariant.includes('mesa') || (biome === 'Deserto' && (origObsType === 'rock' || (origObsType as string) === 'monolith') && maxDim > 1)) {
          // 🏜️ MESA DE ARENITO / PLATÔ DO DESERTO 2D (MULTI-CÉLULA 3x3, 2x2, etc.)
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

          // 2. Base da Formação de Arenito (Escarpa Externa)
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
        } else if (origObsType === 'tree' && maxDim > 1) {
          // 🌳 ÁRVORE ANCESTRAL / GRANDE 2D (MULTI-CÉLULA 3x3, 2x2)
          const canopyR = (Math.min(totalW, totalH) / 2) - 4;

          // Sombra suave da Copa
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(centerX + 4, centerY + 6, canopyR + 2, canopyR, 0, 0, Math.PI * 2);
          ctx.fill();

          // Camadas concêntricas e tufos orgânicos de folhagem
          const isSwamp = biome === 'Pântano';
          const tufts = [
            { dx: 0, dy: 0, r: canopyR * 0.95, col: isSwamp ? '#064e3b' : '#14532d' },
            { dx: -canopyR * 0.35, dy: -canopyR * 0.3, r: canopyR * 0.6, col: isSwamp ? '#0f766e' : '#16a34a' },
            { dx: canopyR * 0.35, dy: -canopyR * 0.25, r: canopyR * 0.55, col: isSwamp ? '#14b8a6' : '#22c55e' },
            { dx: -canopyR * 0.25, dy: canopyR * 0.35, r: canopyR * 0.58, col: isSwamp ? '#042f2e' : '#15803d' },
            { dx: canopyR * 0.3, dy: canopyR * 0.3, r: canopyR * 0.52, col: isSwamp ? '#0f766e' : '#14532d' },
            { dx: 0, dy: -canopyR * 0.15, r: canopyR * 0.42, col: isSwamp ? '#2dd4bf' : '#4ade80' },
          ];

          tufts.forEach(({ dx, dy, r, col }) => {
            ctx.beginPath();
            ctx.arc(centerX + dx, centerY + dy, r, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
          });

          // Borda elegante da Copa
          ctx.beginPath();
          ctx.arc(centerX, centerY, canopyR, 0, Math.PI * 2);
          ctx.strokeStyle = isSwamp ? '#042f2e' : '#064e3b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Ponto de luz no topo da copa (ou neve acumulada no clima de neve)
          ctx.beginPath();
          ctx.arc(centerX - canopyR * 0.1, centerY - canopyR * 0.15, canopyR * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
            ? '#ffffff'
            : isSwamp ? 'rgba(94, 234, 212, 0.45)' : 'rgba(134, 239, 172, 0.45)';
          ctx.fill();

          if (!isIndoorEnv && weather === 'snow') {
            // Cobertura de neve fofa sobre a copa da árvore
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX - canopyR * 0.25, centerY - canopyR * 0.3, canopyR * 0.4, 0, Math.PI * 2);
            ctx.arc(centerX + canopyR * 0.2, centerY - canopyR * 0.22, canopyR * 0.32, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (origObsType === 'cactus' && maxDim > 1) {
          // 🌵 BOSQUE DE CACTOS 2D (MULTI-CÉLULA 2x2)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(centerX + 3, centerY + 4, totalW * 0.4, totalH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();

          draw2DCactus(ctx, centerX - cellSize * 0.28, centerY - cellSize * 0.1, 0.85);
          draw2DCactus(ctx, centerX + cellSize * 0.25, centerY + cellSize * 0.15, 0.95);
          draw2DCactus(ctx, centerX - cellSize * 0.05, centerY + cellSize * 0.25, 0.7);
        } else if (origObsType === 'rock' && maxDim > 1) {
          // 🪨 MONÓLITO / ROCHA GRANDE / CRISTA 2D (MULTI-CÉLULA 3x3, 2x2, 1x2, 2x1)
          const pad = 4;
          const rX = screenOrigX + pad;
          const rY = screenOrigY + pad;
          const rW = totalW - pad * 2;
          const rH = totalH - pad * 2;

          // Sombra suave da rocha
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.roundRect(rX + 4, rY + 5, rW, rH, 8);
          ctx.fill();

          // Corpo da rocha com gradiente de ardósia/granito
          const stoneGrad = ctx.createLinearGradient(rX, rY, rX + rW, rY + rH);
          stoneGrad.addColorStop(0, '#64748b');
          stoneGrad.addColorStop(0.4, '#475569');
          stoneGrad.addColorStop(0.8, '#334155');
          stoneGrad.addColorStop(1, '#1e293b');
          ctx.fillStyle = stoneGrad;
          ctx.beginPath();
          ctx.roundRect(rX, rY, rW, rH, 8);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Facetas de relevo volumétrico da rocha
          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.beginPath();
          ctx.moveTo(rX + 4, rY + 4);
          ctx.lineTo(rX + rW * 0.6, rY + 4);
          ctx.lineTo(rX + rW * 0.4, rY + rH * 0.5);
          ctx.lineTo(rX + 4, rY + rH * 0.4);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(rX + 4, rY + 4);
          ctx.lineTo(rX + rW * 0.6, rY + 4);
          ctx.lineTo(rX + rW * 0.4, rY + rH * 0.5);
          ctx.stroke();
        } else {
          // 🎯 OBSTÁCULOS 1x1 INDIVIDUAIS (Desenho vetorial limpo com escala e sombra)
          const obsRadius = (cellSize / 2 - 4) * Math.min(1.2, origScale);

          if (origObsType === 'rock') {
            // Rocha 1x1
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

            // Faceta de luz (ou neve acumulada)
            ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#ffffff' : 'rgba(203, 213, 225, 0.4)';
            ctx.beginPath();
            ctx.arc(centerX - obsRadius * 0.25, centerY - obsRadius * 0.25, obsRadius * 0.35, 0, Math.PI * 2);
            ctx.fill();
          } else if (origObsType === 'tree') {
            // Árvore 1x1
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
              // Neve branca sobre a copa da árvore 1x1
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(centerX - obsRadius * 0.2, centerY - obsRadius * 0.25, obsRadius * 0.45, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (origObsType === 'cactus') {
            // Cacto Saguaro 1x1
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

            // Braço
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

            // Flor
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(centerX, centerY - obsRadius * 0.85, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (biome === 'Masmorra' && origObsType === 'pillar') {
            // Coluna / Pilar 1x1 de Masmorra
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
            // Grades de Cela de Masmorra
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
            // Fallback para outros tipos de obstáculo
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

        ctx.restore();
      } else if (cell.terrain === 'difficult') {
        // Terreno Difícil (Marcas sutis e elegantes no chão sem poluição visual)
        const c = mapC - cameraX;
        const r = mapR - cameraY;
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          const px = c * cellSize;
          const py = r * cellSize;
          const centerX = px + cellSize / 2;
          const centerY = py + cellSize / 2;

          if (!isIndoorEnv && weather === 'snow') {
            // Cristal de gelo / floco de neve sutil no solo gélido
            ctx.strokeStyle = isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(71, 85, 105, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(centerX - 4, centerY);
            ctx.lineTo(centerX + 4, centerY);
            ctx.moveTo(centerX, centerY - 4);
            ctx.lineTo(centerX, centerY + 4);
            ctx.moveTo(centerX - 2.5, centerY - 2.5);
            ctx.lineTo(centerX + 2.5, centerY + 2.5);
            ctx.moveTo(centerX - 2.5, centerY + 2.5);
            ctx.lineTo(centerX + 2.5, centerY - 2.5);
            ctx.stroke();
          } else if (biome === 'Floresta') {
            // Pequena folha/ramo sutil
            ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 4, 2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (biome === 'Deserto') {
            // Pequena ondulação de areia sutil
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 5, centerY);
            ctx.quadraticCurveTo(centerX, centerY - 2, centerX + 5, centerY);
            ctx.stroke();
          } else if (biome === 'Pântano') {
            // Pequena poça/bolha pantanosa
            ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (biome === 'Masmorra') {
            // Pequena rachadura ou escombro sutil
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 3, centerY - 3);
            ctx.lineTo(centerX + 3, centerY + 3);
            ctx.stroke();
          } else {
            // Caverna: Pequeno seixo sutil
            ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // 1.5. Desenhar Tochas no mapa (se houver)
  torches.forEach(t => {
    const c = t.x - cameraX;
    const r = t.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawTorchGlow(ctx, px, py, cellSize);
  });

  // 1.5b. Desenhar Hazards (Armadilhas) no chão
  hazards.forEach(hazard => {
    if (hazard.isHidden) return; // Não desenhar armadilhas escondidas que ainda não foram acionadas
    const c = hazard.x - cameraX;
    const r = hazard.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawHazard2D(ctx, px, py, cellSize, hazard);
  });

  // 1.5c. Desenhar Power-ups no chão
  powerups.forEach(pw => {
    if (pw.isCollected) return;
    const c = pw.x - cameraX;
    const r = pw.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;
    drawPowerup2D(ctx, px, py, cellSize, pw);

    // Label
    ctx.font = 'bold 7px sans-serif';
    ctx.fillStyle = `rgb(${pw.color})`;
    ctx.fillText(pw.name.toUpperCase().substring(0, 8), px, py + cellSize * 0.35);
  });

  // 1.5d. Desenhar Pontos de Descanso Longo (Acampamentos) no chão
  restPoints.forEach(rp => {
    const size = rp.size || 2;
    const c = rp.x - cameraX;
    const r = rp.y - cameraY;
    if (c + size < 0 || c >= cols || r + size < 0 || r >= rows) return;
    const px = (c + size / 2) * cellSize;
    const py = (r + size / 2) * cellSize;
    const radius = (cellSize * size) * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    if (!rp.isUsed) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
      ctx.lineWidth = 2.5;
    } else {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1.5;
    }
    ctx.fill();
    ctx.stroke();

    const rpIcon = rp.icon || '⛺';
    ctx.font = `${cellSize * (size * 0.45)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rp.isUsed ? '🪵' : rpIcon, px, py - 4);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = rp.isUsed ? '#94a3b8' : '#fbbf24';
    ctx.fillText(rp.isUsed ? 'ACAMPAMENTO (USADO)' : '⛺ ACAMPAMENTO', px, py + cellSize * (size * 0.35));
    ctx.restore();
  });

  // 1.6. Desenhar Itens de Loot no chão
  droppedLoot.forEach(loot => {
    if (loot.isCollected) return;
    const c = loot.x - cameraX;
    const r = loot.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;

    // Desenhar uma aura brilhante de acordo com a raridade do item
    ctx.beginPath();
    ctx.arc(px, py, cellSize * 0.28, 0, Math.PI * 2);
    switch (loot.item.rarity) {
      case 'lendário':
        ctx.fillStyle = 'rgba(236, 72, 153, 0.25)'; // Rosa
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        break;
      case 'raro':
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // Azul
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        break;
      case 'incomum':
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'; // Verde
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        break;
      default:
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)'; // Bronze/Ouro
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        break;
    }
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Desenhar o emoji/ícone do item flutuando
    ctx.font = `${cellSize * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loot.item.icon, px, py - 2);

    // Nome abreviado do item flutuando embaixo
    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = loot.item.rarity === 'lendário' ? '#f472b6' : loot.item.rarity === 'raro' ? '#60a5fa' : loot.item.rarity === 'incomum' ? '#34d399' : '#fbbf24';
    const cleanName = loot.item.name.replace(/Peças de Ouro|PO/g, '').trim();
    ctx.fillText(cleanName.length > 8 ? cleanName.substring(0, 8) + '..' : cleanName, px, py + cellSize * 0.35);
  });

  // 1.7. Desenhar Baús de Tesouro no chão
  chests.forEach(chest => {
    const c = chest.x - cameraX;
    const r = chest.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const px = c * cellSize + cellSize / 2;
    const py = r * cellSize + cellSize / 2;

    // Aura sutil ao redor do baú se não estiver aberto
    if (!chest.isOpened) {
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.35, 0, Math.PI * 2);
      switch (chest.rarity) {
        case 'lendário':
          ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
          break;
        case 'raro':
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
          break;
        default:
          ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          break;
      }
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = `${cellSize * 0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ícone do baú (aberto vs fechado)
    const chestIcon = chest.isOpened ? '🔓' : '📦';
    ctx.fillText(chestIcon, px, py - 2);

    // Nome da raridade acima do baú
    if (!chest.isOpened) {
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = chest.rarity === 'lendário' ? '#f472b6' : chest.rarity === 'raro' ? '#60a5fa' : '#94a3b8';
      ctx.fillText(chest.rarity.toUpperCase(), px, py - cellSize * 0.4);
    }
  });

  // 2. Desenhar Entidades (Tokens dos Jogadores e Monstros)
  entities.forEach(ent => {
    if (ent.isDead) return;
    if (!isEntityVisible(ent)) return;
    const c = ent.x - cameraX;
    const r = ent.y - cameraY;
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;

    const sizeInSquares = getEntitySizeInSquares(
      ent.type === 'hero' 
        ? (activeLargeForm ? 'Grande' : (ent.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')))
        : (ent.size || 'Médio')
    );
    const groundPx = c * cellSize + (sizeInSquares * cellSize) / 2;
    const groundPy = r * cellSize + (sizeInSquares * cellSize) / 2;
    const radius = (sizeInSquares * cellSize) * 0.38;

    // Destacar Pegada no Solo para Entidades Grandes (ex: Golias 2x2 em Forma Grande)
    if (ent.type === 'hero' && activeLargeForm) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.fillRect(c * cellSize, r * cellSize, sizeInSquares * cellSize, sizeInSquares * cellSize);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(c * cellSize, r * cellSize, sizeInSquares * cellSize, sizeInSquares * cellSize);
      ctx.restore();
    }

    const isFlying = Boolean(ent.conditions?.includes('Voando'));
    const flyOffset = isFlying ? (sizeInSquares * cellSize) * 0.45 : 0; // Deslocamento visual de 3m no 2D
    const px = groundPx;
    const py = groundPy - flyOffset;

    // Sombra no Chão se estiver Voando
    if (isFlying) {
      ctx.beginPath();
      ctx.ellipse(groundPx, groundPy, radius * 0.75, radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      // Linha pontilhada de elevação
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(groundPx, groundPy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();

      // Rótulo de altitude 3m
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('3m 🕊️', groundPx + radius + 2, (groundPy + py) / 2);
    }

    // Anel do Turno Ativo
    if (activeEntity && activeEntity.id === ent.id) {
      ctx.beginPath();
      ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = ent.type === 'hero' ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Círculo do Token
    const isBlindOnly = isEntityVisibleByBlindFightingOnly(ent);
    const isHidden = ent.conditions?.includes('Invisível');

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = isBlindOnly ? '#111827' : (isHidden ? 'rgba(15, 23, 42, 0.45)' : (ent.color || (ent.type === 'hero' ? '#2563eb' : '#dc2626')));
    ctx.fill();

    ctx.strokeStyle = isHidden ? '#14b8a6' : (isFlying ? '#38bdf8' : (isBlindOnly ? '#e2e8f0' : '#ffffff'));
    ctx.lineWidth = isHidden ? 3 : (isFlying ? 2.5 : 2);
    if (isHidden) {
      ctx.setLineDash([3, 3]);
    }
    ctx.stroke();
    if (isHidden) {
      ctx.setLineDash([]);
    }

    // Ícone do Token
    ctx.font = `${(sizeInSquares * cellSize) * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = isHidden ? 0.5 : 1.0;
    ctx.fillText(isBlindOnly ? '❓' : ent.icon, px, py);
    ctx.globalAlpha = 1.0;

    // Indicador de Cobertura 2D para monstros
    if (ent.type === 'monster' && !ent.isDead) {
      const coverRes = getEntityCover(ent);
      if (coverRes.degree !== 'none') {
        const badgeText = coverRes.degree === 'total' ? '🛡️ Cobertura' : coverRes.acBonus > 0 ? `🛡️ +${coverRes.acBonus} (Cobertura)` : '🛡️ (Cobertura)';
        drawCoverBadge(ctx, px, py, radius, badgeText);
      }
    }

    // Barra de Vida acima do Token (oculta apenas se o monstro estiver totalmente oculto fora de visão)
    if (!shouldHideEntityDetails(ent)) {
      const barW = (sizeInSquares * cellSize) * 0.8;
      const barH = 5;
      const barX = px - barW / 2;
      const barY = py - radius - 8;

      drawEntityHealthBar(ctx, barX, barY, barW, barH, ent.currentHp, ent.maxHp);
      
      // Renderizar Condition Icons (ex: 😱)
      if (ent.conditions && ent.conditions.length > 0) {
        drawConditionIcons(ctx, px, barY - 2, ent.conditions, (sizeInSquares * cellSize) * 0.25);
      }
    }
  });

  // 3. Sistema de Dia/Noite e Iluminação Dinâmica
  if (isNightOrDarkEnv) {
    const activeLightRadiusInCells = getHeroLightRadiusInCells();
    const activeLightRadius = cellSize * activeLightRadiusInCells;
    const hasActiveLightSource = activeLightRadiusInCells > 0;

    const heroEntity = entities.find(e => e.type === 'hero' && !e.isDead);

    // Criar máscara de saturação (Preto e Branco para visão no escuro)
    const desatCanvas = document.createElement('canvas');
    desatCanvas.width = canvas.width;
    desatCanvas.height = canvas.height;
    const dctx = desatCanvas.getContext('2d');
    if (dctx) {
      dctx.fillStyle = 'rgba(128, 128, 128, 1)'; // Cinza médio (força escala de cinza no blend 'saturation')
      dctx.fillRect(0, 0, desatCanvas.width, desatCanvas.height);
      dctx.globalCompositeOperation = 'destination-out';

      // 1. Tocha/Lanterna EQUIPADA do herói ou revelação de luz
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

      // 2. Tochas na parede (fontes de luz do ambiente)
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

      // 3. Drops com brilho de iluminação apenas se forem fontes de iluminação ativas (ex: tocha)
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

    // Criar máscara de sombra / escuridão
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

      // Aplicar a máscara de escuridão no canvas principal
      ctx.drawImage(maskCanvas, 0, 0);

      // Adicionar brilho quente (overlay de cor) apenas de fontes de iluminação ativas
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

  // 4. Desenhar Efeitos Visuais Ativos (Melee / Ranged / Baforadas)
  renderActiveEffects(ctx, activeEffects, cameraX, cameraY, cellSize);

  // 4.5. Desenhar Alcance do Passo das Nuvens (Teleporte Golias)
  if (isTeleportTargetMode && isGoliath && hero) {
    const hx = (hero.x - cameraX) * cellSize + cellSize / 2;
    const hy = (hero.y - cameraY) * cellSize + cellSize / 2;
    drawTeleportRange(ctx, hx, hy, cellSize);
  }

  // 5. Desenhar Floating Texts
  floatingTexts.forEach(ft => {
    const tx = (ft.x - cameraX) * cellSize + cellSize / 2;
    const ty = (ft.y - cameraY) * cellSize + cellSize / 2 - (ft.progress * cellSize);
    drawFloatingText(ctx, ft.text, tx, ty, ft.color, ft.progress);
  });

  // 6. Renderização Atmosférica de Clima no Modo 2D Top-Down
  renderWeatherFX(
    ctx,
    canvas.width,
    canvas.height,
    weather,
    weatherTime || performance.now(),
    isIndoorEnv,
    isNightOrDarkEnv
  );
}
