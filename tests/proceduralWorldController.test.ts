import { describe, it, expect } from 'vitest';
import {
  CHUNK_SIZE,
  ProceduralWorldController,
  WorldChunkCache,
  worldToChunk,
} from '../src/game/world';

describe('ProceduralWorldController (Controlador Puro de Exploração Procedural)', () => {
  const SEED_MAIN = 'faerun-wilderness-42';
  const SEED_ALT = 'waterdeep-sewers-99';

  describe('Inicialização e Estado Global', () => {
    it('deve inicializar na posição padrão (0,0) e com janela 3x3 (9 chunks ativos)', () => {
      const controller = new ProceduralWorldController({ worldSeed: SEED_MAIN });

      expect(controller.getWorldSeed()).toBe(SEED_MAIN);
      expect(controller.getPosition()).toEqual({ worldX: 0, worldY: 0 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 0 });
      expect(controller.getActiveChunks().length).toBe(9);

      const currentCell = controller.getCurrentCell();
      expect(currentCell.worldX).toBe(0);
      expect(currentCell.worldY).toBe(0);
      expect(currentCell.biome).toBeDefined();
    });

    it('deve inicializar em posição global customizada', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: 65, worldY: 100 },
      });

      expect(controller.getPosition()).toEqual({ worldX: 65, worldY: 100 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 2, chunkY: 3 });
      expect(controller.getActiveChunks().length).toBe(9);
    });
  });

  describe('Movimento Normal e Custo de Terreno', () => {
    it('deve mover uma célula livre atualizando a posição com custo 1', () => {
      const controller = new ProceduralWorldController({ worldSeed: SEED_MAIN });

      // Encontra uma célula livre adjacente
      const pos = controller.getPosition();
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];

      let moved = false;
      for (const dir of directions) {
        const cost = controller.getMovementCost(pos.worldX + dir.dx, pos.worldY + dir.dy);
        if (cost === 1) {
          const result = controller.moveBy(dir.dx, dir.dy);
          expect(result.success).toBe(true);
          expect(result.previousPosition).toEqual(pos);
          expect(result.newPosition).toEqual({
            worldX: pos.worldX + dir.dx,
            worldY: pos.worldY + dir.dy,
          });
          expect(result.movementCost).toBe(1);
          expect(controller.getPosition()).toEqual(result.newPosition);
          moved = true;
          break;
        }
      }

      expect(moved).toBe(true);
    });

    it('deve bloquear movimento em obstáculos sem alterar a posição do jogador', () => {
      const controller = new ProceduralWorldController({ worldSeed: SEED_MAIN });

      // Procura uma célula com obstáculo no chunk atual
      let blockedCoord: { worldX: number; worldY: number } | null = null;
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          if (controller.isMovementBlocked(x, y)) {
            blockedCoord = { worldX: x, worldY: y };
            break;
          }
        }
        if (blockedCoord) break;
      }

      expect(blockedCoord).not.toBeNull();
      if (blockedCoord) {
        // Posiciona adjacente ao obstáculo
        const origin = { worldX: blockedCoord.worldX - 1, worldY: blockedCoord.worldY };
        controller.setPosition(origin);

        const result = controller.moveTo(blockedCoord);
        expect(result.success).toBe(false);
        expect(result.reason).toBe('BLOCKED');
        expect(result.movementCost).toBe(Infinity);
        expect(result.previousPosition).toEqual(origin);
        expect(result.newPosition).toEqual(origin);
        expect(controller.getPosition()).toEqual(origin);
      }
    });

    it('deve calcular custo dobrado (movementCost=2) para terreno difícil', () => {
      const controller = new ProceduralWorldController({ worldSeed: SEED_MAIN });

      // Procura uma célula com terreno difícil
      let diffCoord: { worldX: number; worldY: number } | null = null;
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const cell = controller.getCellAt(x, y);
          if (cell.difficultTerrain && !cell.blocksMovement) {
            diffCoord = { worldX: x, worldY: y };
            break;
          }
        }
        if (diffCoord) break;
      }

      if (diffCoord) {
        controller.setPosition({ worldX: diffCoord.worldX - 1, worldY: diffCoord.worldY });
        const result = controller.moveTo(diffCoord);
        if (result.success) {
          expect(result.movementCost).toBe(2);
          expect(result.targetCell.difficultTerrain).toBe(true);
        }
      }
    });
  });

  describe('Travessia de Fronteiras nos Quatro Lados', () => {
    it('Lado Leste (East): atravessar borda worldX = 31 -> 32 deve mudar chunkX de 0 para 1 e recarregar janela', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: 31, worldY: 10 },
      });

      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 0 });

      // Se a célula (32, 10) estiver bloqueada, movemos em Y até achar passagem livre
      let startY = 10;
      while (controller.isMovementBlocked(32, startY) && startY < 30) {
        startY++;
      }
      controller.setPosition({ worldX: 31, worldY: startY });

      const result = controller.moveBy(1, 0);
      expect(result.success).toBe(true);
      expect(result.chunkChanged).toBe(true);
      expect(result.previousChunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(result.newChunk).toEqual({ chunkX: 1, chunkY: 0 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 1, chunkY: 0 });

      // Janela 3x3 centrada em (1, 0)
      const activeChunks = controller.getActiveChunks();
      expect(activeChunks.length).toBe(9);
      const chunkKeys = activeChunks.map((c) => `${c.chunkX},${c.chunkY}`);
      expect(chunkKeys).toContain('1,0');
      expect(chunkKeys).toContain('2,0');
      expect(chunkKeys).toContain('0,0');
    });

    it('Lado Oeste (West): atravessar borda worldX = 0 -> -1 deve mudar chunkX de 0 para -1', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: 0, worldY: 10 },
      });

      let startY = 10;
      while (controller.isMovementBlocked(-1, startY) && startY < 30) {
        startY++;
      }
      controller.setPosition({ worldX: 0, worldY: startY });

      const result = controller.moveBy(-1, 0);
      expect(result.success).toBe(true);
      expect(result.chunkChanged).toBe(true);
      expect(result.previousChunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(result.newChunk).toEqual({ chunkX: -1, chunkY: 0 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: -1, chunkY: 0 });
    });

    it('Lado Sul (South): atravessar borda worldY = 31 -> 32 deve mudar chunkY de 0 para 1', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: 10, worldY: 31 },
      });

      let startX = 10;
      while (controller.isMovementBlocked(startX, 32) && startX < 30) {
        startX++;
      }
      controller.setPosition({ worldX: startX, worldY: 31 });

      const result = controller.moveBy(0, 1);
      expect(result.success).toBe(true);
      expect(result.chunkChanged).toBe(true);
      expect(result.previousChunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(result.newChunk).toEqual({ chunkX: 0, chunkY: 1 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: 1 });
    });

    it('Lado Norte (North): atravessar borda worldY = 0 -> -1 deve mudar chunkY de 0 para -1', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: 10, worldY: 0 },
      });

      let startX = 10;
      while (controller.isMovementBlocked(startX, -1) && startX < 30) {
        startX++;
      }
      controller.setPosition({ worldX: startX, worldY: 0 });

      const result = controller.moveBy(0, -1);
      expect(result.success).toBe(true);
      expect(result.chunkChanged).toBe(true);
      expect(result.previousChunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(result.newChunk).toEqual({ chunkX: 0, chunkY: -1 });
      expect(controller.getCurrentChunk()).toEqual({ chunkX: 0, chunkY: -1 });
    });
  });

  describe('Navegação e Chunks Negativos Sem Limite Artificial', () => {
    it('deve operar em coordenadas profundamente negativas', () => {
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        initialPosition: { worldX: -3200, worldY: -6400 },
      });

      const chunk = controller.getCurrentChunk();
      expect(chunk).toEqual({ chunkX: -100, chunkY: -200 });

      const cell = controller.getCurrentCell();
      expect(cell.worldX).toBe(-3200);
      expect(cell.worldY).toBe(-6400);

      const active = controller.getActiveChunks();
      expect(active.length).toBe(9);
      const coords = active.map((c) => `${c.chunkX},${c.chunkY}`);
      expect(coords).toContain('-100,-200');
      expect(coords).toContain('-101,-201');
      expect(coords).toContain('-99,-199');
    });
  });

  describe('Limite de Chunks Ativos e Cache Reutilizado', () => {
    it('a janela ativa deve conter exatamente 9 chunks enquanto o cache armazena múltiplos chunks', () => {
      const cache = new WorldChunkCache({ maxCapacity: 64 });
      const controller = new ProceduralWorldController({
        worldSeed: SEED_MAIN,
        chunkCache: cache,
      });

      expect(controller.getActiveChunks().length).toBe(9);
      expect(cache.size()).toBe(9);

      // Move-se para outros chunks
      controller.setPosition({ worldX: 320, worldY: 320 }); // Chunk (10, 10)
      expect(controller.getActiveChunks().length).toBe(9);
      expect(cache.size()).toBe(18); // 9 antigos + 9 novos
    });
  });

  describe('Recriação Idêntica Pela Mesma Seed', () => {
    it('dois controladores com a mesma seed devem gerar biomas, terrenos e células perfeitamente idênticos', () => {
      const controllerA = new ProceduralWorldController({ worldSeed: SEED_MAIN });
      const controllerB = new ProceduralWorldController({ worldSeed: SEED_MAIN });

      const testCoords = [
        { worldX: 0, worldY: 0 },
        { worldX: -50, worldY: 25 },
        { worldX: 128, worldY: -96 },
        { worldX: 1000, worldY: 2000 },
      ];

      for (const pos of testCoords) {
        const cellA = controllerA.getCellAtWorld(pos);
        const cellB = controllerB.getCellAtWorld(pos);

        expect(cellA.biome).toBe(cellB.biome);
        expect(cellA.terrain).toBe(cellB.terrain);
        expect(cellA.blocksMovement).toBe(cellB.blocksMovement);
        expect(cellA.difficultTerrain).toBe(cellB.difficultTerrain);
        expect(cellA.elevation).toBe(cellB.elevation);
      }
    });

    it('controladores com seeds distintas devem gerar dados diferentes', () => {
      const controllerA = new ProceduralWorldController({ worldSeed: SEED_MAIN });
      const controllerB = new ProceduralWorldController({ worldSeed: SEED_ALT });

      let differencesFound = 0;
      for (let i = 0; i < 30; i++) {
        const cellA = controllerA.getCellAt(i * 10, i * 10);
        const cellB = controllerB.getCellAt(i * 10, i * 10);
        if (cellA.elevation !== cellB.elevation || cellA.terrain !== cellB.terrain) {
          differencesFound++;
        }
      }

      expect(differencesFound).toBeGreaterThan(0);
    });
  });
});
