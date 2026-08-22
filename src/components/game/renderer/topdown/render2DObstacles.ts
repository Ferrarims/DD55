import {
  draw2DFallenLog,
  draw2DBrickWall,
  draw2DSandstoneMesa,
  draw2DLargeTree,
  draw2DLargeRock
} from './render2DObstacleDrawers';
import { draw2DCactus } from '../drawHelpers';
import { draw2D1x1Obstacle } from './obstacles/draw2D1x1Obstacles';
import { draw2DDifficultTerrain } from './obstacles/draw2DDifficultTerrain';

export interface Render2DObstaclesProps {
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

export function render2DObstacles({
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
}: Render2DObstaclesProps): void {
  const renderedObstacleOrigins = new Set<string>();
  const margin = 4;
  const minR = Math.max(0, cameraY - margin);
  const maxR = Math.min(150, cameraY + rows + margin);
  const minC = Math.max(0, cameraX - margin);
  const maxC = Math.min(150, cameraX + cols + margin);

  for (let mapR = minR; mapR < maxR; mapR++) {
    for (let mapC = minC; mapC < maxC; mapC++) {
      const cell = grid[mapR]?.[mapC];
      if (!cell) continue;

      if (cell.terrain === 'wall') {
        const w = cell.obstacleWidth || 1;
        const h = cell.obstacleHeight || 1;
        const origX = cell.obstacleOriginX ?? mapC;
        const origY = cell.obstacleOriginY ?? mapR;
        const originKey = `${origX},${origY}`;

        if (renderedObstacleOrigins.has(originKey)) continue;
        renderedObstacleOrigins.add(originKey);

        const origCell = grid[origY]?.[origX] || cell;
        const origW = origCell.obstacleWidth || w;
        const origH = origCell.obstacleHeight || h;
        const origScale = origCell.obstacleScale || cell.obstacleScale || (Math.max(origW, origH) > 1 ? Math.max(origW, origH) * 0.85 : 1.0);
        const origVariant = origCell.obstacleVariant || cell.obstacleVariant || 'standard';
        const origObsType = origCell.obstacleType || cell.obstacleType || (biome === 'Floresta' ? 'tree' : biome === 'Deserto' ? 'cactus' : biome === 'Pântano' ? 'tree' : 'rock');

        const screenOrigX = (origX - cameraX) * cellSize;
        const screenOrigY = (origY - cameraY) * cellSize;
        const totalW = origW * cellSize;
        const totalH = origH * cellSize;
        const centerX = screenOrigX + totalW / 2;
        const centerY = screenOrigY + totalH / 2;
        const maxDim = Math.max(origW, origH);

        ctx.save();

        if (origObsType === 'fallen_log') {
          draw2DFallenLog(ctx, screenOrigX, screenOrigY, totalW, totalH, origVariant, origW, origH, cellSize, centerX, centerY);
        } else if (origObsType === 'brick_wall') {
          draw2DBrickWall(ctx, screenOrigX, screenOrigY, totalW, totalH);
        } else if ((origObsType as string) === 'monolith' || origVariant.includes('mesa') || (biome === 'Deserto' && (origObsType === 'rock' || (origObsType as string) === 'monolith') && maxDim > 1)) {
          draw2DSandstoneMesa(ctx, screenOrigX, screenOrigY, totalW, totalH, cellSize, centerX, centerY);
        } else if (origObsType === 'tree' && maxDim > 1) {
          draw2DLargeTree(ctx, totalW, totalH, centerX, centerY, biome, weather, isIndoorEnv);
        } else if (origObsType === 'cactus' && maxDim > 1) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(centerX + 3, centerY + 4, totalW * 0.4, totalH * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          draw2DCactus(ctx, centerX - cellSize * 0.28, centerY - cellSize * 0.1, 0.85);
          draw2DCactus(ctx, centerX + cellSize * 0.25, centerY + cellSize * 0.15, 0.95);
          draw2DCactus(ctx, centerX - cellSize * 0.05, centerY + cellSize * 0.25, 0.7);
        } else if (origObsType === 'rock' && maxDim > 1) {
          draw2DLargeRock(ctx, screenOrigX, screenOrigY, totalW, totalH);
        } else {
          // Obstáculos 1x1 Individuais
          const obsRadius = (cellSize / 2 - 4) * Math.min(1.2, origScale);
          draw2D1x1Obstacle({
            ctx,
            origObsType,
            origVariant,
            centerX,
            centerY,
            obsRadius,
            isIndoorEnv,
            weather,
            biome,
          });
        }

        ctx.restore();
      } else if (cell.terrain === 'difficult') {
        const c = mapC - cameraX;
        const r = mapR - cameraY;
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          const px = c * cellSize;
          const py = r * cellSize;
          const centerX = px + cellSize / 2;
          const centerY = py + cellSize / 2;

          draw2DDifficultTerrain({
            ctx,
            centerX,
            centerY,
            biome,
            weather,
            isNight,
            isIndoorEnv,
          });
        }
      }
    }
  }
}
