import { describe, it, expect } from 'vitest';
import {
  WorldChunkCache,
  getChunkCacheKey,
  DEFAULT_CHUNK_CACHE_CAPACITY,
  GeneratedChunk,
} from '../src/game/world';

describe('WorldChunkCache (Cache em Memória de Chunks)', () => {
  const SEED_A = 'forgotten-realms-seed-1';
  const SEED_B = 'greyhawk-seed-2';

  describe('Estrutura e Inicialização', () => {
    it('deve inicializar com capacidade padrão ou capacidade customizada', () => {
      const defaultCache = new WorldChunkCache();
      expect(defaultCache.getCapacity()).toBe(DEFAULT_CHUNK_CACHE_CAPACITY);
      expect(defaultCache.size()).toBe(0);

      const customCache = new WorldChunkCache({ maxCapacity: 10 });
      expect(customCache.getCapacity()).toBe(10);
      expect(customCache.size()).toBe(0);
    });

    it('deve gerar chaves compostas corretas para worldSeed, chunkX e chunkY', () => {
      expect(getChunkCacheKey('toril', 0, 0)).toBe('toril::0_0');
      expect(getChunkCacheKey('toril', -5, 12)).toBe('toril::-5_12');
      expect(getChunkCacheKey(42, -1, -1)).toBe('42::-1_-1');
    });
  });

  describe('Reutilização de Instância em Memória', () => {
    it('deve retornar exatamente a mesma referência de objeto GeneratedChunk em acessos subsequentes', () => {
      const cache = new WorldChunkCache();
      const chunkFirst = cache.getOrGenerateChunk(SEED_A, 0, 0);
      const chunkSecond = cache.getOrGenerateChunk(SEED_A, 0, 0);

      // Verificação estrita de identidade por referência
      expect(chunkFirst).toBe(chunkSecond);
      expect(cache.size()).toBe(1);
      expect(cache.has(SEED_A, 0, 0)).toBe(true);
    });
  });

  describe('Janela de Chunks 3 × 3', () => {
    it('getChunkWindow com radius=1 (e get3x3Window) deve retornar exatamente 9 chunks ao redor do centro', () => {
      const cache = new WorldChunkCache();
      const windowChunks = cache.getChunkWindow(SEED_A, 0, 0, 1);

      expect(windowChunks.length).toBe(9);
      expect(cache.size()).toBe(9);

      const coords = windowChunks.map(c => `${c.chunkX},${c.chunkY}`);
      const expectedCoords = [
        '-1,-1', '0,-1', '1,-1',
        '-1,0',  '0,0',  '1,0',
        '-1,1',  '0,1',  '1,1',
      ];

      expect(coords).toEqual(expectedCoords);

      // Re-requisitar a janela deve reutilizar as mesmas instâncias já geradas
      const windowSecond = cache.get3x3Window(SEED_A, { chunkX: 0, chunkY: 0 });
      for (let i = 0; i < 9; i++) {
        expect(windowSecond[i]).toBe(windowChunks[i]);
      }
      expect(cache.size()).toBe(9);
    });
  });

  describe('Suporte a Coordenadas Negativas', () => {
    it('deve indexar e consultar perfeitamente chunks e janelas centradas em coordenadas negativas', () => {
      const cache = new WorldChunkCache();
      const chunkNeg = cache.getOrGenerateChunk(SEED_A, -10, -25);

      expect(chunkNeg.chunkX).toBe(-10);
      expect(chunkNeg.chunkY).toBe(-25);
      expect(cache.has(SEED_A, -10, -25)).toBe(true);

      const windowNeg = cache.getChunkWindow(SEED_A, -5, -5, 1);
      expect(windowNeg.length).toBe(9);

      const coords = windowNeg.map(c => `${c.chunkX},${c.chunkY}`);
      expect(coords).toContain('-6,-6');
      expect(coords).toContain('-5,-5');
      expect(coords).toContain('-4,-4');
    });
  });

  describe('Política de Descarte LRU (Least Recently Used)', () => {
    it('deve descartar o chunk menos recentemente utilizado quando a capacidade for atingida', () => {
      const cache = new WorldChunkCache({ maxCapacity: 3 });

      // Inserção de 3 chunks: (0,0), (1,1), (2,2)
      const c0 = cache.getOrGenerateChunk(SEED_A, 0, 0);
      const c1 = cache.getOrGenerateChunk(SEED_A, 1, 1);
      const c2 = cache.getOrGenerateChunk(SEED_A, 2, 2);

      expect(cache.size()).toBe(3);
      expect(cache.has(SEED_A, 0, 0)).toBe(true);

      // Acessa (0,0) para torná-lo o mais recentemente usado -> Ordem LRU agora: (1,1) [mais antigo], (2,2), (0,0) [mais novo]
      const accessed0 = cache.getOrGenerateChunk(SEED_A, 0, 0);
      expect(accessed0).toBe(c0);

      // Insere um 4º chunk (3,3) -> Deve desalocar (1,1)
      const c3 = cache.getOrGenerateChunk(SEED_A, 3, 3);
      expect(cache.size()).toBe(3);

      expect(cache.has(SEED_A, 1, 1)).toBe(false); // (1,1) foi descartado pelo LRU
      expect(cache.has(SEED_A, 0, 0)).toBe(true);  // (0,0) foi preservado
      expect(cache.has(SEED_A, 2, 2)).toBe(true);  // (2,2) foi preservado
      expect(cache.has(SEED_A, 3, 3)).toBe(true);  // (3,3) está presente
    });
  });

  describe('Separação Entre Seeds Distintas', () => {
    it('mesmas coordenadas com seeds diferentes devem armazenar instâncias e dados distintos no cache', () => {
      const cache = new WorldChunkCache();

      const chunkA = cache.getOrGenerateChunk(SEED_A, 5, 5);
      const chunkB = cache.getOrGenerateChunk(SEED_B, 5, 5);

      expect(cache.size()).toBe(2);
      expect(cache.has(SEED_A, 5, 5)).toBe(true);
      expect(cache.has(SEED_B, 5, 5)).toBe(true);

      expect(chunkA).not.toBe(chunkB);
    });
  });

  describe('Limpeza (clear) e Inspeção', () => {
    it('clear() deve esvaziar totalmente o cache e zerar size()', () => {
      const cache = new WorldChunkCache();
      cache.getChunkWindow(SEED_A, 0, 0, 1); // Carrega 9 chunks
      expect(cache.size()).toBe(9);

      const loadedBefore = cache.getLoadedChunks();
      expect(loadedBefore.length).toBe(9);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.getLoadedChunks().length).toBe(0);
      expect(cache.has(SEED_A, 0, 0)).toBe(false);
    });
  });
});
