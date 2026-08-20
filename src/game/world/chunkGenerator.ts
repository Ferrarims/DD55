import {
  CHUNK_SIZE,
  ChunkCell,
  GeneratedChunk,
  WorldSeed,
  Biome,
} from './types';
import {
  chunkAndLocalToWorld,
  worldToLocalCoordinate,
} from './coordinates';
import { generateCellData } from './biome';

/**
 * Retorna os dados completos e determinísticos de uma célula em qualquer posição global de mundo (worldX, worldY).
 * Todos os cálculos utilizam coordenadas globais e a seed do mundo.
 */
export function getCellAtWorldPosition(
  worldSeed: WorldSeed,
  worldX: number,
  worldY: number
): ChunkCell {
  const localX = worldToLocalCoordinate(worldX);
  const localY = worldToLocalCoordinate(worldY);
  const data = generateCellData(worldSeed, worldX, worldY);

  return {
    worldX,
    worldY,
    localX,
    localY,
    biome: data.biome,
    terrain: data.terrain,
    blocksMovement: data.blocksMovement,
    difficultTerrain: data.difficultTerrain,
    obstacle: data.obstacle,
    elevation: data.elevation,
  };
}

/**
 * Gera um chunk completo de 32 × 32 células de forma estritamente determinística.
 * Suporta chunks com coordenadas positivas, negativas e na origem.
 */
export function generateChunk(
  worldSeed: WorldSeed,
  chunkX: number,
  chunkY: number
): GeneratedChunk {
  const cells: ChunkCell[][] = [];
  const biomeCounts: Record<Biome, number> = {
    Caverna: 0,
    Floresta: 0,
    Masmorra: 0,
    Pântano: 0,
    Deserto: 0,
  };

  for (let localY = 0; localY < CHUNK_SIZE; localY++) {
    const row: ChunkCell[] = [];
    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      const worldPos = chunkAndLocalToWorld(
        { chunkX, chunkY },
        { localX, localY },
        CHUNK_SIZE
      );
      const cell = getCellAtWorldPosition(
        worldSeed,
        worldPos.worldX,
        worldPos.worldY
      );
      biomeCounts[cell.biome]++;
      row.push(cell);
    }
    cells.push(row);
  }

  // Determina o bioma dominante do chunk
  let dominantBiome: Biome = 'Floresta';
  let maxCount = -1;
  const biomes: Biome[] = ['Caverna', 'Floresta', 'Masmorra', 'Pântano', 'Deserto'];
  for (const b of biomes) {
    if (biomeCounts[b] > maxCount) {
      maxCount = biomeCounts[b];
      dominantBiome = b;
    }
  }

  return {
    chunkX,
    chunkY,
    dominantBiome,
    cells,
  };
}
