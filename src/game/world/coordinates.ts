import {
  CHUNK_SIZE,
  ChunkCoordinates,
  LocalCoordinates,
  WorldCoordinates,
  ChunkLocalPosition,
} from './types';

/**
 * Converte coordenada global (worldX ou worldY) em índice de chunk usando divisão por piso (floor division).
 * Suporta corretamente coordenadas negativas.
 * Ex: world = -1 => chunk = -1; world = -32 => chunk = -1; world = -33 => chunk = -2.
 */
export function worldToChunkCoordinate(worldCoord: number, chunkSize = CHUNK_SIZE): number {
  const chunk = Math.floor(worldCoord / chunkSize);
  return chunk === 0 ? 0 : chunk;
}

/**
 * Converte coordenada global (worldX ou worldY) em coordenada local no chunk [0, chunkSize - 1].
 * Suporta corretamente coordenadas negativas via divisão por piso.
 * Ex: world = -1 => local = 31; world = -32 => local = 0; world = -33 => local = 31.
 */
export function worldToLocalCoordinate(worldCoord: number, chunkSize = CHUNK_SIZE): number {
  const local = worldCoord - Math.floor(worldCoord / chunkSize) * chunkSize;
  return local === 0 ? 0 : local;
}

/**
 * Converte coordenadas de mundo globais para coordenadas de chunk (chunkX, chunkY).
 */
export function worldToChunk(world: WorldCoordinates, chunkSize = CHUNK_SIZE): ChunkCoordinates {
  return {
    chunkX: worldToChunkCoordinate(world.worldX, chunkSize),
    chunkY: worldToChunkCoordinate(world.worldY, chunkSize),
  };
}

/**
 * Converte coordenadas de mundo globais para coordenadas locais no chunk (localX, localY).
 */
export function worldToLocal(world: WorldCoordinates, chunkSize = CHUNK_SIZE): LocalCoordinates {
  return {
    localX: worldToLocalCoordinate(world.worldX, chunkSize),
    localY: worldToLocalCoordinate(world.worldY, chunkSize),
  };
}

/**
 * Converte coordenadas globais para a combinação de Chunk e Local.
 */
export function worldToChunkAndLocal(
  world: WorldCoordinates,
  chunkSize = CHUNK_SIZE
): ChunkLocalPosition {
  return {
    chunk: worldToChunk(world, chunkSize),
    local: worldToLocal(world, chunkSize),
  };
}

/**
 * Converte coordenadas de Chunk e Local para coordenadas globais de Mundo.
 * worldX = chunkX * CHUNK_SIZE + localX
 * worldY = chunkY * CHUNK_SIZE + localY
 */
export function chunkAndLocalToWorld(
  chunk: ChunkCoordinates,
  local: LocalCoordinates,
  chunkSize = CHUNK_SIZE
): WorldCoordinates {
  return {
    worldX: chunk.chunkX * chunkSize + local.localX,
    worldY: chunk.chunkY * chunkSize + local.localY,
  };
}

/**
 * Retorna as coordenadas de mundo da origem (0, 0 local) de um chunk.
 */
export function chunkToWorldOrigin(
  chunk: ChunkCoordinates,
  chunkSize = CHUNK_SIZE
): WorldCoordinates {
  return {
    worldX: chunk.chunkX * chunkSize,
    worldY: chunk.chunkY * chunkSize,
  };
}

/**
 * Cria chave de identificação única determinística para um chunk (ex: "chunk_0_0", "chunk_-1_2").
 */
export function getChunkKey(chunk: ChunkCoordinates): string {
  return `chunk_${chunk.chunkX}_${chunk.chunkY}`;
}

/**
 * Converte chave de identificação de volta para ChunkCoordinates.
 */
export function parseChunkKey(key: string): ChunkCoordinates | null {
  const match = /^chunk_(-?\d+)_(-?\d+)$/.exec(key);
  if (!match) return null;
  return {
    chunkX: parseInt(match[1], 10),
    chunkY: parseInt(match[2], 10),
  };
}
