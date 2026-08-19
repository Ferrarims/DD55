import { useEffect, MutableRefObject } from 'react';
import { CombatEntity, BiomeType, WeatherType, CellData } from '../../../game/types';

interface UseMinimapRendererProps {
  minimapRef: MutableRefObject<HTMLCanvasElement | null>;
  grid: CellData[][];
  entities: CombatEntity[];
  biome: BiomeType;
  weather: WeatherType;
  cols: number;
  rows: number;
  isFullscreenMap: boolean;
  isNight: boolean;
  getHeroLightRadiusInCells: any;
  heroHasBlindFighting: () => boolean;
  exploredCellsRef: any;
  isEntityVisible: any;
}

export function useMinimapRenderer({
  minimapRef, grid, entities, biome, weather, cols, rows, isFullscreenMap,
  isNight, getHeroLightRadiusInCells, heroHasBlindFighting, exploredCellsRef, isEntityVisible
}: UseMinimapRendererProps) {

  // Renderizador do Minimapa
  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas || !grid || grid.length === 0 || !grid[0]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hero = entities.find(e => e.type === 'hero');
    const heroX = hero && !hero.isDead ? hero.x : Math.floor(150 / 2);
    const heroY = hero && !hero.isDead ? hero.y : Math.floor(150 / 2);

    // 3x3 telas (3 vezes o número de colunas e linhas da câmera principal)
    const minimapCols = cols * 3; // 14 * 3 = 42
    const minimapRows = rows * 3; // 12 * 3 = 36
    const cellSize = 3;

    canvas.width = minimapCols * cellSize;
    canvas.height = minimapRows * cellSize;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startCol = Math.max(0, Math.min(150 - minimapCols, heroX - Math.floor(minimapCols / 2)));
    const startRow = Math.max(0, Math.min(150 - minimapRows, heroY - Math.floor(minimapRows / 2)));

    ctx.save();

    // Atualiza células exploradas com base na visão do herói
    const visibleCells = new Set<string>();
    if (hero && !hero.isDead) {
      const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
      const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));
      
      let visionRadius = 25; // day default
      if (isDarkEnv) {
         visionRadius = getHeroLightRadiusInCells();
         if (hero.hasDarkvision) {
           const dvCells = (hero.darkvisionRange || 18) / 1.5;
           if (dvCells > visionRadius) visionRadius = dvCells;
         }
      }
      if (heroHasBlindFighting() && visionRadius < 2) {
        visionRadius = 2;
      }
      
      exploredCellsRef.current.add(`${hero.x},${hero.y}`);
      visibleCells.add(`${hero.x},${hero.y}`);
      for (let i = 0; i < 360; i += 2) {
        const dx = Math.cos(i * (Math.PI / 180));
        const dy = Math.sin(i * (Math.PI / 180));
        let ox = hero.x + 0.5;
        let oy = hero.y + 0.5;
        for (let j = 0; j <= visionRadius; j++) {
          const gx = Math.floor(ox);
          const gy = Math.floor(oy);
          if (gy < 0 || gy >= grid.length || gx < 0 || gx >= (grid[0]?.length || 150)) break;
          exploredCellsRef.current.add(`${gx},${gy}`);
          visibleCells.add(`${gx},${gy}`);
          const isFlying = Boolean(hero.conditions?.includes('Voando'));
          if (grid[gy][gx].terrain === 'wall' && !isFlying) break;
          ox += dx;
          oy += dy;
        }
      }
    }

    // Draw terrain
    const isIndoorEnv = biome === 'Caverna' || biome === 'Masmorra';
    for (let r = startRow; r < Math.min(150, startRow + minimapRows); r++) {
      for (let c = startCol; c < Math.min(150, startCol + minimapCols); c++) {
        if (!exploredCellsRef.current.has(`${c},${r}`)) continue;
        const cell = grid[r][c];
        const drawX = (c - startCol) * cellSize;
        const drawY = (r - startRow) * cellSize;
        if (!isIndoorEnv && weather === 'snow') {
          if (cell.terrain === 'wall') {
            ctx.fillStyle = '#64748b'; // Obstáculo na neve
          } else if (cell.terrain === 'water') {
            ctx.fillStyle = '#38bdf8'; // Água gélida
          } else if (cell.movementCost > 1) {
            ctx.fillStyle = '#cbd5e1'; // Neve fofa / terreno difícil
          } else {
            ctx.fillStyle = '#f8fafc'; // Piso nevado
          }
          ctx.fillRect(drawX, drawY, cellSize, cellSize);
        } else if (cell.terrain === 'wall') {
          ctx.fillStyle = '#334155'; // Darker gray for walls
          ctx.fillRect(drawX, drawY, cellSize, cellSize);
        } else if (cell.terrain === 'water') {
          ctx.fillStyle = '#0369a1'; // Blue for water
          ctx.fillRect(drawX, drawY, cellSize, cellSize);
        } else if (cell.movementCost > 1) {
          ctx.fillStyle = '#64748b'; // Difficult terrain
          ctx.fillRect(drawX, drawY, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#94a3b8'; // Normal floor
          ctx.fillRect(drawX, drawY, cellSize, cellSize);
        }
        if (!visibleCells.has(`${c},${r}`)) {
           ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
           ctx.fillRect(drawX, drawY, cellSize, cellSize);
        }
      }
    }

    // Draw monsters
    entities.forEach(ent => {
      if (ent.type === 'monster' && !ent.isDead && ent.x >= startCol && ent.x < startCol + minimapCols && ent.y >= startRow && ent.y < startRow + minimapRows) {
        if (!visibleCells.has(`${ent.x},${ent.y}`)) return;
        if (!isEntityVisible(ent)) return;
        ctx.fillStyle = '#ef4444'; // Red for monsters
        const drawX = (ent.x - startCol) * cellSize;
        const drawY = (ent.y - startRow) * cellSize;
        ctx.fillRect(drawX - 1, drawY - 1, cellSize + 2, cellSize + 2);
      }
    });

    // Draw hero
    if (hero && !hero.isDead) {
      const drawX = (hero.x - startCol) * cellSize;
      const drawY = (hero.y - startRow) * cellSize;
      ctx.fillStyle = '#38bdf8'; // Light blue for hero
      ctx.fillRect(drawX - 1, drawY - 1, cellSize + 2, cellSize + 2);
      
      // Draw a larger ring around the hero to make them easier to spot
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.arc(drawX + cellSize/2, drawY + cellSize/2, 6, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw camera bounds (viewable area)
      const cameraX = Math.max(0, Math.min(150 - cols, hero.x - Math.floor(cols / 2)));
      const cameraY = Math.max(0, Math.min(150 - rows, hero.y - Math.floor(rows / 2)));
      const camDrawX = (cameraX - startCol) * cellSize;
      const camDrawY = (cameraY - startRow) * cellSize;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(camDrawX, camDrawY, cols * cellSize, rows * cellSize);
    }
    
    ctx.restore();
  }, [grid, entities, cols, rows, isFullscreenMap, weather, biome]);
}
