import {
  WorldCoordinates,
  WorldSeed,
} from '../types';
import { GridPosition } from '../../../types/game';
import { findPathAStar } from '../../aStarPathfinding';
import { WorldChunkCache } from '../chunkCache';
import { worldToChunkCoordinate } from '../coordinates';
import { ChunkWorldGrid, buildChunkWorldGrid } from './chunkWorldGridBuilder';

export type WorldPathfindingStatus =
  | 'SUCCESS'
  | 'START_OUT_OF_BOUNDS'
  | 'TARGET_OUT_OF_BOUNDS'
  | 'NO_PATH_FOUND';

export interface WorldPathfindingResult {
  readonly success: boolean;
  readonly status: WorldPathfindingStatus;
  readonly path: readonly WorldCoordinates[];
  readonly totalMovementCost: number;
}

export interface WorldPathfindingOptions {
  readonly occupiedWorldPositions?: readonly WorldCoordinates[];
  readonly isFlying?: boolean;
  readonly size?: number;
}

/**
 * Executa o algoritmo A* em uma janela de mundo procedural definida pelo ChunkWorldGrid.
 * Retorna status explícito se o início ou fim estiver fora da janela carregada.
 */
export function findPathInChunkWorld(
  grid: ChunkWorldGrid,
  startWorld: WorldCoordinates,
  targetWorld: WorldCoordinates,
  options?: WorldPathfindingOptions
): WorldPathfindingResult {
  if (!grid.isWorldPosInBounds(startWorld.worldX, startWorld.worldY)) {
    return {
      success: false,
      status: 'START_OUT_OF_BOUNDS',
      path: [],
      totalMovementCost: 0,
    };
  }

  if (!grid.isWorldPosInBounds(targetWorld.worldX, targetWorld.worldY)) {
    return {
      success: false,
      status: 'TARGET_OUT_OF_BOUNDS',
      path: [],
      totalMovementCost: 0,
    };
  }

  const startGrid = grid.worldToGridPos(startWorld)!;
  const targetGrid = grid.worldToGridPos(targetWorld)!;

  const occupiedGridPositions: GridPosition[] = [];
  if (options?.occupiedWorldPositions) {
    for (const occ of options.occupiedWorldPositions) {
      const gPos = grid.worldToGridPos(occ);
      if (gPos) {
        occupiedGridPositions.push(gPos);
      }
    }
  }

  const gridPath = findPathAStar(
    grid.cells,
    startGrid,
    targetGrid,
    occupiedGridPositions,
    options?.isFlying ?? false,
    options?.size ?? 1
  );

  if (gridPath.length === 0) {
    return {
      success: false,
      status: 'NO_PATH_FOUND',
      path: [],
      totalMovementCost: 0,
    };
  }

  const worldPath: WorldCoordinates[] = gridPath.map((pos) =>
    grid.gridToWorldPos(pos)
  );

  let totalCost = 0;
  for (let i = 1; i < gridPath.length; i++) {
    const p = gridPath[i];
    const cell = grid.cells[p.y][p.x];
    totalCost += options?.isFlying ? 1 : cell.movementCost;
  }

  return {
    success: true,
    status: 'SUCCESS',
    path: worldPath,
    totalMovementCost: totalCost,
  };
}

/**
 * Helper de alto nível para consultar ou gerar a janela de chunks no cache e calcular o caminho A*.
 */
export function findPathWithChunkCache(
  cache: WorldChunkCache,
  seed: WorldSeed,
  startWorld: WorldCoordinates,
  targetWorld: WorldCoordinates,
  radius = 1,
  options?: WorldPathfindingOptions
): WorldPathfindingResult {
  const centerChunkX = worldToChunkCoordinate(startWorld.worldX);
  const centerChunkY = worldToChunkCoordinate(startWorld.worldY);

  const windowChunks = cache.getChunkWindow(
    seed,
    centerChunkX,
    centerChunkY,
    radius
  );
  const grid = buildChunkWorldGrid(windowChunks);

  return findPathInChunkWorld(grid, startWorld, targetWorld, options);
}
