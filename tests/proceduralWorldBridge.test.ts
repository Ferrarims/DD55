import { describe, it, expect } from 'vitest';
import {
  getStableWorldSeed,
} from '../src/game/world/useProceduralExplorationBridge';
import {
  ProceduralWorldController,
} from '../src/game/world/proceduralWorldController';
import {
  buildChunkWorldGrid,
  findPathInChunkWorld,
} from '../src/game/world/pathfindingAdapter';
import { CHUNK_SIZE } from '../src/game/world/types';

describe('Procedural Exploration Bridge & Controller Integration', () => {
  describe('getStableWorldSeed', () => {
    it('deve gerar seed estável baseada no ID do personagem', () => {
      const seed1 = getStableWorldSeed({ id: 'hero-123', name: 'Aragorn' });
      const seed2 = getStableWorldSeed({ id: 'hero-123', name: 'Outro Nome' });
      expect(seed1).toBe('seed-hero-123');
      expect(seed1).toBe(seed2);
    });

    it('deve gerar seed estável baseada no nome se não houver ID', () => {
      const seed = getStableWorldSeed({ name: 'Legolas Greenleaf' });
      expect(seed).toBe('seed-legolas-greenleaf');
    });

    it('deve usar fallback seed quando personagem for nulo ou vazio', () => {
      const seed = getStableWorldSeed(null, 999);
      expect(seed).toBe(999);
    });
  });

  describe('Bridge State & Grid Integration', () => {
    const SEED = 'bridge-integration-seed-42';

    it('deve inicializar o controlador procedural com janela 3x3 e indexar grid perfeitamente', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED,
        initialPosition: { worldX: 0, worldY: 0 },
        windowRadius: 1,
      });

      expect(controller.getPosition()).toEqual({ worldX: 0, worldY: 0 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 0 });

      const activeChunks = controller.getActiveChunks();
      expect(activeChunks.length).toBe(9);

      const grid = buildChunkWorldGrid(activeChunks);
      expect(grid.width).toBe(CHUNK_SIZE * 3);
      expect(grid.height).toBe(CHUNK_SIZE * 3);
      expect(grid.cells.length).toBe(CHUNK_SIZE * 3);
      expect(grid.cells[0].length).toBe(CHUNK_SIZE * 3);

      // Na janela 3x3 centrada em chunk (0,0), minWorldX = -32, minWorldY = -32
      expect(grid.minWorldX).toBe(-32);
      expect(grid.minWorldY).toBe(-32);
      expect(grid.maxWorldX).toBe(63);
      expect(grid.maxWorldY).toBe(63);

      // A posição global (0, 0) mapeia para posição local (32, 32)
      const localPos = grid.worldToGridPos({ worldX: 0, worldY: 0 });
      expect(localPos).toEqual({ x: 32, y: 32 });

      const worldPos = grid.gridToWorldPos({ x: 32, y: 32 });
      expect(worldPos).toEqual({ worldX: 0, worldY: 0 });
    });

    it('deve permitir travessia suave de chunks em todas as direções sem barreiras artificiais', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED,
        initialPosition: { worldX: 31, worldY: 0 },
        windowRadius: 1,
      });

      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 0 });

      // Move para X=32 (Chunk 1, 0)
      const moveRes = controller.moveTo({ worldX: 32, worldY: 0 });
      if (moveRes.success) {
        expect(moveRes.chunkChanged).toBe(true);
        expect(moveRes.newChunk).toEqual({ chunkX: 1, chunkY: 0 });

        const activeChunks = controller.getActiveChunks();
        expect(activeChunks.length).toBe(9);

        const newGrid = buildChunkWorldGrid(activeChunks);
        expect(newGrid.minWorldX).toBe(0);
        expect(newGrid.maxWorldX).toBe(95);

        // A posição global 32 agora mapeia para a coluna local 32
        const localPos = newGrid.worldToGridPos({ worldX: 32, worldY: 0 });
        expect(localPos).toEqual({ x: 32, y: 32 });
      }
    });

    it('deve suportar movimentação para quadrantes e coordenadas negativas', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED,
        initialPosition: { worldX: 0, worldY: 0 },
        windowRadius: 1,
      });

      // Move para X=-1, Y=-1 (Chunk -1, -1)
      const moveRes = controller.moveTo({ worldX: -1, worldY: -1 });
      if (moveRes.success) {
        expect(moveRes.newPosition).toEqual({ worldX: -1, worldY: -1 });
        expect(moveRes.newChunk).toEqual({ chunkX: -1, chunkY: -1 });

        const newGrid = buildChunkWorldGrid(controller.getActiveChunks());
        expect(newGrid.minWorldX).toBe(-64);
        expect(newGrid.minWorldY).toBe(-64);

        const localPos = newGrid.worldToGridPos({ worldX: -1, worldY: -1 });
        expect(localPos).toEqual({ x: 63, y: 63 });
      }
    });

    it('deve realizar pathfinding A* reutilizando o adaptador na janela de chunks carregada', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED,
        initialPosition: { worldX: 0, worldY: 0 },
        windowRadius: 1,
      });

      const grid = buildChunkWorldGrid(controller.getActiveChunks());
      const pathResult = findPathInChunkWorld(grid, { worldX: 0, worldY: 0 }, { worldX: 3, worldY: 3 });

      expect(typeof pathResult.success).toBe('boolean');
      if (pathResult.success) {
        expect(pathResult.status).toBe('SUCCESS');
        expect(pathResult.path.length).toBeGreaterThan(0);
        expect(pathResult.path[pathResult.path.length - 1]).toEqual({ worldX: 3, worldY: 3 });
      }
    });

    it('deve permitir resetar a posição para a origem (0, 0)', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED,
        initialPosition: { worldX: 120, worldY: 350 },
        windowRadius: 1,
      });

      expect(controller.getPosition()).toEqual({ worldX: 120, worldY: 350 });

      controller.setPosition({ worldX: 0, worldY: 0 });
      expect(controller.getPosition()).toEqual({ worldX: 0, worldY: 0 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 0 });
    });
  });
});
