import { CellData } from '../../types';
import {
  canPlaceObstacle,
  placeMultiCellObstacle,
  isSafeDistanceFromLargeObstacles,
  placeSingleCellObstacle,
} from '../arenaPlacementUtils';

export function generateSwampBiome(grid: CellData[][], cols: number, rows: number): void {
  // 1. Manguezais Gigantes 3x3
  const giantSwampAttempts = Math.max(1, Math.floor((cols * rows) / 800));
  for (let i = 0; i < giantSwampAttempts * 4; i++) {
    const rx = Math.floor(Math.random() * (cols - 8)) + 4;
    const ry = Math.floor(Math.random() * (rows - 8)) + 4;
    if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
      placeMultiCellObstacle(grid, rx, ry, 3, 3, 'tree', 'giant_mangrove', 3.0);
    }
  }

  // 2. Manguezais e Ciprestes Grandes 2x2
  const largeSwampTreeAttempts = Math.max(3, Math.floor((cols * rows) / 220));
  for (let i = 0; i < largeSwampTreeAttempts * 3; i++) {
    const rx = Math.floor(Math.random() * (cols - 6)) + 3;
    const ry = Math.floor(Math.random() * (rows - 6)) + 3;
    if (canPlaceObstacle(grid, rx, ry, 2, 2, cols, rows, 2)) {
      const isMudRock = Math.random() < 0.25;
      if (isMudRock) {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'rock', 'swamp_crag', 1.85);
      } else {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'tree', 'large_cypress', 2.0);
      }
    }
  }

  // 3. Troncos Podres e Submersos (1x2, 2x1, 1x3, 3x1)
  const swampLogAttempts = Math.max(4, Math.floor((cols * rows) / 160));
  for (let i = 0; i < swampLogAttempts * 3; i++) {
    const isHorizontal = Math.random() < 0.5;
    const len = Math.random() < 0.65 ? 2 : 3;
    const w = isHorizontal ? len : 1;
    const h = isHorizontal ? 1 : len;
    const rx = Math.floor(Math.random() * (cols - w - 4)) + 2;
    const ry = Math.floor(Math.random() * (rows - h - 4)) + 2;
    if (canPlaceObstacle(grid, rx, ry, w, h, cols, rows, 1)) {
      placeMultiCellObstacle(grid, rx, ry, w, h, 'fallen_log', isHorizontal ? 'swamp_log_h' : 'swamp_log_v', 1.25);
    }
  }

  // 4. Árvores e Rochas Pantanosas 1x1
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (grid[r][c].terrain === 'normal' && isSafeDistanceFromLargeObstacles(grid, c, r, 2)) {
        const rand = Math.random();
        if (rand < 0.06) {
          const isRock = Math.random() < 0.2;
          const scale = 0.8 + Math.random() * 0.45;
          if (isRock) {
            placeSingleCellObstacle(grid, c, r, 'rock', 'swamp_stone', scale);
          } else {
            const variant = Math.random() < 0.5 ? 'swamp_tree' : 'dead_tree';
            placeSingleCellObstacle(grid, c, r, 'tree', variant, scale);
          }
        } else if (rand < 0.28) {
          grid[r][c].terrain = 'difficult';
          grid[r][c].movementCost = 2;
        } else if (rand > 0.994) {
          grid[r][c].hasTrap = true;
          grid[r][c].trapType = 'mud';
          grid[r][c].isHiddenTrap = true;
          grid[r][c].trapSaveDC = 13;
          grid[r][c].trapSaveStat = 'str';
        }
      }
    }
  }
}

export function generateDesertBiome(grid: CellData[][], cols: number, rows: number): void {
  // 1. Mesas / Monólitos de Arenito 3x3
  const mesaAttempts = Math.max(1, Math.floor((cols * rows) / 800));
  for (let i = 0; i < mesaAttempts * 4; i++) {
    const rx = Math.floor(Math.random() * (cols - 8)) + 4;
    const ry = Math.floor(Math.random() * (rows - 8)) + 4;
    if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
      placeMultiCellObstacle(grid, rx, ry, 3, 3, 'monolith', 'desert_mesa', 2.9);
    }
  }

  // 2. Formações Rochosas de Arenito e Bosque de Cactos 2x2
  const largeDesertRockAttempts = Math.max(3, Math.floor((cols * rows) / 220));
  for (let i = 0; i < largeDesertRockAttempts * 3; i++) {
    const rx = Math.floor(Math.random() * (cols - 6)) + 3;
    const ry = Math.floor(Math.random() * (rows - 6)) + 3;
    if (canPlaceObstacle(grid, rx, ry, 2, 2, cols, rows, 2)) {
      const isCactusGrove = Math.random() < 0.45;
      if (isCactusGrove) {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'cactus', 'giant_cactus_grove', 1.95);
      } else {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'rock', 'sandstone_crag', 1.85);
      }
    }
  }

  // 3. Cristas de Arenito Alongadas (1x2, 2x1, 1x3, 3x1)
  const desertRidgeAttempts = Math.max(4, Math.floor((cols * rows) / 160));
  for (let i = 0; i < desertRidgeAttempts * 3; i++) {
    const isHorizontal = Math.random() < 0.5;
    const len = Math.random() < 0.65 ? 2 : 3;
    const w = isHorizontal ? len : 1;
    const h = isHorizontal ? 1 : len;
    const rx = Math.floor(Math.random() * (cols - w - 4)) + 2;
    const ry = Math.floor(Math.random() * (rows - h - 4)) + 2;
    if (canPlaceObstacle(grid, rx, ry, w, h, cols, rows, 1)) {
      placeMultiCellObstacle(grid, rx, ry, w, h, 'rock', isHorizontal ? 'sandstone_ridge_h' : 'sandstone_ridge_v', 1.35);
    }
  }

  // 4. Cactos Saguaro 1x1 e Rochas do Deserto
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (grid[r][c].terrain === 'normal' && isSafeDistanceFromLargeObstacles(grid, c, r, 2)) {
        const rand = Math.random();
        if (rand < 0.055) {
          const isRock = Math.random() < 0.35;
          const scale = 0.75 + Math.random() * 0.45;
          if (isRock) {
            placeSingleCellObstacle(grid, c, r, 'rock', 'desert_stone', scale);
          } else {
            const variant = scale > 1.1 ? 'saguaro_tall' : scale > 0.9 ? 'saguaro_medium' : 'saguaro_flower';
            placeSingleCellObstacle(grid, c, r, 'cactus', variant, scale);
          }
        } else if (rand < 0.22) {
          grid[r][c].terrain = 'difficult';
          grid[r][c].movementCost = 2;
        } else if (rand > 0.993) {
          grid[r][c].hasTrap = true;
          grid[r][c].trapType = 'quicksand';
          grid[r][c].isHiddenTrap = true;
          grid[r][c].trapDamage = 4;
          grid[r][c].trapSaveDC = 12;
          grid[r][c].trapSaveStat = 'str';
        }
      }
    }
  }
}
