export interface Render2DTerrainFloorProps {
  ctx: CanvasRenderingContext2D;
  grid: any[][];
  cameraX: number;
  cameraY: number;
  cols: number;
  rows: number;
  cellSize: number;
  biome: string;
  weather: string;
  isNight: boolean;
  isIndoorEnv: boolean;
}

export function render2DTerrainFloor({
  ctx,
  grid,
  cameraX,
  cameraY,
  cols,
  rows,
  cellSize,
  biome,
  weather,
  isNight,
  isIndoorEnv
}: Render2DTerrainFloorProps): void {
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
          ctx.fillStyle = isNight ? '#94a3b8' : '#e2e8f0';
        } else {
          ctx.fillStyle = biome === 'Floresta' ? '#14532d' : biome === 'Pântano' ? '#164e63' : biome === 'Deserto' ? '#b45309' : '#1e293b';
        }
      } else if (cell.terrain === 'difficult') {
        if (biome === 'Masmorra') {
          ctx.fillStyle = cell.dungeonFeature === 'cell' ? '#0f172a' : '#283141';
        } else if (!isIndoorEnv && weather === 'snow') {
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
          const snowSeed = (mapR * 13 + mapC * 17) % 3;
          ctx.fillStyle = isNight
            ? (snowSeed === 0 ? '#cbd5e1' : snowSeed === 1 ? '#94a3b8' : '#cbd5e1')
            : (snowSeed === 0 ? '#ffffff' : snowSeed === 1 ? '#f8fafc' : '#f1f5f9');
        } else {
          ctx.fillStyle = biome === 'Floresta' ? '#14532d' : biome === 'Pântano' ? '#164e63' : biome === 'Deserto' ? '#b45309' : '#1e293b';
        }
      }

      ctx.fillRect(px, py, cellSize, cellSize);

      // Sombreamento 3D abaixo de paredes na Masmorra
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
}
