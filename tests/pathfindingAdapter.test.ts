import { describe, it, expect } from 'vitest';
import {
  CHUNK_SIZE,
  ChunkCell,
  GeneratedChunk,
  WorldChunkCache,
  chunkCellToCellData,
  buildChunkWorldGrid,
  findPathInChunkWorld,
  findPathWithChunkCache,
} from '../src/game/world';
import { findPathAStar } from '../src/game/aStarPathfinding';

describe('Adaptador de Pathfinding A* para Mundo Procedural', () => {
  const TEST_SEED = 'cormyr-realm-path-seed-77';

  function createMockCell(
    worldX: number,
    worldY: number,
    blocksMovement = false,
    difficultTerrain = false
  ): ChunkCell {
    return {
      worldX,
      worldY,
      localX: ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
      localY: ((worldY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
      biome: 'Floresta',
      terrain: blocksMovement ? 'arvore_ancestral' : difficultTerrain ? 'arbusto_denso' : 'relva_florestal',
      blocksMovement,
      difficultTerrain,
      elevation: 0.5,
    };
  }

  function createMockChunk(
    chunkX: number,
    chunkY: number,
    cellModifier?: (worldX: number, worldY: number) => { blocksMovement?: boolean; difficultTerrain?: boolean }
  ): GeneratedChunk {
    const cells: ChunkCell[][] = [];
    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      const row: ChunkCell[] = [];
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldY = chunkY * CHUNK_SIZE + localY;
        const mod = cellModifier ? cellModifier(worldX, worldY) : {};
        row.push(createMockCell(worldX, worldY, mod.blocksMovement ?? false, mod.difficultTerrain ?? false));
      }
      cells.push(row);
    }
    return {
      chunkX,
      chunkY,
      dominantBiome: 'Floresta',
      cells,
    };
  }

  describe('Conversão e Formato Compatível com A* (chunkCellToCellData)', () => {
    it('deve converter célula normal em CellData com movementCost=1 e terrain=normal', () => {
      const cell = createMockCell(5, 10, false, false);
      const cellData = chunkCellToCellData(cell);

      expect(cellData.x).toBe(5);
      expect(cellData.y).toBe(10);
      expect(cellData.terrain).toBe('normal');
      expect(cellData.movementCost).toBe(1);
    });

    it('deve converter célula com blocksMovement em terrain=wall e movementCost=Infinity', () => {
      const cell = createMockCell(12, 14, true, false);
      const cellData = chunkCellToCellData(cell);

      expect(cellData.terrain).toBe('wall');
      expect(cellData.movementCost).toBe(Infinity);
    });

    it('deve converter célula com difficultTerrain em terrain=difficult e movementCost=2', () => {
      const cell = createMockCell(20, 25, false, true);
      const cellData = chunkCellToCellData(cell);

      expect(cellData.terrain).toBe('difficult');
      expect(cellData.movementCost).toBe(2);
    });

    it('deve permitir sobrescrever a posição de grade para coordenadas locais da janela', () => {
      const cell = createMockCell(100, 200, false, false);
      const cellData = chunkCellToCellData(cell, { x: 4, y: 8 });

      expect(cellData.x).toBe(4);
      expect(cellData.y).toBe(8);
    });
  });

  describe('Construção de Grade de Janela de Chunks (buildChunkWorldGrid)', () => {
    it('deve criar uma grade correta para um único chunk', () => {
      const chunk = createMockChunk(0, 0);
      const grid = buildChunkWorldGrid([chunk]);

      expect(grid.width).toBe(32);
      expect(grid.height).toBe(32);
      expect(grid.minWorldX).toBe(0);
      expect(grid.maxWorldX).toBe(31);
      expect(grid.minWorldY).toBe(0);
      expect(grid.maxWorldY).toBe(31);

      expect(grid.isWorldPosInBounds(0, 0)).toBe(true);
      expect(grid.isWorldPosInBounds(31, 31)).toBe(true);
      expect(grid.isWorldPosInBounds(32, 0)).toBe(false);
      expect(grid.isWorldPosInBounds(-1, 0)).toBe(false);
    });

    it('deve indexar e mapear coordenadas em janela 3x3 de chunks', () => {
      const chunks: GeneratedChunk[] = [];
      for (let cy = -1; cy <= 1; cy++) {
        for (let cx = -1; cx <= 1; cx++) {
          chunks.push(createMockChunk(cx, cy));
        }
      }
      const grid = buildChunkWorldGrid(chunks);

      expect(grid.width).toBe(96);
      expect(grid.height).toBe(96);
      expect(grid.minWorldX).toBe(-32);
      expect(grid.maxWorldX).toBe(63);
      expect(grid.minWorldY).toBe(-32);
      expect(grid.maxWorldY).toBe(63);

      const cell = grid.getCellAtWorld(0, 0);
      expect(cell).not.toBeNull();
      expect(cell?.x).toBe(32); // Offset local na grade de 96x96
      expect(cell?.y).toBe(32);
    });
  });

  describe('Pathfinding em Mundo de Chunks (findPathInChunkWorld)', () => {
    it('deve encontrar caminho livre direto entre dois pontos', () => {
      const chunk = createMockChunk(0, 0);
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: 2, worldY: 2 },
        { worldX: 5, worldY: 2 }
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.path.length).toBe(4);
      expect(result.path[0]).toEqual({ worldX: 2, worldY: 2 });
      expect(result.path[result.path.length - 1]).toEqual({ worldX: 5, worldY: 2 });
      expect(result.totalMovementCost).toBe(3);
    });

    it('deve desviar ao redor de obstáculos bloqueantes', () => {
      // Cria parede vertical em worldX = 3 de worldY = 0 até worldY = 4
      const chunk = createMockChunk(0, 0, (wx, wy) => {
        if (wx === 3 && wy >= 0 && wy <= 4) {
          return { blocksMovement: true };
        }
        return {};
      });
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: 1, worldY: 2 },
        { worldX: 5, worldY: 2 }
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      // O caminho não pode conter células com x=3 e y entre 0 e 4
      for (const step of result.path) {
        const isBlockedWall = step.worldX === 3 && step.worldY >= 0 && step.worldY <= 4;
        expect(isBlockedWall).toBe(false);
      }
    });

    it('deve retornar NO_PATH_FOUND quando o destino estiver totalmente cercado', () => {
      // Cerco fechado ao redor de (5, 5)
      const chunk = createMockChunk(0, 0, (wx, wy) => {
        if (Math.abs(wx - 5) <= 1 && Math.abs(wy - 5) <= 1 && !(wx === 5 && wy === 5)) {
          return { blocksMovement: true };
        }
        return {};
      });
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: 0, worldY: 0 },
        { worldX: 5, worldY: 5 }
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('NO_PATH_FOUND');
      expect(result.path).toEqual([]);
    });

    it('deve computar custo dobrado (movementCost=2) para passos em terreno difícil', () => {
      // Corredor estreito com paredes acima e abaixo e terreno difícil no caminho
      const chunk = createMockChunk(0, 0, (wx, wy) => {
        if ((wy === 4 || wy === 6) && wx >= 1 && wx <= 4) {
          return { blocksMovement: true };
        }
        if (wy === 5 && wx >= 2 && wx <= 4) {
          return { difficultTerrain: true };
        }
        return {};
      });
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: 1, worldY: 5 },
        { worldX: 4, worldY: 5 }
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      // Passos no corredor: (1,5) -> (2,5 cost 2) -> (3,5 cost 2) -> (4,5 cost 2) = custo total 6
      expect(result.totalMovementCost).toBe(6);
    });

    it('deve navegar perfeitamente através de quadrantes e coordenadas negativas', () => {
      // Janela com chunks negativos: (-1, -1) até (0, 0)
      const chunks = [
        createMockChunk(-1, -1),
        createMockChunk(0, -1),
        createMockChunk(-1, 0),
        createMockChunk(0, 0),
      ];
      const grid = buildChunkWorldGrid(chunks);

      const startWorld = { worldX: -10, worldY: -15 };
      const targetWorld = { worldX: 10, worldY: 5 };

      const result = findPathInChunkWorld(grid, startWorld, targetWorld);

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.path[0]).toEqual(startWorld);
      expect(result.path[result.path.length - 1]).toEqual(targetWorld);
    });

    it('deve retornar START_OUT_OF_BOUNDS quando o início estiver fora da janela', () => {
      const chunk = createMockChunk(0, 0); // Limites: 0..31, 0..31
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: -5, worldY: 10 },
        { worldX: 15, worldY: 15 }
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('START_OUT_OF_BOUNDS');
      expect(result.path).toEqual([]);
    });

    it('deve retornar TARGET_OUT_OF_BOUNDS quando o destino estiver fora da janela', () => {
      const chunk = createMockChunk(0, 0); // Limites: 0..31, 0..31
      const grid = buildChunkWorldGrid([chunk]);

      const result = findPathInChunkWorld(
        grid,
        { worldX: 10, worldY: 10 },
        { worldX: 45, worldY: 20 }
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('TARGET_OUT_OF_BOUNDS');
      expect(result.path).toEqual([]);
    });
  });

  describe('Integração com WorldChunkCache e Reutilização do A*', () => {
    it('findPathWithChunkCache deve carregar janela do cache e encontrar caminho determinístico', () => {
      const cache = new WorldChunkCache();
      const start = { worldX: 0, worldY: 0 };
      const target = { worldX: 5, worldY: 5 };

      const result = findPathWithChunkCache(cache, TEST_SEED, start, target, 1);

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(target);
      expect(cache.size()).toBe(9); // Janela 3x3 carregada no cache
    });

    it('deve ser estritamente equivalente ao findPathAStar original em dados convertidos', () => {
      const chunk = createMockChunk(0, 0);
      const grid = buildChunkWorldGrid([chunk]);

      const start = { x: 2, y: 3 };
      const target = { x: 8, y: 9 };

      const rawAStarPath = findPathAStar(grid.cells, start, target);
      const adaptedResult = findPathInChunkWorld(
        grid,
        { worldX: start.x, worldY: start.y },
        { worldX: target.x, worldY: target.y }
      );

      expect(adaptedResult.success).toBe(true);
      expect(adaptedResult.path.length).toBe(rawAStarPath.length);

      for (let i = 0; i < rawAStarPath.length; i++) {
        expect(adaptedResult.path[i].worldX).toBe(rawAStarPath[i].x);
        expect(adaptedResult.path[i].worldY).toBe(rawAStarPath[i].y);
      }
    });
  });
});
