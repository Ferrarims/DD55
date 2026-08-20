import { describe, it, expect } from 'vitest';
import {
  CHUNK_SIZE,
  worldToChunkCoordinate,
  worldToLocalCoordinate,
  worldToChunk,
  worldToLocal,
  worldToChunkAndLocal,
  chunkAndLocalToWorld,
  chunkToWorldOrigin,
  getChunkKey,
  parseChunkKey,
  hashSeed,
  hashString,
  hashCoordinates,
  mix32,
  createPRNG,
  createCoordinatePRNG,
  getCoordinateRandom,
} from '../src/game/world';

describe('Base de Mundo Procedural - Coordenadas e Chunks', () => {
  it('CHUNK_SIZE deve ser 32', () => {
    expect(CHUNK_SIZE).toBe(32);
  });

  describe('Coordenadas Positivas', () => {
    it('deve converter corretamente coordenada de origem (0, 0)', () => {
      const pos = worldToChunkAndLocal({ worldX: 0, worldY: 0 });
      expect(pos.chunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(pos.local).toEqual({ localX: 0, localY: 0 });
    });

    it('deve converter pontos arbitrários dentro do primeiro chunk', () => {
      const pos = worldToChunkAndLocal({ worldX: 15, worldY: 20 });
      expect(pos.chunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(pos.local).toEqual({ localX: 15, localY: 20 });
    });

    it('deve converter corretamente no limite superior do chunk 0 (31, 31)', () => {
      const pos = worldToChunkAndLocal({ worldX: 31, worldY: 31 });
      expect(pos.chunk).toEqual({ chunkX: 0, chunkY: 0 });
      expect(pos.local).toEqual({ localX: 31, localY: 31 });
    });

    it('deve avançar para chunkX = 1 quando worldX = 32', () => {
      const pos = worldToChunkAndLocal({ worldX: 32, worldY: 64 });
      expect(pos.chunk).toEqual({ chunkX: 1, chunkY: 2 });
      expect(pos.local).toEqual({ localX: 0, localY: 0 });
    });

    it('deve calcular chunks distantes com valores positivos grandes', () => {
      const pos = worldToChunkAndLocal({ worldX: 325, worldY: 1000 });
      expect(pos.chunk).toEqual({ chunkX: 10, chunkY: 31 });
      expect(pos.local).toEqual({ localX: 5, localY: 8 });
    });
  });

  describe('Coordenadas Negativas com Divisão por Piso', () => {
    it('deve mapear worldX = -1 para chunkX = -1 e localX = 31', () => {
      const pos = worldToChunkAndLocal({ worldX: -1, worldY: -1 });
      expect(pos.chunk).toEqual({ chunkX: -1, chunkY: -1 });
      expect(pos.local).toEqual({ localX: 31, localY: 31 });
    });

    it('deve mapear worldX = -32 para chunkX = -1 e localX = 0', () => {
      const pos = worldToChunkAndLocal({ worldX: -32, worldY: -32 });
      expect(pos.chunk).toEqual({ chunkX: -1, chunkY: -1 });
      expect(pos.local).toEqual({ localX: 0, localY: 0 });
    });

    it('deve mapear worldX = -33 para chunkX = -2 e localX = 31', () => {
      const pos = worldToChunkAndLocal({ worldX: -33, worldY: -65 });
      expect(pos.chunk).toEqual({ chunkX: -2, chunkY: -3 });
      expect(pos.local).toEqual({ localX: 31, localY: 31 });
    });

    it('deve suportar coordenadas com eixos mistos (positivo e negativo)', () => {
      const pos = worldToChunkAndLocal({ worldX: -5, worldY: 45 });
      expect(pos.chunk).toEqual({ chunkX: -1, chunkY: 1 });
      expect(pos.local).toEqual({ localX: 27, localY: 13 });
    });
  });

  describe('Bordas e Transições de Chunks', () => {
    it('deve transicionar com continuidade estrita ao redor do zero', () => {
      const points = [
        { world: -33, expectedChunk: -2, expectedLocal: 31 },
        { world: -32, expectedChunk: -1, expectedLocal: 0 },
        { world: -31, expectedChunk: -1, expectedLocal: 1 },
        { world: -1, expectedChunk: -1, expectedLocal: 31 },
        { world: 0, expectedChunk: 0, expectedLocal: 0 },
        { world: 1, expectedChunk: 0, expectedLocal: 1 },
        { world: 31, expectedChunk: 0, expectedLocal: 31 },
        { world: 32, expectedChunk: 1, expectedLocal: 0 },
        { world: 33, expectedChunk: 1, expectedLocal: 1 },
        { world: 63, expectedChunk: 1, expectedLocal: 31 },
        { world: 64, expectedChunk: 2, expectedLocal: 0 },
      ];

      for (const pt of points) {
        expect(worldToChunkCoordinate(pt.world)).toBe(pt.expectedChunk);
        expect(worldToLocalCoordinate(pt.world)).toBe(pt.expectedLocal);
      }
    });

    it('garante que localCoordinate está sempre no intervalo [0, CHUNK_SIZE - 1]', () => {
      for (let w = -200; w <= 200; w++) {
        const local = worldToLocalCoordinate(w);
        expect(local).toBeGreaterThanOrEqual(0);
        expect(local).toBeLessThan(CHUNK_SIZE);
      }
    });
  });

  describe('Conversão Reversível (Bijeção Bidirecional)', () => {
    it('deve ser 100% reversível para qualquer coordenada global de -500 a 500', () => {
      for (let x = -500; x <= 500; x += 23) {
        for (let y = -500; y <= 500; y += 37) {
          const original = { worldX: x, worldY: y };
          const chunk = worldToChunk(original);
          const local = worldToLocal(original);
          const reconstructed = chunkAndLocalToWorld(chunk, local);

          expect(reconstructed).toEqual(original);
        }
      }
    });

    it('chunkToWorldOrigin deve retornar a coordenada correta do canto (0,0) do chunk', () => {
      expect(chunkToWorldOrigin({ chunkX: 0, chunkY: 0 })).toEqual({ worldX: 0, worldY: 0 });
      expect(chunkToWorldOrigin({ chunkX: 2, chunkY: 3 })).toEqual({ worldX: 64, worldY: 96 });
      expect(chunkToWorldOrigin({ chunkX: -1, chunkY: -2 })).toEqual({ worldX: -32, worldY: -64 });
    });

    it('deve gerar e interpretar chaves de chunk de forma determinística', () => {
      const chunk = { chunkX: -5, chunkY: 12 };
      const key = getChunkKey(chunk);
      expect(key).toBe('chunk_-5_12');
      expect(parseChunkKey(key)).toEqual(chunk);
      expect(parseChunkKey('invalid_key')).toBeNull();
    });
  });
});

describe('Base de Mundo Procedural - Hash e Determinismo de Seed', () => {
  it('hashSeed deve ser determinístico para números e strings', () => {
    const seedA = 'dnd-campaign-2026';
    const seedB = 123456789;

    expect(hashSeed(seedA)).toBe(hashSeed(seedA));
    expect(hashSeed(seedB)).toBe(hashSeed(seedB));
    expect(hashSeed(seedA)).toBeTypeOf('number');
    expect(hashSeed(seedB)).toBeTypeOf('number');
  });

  it('strings diferentes devem gerar hashes diferentes', () => {
    const hash1 = hashSeed('dnd-seed-alpha');
    const hash2 = hashSeed('dnd-seed-beta');
    expect(hash1).not.toBe(hash2);
  });

  it('mix32 deve produzir números uint32 determinísticos', () => {
    const mixed = mix32(42);
    expect(mixed).toBeGreaterThanOrEqual(0);
    expect(mixed).toBeLessThanOrEqual(0xffffffff);
    expect(mix32(42)).toBe(mixed);
  });

  it('hashCoordinates deve ser determinístico e variar com x, y e salt', () => {
    const seed = 'world-seed-1';
    const h1 = hashCoordinates(seed, 10, 20, 0);
    const h1Repeat = hashCoordinates(seed, 10, 20, 0);
    const h2 = hashCoordinates(seed, 10, 21, 0);
    const h3 = hashCoordinates(seed, 11, 20, 0);
    const h4 = hashCoordinates(seed, 10, 20, 1);

    expect(h1).toBe(h1Repeat);
    expect(h1).not.toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toBe(h4);
  });
});

describe('Base de Mundo Procedural - PRNG Determinístico', () => {
  it('createPRNG deve produzir exatamente a mesma sequência para a mesma seed', () => {
    const prng1 = createPRNG('faerun-seed-99');
    const prng2 = createPRNG('faerun-seed-99');

    const seq1 = [prng1.next(), prng1.next(), prng1.next(), prng1.nextInt(1, 20), prng1.nextFloat(0, 100)];
    const seq2 = [prng2.next(), prng2.next(), prng2.next(), prng2.nextInt(1, 20), prng2.nextFloat(0, 100)];

    expect(seq1).toEqual(seq2);
  });

  it('seeds diferentes devem produzir sequências distintas', () => {
    const prng1 = createPRNG('seed-A');
    const prng2 = createPRNG('seed-B');

    const seq1 = [prng1.next(), prng1.next(), prng1.next()];
    const seq2 = [prng2.next(), prng2.next(), prng2.next()];

    expect(seq1).not.toEqual(seq2);
  });

  it('createCoordinatePRNG deve ser determinístico e independente por coordenadas', () => {
    const prngCoord1 = createCoordinatePRNG('test-world', -3, 7);
    const prngCoord1Again = createCoordinatePRNG('test-world', -3, 7);
    const prngCoord2 = createCoordinatePRNG('test-world', -3, 8);

    expect(prngCoord1.next()).toBe(prngCoord1Again.next());
    expect(prngCoord1.next()).toBe(prngCoord1Again.next());
    expect(prngCoord1.nextInt(1, 100)).toBe(prngCoord1Again.nextInt(1, 100));

    expect(createCoordinatePRNG('test-world', -3, 7).next()).not.toBe(prngCoord2.next());
  });

  it('getCoordinateRandom deve retornar o mesmo float no intervalo [0, 1) para a mesma coordenada', () => {
    const seed = 'deterministic-seed';
    const val1 = getCoordinateRandom(seed, 4, -2, 0);
    const val1Repeat = getCoordinateRandom(seed, 4, -2, 0);
    const val2 = getCoordinateRandom(seed, 4, -1, 0);

    expect(val1).toBe(val1Repeat);
    expect(val1).toBeGreaterThanOrEqual(0);
    expect(val1).toBeLessThan(1);
    expect(val1).not.toBe(val2);
  });

  it('nextInt e nextFloat devem respeitar estritamente os limites fornecidos', () => {
    const prng = createPRNG(4242);
    for (let i = 0; i < 100; i++) {
      const d20 = prng.nextInt(1, 20);
      expect(d20).toBeGreaterThanOrEqual(1);
      expect(d20).toBeLessThanOrEqual(20);
      expect(Number.isInteger(d20)).toBe(true);

      const floatVal = prng.nextFloat(50.5, 75.5);
      expect(floatVal).toBeGreaterThanOrEqual(50.5);
      expect(floatVal).toBeLessThan(75.5);
    }
  });

  it('nextBoolean deve retornar booleano determinístico', () => {
    const prng = createPRNG('bool-test');
    const alwaysTrue = prng.nextBoolean(1.0);
    const alwaysFalse = prng.nextBoolean(0.0);
    const normal = prng.nextBoolean(0.5);

    expect(alwaysTrue).toBe(true);
    expect(alwaysFalse).toBe(false);
    expect(typeof normal).toBe('boolean');
  });
});
