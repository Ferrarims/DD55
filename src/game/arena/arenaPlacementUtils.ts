import { CellData } from '../types';

/**
 * Verifica se uma região retangular está livre para alocar um obstáculo de dimensões w x h
 */
export function canPlaceObstacle(
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
export function placeMultiCellObstacle(
  grid: CellData[][],
  startX: number,
  startY: number,
  w: number,
  h: number,
  type: CellData['obstacleType'],
  variant: string,
  scale: number
): void {
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
}

/**
 * Verifica se uma célula está a uma distância segura de qualquer obstáculo multi-célula
 */
export function isSafeDistanceFromLargeObstacles(
  grid: CellData[][],
  x: number,
  y: number,
  minDistance: number = 2
): boolean {
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
export function placeSingleCellObstacle(
  grid: CellData[][],
  x: number,
  y: number,
  type: CellData['obstacleType'],
  variant: string,
  scale: number
): void {
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

/**
 * Garante uma área livre ao redor de um ponto de coordenadas (spawn / centro)
 */
export function clearAreaAround(
  grid: CellData[][],
  cx: number,
  cy: number,
  radius: number = 2
): void {
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
