import {
  ChunkCell,
  ChunkCoordinates,
  GeneratedChunk,
  WorldCoordinates,
  WorldSeed,
} from './types';
import { WorldChunkCache } from './chunkCache';
import { worldToChunk } from './coordinates';
import { getCellAtCoordinates, calculateMovementCost } from './controller/proceduralCellQuery';
import { executeWorldMove } from './controller/proceduralMovementHandler';

export interface ProceduralWorldControllerOptions {
  readonly worldSeed: WorldSeed;
  readonly initialPosition?: WorldCoordinates;
  readonly chunkCache?: WorldChunkCache;
  readonly windowRadius?: number;
}

export type MoveFailureReason = 'BLOCKED' | 'ALREADY_AT_POSITION' | 'INVALID_STEP';

export interface WorldMoveResult {
  readonly success: boolean;
  readonly previousPosition: WorldCoordinates;
  readonly newPosition: WorldCoordinates;
  readonly previousChunk: ChunkCoordinates;
  readonly newChunk: ChunkCoordinates;
  readonly chunkChanged: boolean;
  readonly movementCost: number;
  readonly reason?: MoveFailureReason;
  readonly targetCell: ChunkCell;
}

/**
 * Controlador de exploração procedural para mundos infinitos baseados em chunks.
 * Gerencia a posição global do jogador, consulta de células, detecção de colisões,
 * custos de terreno e atualização de janelas 3x3 ativas sem limites artificiais de mapa.
 */
export class ProceduralWorldController {
  private readonly worldSeed: WorldSeed;
  private readonly chunkCache: WorldChunkCache;
  private readonly windowRadius: number;
  private currentPosition: WorldCoordinates;
  private currentChunk: ChunkCoordinates;
  private activeChunks: readonly GeneratedChunk[];

  constructor(options: ProceduralWorldControllerOptions) {
    this.worldSeed = options.worldSeed;
    this.chunkCache = options.chunkCache ?? new WorldChunkCache();
    this.windowRadius = Math.max(1, Math.floor(options.windowRadius ?? 1));

    const initialPos = options.initialPosition ?? { worldX: 0, worldY: 0 };
    this.currentPosition = {
      worldX: initialPos.worldX,
      worldY: initialPos.worldY,
    };
    this.currentChunk = worldToChunk(this.currentPosition);
    this.activeChunks = this.loadActiveWindow(this.currentChunk);
  }

  public getWorldSeed(): WorldSeed {
    return this.worldSeed;
  }

  public getPosition(): WorldCoordinates {
    return { ...this.currentPosition };
  }

  public getCurrentChunk(): ChunkCoordinates {
    return { ...this.currentChunk };
  }

  public getChunkCache(): WorldChunkCache {
    return this.chunkCache;
  }

  public getActiveChunks(): readonly GeneratedChunk[] {
    return this.activeChunks;
  }

  public getCurrentCell(): ChunkCell {
    return this.getCellAt(this.currentPosition.worldX, this.currentPosition.worldY);
  }

  public getCellAt(worldX: number, worldY: number): ChunkCell {
    return getCellAtCoordinates(this.chunkCache, this.worldSeed, worldX, worldY);
  }

  public getCellAtWorld(coords: WorldCoordinates): ChunkCell {
    return this.getCellAt(coords.worldX, coords.worldY);
  }

  public isMovementBlocked(worldX: number, worldY: number): boolean {
    const cell = this.getCellAt(worldX, worldY);
    return cell.blocksMovement;
  }

  public getMovementCost(worldX: number, worldY: number): number {
    return calculateMovementCost(this.chunkCache, this.worldSeed, worldX, worldY);
  }

  public moveBy(dx: number, dy: number): WorldMoveResult {
    if (dx === 0 && dy === 0) {
      const currentCell = this.getCurrentCell();
      return {
        success: false,
        reason: 'ALREADY_AT_POSITION',
        previousPosition: this.getPosition(),
        newPosition: this.getPosition(),
        previousChunk: this.getCurrentChunk(),
        newChunk: this.getCurrentChunk(),
        chunkChanged: false,
        movementCost: 0,
        targetCell: currentCell,
      };
    }

    const targetPos: WorldCoordinates = {
      worldX: this.currentPosition.worldX + dx,
      worldY: this.currentPosition.worldY + dy,
    };

    return this.moveTo(targetPos);
  }

  public moveTo(targetPos: WorldCoordinates): WorldMoveResult {
    const result = executeWorldMove({
      chunkCache: this.chunkCache,
      worldSeed: this.worldSeed,
      currentPosition: this.currentPosition,
      currentChunk: this.currentChunk,
      targetPos,
    });

    if (result.success) {
      this.currentPosition = { ...result.newPosition };
      this.currentChunk = { ...result.newChunk };

      if (result.chunkChanged) {
        this.activeChunks = this.loadActiveWindow(result.newChunk);
      }
    }

    return result;
  }

  public setPosition(pos: WorldCoordinates): void {
    const prevChunk = this.currentChunk;
    this.currentPosition = {
      worldX: pos.worldX,
      worldY: pos.worldY,
    };
    this.currentChunk = worldToChunk(this.currentPosition);

    if (
      this.currentChunk.chunkX !== prevChunk.chunkX ||
      this.currentChunk.chunkY !== prevChunk.chunkY ||
      this.activeChunks.length === 0
    ) {
      this.activeChunks = this.loadActiveWindow(this.currentChunk);
    }
  }

  public refreshActiveWindow(): void {
    this.activeChunks = this.loadActiveWindow(this.currentChunk);
  }

  private loadActiveWindow(centerChunk: ChunkCoordinates): readonly GeneratedChunk[] {
    return this.chunkCache.getChunkWindow(
      this.worldSeed,
      centerChunk.chunkX,
      centerChunk.chunkY,
      this.windowRadius
    );
  }
}
