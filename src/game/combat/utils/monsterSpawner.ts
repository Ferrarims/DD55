import { CellData } from '../../types';

export interface SafeSpawnOptions {
  grid: CellData[][];
  monsterSize: number;
  heroPos: { x: number; y: number };
  heroSize?: number;
  usedPositions: Set<string>;
  minDistanceToHero?: number;
  maxDistanceToHero?: number;
  preferredAngle?: number;
}

export function findSafeMonsterSpawnPosition(options: SafeSpawnOptions): { x: number; y: number } {
  const {
    grid,
    monsterSize,
    heroPos,
    heroSize = 1,
    usedPositions,
    minDistanceToHero = 6,
    maxDistanceToHero = 14,
    preferredAngle = Math.random() * Math.PI * 2
  } = options;

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const isCellAvailable = (x: number, y: number): boolean => {
    if (x < 2 || x >= cols - 2 || y < 2 || y >= rows - 2) return false;
    const cell = grid[y]?.[x];
    if (!cell) return false;
    if (cell.terrain === 'wall' || cell.terrain === 'water') return false;
    if (cell.movementCost === Infinity) return false;
    if (cell.obstacleType !== undefined) return false;
    if (usedPositions.has(`${x},${y}`)) return false;
    return true;
  };

  const isPositionSafeAndClear = (x: number, y: number, size: number, checkHeroDist: boolean = true): boolean => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isCellAvailable(x + c, y + r)) {
          return false;
        }
      }
    }

    if (checkHeroDist) {
      for (let hr = 0; hr < heroSize; hr++) {
        for (let hc = 0; hc < heroSize; hc++) {
          const hx = heroPos.x + hc;
          const hy = heroPos.y + hr;
          for (let mr = 0; mr < size; mr++) {
            for (let mc = 0; mc < size; mc++) {
              const mx = x + mc;
              const my = y + mr;
              const dist = Math.max(Math.abs(mx - hx), Math.abs(my - hy));
              if (dist < minDistanceToHero) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  const angleSteps = 24;
  for (let dist = minDistanceToHero; dist <= maxDistanceToHero; dist++) {
    for (let step = 0; step < angleSteps; step++) {
      const angle = preferredAngle + (step % 2 === 0 ? (step / 2) : -(step + 1) / 2) * ((Math.PI * 2) / angleSteps);
      const testX = Math.round(heroPos.x + Math.cos(angle) * dist);
      const testY = Math.round(heroPos.y + Math.sin(angle) * dist);

      if (isPositionSafeAndClear(testX, testY, monsterSize, true)) {
        for (let r = 0; r < monsterSize; r++) {
          for (let c = 0; c < monsterSize; c++) {
            usedPositions.add(`${testX + c},${testY + r}`);
            if (grid[testY + r]?.[testX + c]) {
              grid[testY + r][testX + c] = {
                ...grid[testY + r][testX + c],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined
              };
            }
          }
        }
        return { x: testX, y: testY };
      }
    }
  }

  for (let dist = maxDistanceToHero + 1; dist <= 28; dist++) {
    for (let dy = -dist; dy <= dist; dy++) {
      for (let dx = -dist; dx <= dist; dx++) {
        if (Math.abs(dx) !== dist && Math.abs(dy) !== dist) continue;
        const testX = heroPos.x + dx;
        const testY = heroPos.y + dy;
        if (isPositionSafeAndClear(testX, testY, monsterSize, true)) {
          for (let r = 0; r < monsterSize; r++) {
            for (let c = 0; c < monsterSize; c++) {
              usedPositions.add(`${testX + c},${testY + r}`);
              if (grid[testY + r]?.[testX + c]) {
                grid[testY + r][testX + c] = {
                  ...grid[testY + r][testX + c],
                  terrain: 'normal',
                  movementCost: 1,
                  obstacleType: undefined
                };
              }
            }
          }
          return { x: testX, y: testY };
        }
      }
    }
  }

  for (let r = 3; r < rows - monsterSize - 3; r++) {
    for (let c = 3; c < cols - monsterSize - 3; c++) {
      if (isPositionSafeAndClear(c, r, monsterSize, true)) {
        for (let mr = 0; mr < monsterSize; mr++) {
          for (let mc = 0; mc < monsterSize; mc++) {
            usedPositions.add(`${c + mc},${r + mr}`);
            if (grid[r + mr]?.[c + mc]) {
              grid[r + mr][c + mc] = {
                ...grid[r + mr][c + mc],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined
              };
            }
          }
        }
        return { x: c, y: r };
      }
    }
  }

  if (monsterSize > 1) {
    return findSafeMonsterSpawnPosition({
      ...options,
      monsterSize: 1
    });
  }

  const fallbackX = Math.min(cols - 4, Math.max(4, heroPos.x + 6));
  const fallbackY = Math.min(rows - 4, Math.max(4, heroPos.y + 6));
  usedPositions.add(`${fallbackX},${fallbackY}`);
  if (grid[fallbackY]?.[fallbackX]) {
    grid[fallbackY][fallbackX] = {
      ...grid[fallbackY][fallbackX],
      terrain: 'normal',
      movementCost: 1,
      obstacleType: undefined
    };
  }
  return { x: fallbackX, y: fallbackY };
}
