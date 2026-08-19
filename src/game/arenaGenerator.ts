import { CellData, BiomeType, GridPosition, TerrainType } from './types';

export interface GeneratedMap {
  grid: CellData[][];
  cols: number;
  rows: number;
  heroSpawn: GridPosition;
  monsterSpawns: GridPosition[];
  biome: BiomeType;
}

/**
 * Verifica se uma região retangular está livre para alocar um obstáculo de dimensões w x h
 */
function canPlaceObstacle(
  grid: CellData[][],
  startX: number,
  startY: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  padding: number = 2
): boolean {
  if (startX < padding || startY < padding || startX + w > cols - padding || startY + h > rows - padding) {
    return false;
  }

  for (let r = startY - padding; r < startY + h + padding; r++) {
    for (let c = startX - padding; c < startX + w + padding; c++) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      // Não sobrepor com paredes existentes ou áreas já ocupadas
      if (grid[r][c].terrain === 'wall') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Posiciona um obstáculo multi-célula (ex: 2x2, 3x3, 1x2, 2x1, 1x3, 3x1)
 */
function placeMultiCellObstacle(
  grid: CellData[][],
  startX: number,
  startY: number,
  w: number,
  h: number,
  type: CellData['obstacleType'],
  variant: string,
  scale: number
) {
  for (let r = startY; r < startY + h; r++) {
    for (let c = startX; c < startX + w; c++) {
      grid[r][c].terrain = 'wall';
      grid[r][c].movementCost = Infinity;
      grid[r][c].obstacleType = type;
      grid[r][c].obstacleWidth = w;
      grid[r][c].obstacleHeight = h;
      grid[r][c].obstacleOriginX = startX;
      grid[r][c].obstacleOriginY = startY;
      grid[r][c].obstacleVariant = variant;
      grid[r][c].obstacleScale = scale;
    }
  }

  // Não forçamos um anel retangular artificial de terreno difícil em volta do objeto
  // Terrenos difíceis são espalhados de forma orgânica e natural pelos biomas.
}

/**
 * Verifica se uma célula está a uma distância segura de qualquer obstáculo multi-célula
 */
function isSafeDistanceFromLargeObstacles(grid: CellData[][], x: number, y: number, minDistance: number = 2): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = y - minDistance; r <= y + minDistance; r++) {
    for (let c = x - minDistance; c <= x + minDistance; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const cell = grid[r][c];
        if (cell.terrain === 'wall' && ((cell.obstacleWidth || 1) > 1 || (cell.obstacleHeight || 1) > 1)) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Posiciona um obstáculo de 1 célula com variante e escala específicas
 */
function placeSingleCellObstacle(
  grid: CellData[][],
  x: number,
  y: number,
  type: CellData['obstacleType'],
  variant: string,
  scale: number
) {
  grid[y][x].terrain = 'wall';
  grid[y][x].movementCost = Infinity;
  grid[y][x].obstacleType = type;
  grid[y][x].obstacleWidth = 1;
  grid[y][x].obstacleHeight = 1;
  grid[y][x].obstacleOriginX = x;
  grid[y][x].obstacleOriginY = y;
  grid[y][x].obstacleVariant = variant;
  grid[y][x].obstacleScale = scale;
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
        obstacleScale: 1.0
      });
    }
    grid.push(row);
  }

  // Paredes externas de borda
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        grid[r][c].terrain = 'wall';
        grid[r][c].obstacleType = biome === 'Floresta' ? 'tree' : biome === 'Deserto' ? 'rock' : biome === 'Pântano' ? 'tree' : biome === 'Masmorra' ? 'brick_wall' : 'rock';
        grid[r][c].movementCost = Infinity;
        grid[r][c].obstacleWidth = 1;
        grid[r][c].obstacleHeight = 1;
        grid[r][c].obstacleOriginX = c;
        grid[r][c].obstacleOriginY = r;
        grid[r][c].obstacleScale = 1.0;
      }
    }
  }

  // 2. Aplicar algoritmo baseado no bioma com suporte a obstáculos de múltiplos tamanhos
  if (biome === 'Arena de Testes') {
    // Arena especial com inimigos cercados por água para testar coberturas
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
          grid[r][c].terrain = 'wall';
          grid[r][c].obstacleType = 'rock';
          grid[r][c].movementCost = Infinity;
        }
      }
    }

    const mSpawns = [
      { x: 83, y: 69 }, // No cover
      { x: 83, y: 73 }, // Half cover
      { x: 83, y: 77 }, // 3/4 cover
      { x: 83, y: 81 }, // Total cover
    ];

    // Surround each with water
    mSpawns.forEach((spawn, idx) => {
      if (spawn.x < cols - 1 && spawn.y < rows - 1) {
        for (let r = spawn.y - 1; r <= spawn.y + 1; r++) {
          for (let c = spawn.x - 1; c <= spawn.x + 1; c++) {
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
              if (!(r === spawn.y && c === spawn.x)) {
                grid[r][c].terrain = 'water';
                grid[r][c].movementCost = Infinity; // Block movement completely
              }
            }
          }
        }
      }
    });

    // Place Obstacles
    // M1: No cover -> no obstacle
    // M2: Half cover (fallen log)
    placeMultiCellObstacle(grid, 81, 72, 1, 3, 'fallen_log', 'log_v', 1.2);
    // M3: 3/4 cover (tree)
    placeMultiCellObstacle(grid, 81, 76, 1, 3, 'tree', 'pine_tree', 1.5);
    // M4: Total cover (wall)
    placeMultiCellObstacle(grid, 81, 80, 1, 3, 'brick_wall', 'brick_wall', 1.0);

  } else if (biome === 'Caverna') {
    // 2.1 Caverna: Monólitos 3x3, Rochas Gigantes 2x2, Cristas/Formações 1x2 e 2x1, Rochas 1x1 variadas
    const giantAttempts = Math.max(1, Math.floor((cols * rows) / 900));
    for (let i = 0; i < giantAttempts * 3; i++) {
      const rx = Math.floor(Math.random() * (cols - 8)) + 4;
      const ry = Math.floor(Math.random() * (rows - 8)) + 4;
      if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
        placeMultiCellObstacle(grid, rx, ry, 3, 3, 'rock', 'monolith', 2.8);
      }
    }

    // 2.2 Rochas Grandes 2x2
    const largeRockAttempts = Math.max(3, Math.floor((cols * rows) / 250));
    for (let i = 0; i < largeRockAttempts * 3; i++) {
      const rx = Math.floor(Math.random() * (cols - 6)) + 3;
      const ry = Math.floor(Math.random() * (rows - 6)) + 3;
      if (canPlaceObstacle(grid, rx, ry, 2, 2, cols, rows, 1)) {
        placeMultiCellObstacle(grid, rx, ry, 2, 2, 'rock', 'boulder_large', 1.9);
      }
    }

    // 2.3 Cristas de Rocha / Paredes de Estalagmites Alongadas (1x2, 2x1, 1x3, 3x1)
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

    // 2.4 Rochas e Estalagmites 1x1 Individuais com escalas variadas (respeitando distância de obstáculos grandes)
    for (let r = 2; r < rows - 2; r++) {
      for (let c = 2; c < cols - 2; c++) {
        if (grid[r][c].terrain === 'normal' && isSafeDistanceFromLargeObstacles(grid, c, r, 2)) {
          const rand = Math.random();
          if (rand < 0.05) {
            const scale = 0.75 + Math.random() * 0.45; // 0.75 a 1.20
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
  } else if (biome === 'Floresta') {
    // 2.1 Floresta: Árvores Ancestrais 3x3, Grandes Carvalhos 2x2, Rochas de Musgo 2x2, Troncos Caídos 1x2/1x3/2x1/3x1, Árvores 1x1 variadas
    const elderTreeAttempts = Math.max(1, Math.floor((cols * rows) / 800));
    for (let i = 0; i < elderTreeAttempts * 4; i++) {
      const rx = Math.floor(Math.random() * (cols - 8)) + 4;
      const ry = Math.floor(Math.random() * (rows - 8)) + 4;
      if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
        placeMultiCellObstacle(grid, rx, ry, 3, 3, 'tree', 'giant_oak', 3.0);
      }
    }

    // 2.2 Árvores Grandes 2x2 (Carvalhos Densos)
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

    // 2.3 Troncos Caídos Alongados (1x2, 2x1, 1x3, 3x1)
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

    // 2.4 Árvores 1x1 (Pinheiros, Carvalhos, Bétulas) e Rochas (respeitando distância de obstáculos grandes)
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
  } else if (biome === 'Pântano') {
    // 2.1 Pântano: Salgueiro-chorão Gigante 3x3, Manguezais 2x2, Troncos Podres 1x2/1x3, Árvores de Pântano 1x1
    const giantSwampAttempts = Math.max(1, Math.floor((cols * rows) / 800));
    for (let i = 0; i < giantSwampAttempts * 4; i++) {
      const rx = Math.floor(Math.random() * (cols - 8)) + 4;
      const ry = Math.floor(Math.random() * (rows - 8)) + 4;
      if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
        placeMultiCellObstacle(grid, rx, ry, 3, 3, 'tree', 'giant_mangrove', 3.0);
      }
    }

    // 2.2 Manguezais e Ciprestes Grandes 2x2
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

    // 2.3 Troncos Podres e Submersos (1x2, 2x1, 1x3, 3x1)
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

    // 2.4 Ciprestes, Árvores Mortas e Rochas Pantanosas 1x1 (respeitando distância de obstáculos grandes)
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
  } else if (biome === 'Deserto') {
    // 2.1 Deserto: Mesas / Monólitos de Arenito 3x3, Formações Rochosas 2x2, Cristas 1x2/1x3, Bosque de Cactos 2x2, Cactos 1x1 variados
    const mesaAttempts = Math.max(1, Math.floor((cols * rows) / 800));
    for (let i = 0; i < mesaAttempts * 4; i++) {
      const rx = Math.floor(Math.random() * (cols - 8)) + 4;
      const ry = Math.floor(Math.random() * (rows - 8)) + 4;
      if (canPlaceObstacle(grid, rx, ry, 3, 3, cols, rows, 2)) {
        placeMultiCellObstacle(grid, rx, ry, 3, 3, 'monolith', 'desert_mesa', 2.9);
      }
    }

    // 2.2 Formações Rochosas de Arenito e Bosque de Cactos 2x2
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

    // 2.3 Cristas de Arenito Alongadas (1x2, 2x1, 1x3, 3x1)
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

    // 2.4 Cactos Saguaro 1x1 e Rochas do Deserto (respeitando distância segura de obstáculos grandes)
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
  } else {
    // Masmorra Completa: Paredes de pedra cinza, Salões Principais, Corredores Cruzados, Salas, Celas e Pilares 2x2/1x1
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c].terrain = 'wall';
        grid[r][c].obstacleType = 'brick_wall';
        grid[r][c].dungeonFeature = 'brick_wall';
        grid[r][c].movementCost = Infinity;
        grid[r][c].obstacleWidth = 1;
        grid[r][c].obstacleHeight = 1;
        grid[r][c].obstacleOriginX = c;
        grid[r][c].obstacleOriginY = r;
      }
    }

    interface RoomDef {
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'hall' | 'room' | 'cell' | 'vault';
      cx: number;
      cy: number;
    }

    const rooms: RoomDef[] = [];
    const minSize = 6;
    const maxSize = 16;
    const targetRoomCount = Math.max(12, Math.floor((rows * cols) / 400));

    for (let attempt = 0; attempt < targetRoomCount * 4 && rooms.length < targetRoomCount; attempt++) {
      const rw = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      const rh = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      const rx = Math.floor(Math.random() * (cols - rw - 6)) + 3;
      const ry = Math.floor(Math.random() * (rows - rh - 6)) + 3;

      let overlaps = false;
      for (const room of rooms) {
        if (
          rx < room.x + room.w + 2 &&
          rx + rw + 2 > room.x &&
          ry < room.y + room.h + 2 &&
          ry + rh + 2 > room.y
        ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        let type: 'hall' | 'room' | 'cell' | 'vault' = 'room';
        if (rw >= 11 && rh >= 11) type = 'hall';
        else if (Math.random() < 0.25) type = 'cell';
        else if (Math.random() < 0.20) type = 'vault';

        rooms.push({
          x: rx,
          y: ry,
          w: rw,
          h: rh,
          type,
          cx: Math.floor(rx + rw / 2),
          cy: Math.floor(ry + rh / 2)
        });
      }
    }

    if (rooms.length === 0) {
      rooms.push({
        x: 3, y: 3, w: cols - 6, h: rows - 6, type: 'hall',
        cx: Math.floor(cols / 2), cy: Math.floor(rows / 2)
      });
    }

    // Escavar as Salas no Grid
    rooms.forEach((room) => {
      for (let r = room.y; r < room.y + room.h; r++) {
        for (let c = room.x; c < room.x + room.w; c++) {
          if (r >= 1 && r < rows - 1 && c >= 1 && c < cols - 1) {
            grid[r][c].terrain = 'normal';
            grid[r][c].movementCost = 1;
            grid[r][c].obstacleType = undefined;
            grid[r][c].obstacleWidth = 1;
            grid[r][c].obstacleHeight = 1;
            grid[r][c].obstacleOriginX = c;
            grid[r][c].obstacleOriginY = r;

            if (room.type === 'hall') {
              grid[r][c].dungeonFeature = 'hall';
            } else if (room.type === 'cell') {
              grid[r][c].dungeonFeature = 'cell';
              if (Math.random() < 0.20) {
                grid[r][c].terrain = 'difficult';
                grid[r][c].movementCost = 2;
              }
            } else if (room.type === 'vault') {
              grid[r][c].dungeonFeature = 'vault';
            } else {
              grid[r][c].dungeonFeature = 'room';
            }
          }
        }
      }

      // Adicionar Pilares Grandiosos 2x2 ou 1x1 nos Salões Principais
      if (room.type === 'hall') {
        // Se a sala for grande (12x12 ou maior), colocar um monumento ou pilar central 2x2
        if (room.w >= 12 && room.h >= 12) {
          const midX = room.x + Math.floor(room.w / 2) - 1;
          const midY = room.y + Math.floor(room.h / 2) - 1;
          placeMultiCellObstacle(grid, midX, midY, 2, 2, 'pillar', 'altar_grand_2x2', 2.2);
        }

        // Colunas menores 1x1 distribuídas
        for (let r = room.y + 2; r < room.y + room.h - 2; r += 4) {
          for (let c = room.x + 2; c < room.x + room.w - 2; c += 4) {
            if (grid[r][c].terrain === 'normal') {
              const scale = 0.9 + Math.random() * 0.35;
              placeSingleCellObstacle(grid, c, r, 'pillar', 'pillar_ornate', scale);
              grid[r][c].dungeonFeature = 'pillar';
            }
          }
        }
      }

      // Se for cela de prisão, colocar grades de ferro na entrada
      if (room.type === 'cell') {
        const doorC = room.x + Math.floor(room.w / 2);
        const doorR = room.y + room.h;
        if (doorR < rows - 1 && doorC < cols - 1) {
          grid[doorR][doorC].terrain = 'wall';
          grid[doorR][doorC].obstacleType = 'cell_bars';
          grid[doorR][doorC].dungeonFeature = 'cell_bars';
          grid[doorR][doorC].movementCost = Infinity;
          grid[doorR][doorC].obstacleWidth = 1;
          grid[doorR][doorC].obstacleHeight = 1;
          grid[doorR][doorC].obstacleOriginX = doorC;
          grid[doorR][doorC].obstacleOriginY = doorR;
        }
      }
    });

    const carveCorridor = (x1: number, y1: number, x2: number, y2: number) => {
      let currX = x1;
      let currY = y1;
      const horizontalFirst = Math.random() < 0.5;

      if (horizontalFirst) {
        while (currX !== x2) {
          currX += currX < x2 ? 1 : -1;
          for (let wy = -1; wy <= 0; wy++) {
            const ny = currY + wy;
            if (ny >= 1 && ny < rows - 1 && currX >= 1 && currX < cols - 1) {
              if (grid[ny][currX].terrain === 'wall' && grid[ny][currX].obstacleType === 'brick_wall') {
                grid[ny][currX].terrain = 'normal';
                grid[ny][currX].movementCost = 1;
                grid[ny][currX].obstacleType = undefined;
                grid[ny][currX].dungeonFeature = 'corridor';
                grid[ny][currX].obstacleWidth = 1;
                grid[ny][currX].obstacleHeight = 1;
                grid[ny][currX].obstacleOriginX = currX;
                grid[ny][currX].obstacleOriginY = ny;
              }
            }
          }
        }
        while (currY !== y2) {
          currY += currY < y2 ? 1 : -1;
          for (let wx = -1; wx <= 0; wx++) {
            const nx = currX + wx;
            if (nx >= 1 && nx < cols - 1 && currY >= 1 && currY < rows - 1) {
              if (grid[currY][nx].terrain === 'wall' && grid[currY][nx].obstacleType === 'brick_wall') {
                grid[currY][nx].terrain = 'normal';
                grid[currY][nx].movementCost = 1;
                grid[currY][nx].obstacleType = undefined;
                grid[currY][nx].dungeonFeature = 'corridor';
                grid[currY][nx].obstacleWidth = 1;
                grid[currY][nx].obstacleHeight = 1;
                grid[currY][nx].obstacleOriginX = nx;
                grid[currY][nx].obstacleOriginY = currY;
              }
            }
          }
        }
      } else {
        while (currY !== y2) {
          currY += currY < y2 ? 1 : -1;
          for (let wx = -1; wx <= 0; wx++) {
            const nx = currX + wx;
            if (nx >= 1 && nx < cols - 1 && currY >= 1 && currY < rows - 1) {
              if (grid[currY][nx].terrain === 'wall' && grid[currY][nx].obstacleType === 'brick_wall') {
                grid[currY][nx].terrain = 'normal';
                grid[currY][nx].movementCost = 1;
                grid[currY][nx].obstacleType = undefined;
                grid[currY][nx].dungeonFeature = 'corridor';
                grid[currY][nx].obstacleWidth = 1;
                grid[currY][nx].obstacleHeight = 1;
                grid[currY][nx].obstacleOriginX = nx;
                grid[currY][nx].obstacleOriginY = currY;
              }
            }
          }
        }
        while (currX !== x2) {
          currX += currX < x2 ? 1 : -1;
          for (let wy = -1; wy <= 0; wy++) {
            const ny = currY + wy;
            if (ny >= 1 && ny < rows - 1 && currX >= 1 && currX < cols - 1) {
              if (grid[ny][currX].terrain === 'wall' && grid[ny][currX].obstacleType === 'brick_wall') {
                grid[ny][currX].terrain = 'normal';
                grid[ny][currX].movementCost = 1;
                grid[ny][currX].obstacleType = undefined;
                grid[ny][currX].dungeonFeature = 'corridor';
                grid[ny][currX].obstacleWidth = 1;
                grid[ny][currX].obstacleHeight = 1;
                grid[ny][currX].obstacleOriginX = currX;
                grid[ny][currX].obstacleOriginY = ny;
              }
            }
          }
        }
      }
    };

    for (let i = 0; i < rooms.length; i++) {
      const roomA = rooms[i];
      const nextRoom = rooms[(i + 1) % rooms.length];
      carveCorridor(roomA.cx, roomA.cy, nextRoom.cx, nextRoom.cy);

      let closestRoom: RoomDef | null = null;
      let minDist = Infinity;
      for (let j = 0; j < rooms.length; j++) {
        if (i === j) continue;
        const roomB = rooms[j];
        const dist = Math.hypot(roomA.cx - roomB.cx, roomA.cy - roomB.cy);
        if (dist < minDist) {
          minDist = dist;
          closestRoom = roomB;
        }
      }
      if (closestRoom && minDist < 50) {
        carveCorridor(roomA.cx, roomA.cy, closestRoom.cx, closestRoom.cy);
      }
    }

    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c].terrain === 'normal') {
          const rand = Math.random();
          if (rand < 0.04) {
            grid[r][c].terrain = 'difficult';
            grid[r][c].movementCost = 2;
          } else if (rand > 0.985) {
            grid[r][c].hasTrap = true;
            grid[r][c].isHiddenTrap = true;
            if (Math.random() < 0.5) {
              grid[r][c].trapType = 'spike';
              grid[r][c].trapDamage = 6;
              grid[r][c].trapSaveDC = 13;
              grid[r][c].trapSaveStat = 'dex';
            } else {
              grid[r][c].trapType = 'magic_rune';
              grid[r][c].trapDamage = 8;
              grid[r][c].trapSaveDC = 14;
              grid[r][c].trapSaveStat = 'wis';
            }
          }
        }
      }
    }
  }

  // 3. Garantir área livre no spawn do jogador (centro do mapa)
  let heroSpawn: GridPosition = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  let monsterSpawns: GridPosition[] = [];

  if (biome === 'Arena de Testes') {
    heroSpawn = { x: 75, y: 75 };
    clearAreaAround(grid, heroSpawn.x, heroSpawn.y);

    // Explicit monster spawns to match obstacles
    monsterSpawns.push({ x: 83, y: 69 }); // No cover
    monsterSpawns.push({ x: 83, y: 73 }); // Half cover
    monsterSpawns.push({ x: 83, y: 77 }); // 3/4 cover
    monsterSpawns.push({ x: 83, y: 81 }); // Total cover

    // Ensure area around monsters is clear of walls, but we already placed water manually
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
    biome
  };
}

function clearAreaAround(grid: CellData[][], cx: number, cy: number, radius: number = 2) {
  for (let r = Math.max(0, cy - radius); r <= Math.min(grid.length - 1, cy + radius); r++) {
    for (let c = Math.max(0, cx - radius); c <= Math.min(grid[0].length - 1, cx + radius); c++) {
      grid[r][c].terrain = 'normal';
      grid[r][c].movementCost = 1;
      grid[r][c].obstacleType = undefined;
      grid[r][c].obstacleWidth = 1;
      grid[r][c].obstacleHeight = 1;
      grid[r][c].obstacleOriginX = c;
      grid[r][c].obstacleOriginY = r;
    }
  }
}
