/**
 * Tipos e constantes fundamentais para o sistema de mundo procedural.
 */

export type WorldSeed = string | number;

export type Biome = 'Caverna' | 'Floresta' | 'Masmorra' | 'Pântano' | 'Deserto';

export interface ChunkCoordinates {
  readonly chunkX: number;
  readonly chunkY: number;
}

export interface WorldCoordinates {
  readonly worldX: number;
  readonly worldY: number;
}

export interface LocalCoordinates {
  readonly localX: number;
  readonly localY: number;
}

export interface ChunkLocalPosition {
  readonly chunk: ChunkCoordinates;
  readonly local: LocalCoordinates;
}

export interface ChunkCell {
  readonly worldX: number;
  readonly worldY: number;
  readonly localX: number;
  readonly localY: number;
  readonly biome: Biome;
  readonly terrain: string;
  readonly blocksMovement: boolean;
  readonly difficultTerrain: boolean;
  readonly obstacle?: string;
  readonly elevation: number;
}

export interface GeneratedChunk {
  readonly chunkX: number;
  readonly chunkY: number;
  readonly dominantBiome: Biome;
  readonly cells: readonly (readonly ChunkCell[])[];
}

export const CHUNK_SIZE = 32;
