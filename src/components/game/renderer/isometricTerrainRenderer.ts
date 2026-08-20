import { CellData } from '../../../game/types';

interface DrawIsometricTileProps {
  ctx: CanvasRenderingContext2D;
  cell: CellData;
  mapC: number;
  mapR: number;
  isoX: number;
  isoY: number;
  isoTileW: number;
  isoTileH: number;
  biome: string;
  weather: string;
  isNightOrDarkEnv: boolean;
  isIndoorEnv: boolean;
  highlightedPath: { x: number; y: number }[];
  activeLargeForm: boolean;
  hero: any;
}

/**
 * Desenha um único ladrilho (terreno, água, calçada, relevos 3D e grama/areia)
 * mantendo a compatibilidade estrita com o Painter's Algorithm.
 * Retorna o valor calculado de blockH para uso em elementos subsequentes da mesma célula.
 */
export function drawIsometricTile({
  ctx,
  cell,
  mapC,
  mapR,
  isoX,
  isoY,
  isoTileW,
  isoTileH,
  biome,
  weather,
  isNightOrDarkEnv,
  isIndoorEnv,
  highlightedPath,
  activeLargeForm,
  hero,
}: DrawIsometricTileProps): number {
  const displayBiome = biome === 'Arena de Testes' ? 'Floresta' : biome;

  // Determinar Altura do Bloco 3D (Extrusão Vertical)
  let blockH = 0;
  if (cell.terrain === 'wall') {
    if (displayBiome === 'Masmorra') {
      if (cell.obstacleType === 'pillar' || cell.obstacleType === 'cell_bars') blockH = 0;
      else blockH = isoTileH * 1.6; // Paredes de Pedra de Masmorra
    } else if (cell.obstacleType === 'brick_wall') {
      blockH = isoTileH * 1.6; // Muralha de cobertura total
    } else {
      // Árvores, rochas, cactos e vegetações em biomas abertos ficam no NÍVEL DO CHÃO
      blockH = 0;
    }
  } else if (cell.terrain === 'difficult') {
    // Terrenos difíceis permanecem no nível do chão (sem bloco elevado)
    blockH = 0;
  }

  // Paleta de Cores das Faces 3D do Bloco Isométrico (Ajustada para Clima de Neve, Dia e Noite)
  let topColor = '#1e293b';
  let leftColor = '#0f172a';
  let rightColor = '#334155';

  if (!isIndoorEnv && weather === 'snow') {
    // ❄️ CLIMA DE NEVE EM BIOMAS ABERTOS - Manto de neve branca / gélida cobrindo todo o cenário
    const snowSeed = (mapR * 13 + mapC * 17) % 3;
    if (!isNightOrDarkEnv) {
      // DIA COM NEVE: Neve branca pura reflexiva
      if (cell.terrain === 'difficult') {
        topColor = '#e2e8f0'; // Neve profunda / banco de gelo
        leftColor = '#94a3b8';
        rightColor = '#cbd5e1';
      } else {
        topColor = snowSeed === 0 ? '#ffffff' : snowSeed === 1 ? '#f8fafc' : '#f1f5f9';
        leftColor = '#cbd5e1';
        rightColor = '#e2e8f0';
      }
    } else {
      // NOITE COM NEVE: Neve sob o luar gélido azulado
      if (cell.terrain === 'difficult') {
        topColor = '#94a3b8';
        leftColor = '#475569';
        rightColor = '#64748b';
      } else {
        topColor = snowSeed === 0 ? '#e2e8f0' : snowSeed === 1 ? '#cbd5e1' : '#dbeafe';
        leftColor = '#64748b';
        rightColor = '#94a3b8';
      }
    }
  } else if (displayBiome === 'Floresta') {
    if (!isNightOrDarkEnv) {
      // DIA (CLARO) - Grama vibrante e ensolarada
      if (cell.terrain === 'difficult') {
        topColor = '#15803d'; leftColor = '#14532d'; rightColor = '#22c55e';
      } else {
        topColor = '#22c55e'; leftColor = '#15803d'; rightColor = '#4ade80';
      }
    } else {
      // NOITE (ESCURO) - Grama em tom verde noturno sombrio
      if (cell.terrain === 'difficult') {
        topColor = '#14532d'; leftColor = '#0f3923'; rightColor = '#166534';
      } else {
        topColor = '#15803d'; leftColor = '#14532d'; rightColor = '#166534';
      }
    }
  } else if (displayBiome === 'Deserto') {
    if (!isNightOrDarkEnv) {
      // DIA (CLARO) - Areia dourada quente ensolarada
      if (cell.terrain === 'difficult') {
        topColor = '#d97706'; leftColor = '#92400e'; rightColor = '#f59e0b';
      } else {
        topColor = '#f59e0b'; leftColor = '#d97706'; rightColor = '#fbbf24';
      }
    } else {
      // NOITE (ESCURO) - Areia do deserto sob o luar azulado
      if (cell.terrain === 'difficult') {
        topColor = '#b45309'; leftColor = '#78350f'; rightColor = '#92400e';
      } else {
        topColor = '#d97706'; leftColor = '#92400e'; rightColor = '#f59e0b';
      }
    }
  } else if (displayBiome === 'Pântano') {
    if (!isNightOrDarkEnv) {
      // DIA (CLARO) - Lama e musgo ensolarado
      if (cell.terrain === 'difficult') {
        topColor = '#0d9488'; leftColor = '#042f2e'; rightColor = '#14b8a6';
      } else {
        topColor = '#14b8a6'; leftColor = '#0f766e'; rightColor = '#2dd4bf';
      }
    } else {
      // NOITE (ESCURO) - Pântano escuro e misterioso
      if (cell.terrain === 'difficult') {
        topColor = '#042f2e'; leftColor = '#021c1b'; rightColor = '#0d9488';
      } else {
        topColor = '#0f766e'; leftColor = '#042f2e'; rightColor = '#115e59';
      }
    }
  } else if (displayBiome === 'Masmorra') {
    if (cell.terrain === 'wall') {
      topColor = cell.obstacleType === 'pillar' ? '#64748b' : '#3b485e';
      leftColor = '#1c2536';
      rightColor = '#2d3d54';
    } else if (cell.dungeonFeature === 'hall') {
      topColor = '#222e3d'; leftColor = '#0f172a'; rightColor = '#1a2433';
    } else {
      // Variação rica de tons de pedra no chão da masmorra
      const stoneVar = (mapR * 7 + mapC * 11) % 4;
      topColor = stoneVar === 0 ? '#1e293b' : stoneVar === 1 ? '#273549' : stoneVar === 2 ? '#1a2332' : '#223042';
      leftColor = '#0d131f'; rightColor = '#16202e';
    }
  }

  if (cell.terrain === 'water') {
    topColor = '#0284c7'; // Água
    leftColor = '#075985';
    rightColor = '#0369a1';
  }

  // Destaque do Caminho em 3D e da área 2x2 do Golias em Forma Grande
  const isHighlighted = highlightedPath.some(p => p.x === mapC && p.y === mapR);
  const isGoliathCell = activeLargeForm && hero && mapC >= hero.x && mapC < hero.x + 2 && mapR >= hero.y && mapR < hero.y + 2;
  if (isHighlighted) {
    topColor = '#f59e0b';
    leftColor = '#b45309';
    rightColor = '#d97706';
  } else if (isGoliathCell) {
    topColor = '#d97706';
    leftColor = '#78350f';
    rightColor = '#92400e';
  }

  // Desenhar as 3 Faces do Bloco 3D Isométrico
  const topY = isoY - blockH;

  // 1. Face Direita do Bloco 3D
  if (blockH > 0) {
    ctx.beginPath();
    ctx.moveTo(isoX, topY + isoTileH);
    ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
    ctx.lineTo(isoX + isoTileW / 2, isoY + isoTileH / 2);
    ctx.lineTo(isoX, isoY + isoTileH);
    ctx.closePath();
    ctx.fillStyle = rightColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.stroke();

    // Textura Pixel Art de Tijolos de Pedra na Masmorra (Face Direita)
    if (biome === 'Masmorra' && cell.terrain === 'wall') {
      const hRows = 3;
      const rowHeight = blockH / hRows;
      for (let r = 0; r < hRows; r++) {
        const y1 = topY + isoTileH + r * rowHeight;
        const y2 = Math.min(y1 + rowHeight, isoY + isoTileH);

        // Argamassa escuro
        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(isoX, y1);
        ctx.lineTo(isoX + isoTileW / 2, y1 - isoTileH / 2);
        ctx.stroke();

        // Bisel claro no topo do tijolo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(isoX, y1 + 1);
        ctx.lineTo(isoX + isoTileW / 2, y1 - isoTileH / 2 + 1);
        ctx.stroke();

        // Juntas verticais intercaladas
        const tJoints = (r % 2 === 0) ? [0.33, 0.67] : [0.5];
        tJoints.forEach(t => {
          const jx = isoX + t * (isoTileW / 2);
          const jy1 = y1 - t * (isoTileH / 2);
          const jy2 = Math.min(y2 - t * (isoTileH / 2), isoY + isoTileH / 2 + (1 - t) * (isoTileH / 2));
          ctx.strokeStyle = '#070a14';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(jx, jy1);
          ctx.lineTo(jx, jy2);
          ctx.stroke();
        });
      }

      // Musgo/Limo nas juntas de algumas paredes da masmorra
      if ((mapR * 5 + mapC * 9) % 3 === 0) {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(isoX + isoTileW * 0.2, isoY + isoTileH * 0.7, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Face Esquerda do Bloco 3D
    ctx.beginPath();
    ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
    ctx.lineTo(isoX, topY + isoTileH);
    ctx.lineTo(isoX, isoY + isoTileH);
    ctx.lineTo(isoX - isoTileW / 2, isoY + isoTileH / 2);
    ctx.closePath();
    ctx.fillStyle = leftColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();

    // Textura Pixel Art de Tijolos de Pedra na Masmorra (Face Esquerda)
    if (biome === 'Masmorra' && cell.terrain === 'wall') {
      const hRows = 3;
      const rowHeight = blockH / hRows;
      for (let r = 0; r < hRows; r++) {
        const y1 = topY + isoTileH + r * rowHeight;
        const y2 = Math.min(y1 + rowHeight, isoY + isoTileH);

        // Argamassa escura
        ctx.strokeStyle = '#040711';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(isoX - isoTileW / 2, y1 - isoTileH / 2);
        ctx.lineTo(isoX, y1);
        ctx.stroke();

        // Bisel sutil no topo do tijolo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(isoX - isoTileW / 2, y1 - isoTileH / 2 + 1);
        ctx.lineTo(isoX, y1 + 1);
        ctx.stroke();

        // Juntas verticais intercaladas
        const tJoints = (r % 2 === 1) ? [0.33, 0.67] : [0.5];
        tJoints.forEach(t => {
          const jx = isoX - (1 - t) * (isoTileW / 2);
          const jy1 = y1 - (1 - t) * (isoTileH / 2);
          const jy2 = Math.min(y2 - (1 - t) * (isoTileH / 2), isoY + isoTileH / 2 + t * (isoTileH / 2));
          ctx.strokeStyle = '#03050a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(jx, jy1);
          ctx.lineTo(jx, jy2);
          ctx.stroke();
        });
      }

      // Musgo escuro na face esquerda
      if ((mapR * 7 + mapC * 3) % 3 === 0) {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(isoX - isoTileW * 0.2, isoY + isoTileH * 0.7, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Face Superior do Bloco 3D (Diamante Lit Top)
  ctx.beginPath();
  ctx.moveTo(isoX, topY);
  ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
  ctx.lineTo(isoX, topY + isoTileH);
  ctx.lineTo(isoX - isoTileW / 2, topY + isoTileH / 2);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();

  // Borda de Bisel Pixel Art nas Arestas Superiores
  ctx.strokeStyle = blockH > 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Textura de Lajotas de Pedra Realistas e Capas no Bioma Masmorra
  if (biome === 'Masmorra') {
    if (cell.terrain === 'wall') {
      // Moldura/Capa de pedra trabalhada no topo da parede
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(isoX, topY);
      ctx.lineTo(isoX, topY + isoTileH);
      ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
      ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
      ctx.stroke();

      // Bisel nos cantos do bloco superior
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 2, topY + isoTileH / 2);
      ctx.lineTo(isoX, topY);
      ctx.lineTo(isoX + isoTileW / 2, topY + isoTileH / 2);
      ctx.stroke();
    } else {
      // PAVIMENTO DE LAJOTAS ENCAIXADAS DO CHÃO DA MASMORRA
      ctx.strokeStyle = '#080d1a';
      ctx.lineWidth = 1.8;

      // Divisão em 4 lajotas de pedra encaixadas por célula
      ctx.beginPath();
      ctx.moveTo(isoX - isoTileW / 4, topY + isoTileH / 4);
      ctx.lineTo(isoX + isoTileW / 4, topY + isoTileH * 0.75);
      ctx.moveTo(isoX - isoTileW / 4, topY + isoTileH * 0.75);
      ctx.lineTo(isoX + isoTileW / 4, topY + isoTileH / 4);
      ctx.stroke();

      // Moldura perimetral sutil das pedras
      ctx.strokeStyle = '#090e1c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(isoX, topY + 2);
      ctx.lineTo(isoX + isoTileW / 2 - 2, topY + isoTileH / 2);
      ctx.lineTo(isoX, topY + isoTileH - 2);
      ctx.lineTo(isoX - isoTileW / 2 + 2, topY + isoTileH / 2);
      ctx.closePath();
      ctx.stroke();

      // Realce de Bisel (Highlights) nas bordas superiores de cada lajota
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Lajota Superior
      ctx.moveTo(isoX - isoTileW / 4 + 1, topY + isoTileH / 4 + 1);
      ctx.lineTo(isoX, topY + 3);
      ctx.lineTo(isoX + isoTileW / 4 - 1, topY + isoTileH / 4 + 1);
      // Lajotas Laterais
      ctx.moveTo(isoX - isoTileW / 2 + 3, topY + isoTileH / 2);
      ctx.lineTo(isoX - isoTileW / 4 + 1, topY + isoTileH / 4 + 1);
      ctx.stroke();

      // Detalhes Especiais no Chão
      const seed = (mapR * 17 + mapC * 31) % 10;
      if (seed === 0 || seed === 5) {
        // Musgo / Limo verde crescendo nas juntas da pedra
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(isoX, topY + isoTileH / 2, 3, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (seed === 2) {
        // Rachadura realista na pedra
        ctx.strokeStyle = '#050811';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(isoX - 3, topY + isoTileH * 0.3);
        ctx.lineTo(isoX + 2, topY + isoTileH * 0.45);
        ctx.lineTo(isoX - 1, topY + isoTileH * 0.65);
        ctx.stroke();
      } else if (seed === 8) {
        // Runa Mística Brilhante entalhada na pedra do chão
        const runeY = topY + isoTileH / 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(isoX, runeY, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(isoX - 2, runeY);
        ctx.lineTo(isoX + 2, runeY);
        ctx.moveTo(isoX, runeY - 2);
        ctx.lineTo(isoX, runeY + 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Indicadores de Terreno Difícil no nível do chão (sem transparência de emoji)
  if (cell.terrain === 'difficult') {
    const gy = topY + isoTileH * 0.5;
    if (biome === 'Deserto') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(isoX - 4, gy - 6, 2, 8);
      ctx.fillRect(isoX, gy - 9, 2, 11);
      ctx.fillRect(isoX + 4, gy - 5, 2, 7);
    } else if (biome === 'Pântano') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(isoX - 4, gy, 4, 0, Math.PI);
      ctx.arc(isoX + 4, gy, 4, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(isoX - 4, gy - 2, 2, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(isoX, gy - 4, 2, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(isoX + 4, gy - 2, 2, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return blockH;
}
