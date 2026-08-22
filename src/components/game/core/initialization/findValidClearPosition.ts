import { CellData, GridPosition } from '../../../../game/types';

interface FindValidClearPositionProps {
  grid: CellData[][];
  heroSpawn: GridPosition;
  mapWidth: number;
  mapHeight: number;
  usedPositions: Set<string>;
  size: number;
  minDist: number;
  maxDist: number;
  requireWalkablePerimeter?: boolean;
}

export function findValidClearPosition({
  grid,
  heroSpawn,
  mapWidth,
  mapHeight,
  usedPositions,
  size,
  minDist,
  maxDist,
  requireWalkablePerimeter = true,
}: FindValidClearPositionProps): { x: number; y: number; size: number } {
  const candidates: { x: number; y: number; dist: number }[] = [];

  for (let r = Math.max(3, heroSpawn.y - maxDist); r <= Math.min(mapHeight - size - 3, heroSpawn.y + maxDist); r++) {
    for (let c = Math.max(3, heroSpawn.x - maxDist); c <= Math.min(mapWidth - size - 3, heroSpawn.x + maxDist); c++) {
      const dist = Math.hypot(c - heroSpawn.x, r - heroSpawn.y);
      if (dist >= minDist && dist <= maxDist) {
        candidates.push({ x: c, y: r, dist });
      }
    }
  }

  // Embaralhar ligeiramente para posições variadas e orgânicas
  candidates.sort((a, b) => a.dist - b.dist + (Math.random() * 6 - 3));

  for (const cand of candidates) {
    let isClear = true;

    // Verificar se todas as células do objeto estão livres de paredes, água ou obstáculos
    for (let dy = 0; dy < size && isClear; dy++) {
      for (let dx = 0; dx < size && isClear; dx++) {
        const tx = cand.x + dx;
        const ty = cand.y + dy;
        const cell = grid[ty]?.[tx];

        if (!cell) {
          isClear = false;
          break;
        }

        if (
          cell.terrain === 'wall' ||
          cell.terrain === 'water' ||
          cell.movementCost === Infinity ||
          cell.obstacleType !== undefined ||
          usedPositions.has(`${tx},${ty}`)
        ) {
          isClear = false;
          break;
        }
      }
    }

    // Verificar se há espaço caminhável acessível em volta do acampamento
    if (isClear && requireWalkablePerimeter) {
      let walkableNeighbors = 0;
      for (let dy = -1; dy <= size; dy++) {
        for (let dx = -1; dx <= size; dx++) {
          if (dx >= 0 && dx < size && dy >= 0 && dy < size) continue;
          const px = cand.x + dx;
          const py = cand.y + dy;
          const pCell = grid[py]?.[px];
          if (pCell && pCell.terrain !== 'wall' && pCell.movementCost !== Infinity && !pCell.obstacleType) {
            walkableNeighbors++;
          }
        }
      }
      if (walkableNeighbors < 3) {
        isClear = false;
      }
    }

    if (isClear) {
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const tx = cand.x + dx;
          const ty = cand.y + dy;
          usedPositions.add(`${tx},${ty}`);
          if (grid[ty]?.[tx]) {
            grid[ty][tx] = {
              ...grid[ty][tx],
              terrain: 'normal',
              movementCost: 1,
              obstacleType: undefined,
              obstacleWidth: 1,
              obstacleHeight: 1,
              obstacleOriginX: tx,
              obstacleOriginY: ty
            };
          }
        }
      }
      return { x: cand.x, y: cand.y, size };
    }
  }

  // Se tamanho 2x2 não coube sem colidir com obstáculos, tenta 1x1
  if (size > 1) {
    return findValidClearPosition({
      grid,
      heroSpawn,
      mapWidth,
      mapHeight,
      usedPositions,
      size: 1,
      minDist,
      maxDist,
      requireWalkablePerimeter: false,
    });
  }

  // Fallback de emergência: busca a célula livre mais próxima do herói
  for (let d = 2; d < 40; d++) {
    for (let dy = -d; dy <= d; dy++) {
      for (let dx = -d; dx <= d; dx++) {
        const tx = heroSpawn.x + dx;
        const ty = heroSpawn.y + dy;
        if (tx >= 3 && tx < mapWidth - 3 && ty >= 3 && ty < mapHeight - 3) {
          const cell = grid[ty]?.[tx];
          if (cell && cell.terrain !== 'wall' && !usedPositions.has(`${tx},${ty}`)) {
            usedPositions.add(`${tx},${ty}`);
            grid[ty][tx] = {
              ...grid[ty][tx],
              terrain: 'normal',
              movementCost: 1,
              obstacleType: undefined,
              obstacleWidth: 1,
              obstacleHeight: 1,
              obstacleOriginX: tx,
              obstacleOriginY: ty
            };
            return { x: tx, y: ty, size: 1 };
          }
        }
      }
    }
  }

  return { x: heroSpawn.x + 3, y: heroSpawn.y + 3, size: 1 };
}
