import { CellData } from '../types';
import { placeMultiCellObstacle, placeSingleCellObstacle } from './arenaPlacementUtils';

interface RoomDef {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'hall' | 'room' | 'cell' | 'vault';
  cx: number;
  cy: number;
}

export function generateDungeonBiome(grid: CellData[][], cols: number, rows: number): void {
  // 1. Inicializar todas as células como paredes de tijolos de masmorra
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

  const rooms: RoomDef[] = [];
  const minSize = 6;
  const maxSize = 16;
  const targetRoomCount = Math.max(12, Math.floor((rows * cols) / 400));

  // 2. Tentar posicionar salas aleatórias
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
      else if (Math.random() < 0.2) type = 'vault';

      rooms.push({
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        type,
        cx: Math.floor(rx + rw / 2),
        cy: Math.floor(ry + rh / 2),
      });
    }
  }

  if (rooms.length === 0) {
    rooms.push({
      x: 3,
      y: 3,
      w: cols - 6,
      h: rows - 6,
      type: 'hall',
      cx: Math.floor(cols / 2),
      cy: Math.floor(rows / 2),
    });
  }

  // 3. Escavar as Salas no Grid
  rooms.forEach(room => {
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
            if (Math.random() < 0.2) {
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

    // Pilares nos Salões
    if (room.type === 'hall') {
      if (room.w >= 12 && room.h >= 12) {
        const midX = room.x + Math.floor(room.w / 2) - 1;
        const midY = room.y + Math.floor(room.h / 2) - 1;
        placeMultiCellObstacle(grid, midX, midY, 2, 2, 'pillar', 'altar_grand_2x2', 2.2);
      }

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

    // Grades de cela
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

  // 4. Escavar Corredores Conectando as Salas
  const carveCorridor = (x1: number, y1: number, x2: number, y2: number) => {
    let currX = x1;
    let currY = y1;
    const horizontalFirst = Math.random() < 0.5;

    const digAt = (nx: number, ny: number) => {
      if (ny >= 1 && ny < rows - 1 && nx >= 1 && nx < cols - 1) {
        if (grid[ny][nx].terrain === 'wall' && grid[ny][nx].obstacleType === 'brick_wall') {
          grid[ny][nx].terrain = 'normal';
          grid[ny][nx].movementCost = 1;
          grid[ny][nx].obstacleType = undefined;
          grid[ny][nx].dungeonFeature = 'corridor';
          grid[ny][nx].obstacleWidth = 1;
          grid[ny][nx].obstacleHeight = 1;
          grid[ny][nx].obstacleOriginX = nx;
          grid[ny][nx].obstacleOriginY = ny;
        }
      }
    };

    if (horizontalFirst) {
      while (currX !== x2) {
        currX += currX < x2 ? 1 : -1;
        digAt(currX, currY);
        digAt(currX, currY - 1);
      }
      while (currY !== y2) {
        currY += currY < y2 ? 1 : -1;
        digAt(currX, currY);
        digAt(currX - 1, currY);
      }
    } else {
      while (currY !== y2) {
        currY += currY < y2 ? 1 : -1;
        digAt(currX, currY);
        digAt(currX - 1, currY);
      }
      while (currX !== x2) {
        currX += currX < x2 ? 1 : -1;
        digAt(currX, currY);
        digAt(currX, currY - 1);
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

  // 5. Armadilhas e Terreno Difícil no Chão da Masmorra
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
