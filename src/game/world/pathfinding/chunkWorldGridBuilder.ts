import {
  CHUNK_SIZE,
  ChunkCell,
  GeneratedChunk,
  WorldCoordinates,
} from '../types';
import { CellData, GridPosition } from '../../../types/game';

/**
 * Converte uma célula procedural (ChunkCell) no formato mínimo de CellData exigido pelo algoritmo A*.
 * Mapeia adequadamente bloqueio de movimento e terreno difícil para o sistema de colisão e custo do A*.
 */
export function chunkCellToCellData(
  chunkCell: ChunkCell,
  gridPosition?: GridPosition
): CellData {
  const posX = gridPosition !== undefined ? gridPosition.x : chunkCell.worldX;
  const posY = gridPosition !== undefined ? gridPosition.y : chunkCell.worldY;

  if (chunkCell.blocksMovement) {
    return {
      x: posX,
      y: posY,
      terrain: 'wall',
      movementCost: Infinity,
      obstacleVariant: chunkCell.obstacle,
    };
  }

  if (chunkCell.difficultTerrain) {
    return {
      x: posX,
      y: posY,
      terrain: 'difficult',
      movementCost: 2,
      obstacleVariant: chunkCell.obstacle,
    };
  }

  return {
    x: posX,
    y: posY,
    terrain: 'normal',
    movementCost: 1,
  };
}

/**
 * Grade adaptada que indexa e expõe uma janela contígua de chunks para o algoritmo de pathfinding.
 */
export interface ChunkWorldGrid {
  readonly minWorldX: number;
  readonly maxWorldX: number;
  readonly minWorldY: number;
  readonly maxWorldY: number;
  readonly width: number;
  readonly height: number;
  readonly cells: CellData[][];
  readonly chunks: readonly GeneratedChunk[];

  getCellAtWorld(worldX: number, worldY: number): CellData | null;
  worldToGridPos(pos: WorldCoordinates): GridPosition | null;
  gridToWorldPos(pos: GridPosition): WorldCoordinates;
  isWorldPosInBounds(worldX: number, worldY: number): boolean;
}

/**
 * Constrói uma grade de células contígua a partir de um conjunto retangular de chunks.
 * Suporta chunks em qualquer quadrante, incluindo quadrantes com coordenadas negativas.
 */
export function buildChunkWorldGrid(
  chunks: readonly GeneratedChunk[]
): ChunkWorldGrid {
  if (chunks.length === 0) {
    return {
      minWorldX: 0,
      maxWorldX: -1,
      minWorldY: 0,
      maxWorldY: -1,
      width: 0,
      height: 0,
      cells: [],
      chunks: [],
      getCellAtWorld: () => null,
      worldToGridPos: () => null,
      gridToWorldPos: (pos) => ({ worldX: pos.x, worldY: pos.y }),
      isWorldPosInBounds: () => false,
    };
  }

  let minChunkX = Infinity;
  let maxChunkX = -Infinity;
  let minChunkY = Infinity;
  let maxChunkY = -Infinity;

  for (const chunk of chunks) {
    if (chunk.chunkX < minChunkX) minChunkX = chunk.chunkX;
    if (chunk.chunkX > maxChunkX) maxChunkX = chunk.chunkX;
    if (chunk.chunkY < minChunkY) minChunkY = chunk.chunkY;
    if (chunk.chunkY > maxChunkY) maxChunkY = chunk.chunkY;
  }

  const chunkCols = maxChunkX - minChunkX + 1;
  const chunkRows = maxChunkY - minChunkY + 1;
  const width = chunkCols * CHUNK_SIZE;
  const height = chunkRows * CHUNK_SIZE;

  const minWorldX = minChunkX * CHUNK_SIZE;
  const maxWorldX = (maxChunkX + 1) * CHUNK_SIZE - 1;
  const minWorldY = minChunkY * CHUNK_SIZE;
  const maxWorldY = (maxChunkY + 1) * CHUNK_SIZE - 1;

  // Inicializa matriz de células com CellData padrão
  const gridCells: CellData[][] = [];
  for (let y = 0; y < height; y++) {
    const row: CellData[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        terrain: 'wall',
        movementCost: Infinity,
      });
    }
    gridCells.push(row);
  }

  // Preenche a matriz com as células reais dos chunks carregados
  for (const chunk of chunks) {
    const chunkBaseX = (chunk.chunkX - minChunkX) * CHUNK_SIZE;
    const chunkBaseY = (chunk.chunkY - minChunkY) * CHUNK_SIZE;

    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      const row = chunk.cells[localY];
      if (!row) continue;
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const cell = row[localX];
        if (!cell) continue;

        const gridX = chunkBaseX + localX;
        const gridY = chunkBaseY + localY;

        gridCells[gridY][gridX] = chunkCellToCellData(cell, {
          x: gridX,
          y: gridY,
        });
      }
    }
  }

  const isWorldPosInBounds = (worldX: number, worldY: number): boolean => {
    return (
      worldX >= minWorldX &&
      worldX <= maxWorldX &&
      worldY >= minWorldY &&
      worldY <= maxWorldY
    );
  };

  const getCellAtWorld = (worldX: number, worldY: number): CellData | null => {
    if (!isWorldPosInBounds(worldX, worldY)) return null;
    const gx = worldX - minWorldX;
    const gy = worldY - minWorldY;
    return gridCells[gy]?.[gx] ?? null;
  };

  const worldToGridPos = (pos: WorldCoordinates): GridPosition | null => {
    if (!isWorldPosInBounds(pos.worldX, pos.worldY)) return null;
    return {
      x: pos.worldX - minWorldX,
      y: pos.worldY - minWorldY,
    };
  };

  const gridToWorldPos = (pos: GridPosition): WorldCoordinates => {
    return {
      worldX: pos.x + minWorldX,
      worldY: pos.y + minWorldY,
    };
  };

  return {
    minWorldX,
    maxWorldX,
    minWorldY,
    maxWorldY,
    width,
    height,
    cells: gridCells,
    chunks,
    getCellAtWorld,
    worldToGridPos,
    gridToWorldPos,
    isWorldPosInBounds,
  };
}
