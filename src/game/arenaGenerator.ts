import { CellData, BiomeType, GridPosition } from './types';
import { clearAreaAround } from './arena/arenaPlacementUtils';
import {
  generateCaveBiome,
  generateForestBiome,
  generateSwampBiome,
  generateDesertBiome,
} from './arena/generateOutdoorBiomes';
import { generateDungeonBiome } from './arena/generateDungeonBiome';

export interface GeneratedMap {
  grid: CellData[][];
  cols: number;
  rows: number;
  heroSpawn: GridPosition;
  monsterSpawns: GridPosition[];
  biome: BiomeType;
}

export function generateProceduralArena(
  biome: BiomeType = 'Caverna',
  cols: number = 14,
  rows: number = 10,
  monsterCount: number = 2
): GeneratedMap {
  const grid: CellData[][] = [];

  // 1. Inicializar matriz com terreno normal
  for (let r = 0; r < rows; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        x: c,
        y: r,
        terrain: 'normal',
        movementCost: 1,
        obstacleWidth: 1,
        obstacleHeight: 1,
        obstacleOriginX: c,
        obstacleOriginY: r,
        obstacleScale: 1.0,
      });
    }
    grid.push(row);
  }

  // Bioma efetivo para geração de terreno e obstáculos (Arena de Testes usa biomas normais sem monstros)
  const effectiveBiome: BiomeType =
    biome === 'Arena de Testes'
      ? (['Floresta', 'Caverna', 'Masmorra', 'Pântano', 'Deserto'][Math.floor(Math.random() * 5)] as BiomeType)
      : biome;

  // Paredes externas de borda para biomas externos
  if (effectiveBiome !== 'Masmorra') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
          grid[r][c].terrain = 'wall';
          grid[r][c].obstacleType =
            effectiveBiome === 'Floresta'
              ? 'tree'
              : effectiveBiome === 'Deserto'
              ? 'rock'
              : effectiveBiome === 'Pântano'
              ? 'tree'
              : 'rock';
          grid[r][c].movementCost = Infinity;
          grid[r][c].obstacleWidth = 1;
          grid[r][c].obstacleHeight = 1;
          grid[r][c].obstacleOriginX = c;
          grid[r][c].obstacleOriginY = r;
          grid[r][c].obstacleScale = 1.0;
        }
      }
    }
  }

  // 2. Aplicar algoritmo baseado no bioma
  if (effectiveBiome === 'Caverna') {
    generateCaveBiome(grid, cols, rows);
  } else if (effectiveBiome === 'Floresta') {
    generateForestBiome(grid, cols, rows);
  } else if (effectiveBiome === 'Pântano') {
    generateSwampBiome(grid, cols, rows);
  } else if (effectiveBiome === 'Deserto') {
    generateDesertBiome(grid, cols, rows);
  } else {
    generateDungeonBiome(grid, cols, rows);
  }

  // 3. Garantir área livre no spawn do jogador (centro do mapa)
  let heroSpawn: GridPosition = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  let monsterSpawns: GridPosition[] = [];

  if (biome === 'Arena de Testes') {
    heroSpawn = { x: 75, y: 75 };
    clearAreaAround(grid, heroSpawn.x, heroSpawn.y, 4);
    monsterSpawns = [];
  } else {
    clearAreaAround(grid, heroSpawn.x, heroSpawn.y);
    // 4. Pontos de spawn para os monstros (lado direito do grid)
    for (let i = 0; i < monsterCount; i++) {
      const mx = cols - 3;
      const my = Math.min(rows - 2, Math.max(1, Math.floor((rows / (monsterCount + 1)) * (i + 1))));
      clearAreaAround(grid, mx, my);
      monsterSpawns.push({ x: mx, y: my });
    }
  }

  return {
    grid,
    cols,
    rows,
    heroSpawn,
    monsterSpawns,
    biome,
  };
}
