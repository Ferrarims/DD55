import { describe, it, expect, vi } from 'vitest';
import {
  CHUNK_SIZE,
  generateChunk,
  getCellAtWorldPosition,
  getBiomeAtWorldPosition,
  Biome,
} from '../src/game/world';

describe('Gerador Determinístico de Chunks e Células', () => {
  const TEST_SEED = 'toril-forgotten-realms-42';

  it('cada chunk deve conter exatamente 32 × 32 células', () => {
    const chunk = generateChunk(TEST_SEED, 0, 0);
    expect(chunk.cells.length).toBe(CHUNK_SIZE);
    for (let y = 0; y < CHUNK_SIZE; y++) {
      expect(chunk.cells[y].length).toBe(CHUNK_SIZE);
    }
  });

  it('cada célula deve possuir todos os campos obrigatórios tipados', () => {
    const cell = getCellAtWorldPosition(TEST_SEED, 10, 20);
    expect(typeof cell.worldX).toBe('number');
    expect(typeof cell.worldY).toBe('number');
    expect(typeof cell.localX).toBe('number');
    expect(typeof cell.localY).toBe('number');
    expect(['Caverna', 'Floresta', 'Masmorra', 'Pântano', 'Deserto']).toContain(cell.biome);
    expect(typeof cell.terrain).toBe('string');
    expect(typeof cell.blocksMovement).toBe('boolean');
    expect(typeof cell.difficultTerrain).toBe('boolean');
    expect(typeof cell.elevation).toBe('number');
  });

  describe('Determinismo Estrito', () => {
    it('mesma seed e coordenadas devem gerar chunks idênticos', () => {
      const chunk1 = generateChunk(TEST_SEED, 2, -3);
      const chunk2 = generateChunk(TEST_SEED, 2, -3);

      expect(chunk1.dominantBiome).toBe(chunk2.dominantBiome);
      expect(chunk1.cells).toEqual(chunk2.cells);
    });

    it('getCellAtWorldPosition deve ser 100% determinístico', () => {
      const cell1 = getCellAtWorldPosition(TEST_SEED, -45, 128);
      const cell2 = getCellAtWorldPosition(TEST_SEED, -45, 128);

      expect(cell1).toEqual(cell2);
    });
  });

  describe('Diferenciação por Seed', () => {
    it('seeds distintas devem produzir resultados diferentes no mesmo chunk', () => {
      const chunkA = generateChunk('seed-alpha-123', 0, 0);
      const chunkB = generateChunk('seed-beta-999', 0, 0);

      const areIdentical = JSON.stringify(chunkA.cells) === JSON.stringify(chunkB.cells);
      expect(areIdentical).toBe(false);
    });
  });

  describe('Suporte a Chunks e Coordenadas Negativas', () => {
    it('deve gerar corretamente chunks em quadrantes negativos', () => {
      const chunkNeg = generateChunk(TEST_SEED, -2, -3);

      expect(chunkNeg.chunkX).toBe(-2);
      expect(chunkNeg.chunkY).toBe(-3);

      // Canto superior esquerdo do chunk (-2, -3) => worldX: -64, worldY: -96
      const firstCell = chunkNeg.cells[0][0];
      expect(firstCell.worldX).toBe(-64);
      expect(firstCell.worldY).toBe(-96);
      expect(firstCell.localX).toBe(0);
      expect(firstCell.localY).toBe(0);

      // Canto inferior direito do chunk (-2, -3) => worldX: -33, worldY: -65
      const lastCell = chunkNeg.cells[31][31];
      expect(lastCell.worldX).toBe(-33);
      expect(lastCell.worldY).toBe(-65);
      expect(lastCell.localX).toBe(31);
      expect(lastCell.localY).toBe(31);
    });
  });

  describe('Equivalência Bipessoal: getCellAtWorldPosition vs generateChunk', () => {
    it('toda célula do chunk gerado deve ser idêntica a getCellAtWorldPosition', () => {
      const chunkX = -1;
      const chunkY = 2;
      const chunk = generateChunk(TEST_SEED, chunkX, chunkY);

      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          const worldX = chunkX * CHUNK_SIZE + localX;
          const worldY = chunkY * CHUNK_SIZE + localY;

          const directCell = getCellAtWorldPosition(TEST_SEED, worldX, worldY);
          const chunkCell = chunk.cells[localY][localX];

          expect(chunkCell).toEqual(directCell);
        }
      }
    });
  });

  describe('Bordas e Continuidade de Biomas em Regiões Grandes', () => {
    it('biomas vizinhos em células adjacentes devem formar blocos contíguos', () => {
      // Amostra uma linha de 20 células contínuas
      const biomes: Biome[] = [];
      for (let x = 0; x < 20; x++) {
        biomes.push(getBiomeAtWorldPosition(TEST_SEED, x, 50));
      }

      // Conta o número de trocas de bioma
      let transitions = 0;
      for (let i = 1; i < biomes.length; i++) {
        if (biomes[i] !== biomes[i - 1]) {
          transitions++;
        }
      }

      // Em 20 tiles adjacentes, os biomas NÃO devem alternar a cada célula (máximo 1-2 transições de fronteira)
      expect(transitions).toBeLessThanOrEqual(2);
    });

    it('continuidade de relevo/elevação nas fronteiras de chunks', () => {
      // Célula no fim do chunk 0 (worldX = 31) e início do chunk 1 (worldX = 32)
      const cellEdgeLeft = getCellAtWorldPosition(TEST_SEED, 31, 10);
      const cellEdgeRight = getCellAtWorldPosition(TEST_SEED, 32, 10);

      // A diferença de elevação entre vizinhos deve ser suave, sem saltos abruptos de descontinuidade
      const diff = Math.abs(cellEdgeLeft.elevation - cellEdgeRight.elevation);
      expect(diff).toBeLessThan(0.2);
    });
  });

  describe('Ausência de Math.random (Pureza Determinística)', () => {
    it('não deve invocar Math.random durante a geração de chunks ou células', () => {
      const randomSpy = vi.spyOn(Math, 'random');

      // Gera múltiplos chunks e células
      generateChunk(TEST_SEED, 0, 0);
      generateChunk(TEST_SEED, -1, -1);
      generateChunk(TEST_SEED, 5, 10);

      for (let i = -100; i <= 100; i += 25) {
        getCellAtWorldPosition(TEST_SEED, i, i * 2);
      }

      expect(randomSpy).not.toHaveBeenCalled();
      randomSpy.mockRestore();
    });
  });

  describe('Obstáculos Apropriados por Bioma', () => {
    it('deve gerar obstáculos e terreno difícil coerentes com as regras de cada bioma', () => {
      const biomesFound = new Set<Biome>();

      // Amostra vários pontos no mapa para inspecionar biomas
      for (let x = -600; x <= 600; x += 100) {
        for (let y = -600; y <= 600; y += 100) {
          const cell = getCellAtWorldPosition(TEST_SEED, x, y);
          biomesFound.add(cell.biome);

          if (cell.blocksMovement) {
            expect(cell.obstacle).toBeDefined();
            expect(typeof cell.obstacle).toBe('string');
          }
          if (cell.difficultTerrain) {
            expect(typeof cell.terrain).toBe('string');
          }
        }
      }

      // Garante que o gerador consegue amostrar múltiplos biomas
      expect(biomesFound.size).toBeGreaterThanOrEqual(3);
    });
  });
});
