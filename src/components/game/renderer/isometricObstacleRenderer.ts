import { CellData } from '../../../game/types';
import { UseCanvasRendererProps } from './rendererTypes';

interface DrawIsometricObstacleProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  cell: CellData;
  mapC: number;
  mapR: number;
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
  blockH: number;
  isIndoorEnv: boolean;
}

export function drawIsometricObstacle({
  ctx,
  canvas,
  props,
  cell,
  mapC,
  mapR,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
  blockH,
  isIndoorEnv,
}: DrawIsometricObstacleProps): void {
  const { biome, weather } = props;

  if (cell.terrain === 'wall') {
    const w = cell.obstacleWidth || 1;
    const h = cell.obstacleHeight || 1;
    const origX = cell.obstacleOriginX ?? mapC;
    const origY = cell.obstacleOriginY ?? mapR;
    // No algoritmo do pintor (depth = mapR + mapC), renderizamos o obstáculo unificado no ladrilho mais frontal
    const isFrontmostTile = (mapC === origX + w - 1 && mapR === origY + h - 1);

    if (isFrontmostTile) {
      const centerGridX = origX + (w - 1) / 2;
      const centerGridY = origY + (h - 1) / 2;
      const centerRelC = centerGridX - centerC;
      const centerRelR = centerGridY - centerR;
      const objIsoX = canvas.width / 2 + (centerRelC - centerRelR) * (isoTileW / 2);
      const objIsoY = canvas.height / 2 + (centerRelC + centerRelR) * (isoTileH / 2) + isoTileH * 0.5;
      const objTopY = objIsoY - blockH;

      const scale = cell.obstacleScale || (w > 1 || h > 1 ? Math.max(w, h) * 0.95 : 1.0);
      const variant = cell.obstacleVariant || 'standard';
      const obsType = cell.obstacleType || (biome === 'Floresta' ? 'tree' : biome === 'Deserto' ? 'cactus' : biome === 'Pântano' ? 'tree' : 'rock');

      if (obsType === 'fallen_log') {
        // 🪵 TRONCO CAÍDO 3D (Alongado horizontal ou vertical)
        const isHoriz = variant.includes('h') || w >= h;
        const logLen = Math.max(w, h);
        const baseY = objTopY + isoTileH * 0.55;
        const logRadius = isoTileW * 0.12 * Math.min(1.4, scale);
        const logVisualLen = isoTileW * (logLen * 0.75);

        // Sombra no Chão
        ctx.beginPath();
        ctx.ellipse(objIsoX, baseY + 2, (logVisualLen / 2) + 6, isoTileH * 0.22 * logLen, isHoriz ? 0.35 : -0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // Corpo do Tronco de Madeira
        ctx.save();
        ctx.translate(objIsoX, baseY - logRadius * 0.5);
        ctx.rotate(isHoriz ? 0.35 : -0.35);

        // Casca do Tronco
        const logGrad = ctx.createLinearGradient(0, -logRadius, 0, logRadius);
        logGrad.addColorStop(0, '#78350f');
        logGrad.addColorStop(0.5, '#451a03');
        logGrad.addColorStop(1, '#291102');
        ctx.fillStyle = logGrad;
        ctx.fillRect(-logVisualLen / 2, -logRadius, logVisualLen, logRadius * 2);

        // Linhas de textura da casca
        ctx.strokeStyle = '#1c0a00';
        ctx.lineWidth = 1.2;
        for (let lx = -logVisualLen / 2 + 10; lx < logVisualLen / 2; lx += 14) {
          ctx.beginPath();
          ctx.moveTo(lx, -logRadius);
          ctx.lineTo(lx + 4, logRadius);
          ctx.stroke();
        }

        // Extremidades Cortadas do Tronco com Anéis de Crescimento
        ctx.beginPath();
        ctx.ellipse(-logVisualLen / 2, 0, logRadius * 0.6, logRadius, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b45309';
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(-logVisualLen / 2, 0, logRadius * 0.3, logRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(logVisualLen / 2, 0, logRadius * 0.6, logRadius, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#92400e';
        ctx.fill();
        ctx.stroke();

        // Manchas de Musgo Verde no Tronco
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(-logVisualLen * 0.2, -logRadius * 0.6, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(logVisualLen * 0.15, -logRadius * 0.5, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cogumelinhos Vermelhos/Laranjas crescendo no tronco
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-logVisualLen * 0.1, -logRadius - 2, 3, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-logVisualLen * 0.1 - 0.5, -logRadius - 2, 1, 3);

        if (!isIndoorEnv && weather === 'snow') {
          // Camada de neve branca acumulada sobre o tronco caído
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, -logRadius, logVisualLen * 0.45, logRadius * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else if ((obsType as string) === 'monolith' || variant.includes('mesa') || (biome === 'Deserto' && (obsType === 'rock' || (obsType as string) === 'monolith') && (w >= 2 || h >= 2 || scale >= 1.5))) {
        // 🏜️ MESA DE ARENITO / PLATÔ DO DESERTO 3D MULTI-CÉLULA (3x3, 2x2, 1x3, 3x1)
        const isLargeMesa = w >= 3 || h >= 3 || variant.includes('mesa');
        const isMediumMesa = (w === 2 && h === 2) || scale >= 1.6;
        const mesaScale = scale;
        const rx = objIsoX;
        const ry = objTopY + isoTileH * 0.55;
        const mesaW = isoTileW * (isLargeMesa ? 1.35 : isMediumMesa ? 0.95 : 0.7) * (mesaScale / (isLargeMesa ? 2.5 : isMediumMesa ? 1.8 : 1));
        const mesaH = isoTileH * (isLargeMesa ? 2.2 : isMediumMesa ? 1.6 : 1.1) * (mesaScale / (isLargeMesa ? 2.5 : isMediumMesa ? 1.8 : 1));
        const topYPos = ry - mesaH;

        // 1. Sombra Projetada no Chão
        ctx.beginPath();
        ctx.ellipse(rx, ry + 4, mesaW * 1.18, isoTileH * (isLargeMesa ? 0.65 : isMediumMesa ? 0.42 : 0.28), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(69, 26, 3, 0.55)';
        ctx.fill();

        // 2. Base de cascalho e pedregulhos no sopé da mesa
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(rx - mesaW * 0.75, ry + 2, mesaW * 0.22, mesaH * 0.12, 0, 0, Math.PI * 2);
        ctx.ellipse(rx + mesaW * 0.7, ry + 3, mesaW * 0.25, mesaH * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(rx - mesaW * 0.4, ry + 5, mesaW * 0.18, mesaH * 0.09, 0, 0, Math.PI * 2);
        ctx.ellipse(rx + mesaW * 0.35, ry + 6, mesaW * 0.2, mesaH * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Paredes de Estratos Geológicos de Arenito (Face Esquerda - Iluminada)
        ctx.beginPath();
        ctx.moveTo(rx, topYPos + mesaH * 0.12);
        ctx.lineTo(rx - mesaW * 0.85, topYPos + mesaH * 0.05);
        ctx.lineTo(rx - mesaW * 0.95, ry - mesaH * 0.15);
        ctx.lineTo(rx - mesaW * 0.8, ry + 2);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = '#d97706';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Camadas horizontais de estrato na Face Esquerda
        const leftStrataCount = isLargeMesa ? 5 : 3;
        for (let s = 1; s <= leftStrataCount; s++) {
          const t = s / (leftStrataCount + 1);
          const sy1 = topYPos + mesaH * 0.08 + t * (ry - topYPos);
          const sy2 = topYPos + mesaH * 0.05 + t * (ry - topYPos);
          ctx.beginPath();
          ctx.moveTo(rx - mesaW * 0.85 * (1 - t * 0.1), sy2);
          ctx.lineTo(rx, sy1);
          ctx.strokeStyle = s % 2 === 0 ? '#b45309' : '#f59e0b';
          ctx.lineWidth = isLargeMesa ? 2.5 : 1.8;
          ctx.stroke();
        }

        // 4. Paredes de Estratos Geológicos (Face Direita - Sombra)
        ctx.beginPath();
        ctx.moveTo(rx, topYPos + mesaH * 0.12);
        ctx.lineTo(rx + mesaW * 0.85, topYPos + mesaH * 0.05);
        ctx.lineTo(rx + mesaW * 0.95, ry - mesaH * 0.12);
        ctx.lineTo(rx + mesaW * 0.78, ry + 3);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = '#92400e';
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Camadas horizontais de estrato na Face Direita
        const rightStrataCount = isLargeMesa ? 5 : 3;
        for (let s = 1; s <= rightStrataCount; s++) {
          const t = s / (rightStrataCount + 1);
          const sy1 = topYPos + mesaH * 0.08 + t * (ry - topYPos);
          const sy2 = topYPos + mesaH * 0.05 + t * (ry - topYPos);
          ctx.beginPath();
          ctx.moveTo(rx, sy1);
          ctx.lineTo(rx + mesaW * 0.85 * (1 - t * 0.1), sy2);
          ctx.strokeStyle = s % 2 === 0 ? '#78350f' : '#b45309';
          ctx.lineWidth = isLargeMesa ? 2.5 : 1.8;
          ctx.stroke();
        }

        // 5. Platô Superior da Mesa (Plano / Levemente chanfrado)
        ctx.beginPath();
        ctx.moveTo(rx, topYPos - mesaH * 0.1);
        ctx.lineTo(rx - mesaW * 0.85, topYPos + mesaH * 0.05);
        ctx.lineTo(rx, topYPos + mesaH * 0.12);
        ctx.lineTo(rx + mesaW * 0.85, topYPos + mesaH * 0.05);
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Detalhes do Platô Superior (Fendas e textura de areia)
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(rx - mesaW * 0.25, topYPos + mesaH * 0.02, mesaW * 0.15, mesaH * 0.04, 0, 0, Math.PI * 2);
        ctx.ellipse(rx + mesaW * 0.3, topYPos + mesaH * 0.03, mesaW * 0.18, mesaH * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fendas no arenito
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rx - mesaW * 0.1, topYPos);
        ctx.lineTo(rx + mesaW * 0.15, topYPos + mesaH * 0.06);
        ctx.lineTo(rx + mesaW * 0.18, topYPos + mesaH * 0.35);
        ctx.stroke();

        // Arbusto seco ou pequeno cacto no topo em mesas grandes
        if (isLargeMesa) {
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(rx - mesaW * 0.35, topYPos - mesaH * 0.02, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(rx - mesaW * 0.35, topYPos - mesaH * 0.02 - 3, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if ((obsType as string) === 'monolith' || (obsType === 'rock' && (w >= 2 || h >= 2 || scale >= 1.6 || variant.includes('monolith') || variant.includes('boulder') || variant.includes('ridge')))) {
        // 🪨 MONÓLITO COLOSSAL / ROCHA GIGANTE 3D (Caverna, Masmorra, Floresta, Pântano)
        const isMonolith = w >= 3 || h >= 3 || variant.includes('monolith');
        const isLargeBoulder = w === 2 && h === 2;
        const rockScale = scale;
        const rockW = isoTileW * (isMonolith ? 1.3 : isLargeBoulder ? 0.92 : 0.72) * (rockScale / (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1));
        const rockH = isoTileH * (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1.3) * (rockScale / (isMonolith ? 2.5 : isLargeBoulder ? 1.8 : 1));
        const rx = objIsoX;
        const ry = objTopY + isoTileH * 0.55;
        const topYPos = ry - rockH;

        // 1. Sombra Ampla
        ctx.beginPath();
        ctx.ellipse(rx, ry + 4, rockW * 1.15, isoTileH * (isMonolith ? 0.6 : isLargeBoulder ? 0.4 : 0.25), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fill();

        // 2. Pedregulhos ao redor da base
        ctx.fillStyle = biome === 'Floresta' ? '#1e293b' : biome === 'Pântano' ? '#1e293b' : '#334155';
        ctx.beginPath();
        ctx.ellipse(rx - rockW * 0.65, ry + 2, rockW * 0.22, rockH * 0.12, 0, 0, Math.PI * 2);
        ctx.ellipse(rx + rockW * 0.6, ry + 3, rockW * 0.26, rockH * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Face Esquerda (Iluminada)
        ctx.beginPath();
        ctx.moveTo(rx, topYPos);
        ctx.lineTo(rx - rockW * 0.85, topYPos + rockH * 0.25);
        ctx.lineTo(rx - rockW * 0.95, ry - rockH * 0.15);
        ctx.lineTo(rx - rockW * 0.7, ry + 2);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = biome === 'Floresta' ? '#475569' : biome === 'Pântano' ? '#334155' : '#64748b';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4. Face Direita (Sombra)
        ctx.beginPath();
        ctx.moveTo(rx, topYPos);
        ctx.lineTo(rx + rockW * 0.85, topYPos + rockH * 0.22);
        ctx.lineTo(rx + rockW * 0.9, ry - rockH * 0.12);
        ctx.lineTo(rx + rockW * 0.7, ry + 3);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = biome === 'Floresta' ? '#1e293b' : biome === 'Pântano' ? '#0f172a' : '#334155';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 5. Crista / Topo Facetado
        ctx.beginPath();
        ctx.moveTo(rx, topYPos - rockH * 0.08);
        ctx.lineTo(rx - rockW * 0.5, topYPos + rockH * 0.12);
        ctx.lineTo(rx, topYPos + rockH * 0.2);
        ctx.lineTo(rx + rockW * 0.45, topYPos + rockH * 0.1);
        ctx.closePath();
        ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
          ? '#ffffff'
          : biome === 'Floresta' ? '#64748b' : biome === 'Pântano' ? '#475569' : '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = (!isIndoorEnv && weather === 'snow') ? '#f1f5f9' : '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 6. Rachaduras e Veios Cristalinos
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(rx - rockW * 0.25, topYPos + rockH * 0.3);
        ctx.lineTo(rx - rockW * 0.1, topYPos + rockH * 0.55);
        ctx.lineTo(rx - rockW * 0.35, ry - rockH * 0.1);
        ctx.stroke();

        // Minério de quartzo reluzente
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(rx - rockW * 0.12, topYPos + rockH * 0.52, 3, 3);
        ctx.fillRect(rx - rockW * 0.22, topYPos + rockH * 0.35, 2.5, 2.5);

        // 7. Musgo e Vegetação em Floresta e Pântano
        if (biome === 'Floresta' || biome === 'Pântano') {
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.ellipse(rx - rockW * 0.3, topYPos + rockH * 0.35, rockW * 0.25, rockH * 0.12, 0.2, 0, Math.PI * 2);
          ctx.ellipse(rx + rockW * 0.25, ry - rockH * 0.25, rockW * 0.2, rockH * 0.1, -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(rx - rockW * 0.3, topYPos + rockH * 0.32, 2, 2);
        }
      } else if (obsType === 'rock') {
        // 🪨 ROCHA 1x1 FACETADA COM VARIAÇÃO DE ESCALA
        const rockScale = scale;
        const rockW = isoTileW * 0.38 * rockScale;
        const rockH = isoTileH * 0.95 * rockScale;
        const rx = objIsoX;
        const ry = objTopY + isoTileH * 0.45;

        ctx.beginPath();
        ctx.ellipse(rx, ry + rockH * 0.1, rockW * 0.9, isoTileH * 0.22 * rockScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // Face Esquerda (Luz)
        ctx.beginPath();
        ctx.moveTo(rx, ry - rockH);
        ctx.lineTo(rx - rockW, ry - rockH * 0.4);
        ctx.lineTo(rx - rockW * 0.7, ry + rockH * 0.1);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = biome === 'Deserto' ? '#d97706' : '#64748b';
        ctx.fill();
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.stroke();

        // Face Direita (Sombra)
        ctx.beginPath();
        ctx.moveTo(rx, ry - rockH);
        ctx.lineTo(rx + rockW, ry - rockH * 0.35);
        ctx.lineTo(rx + rockW * 0.8, ry + rockH * 0.15);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = biome === 'Deserto' ? '#b45309' : '#334155';
        ctx.fill();
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1; ctx.stroke();

        // Topo Facetado (Brilho ou Neve Acumulada)
        ctx.beginPath();
        ctx.moveTo(rx, ry - rockH);
        ctx.lineTo(rx - rockW * 0.5, ry - rockH * 0.75);
        ctx.lineTo(rx, ry - rockH * 0.5);
        ctx.lineTo(rx + rockW * 0.4, ry - rockH * 0.7);
        ctx.closePath();
        ctx.fillStyle = (!isIndoorEnv && weather === 'snow')
          ? '#ffffff'
          : biome === 'Deserto' ? '#f59e0b' : '#94a3b8';
        ctx.fill();
      } else if (obsType === 'tree') {
        // 🌳 ÁRVORES EM 3D: ANCESTRAL (3x3), GRANDE (2x2) E VARIADAS (1x1: PINHEIRO, CARVALHO, PÂNTANO)
        const isGiant = w >= 3 || h >= 3 || scale >= 2.5 || variant.includes('giant');
        const isLarge = (w === 2 && h === 2) || scale >= 1.6 || variant.includes('large');
        const treeScale = scale;
        const baseY = objTopY + isoTileH * 0.55;

        // Sombra Projetada no Solo
        ctx.beginPath();
        ctx.ellipse(objIsoX, baseY + 2, isoTileW * (isGiant ? 1.2 : isLarge ? 0.75 : 0.38) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1)), isoTileH * (isGiant ? 0.65 : isLarge ? 0.42 : 0.22), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.fill();

        if (variant === 'pine_tree') {
          // 🌲 PINHEIRO CÔNICO REALISTA
          const pineH = isoTileH * 1.5 * treeScale;
          const pineW = isoTileW * 0.45 * treeScale;

          // Tronco Curto
          ctx.fillStyle = '#451a03';
          ctx.fillRect(objIsoX - isoTileW * 0.04 * treeScale, baseY - pineH * 0.25, isoTileW * 0.08 * treeScale, pineH * 0.25);

          // 3 Camadas Cônicas de Agulhas de Pinheiro
          const tiers = [
            { y: baseY - pineH * 0.18, w: pineW * 0.95, h: pineH * 0.35 },
            { y: baseY - pineH * 0.45, w: pineW * 0.75, h: pineH * 0.35 },
            { y: baseY - pineH * 0.72, w: pineW * 0.52, h: pineH * 0.38 }
          ];

          tiers.forEach(({ y, w: tw, h: th }) => {
            // Sombra da camada
            ctx.beginPath();
            ctx.moveTo(objIsoX, y - th);
            ctx.lineTo(objIsoX - tw, y);
            ctx.lineTo(objIsoX + tw, y);
            ctx.closePath();
            ctx.fillStyle = '#064e3b';
            ctx.fill();

            // Face esquerda (Luz)
            ctx.beginPath();
            ctx.moveTo(objIsoX, y - th);
            ctx.lineTo(objIsoX - tw, y);
            ctx.lineTo(objIsoX, y - th * 0.1);
            ctx.closePath();
            ctx.fillStyle = '#10b981';
            ctx.fill();

            // Face direita (Sombra)
            ctx.beginPath();
            ctx.moveTo(objIsoX, y - th);
            ctx.lineTo(objIsoX + tw, y);
            ctx.lineTo(objIsoX, y - th * 0.1);
            ctx.closePath();
            ctx.fillStyle = '#047857';
            ctx.fill();

            if (!isIndoorEnv && weather === 'snow') {
              // Neve branca sobre o topo de cada camada cônica do pinheiro
              ctx.beginPath();
              ctx.moveTo(objIsoX, y - th);
              ctx.lineTo(objIsoX - tw * 0.65, y - th * 0.35);
              ctx.lineTo(objIsoX + tw * 0.65, y - th * 0.35);
              ctx.closePath();
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            }
          });
        } else if (biome === 'Pântano' || variant.includes('swamp') || variant.includes('mangrove')) {
          // 🌳 ÁRVORE DE PÂNTANO / MANGUEZAL TORTUOSO
          const trunkW = isoTileW * (isGiant ? 0.22 : isLarge ? 0.14 : 0.09) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const trunkH = isoTileH * (isGiant ? 2.8 : isLarge ? 1.8 : 1.1) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const trunkTopY = baseY - trunkH;

          // Raízes aéreas de manguezal
          ctx.strokeStyle = '#291e0a';
          ctx.lineWidth = trunkW * 0.9;
          ctx.beginPath();
          ctx.moveTo(objIsoX, baseY - trunkH * 0.3);
          ctx.lineTo(objIsoX - trunkW * 2.5, baseY);
          ctx.moveTo(objIsoX, baseY - trunkH * 0.3);
          ctx.lineTo(objIsoX + trunkW * 2.5, baseY);
          ctx.stroke();

          // Tronco principal
          ctx.lineWidth = trunkW * 1.8;
          ctx.beginPath();
          ctx.moveTo(objIsoX, baseY);
          ctx.quadraticCurveTo(objIsoX - isoTileW * 0.15 * treeScale, baseY - trunkH * 0.5, objIsoX, trunkTopY);
          ctx.stroke();

          // Galhos e tufos
          const swampRadius = isoTileW * (isGiant ? 0.45 : isLarge ? 0.32 : 0.22) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const swampClusters = [
            { dx: -swampRadius * 1.1, dy: -trunkH * 0.1, r: swampRadius * 0.95 },
            { dx: swampRadius * 1.1, dy: -trunkH * 0.15, r: swampRadius * 0.9 },
            { dx: -swampRadius * 0.5, dy: -trunkH * 0.45, r: swampRadius * 1.05 },
            { dx: swampRadius * 0.6, dy: -trunkH * 0.4, r: swampRadius * 1.0 },
            { dx: 0, dy: -trunkH * 0.7, r: swampRadius * 1.15 },
          ];

          swampClusters.forEach(({ dx, dy, r }) => {
            const cx = objIsoX + dx;
            const cy = trunkTopY + dy;

            ctx.beginPath();
            ctx.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
            ctx.fillStyle = '#022c22';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = '#0f766e';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#14b8a6';
            ctx.fill();

            // Musgo pendente
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.3, cy + r * 0.5);
            ctx.lineTo(cx - r * 0.3, cy + r * 1.3);
            ctx.moveTo(cx + r * 0.2, cy + r * 0.6);
            ctx.lineTo(cx + r * 0.2, cy + r * 1.4);
            ctx.stroke();
          });
        } else {
          // 🌳 CARVALHO / ÁRVORE ANCESTRAL DE FLORESTA
          const trunkW = isoTileW * (isGiant ? 0.24 : isLarge ? 0.15 : 0.08) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const trunkH = isoTileH * (isGiant ? 2.7 : isLarge ? 1.7 : 1.0) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const trunkTopY = baseY - trunkH;

          // Raízes espalhadas
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(objIsoX - trunkW * 2.8, baseY);
          ctx.lineTo(objIsoX - trunkW, baseY - trunkH * 0.2);
          ctx.lineTo(objIsoX + trunkW, baseY - trunkH * 0.2);
          ctx.lineTo(objIsoX + trunkW * 2.8, baseY);
          ctx.closePath();
          ctx.fill();

          // Tronco
          ctx.fillStyle = '#78350f';
          ctx.fillRect(objIsoX - trunkW, trunkTopY, trunkW, trunkH);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(objIsoX, trunkTopY, trunkW, trunkH);

          // Galhos
          ctx.lineWidth = trunkW * 1.1;
          ctx.strokeStyle = '#78350f';
          ctx.beginPath();
          ctx.moveTo(objIsoX, trunkTopY + trunkH * 0.35);
          ctx.lineTo(objIsoX - isoTileW * (isGiant ? 0.45 : isLarge ? 0.3 : 0.2), trunkTopY + trunkH * 0.1);
          ctx.moveTo(objIsoX, trunkTopY + trunkH * 0.25);
          ctx.lineTo(objIsoX + isoTileW * (isGiant ? 0.5 : isLarge ? 0.32 : 0.22), trunkTopY);
          ctx.stroke();

          // Copa em Tufos Volumétricos
          const tuftR = isoTileW * (isGiant ? 0.48 : isLarge ? 0.34 : 0.23) * (treeScale / (isGiant ? 2.5 : isLarge ? 1.8 : 1));
          const clusters = [
            { dx: -tuftR * 0.95, dy: -trunkH * 0.15, r: tuftR * 0.95 },
            { dx: tuftR * 1.05, dy: -trunkH * 0.1, r: tuftR * 0.9 },
            { dx: -tuftR * 0.5, dy: -trunkH * 0.45, r: tuftR * 1.08 },
            { dx: tuftR * 0.6, dy: -trunkH * 0.42, r: tuftR * 1.02 },
            { dx: 0, dy: -trunkH * 0.75, r: tuftR * 1.2 },
            { dx: 0, dy: -trunkH * 0.3, r: tuftR * 1.1 },
          ];

          if (isGiant) {
            clusters.push(
              { dx: -tuftR * 1.6, dy: -trunkH * 0.35, r: tuftR * 0.8 },
              { dx: tuftR * 1.7, dy: -trunkH * 0.3, r: tuftR * 0.85 }
            );
          }

          clusters.forEach(({ dx, dy, r }) => {
            const cx = objIsoX + dx;
            const cy = trunkTopY + dy;

            // 1. Sombra do Tufo
            ctx.beginPath();
            ctx.arc(cx + 2, cy + 3, r, 0, Math.PI * 2);
            ctx.fillStyle = '#14532d';
            ctx.fill();

            // 2. Volume Médio
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = '#15803d';
            ctx.fill();

            // 3. Brilho do Sol (ou Neve Acumulada no clima de neve)
            ctx.beginPath();
            ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#ffffff' : '#22c55e';
            ctx.fill();

            // Texturas de folhinhas (ou cristais de neve)
            ctx.fillStyle = (!isIndoorEnv && weather === 'snow') ? '#f1f5f9' : '#86efac';
            ctx.fillRect(cx - r * 0.3, cy - r * 0.4, 2, 2);
            ctx.fillRect(cx + r * 0.1, cy - r * 0.2, 2, 2);
          });
        }
      } else if (obsType === 'cactus') {
        // 🌵 CACTOS EM 3D: BOSQUE 2x2 OU SAGUARO 1x1 COM VARIAÇÃO
        const isGrove = w >= 2 || h >= 2 || variant.includes('grove');
        const cactusScale = scale;
        const baseY = objTopY + isoTileH * 0.55;
        const cactusH = isoTileH * (isGrove ? 1.9 : 1.35) * (cactusScale / (isGrove ? 1.8 : 1));
        const stemR = isoTileW * (isGrove ? 0.11 : 0.085) * (cactusScale / (isGrove ? 1.8 : 1));
        const stemW = stemR * 2;

        // Sombra no Solo
        ctx.beginPath();
        ctx.ellipse(objIsoX, baseY + 2, isoTileW * (isGrove ? 0.65 : 0.32), isoTileH * (isGrove ? 0.35 : 0.18), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        const drawSaguaroStem = (cx: number, cy: number, ch: number, cw: number, hasFlower: boolean) => {
          const topYPos = cy - ch;
          const cr = cw / 2;

          // Contorno
          ctx.lineWidth = cw + 2.5;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx, topYPos);
          ctx.stroke();

          // Corpo Verde
          ctx.lineWidth = cw;
          ctx.strokeStyle = '#16a34a';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx, topYPos);
          ctx.stroke();

          // Sombreamento
          ctx.lineWidth = cw * 0.35;
          ctx.strokeStyle = '#14532d';
          ctx.beginPath();
          ctx.moveTo(cx + cr * 0.35, cy);
          ctx.lineTo(cx + cr * 0.35, topYPos);
          ctx.stroke();

          // Brilho
          ctx.lineWidth = cw * 0.28;
          ctx.strokeStyle = '#86efac';
          ctx.beginPath();
          ctx.moveTo(cx - cr * 0.35, cy);
          ctx.lineTo(cx - cr * 0.35, topYPos);
          ctx.stroke();

          // Braços laterais curvos
          const armW = cw * 0.78;
          const arm1StartY = cy - ch * 0.45;
          const arm1MidX = cx - isoTileW * 0.18 * (cactusScale / (isGrove ? 1.8 : 1));
          const arm1TopY = cy - ch * 0.8;

          ctx.lineWidth = armW + 2;
          ctx.strokeStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(cx, arm1StartY);
          ctx.quadraticCurveTo(arm1MidX, arm1StartY, arm1MidX, arm1TopY);
          ctx.stroke();

          ctx.lineWidth = armW;
          ctx.strokeStyle = '#15803d';
          ctx.beginPath();
          ctx.moveTo(cx, arm1StartY);
          ctx.quadraticCurveTo(arm1MidX, arm1StartY, arm1MidX, arm1TopY);
          ctx.stroke();

          if (hasFlower) {
            ctx.beginPath();
            ctx.arc(cx, topYPos - 2, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f43f5e';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, topYPos - 2, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fef08a';
            ctx.fill();
          }
        };

        if (isGrove) {
          // Três hastes de cacto de tamanhos variados
          drawSaguaroStem(objIsoX - isoTileW * 0.22, baseY, cactusH * 0.75, stemW * 0.85, false);
          drawSaguaroStem(objIsoX + isoTileW * 0.24, baseY, cactusH * 0.65, stemW * 0.8, true);
          drawSaguaroStem(objIsoX, baseY, cactusH, stemW, true);
        } else {
          drawSaguaroStem(objIsoX, baseY, cactusH, stemW, true);
        }
      } else if (biome === 'Masmorra' && obsType === 'pillar') {
        // 🏛️ PILAR OU ALTAR DE PEDRA DE MASMORRA (2x2 GRANDIOSO OU 1x1 ORNAMENTADO)
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
      } else if (biome === 'Masmorra' && obsType === 'cell_bars') {
        // ⛓️ GRADE DE CELA 3D
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
    }
  }
}
