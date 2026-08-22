import {
  ChunkCell,
  WorldCoordinates,
  WorldSeed,
} from '../types';
import { WorldChunkCache } from '../chunkCache';
import {
  worldToChunk,
  worldToLocal,
} from '../coordinates';

export function getCellAtCoordinates(
  chunkCache: WorldChunkCache,
  worldSeed: WorldSeed,
  worldX: number,
  worldY: number
): ChunkCell {
  const chunkCoord = worldToChunk({ worldX, worldY });
  const localCoord = worldToLocal({ worldX, worldY });

  const chunk = chunkCache.getOrGenerateChunk(
    worldSeed,
    chunkCoord.chunkX,
    chunkCoord.chunkY
  );

  return chunk.cells[localCoord.localY][localCoord.localX];
}

export function calculateMovementCost(
  chunkCache: WorldChunkCache,
  worldSeed: WorldSeed,
  worldX: number,
  worldY: number
): number {
  const cell = getCellAtCoordinates(chunkCache, worldSeed, worldX, worldY);
  if (cell.blocksMovement) {
    return Infinity;
  }
  if (cell.difficultTerrain) {
    return 2;
  }
  return 1;
}
