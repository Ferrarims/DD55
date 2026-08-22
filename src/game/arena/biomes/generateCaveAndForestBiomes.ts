import { CellData } from '../../types';
import {
  canPlaceObstacle,
  placeMultiCellObstacle,
  isSafeDistanceFromLargeObstacles,
  placeSingleCellObstacle,
} from '../arenaPlacementUtils';

export function generateCaveBiome(grid: CellData[][], cols: number, rows: number): void {
  // 1. Monólitos 3x3
  const giantAttempts = Math.max(1, Math.floor((cols * rows) / 900));
  for (let i = 0; i < giantAttempts * 3; i++) {
    const rx = Math.floor(Math.random() * (cols - 8)) + 4;
    const ry = Math.floor(Math.random() * (rows - 8)) + 4;
    if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
      placeMultiCellObstacle(grid, rx, ry, 3, 3, 'rock', 'monolith', 2.8);
    }
  }

  // 2. Rochas Grandes 2x2
  const largeRockAttempts = Math.max(3, Math.floor((cols * rows) / 250));
  for (let i = 0; i < largeRockAttempts * 3; i++) {
    const rx = Math.floor(Math.random() * (cols - 6)) + 3;
    const ry = Math.floor(Math.random() * (rows - 6)) + 3;
    if (canPlaceObstacle(grid, rx, ry, 2, 2, cols, rows, 1)) {
      placeMultiCellObstacle(grid, rx, ry, 2, 2, 'rock', 'boulder_large', 1.9);
    }
  }

  // 3. Cristas de Rocha / Paredes de Estalagmites Alongadas (1x2, 2x1, 1x3, 3x1)
  const elongatedAttempts = Math.max(4, Math.floor((cols * rows) / 180));
  for (let i = 0; i < elongatedAttempts * 3; i++) {
    const isHorizontal = Math.random() < 0.5;
    const len = Math.random() < 0.7 ? 2 : 3;
    const w = isHorizontal ? len : 1;
    const h = isHorizontal ? 1 : len;
    const rx = Math.floor(Math.random() * (cols - w - 4)) + 2;
    const ry = Math.floor(Math.random() * (rows - h - 4)) + 2;
    if (canPlaceObstacle(grid, rx, ry, w, h, cols, rows, 1)) {
      placeMultiCellObstacle(grid, rx, ry, w, h, 'rock', isHorizontal ? 'rock_ridge_h' : 'rock_ridge_v', 1.4);
    }
  }

  // 4. Rochas e Estalagmites 1x1 Individuais
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (grid[r][c].terrain === 'normal' && isSafeDistanceFromLargeObstacles(grid, c, r, 2)) {
        const rand = Math.random();
        if (rand < 0.05) {
          const scale = 0.75 + Math.random() * 0.45;
          const variant = Math.random() < 0.4 ? 'stalagmite_sharp' : Math.random() < 0.7 ? 'rock_medium' : 'rock_small';
          placeSingleCellObstacle(grid, c, r, 'rock', variant, scale);
        } else if (rand < 0.22) {
          grid[r][c].terrain = 'difficult';
          grid[r][c].movementCost = 2;
        } else if (rand > 0.994) {
          grid[r][c].hasTrap = true;
          grid[r][c].trapType = 'web';
          grid[r][c].isHiddenTrap = true;
          grid[r][c].trapSaveDC = 12;
          grid[r][c].trapSaveStat = 'dex';
        }
      }
    }
  }
}

export function generateForestBiome(grid: CellData[][], cols: number, rows: number): void {
  // 1. Árvores Ancestrais 3x3
  const elderTreeAttempts = Math.max(1, Math.floor((cols * rows) / 800));
  for (let i = 0; i < elderTreeAttempts * 4; i++) {
    const rx = Math.floor(Math.random() * (cols - 8)) + 4;
    const ry = Math.floor(Math.random() * (rows - 8)) + 4;
    if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
      placeMultiCellObstacle(grid, rx, ry, 3, 3, 'tree', 'giant_oak', 3.0);
    }
  }

  // 2. Árvores Grandes 2x2 (Carvalhos Densos)
  const largeTreeAttempts = Math.max(3, Math.floor((cols * rows) / 220));
  for (let i = 0; i < largeTreeAttempts * 3; i++) {
    const rx = Math.floor(Math.random() * (cols - 6)) + 3;
    const ry = Math.floor(Math.random() * (rows - 6)) + 3;
    if (canPlaceObstacle(grid, rx, ry, 2, 2, cols, rows, 2)) {
      const isRock = Math.random() < 0.25;
      if (isRock) {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'rock', 'boulder_mossy', 1.85);
      } else {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'tree', 'large_oak', 2.0);
      }
    }
  }

  // 3. Troncos Caídos Alongados (1x2, 2x1, 1x3, 3x1)
  const logAttempts = Math.max(4, Math.floor((cols * rows) / 160));
  for (let i = 0; i < logAttempts * 3; i++) {
    const isHorizontal = Math.random() < 0.5;
    const len = Math.random() < 0.65 ? 2 : 3;
    const w = isHorizontal ? len : 1;
    const h = isHorizontal ? 1 : len;
    const rx = Math.floor(Math.random() * (cols - w - 4)) + 2;
    const ry = Math.floor(Math.random() * (rows - h - 4)) + 2;
    if (canPlaceObstacle(grid, rx, ry, w, h, cols, rows, 1)) {
      placeMultiCellObstacle(grid, rx, ry, w, h, 'fallen_log', isHorizontal ? 'log_h' : 'log_v', 1.25);
    }
  }

  // 4. Árvores e Rochas 1x1
  for (let r = 2; r < rows - 2; r++) {
    for (let c = 2; c < cols - 2; c++) {
      if (grid[r][c].terrain === 'normal' && isSafeDistanceFromLargeObstacles(grid, c, r, 2)) {
        const rand = Math.random();
        if (rand < 0.06) {
          const isRock = Math.random() < 0.22;
          const scale = 0.8 + Math.random() * 0.45;
          if (isRock) {
            placeSingleCellObstacle(grid, c, r, 'rock', 'rock_forest', scale);
          } else {
            const variant = Math.random() < 0.5 ? 'pine_tree' : 'oak_tree';
            placeSingleCellObstacle(grid, c, r, 'tree', variant, scale);
          }
        } else if (rand < 0.25) {
          grid[r][c].terrain = 'difficult';
          grid[r][c].movementCost = 2;
        } else if (rand > 0.995) {
          grid[r][c].hasTrap = true;
          grid[r][c].trapType = 'poison_dart';
          grid[r][c].isHiddenTrap = true;
          grid[r][c].trapDamage = 4;
          grid[r][c].trapSaveDC = 11;
          grid[r][c].trapSaveStat = 'dex';
        }
      }
    }
  }
}
