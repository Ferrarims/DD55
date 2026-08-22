import {
  ChunkCoordinates,
  WorldCoordinates,
  WorldSeed,
} from '../types';
import { WorldChunkCache } from '../chunkCache';
import { worldToChunk } from '../coordinates';
import { getCellAtCoordinates } from './proceduralCellQuery';
import { WorldMoveResult } from '../proceduralWorldController';

export function executeWorldMove({
  chunkCache,
  worldSeed,
  currentPosition,
  currentChunk,
  targetPos,
}: {
  chunkCache: WorldChunkCache;
  worldSeed: WorldSeed;
  currentPosition: WorldCoordinates;
  currentChunk: ChunkCoordinates;
  targetPos: WorldCoordinates;
}): WorldMoveResult {
  const prevPos = { ...currentPosition };
  const prevChunk = { ...currentChunk };
  const targetCell = getCellAtCoordinates(chunkCache, worldSeed, targetPos.worldX, targetPos.worldY);

  if (prevPos.worldX === targetPos.worldX && prevPos.worldY === targetPos.worldY) {
    return {
      success: false,
      reason: 'ALREADY_AT_POSITION',
      previousPosition: prevPos,
      newPosition: prevPos,
      previousChunk: prevChunk,
      newChunk: prevChunk,
      chunkChanged: false,
      movementCost: 0,
      targetCell,
    };
  }

  if (targetCell.blocksMovement) {
    return {
      success: false,
      reason: 'BLOCKED',
      previousPosition: prevPos,
      newPosition: prevPos,
      previousChunk: prevChunk,
      newChunk: prevChunk,
      chunkChanged: false,
      movementCost: Infinity,
      targetCell,
    };
  }

  const movementCost = targetCell.difficultTerrain ? 2 : 1;
  const nextChunk = worldToChunk(targetPos);
  const chunkChanged =
    nextChunk.chunkX !== prevChunk.chunkX || nextChunk.chunkY !== prevChunk.chunkY;

  return {
    success: true,
    previousPosition: prevPos,
    newPosition: { ...targetPos },
    previousChunk: prevChunk,
    newChunk: nextChunk,
    chunkChanged,
    movementCost,
    targetCell,
  };
}
