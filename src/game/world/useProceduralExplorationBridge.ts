import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ChunkCell,
  ChunkCoordinates,
  WorldCoordinates,
  WorldSeed,
} from './types';
import { ProceduralWorldController, WorldMoveResult } from './proceduralWorldController';
import {
  buildChunkWorldGrid,
  ChunkWorldGrid,
  findPathInChunkWorld,
  WorldPathfindingResult,
  WorldPathfindingOptions,
} from './pathfindingAdapter';
import { CellData, GridPosition } from '../../types/game';

export interface UseProceduralExplorationBridgeOptions {
  readonly enabled: boolean;
  readonly character?: { id?: string; name?: string; race?: string; speed?: string } | null;
  readonly defaultSeed?: WorldSeed;
  readonly initialPosition?: WorldCoordinates;
}

export interface ProceduralExplorationBridgeState {
  readonly enabled: boolean;
  readonly worldSeed: WorldSeed;
  readonly worldPosition: WorldCoordinates;
  readonly currentChunk: ChunkCoordinates;
  readonly currentCell: ChunkCell | null;
  readonly activeGrid: ChunkWorldGrid | null;
  readonly proceduralCells: CellData[][];
  readonly relativeHeroPos: GridPosition;
  readonly moveBy: (dx: number, dy: number) => WorldMoveResult | null;
  readonly moveTo: (targetWorldPos: WorldCoordinates) => WorldMoveResult | null;
  readonly findPathTo: (
    targetWorldPos: WorldCoordinates,
    options?: WorldPathfindingOptions
  ) => WorldPathfindingResult | null;
  readonly teleportTo: (pos: WorldCoordinates) => void;
  readonly resetToOrigin: () => void;
  readonly worldToGridPos: (pos: WorldCoordinates) => GridPosition | null;
  readonly gridToWorldPos: (pos: GridPosition) => WorldCoordinates | null;
}

/**
 * Gera uma seed estável determinística baseada no personagem ou valor padrão.
 */
export function getStableWorldSeed(character?: { id?: string; name?: string } | null, fallbackSeed: WorldSeed = 133742): WorldSeed {
  if (character?.id && character.id.trim().length > 0) {
    return `seed-${character.id}`;
  }
  if (character?.name && character.name.trim().length > 0) {
    return `seed-${character.name.toLowerCase().replace(/\s+/g, '-')}`;
  }
  return fallbackSeed;
}

/**
 * Hook bridge que conecta o ProceduralWorldController e o adaptador A* ao ciclo de vida do React.
 * Mantém isolamento total de arena finita e não altera o modo de combate.
 */
export function useProceduralExplorationBridge(
  options: UseProceduralExplorationBridgeOptions
): ProceduralExplorationBridgeState {
  const { enabled, character, defaultSeed, initialPosition } = options;

  const stableSeed = useMemo(() => {
    return defaultSeed ?? getStableWorldSeed(character);
  }, [defaultSeed, character?.id, character?.name]);

  const controllerRef = useRef<ProceduralWorldController | null>(null);

  // Inicializar / Reutilizar controlador quando habilitado
  if (enabled && (!controllerRef.current || controllerRef.current.getWorldSeed() !== stableSeed)) {
    controllerRef.current = new ProceduralWorldController({
      worldSeed: stableSeed,
      initialPosition: initialPosition ?? { worldX: 0, worldY: 0 },
      windowRadius: 1, // Janela 3x3
    });
  }

  const [worldPosition, setWorldPosition] = useState<WorldCoordinates>(() => {
    return controllerRef.current?.getPosition() ?? (initialPosition ?? { worldX: 0, worldY: 0 });
  });

  const [currentChunk, setCurrentChunk] = useState<ChunkCoordinates>(() => {
    return controllerRef.current?.getCurrentChunk() ?? { chunkX: 0, chunkY: 0 };
  });

  const [activeGridVersion, setActiveGridVersion] = useState<number>(0);

  // Sincronizar quando habilitado / desabilitado ou quando a seed mudar
  useEffect(() => {
    if (enabled && controllerRef.current) {
      setWorldPosition(controllerRef.current.getPosition());
      setCurrentChunk(controllerRef.current.getCurrentChunk());
      setActiveGridVersion(v => v + 1);
    }
  }, [enabled, stableSeed]);

  // Construir ChunkWorldGrid a partir dos chunks ativos
  const activeGrid = useMemo<ChunkWorldGrid | null>(() => {
    if (!enabled || !controllerRef.current) return null;
    const activeChunks = controllerRef.current.getActiveChunks();
    return buildChunkWorldGrid(activeChunks);
  }, [enabled, activeGridVersion]);

  const proceduralCells = useMemo<CellData[][]>(() => {
    return activeGrid?.cells ?? [];
  }, [activeGrid]);

  const currentCell = useMemo<ChunkCell | null>(() => {
    if (!enabled || !controllerRef.current) return null;
    return controllerRef.current.getCurrentCell();
  }, [enabled, worldPosition, activeGridVersion]);

  const relativeHeroPos = useMemo<GridPosition>(() => {
    if (!activeGrid) return { x: 0, y: 0 };
    const gridPos = activeGrid.worldToGridPos(worldPosition);
    return gridPos ?? { x: 0, y: 0 };
  }, [activeGrid, worldPosition]);

  const moveBy = useCallback((dx: number, dy: number): WorldMoveResult | null => {
    if (!enabled || !controllerRef.current) return null;

    const result = controllerRef.current.moveBy(dx, dy);
    if (result.success) {
      setWorldPosition(result.newPosition);
      if (result.chunkChanged) {
        setCurrentChunk(result.newChunk);
        setActiveGridVersion(v => v + 1);
      }
    }
    return result;
  }, [enabled]);

  const moveTo = useCallback((targetWorldPos: WorldCoordinates): WorldMoveResult | null => {
    if (!enabled || !controllerRef.current) return null;

    const result = controllerRef.current.moveTo(targetWorldPos);
    if (result.success) {
      setWorldPosition(result.newPosition);
      if (result.chunkChanged) {
        setCurrentChunk(result.newChunk);
        setActiveGridVersion(v => v + 1);
      }
    }
    return result;
  }, [enabled]);

  const findPathTo = useCallback((
    targetWorldPos: WorldCoordinates,
    pathOptions?: WorldPathfindingOptions
  ): WorldPathfindingResult | null => {
    if (!enabled || !activeGrid || !controllerRef.current) return null;

    const currentPos = controllerRef.current.getPosition();
    return findPathInChunkWorld(activeGrid, currentPos, targetWorldPos, pathOptions);
  }, [enabled, activeGrid]);

  const teleportTo = useCallback((pos: WorldCoordinates): void => {
    if (!enabled || !controllerRef.current) return;

    controllerRef.current.setPosition(pos);
    setWorldPosition(controllerRef.current.getPosition());
    setCurrentChunk(controllerRef.current.getCurrentChunk());
    setActiveGridVersion(v => v + 1);
  }, [enabled]);

  const resetToOrigin = useCallback((): void => {
    teleportTo({ worldX: 0, worldY: 0 });
  }, [teleportTo]);

  const worldToGridPos = useCallback((pos: WorldCoordinates): GridPosition | null => {
    if (!activeGrid) return null;
    return activeGrid.worldToGridPos(pos);
  }, [activeGrid]);

  const gridToWorldPos = useCallback((pos: GridPosition): WorldCoordinates | null => {
    if (!activeGrid) return null;
    return activeGrid.gridToWorldPos(pos);
  }, [activeGrid]);

  return {
    enabled,
    worldSeed: stableSeed,
    worldPosition,
    currentChunk,
    currentCell,
    activeGrid,
    proceduralCells,
    relativeHeroPos,
    moveBy,
    moveTo,
    findPathTo,
    teleportTo,
    resetToOrigin,
    worldToGridPos,
    gridToWorldPos,
  };
}
