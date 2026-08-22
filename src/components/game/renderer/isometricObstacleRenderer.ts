import { CellData } from '../../../game/types';
import { UseCanvasRendererProps } from './rendererTypes';
import {
  drawIsoFallenLog,
  drawIsoTree,
  drawIsoCactus,
} from './isometric/renderIsoWoodAndPlants';
import {
  drawIsoMesa,
  drawIsoMonolith,
  drawIsoRock,
} from './isometric/renderIsoRockAndTerrain';
import {
  drawIsoPillarOrAltar,
  drawIsoCellBars,
} from './isometric/renderIsoDungeonStructures';

export interface DrawIsometricObstacleProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  cell: CellData;
  mapC: number;
  mapR: number;
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
  blockH: number;
  isIndoorEnv: boolean;
}

export function drawIsometricObstacle({
  ctx,
  canvas,
  props,
  cell,
  mapC,
  mapR,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
  blockH,
  isIndoorEnv,
}: DrawIsometricObstacleProps): void {
  const { biome, weather } = props;

  if (cell.terrain === 'wall') {
    const w = cell.obstacleWidth || 1;
    const h = cell.obstacleHeight || 1;
    const origX = cell.obstacleOriginX ?? mapC;
    const origY = cell.obstacleOriginY ?? mapR;

    // No algoritmo do pintor (depth = mapR + mapC), renderizamos o obstáculo unificado no ladrilho mais frontal
    const isFrontmostTile = mapC === origX + w - 1 && mapR === origY + h - 1;

    if (isFrontmostTile) {
      const centerGridX = origX + (w - 1) / 2;
      const centerGridY = origY + (h - 1) / 2;
      const centerRelC = centerGridX - centerC;
      const centerRelR = centerGridY - centerR;
      const objIsoX = canvas.width / 2 + (centerRelC - centerRelR) * (isoTileW / 2);
      const objIsoY = canvas.height / 2 + (centerRelC + centerRelR) * (isoTileH / 2) + isoTileH * 0.5;
      const objTopY = objIsoY - blockH;

      const scale = cell.obstacleScale || (w > 1 || h > 1 ? Math.max(w, h) * 0.95 : 1.0);
      const variant = cell.obstacleVariant || 'standard';
      const obsType =
        cell.obstacleType ||
        (biome === 'Floresta' ? 'tree' : biome === 'Deserto' ? 'cactus' : biome === 'Pântano' ? 'tree' : 'rock');

      const renderParams = {
        ctx,
        objIsoX,
        objTopY,
        isoTileW,
        isoTileH,
        scale,
        variant,
        w,
        h,
        biome,
        weather,
        isIndoorEnv,
      };

      if (obsType === 'fallen_log') {
        drawIsoFallenLog(renderParams);
      } else if (
        (obsType as string) === 'monolith' ||
        variant.includes('mesa') ||
        (biome === 'Deserto' &&
          (obsType === 'rock' || (obsType as string) === 'monolith') &&
          (w >= 2 || h >= 2 || scale >= 1.5))
      ) {
        drawIsoMesa(renderParams);
      } else if (
        (obsType as string) === 'monolith' ||
        (obsType === 'rock' &&
          (w >= 2 ||
            h >= 2 ||
            scale >= 1.6 ||
            variant.includes('monolith') ||
            variant.includes('boulder') ||
            variant.includes('ridge')))
      ) {
        drawIsoMonolith(renderParams);
      } else if (obsType === 'rock') {
        drawIsoRock(renderParams);
      } else if (obsType === 'tree') {
        drawIsoTree(renderParams);
      } else if (obsType === 'cactus') {
        drawIsoCactus(renderParams);
      } else if (biome === 'Masmorra' && obsType === 'pillar') {
        drawIsoPillarOrAltar(renderParams);
      } else if (biome === 'Masmorra' && obsType === 'cell_bars') {
        drawIsoCellBars(renderParams);
      }
    }
  }
}
