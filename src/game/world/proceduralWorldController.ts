import {
  ChunkCell,
  ChunkCoordinates,
  GeneratedChunk,
  WorldCoordinates,
  WorldSeed,
} from './types';
import { WorldChunkCache } from './chunkCache';
import {
  worldToChunk,
  worldToLocal,
} from './coordinates';

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

  /**
   * Retorna a seed do mundo configurada.
   */
  public getWorldSeed(): WorldSeed {
    return this.worldSeed;
  }

  /**
   * Retorna a posição global atual do jogador.
   */
  public getPosition(): WorldCoordinates {
    return { ...this.currentPosition };
  }

  /**
   * Retorna as coordenadas de chunk onde o jogador se encontra.
   */
  public getCurrentChunk(): ChunkCoordinates {
    return { ...this.currentChunk };
  }

  /**
   * Retorna a instância do cache de chunks em memória.
   */
  public getChunkCache(): WorldChunkCache {
    return this.chunkCache;
  }

  /**
   * Retorna a lista de chunks ativos na janela ao redor do jogador (por padrão, 3 × 3 = 9 chunks).
   */
  public getActiveChunks(): readonly GeneratedChunk[] {
    return this.activeChunks;
  }

  /**
   * Retorna a célula procedural em que o jogador está posicionado.
   */
  public getCurrentCell(): ChunkCell {
    return this.getCellAt(this.currentPosition.worldX, this.currentPosition.worldY);
  }

  /**
   * Consulta os dados de qualquer célula por coordenadas globais de mundo.
   * Utiliza o cache de chunks para carregar o chunk necessário sob demanda.
   */
  public getCellAt(worldX: number, worldY: number): ChunkCell {
    const chunkCoord = worldToChunk({ worldX, worldY });
    const localCoord = worldToLocal({ worldX, worldY });

    const chunk = this.chunkCache.getOrGenerateChunk(
      this.worldSeed,
      chunkCoord.chunkX,
      chunkCoord.chunkY
    );

    return chunk.cells[localCoord.localY][localCoord.localX];
  }

  /**
   * Consulta os dados de célula a partir de um objeto WorldCoordinates.
   */
  public getCellAtWorld(coords: WorldCoordinates): ChunkCell {
    return this.getCellAt(coords.worldX, coords.worldY);
  }

  /**
   * Verifica se a célula na coordenada de mundo especificada bloqueia movimento.
   */
  public isMovementBlocked(worldX: number, worldY: number): boolean {
    const cell = this.getCellAt(worldX, worldY);
    return cell.blocksMovement;
  }

  /**
   * Calcula o custo de movimento para adentrar a célula na coordenada especificada.
   * Retorna Infinity se bloqueada, 2 se terreno difícil e 1 se terreno normal.
   */
  public getMovementCost(worldX: number, worldY: number): number {
    const cell = this.getCellAt(worldX, worldY);
    if (cell.blocksMovement) {
      return Infinity;
    }
    if (cell.difficultTerrain) {
      return 2;
    }
    return 1;
  }

  /**
   * Move o jogador por um delta de uma célula (dx: -1..1, dy: -1..1).
   * Valida colisão, terreno difícil e atualiza a janela ativa se houver transição de chunk.
   */
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

  /**
   * Move o jogador para uma coordenada global adjacente.
   * Se a célula de destino bloquear movimento, a posição não é alterada.
   */
  public moveTo(targetPos: WorldCoordinates): WorldMoveResult {
    const prevPos = this.getPosition();
    const prevChunk = this.getCurrentChunk();
    const targetCell = this.getCellAtWorld(targetPos);

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

    this.currentPosition = {
      worldX: targetPos.worldX,
      worldY: targetPos.worldY,
    };
    this.currentChunk = nextChunk;

    if (chunkChanged) {
      this.activeChunks = this.loadActiveWindow(nextChunk);
    }

    return {
      success: true,
      previousPosition: prevPos,
      newPosition: this.getPosition(),
      previousChunk: prevChunk,
      newChunk: nextChunk,
      chunkChanged,
      movementCost,
      targetCell,
    };
  }

  /**
   * Reposiciona o jogador diretamente em uma coordenada global (ex: teletransporte/respawn)
   * e recarrega a janela ativa de chunks correspondente.
   */
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

  /**
   * Força a recarga da janela de chunks ativa ao redor da posição atual.
   */
  public refreshActiveWindow(): void {
    this.activeChunks = this.loadActiveWindow(this.currentChunk);
  }

  /**
   * Carrega a janela de chunks ao redor de um chunk central a partir do cache.
   */
  private loadActiveWindow(centerChunk: ChunkCoordinates): readonly GeneratedChunk[] {
    return this.chunkCache.getChunkWindow(
      this.worldSeed,
      centerChunk.chunkX,
      centerChunk.chunkY,
      this.windowRadius
    );
  }
}
