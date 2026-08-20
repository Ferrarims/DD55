import { WorldSeed } from './types';
import { hashSeed, hashCoordinates } from './seed';

export interface PRNG {
  /** Retorna número pseudoaleatório determinístico no intervalo [0, 1) */
  next(): number;
  /** Retorna número inteiro determinístico no intervalo [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Retorna float determinístico no intervalo [min, max) */
  nextFloat(min: number, max: number): number;
  /** Retorna booleano determinístico com probabilidade dada [0, 1] */
  nextBoolean(probability?: number): boolean;
  /** Retorna o estado numérico interno atual (uint32) */
  getState(): number;
}

/**
 * Gerador Mulberry32: PRNG de 32-bit rápido, determinístico e de alta qualidade estatística.
 * Não utiliza Math.random e não possui dependências externas.
 */
export function createMulberry32(initialSeed: number): PRNG {
  let state = initialSeed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  function nextFloat(min: number, max: number): number {
    return min + next() * (max - min);
  }

  function nextInt(min: number, max: number): number {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(low + next() * (high - low + 1));
  }

  function nextBoolean(probability = 0.5): boolean {
    return next() < probability;
  }

  function getState(): number {
    return state;
  }

  return {
    next,
    nextInt,
    nextFloat,
    nextBoolean,
    getState,
  };
}

/**
 * Cria um PRNG determinístico a partir de uma WorldSeed (string ou número).
 */
export function createPRNG(seed: WorldSeed): PRNG {
  const numericSeed = hashSeed(seed);
  return createMulberry32(numericSeed);
}

/**
 * Cria um PRNG determinístico isolado para um par de coordenadas (world ou chunk) e salt opcional.
 */
export function createCoordinatePRNG(
  seed: WorldSeed,
  x: number,
  y: number,
  salt = 0
): PRNG {
  const coordHash = hashCoordinates(seed, x, y, salt);
  return createMulberry32(coordHash);
}

/**
 * Obtém diretamente um valor determinístico [0, 1) para um par de coordenadas sem alocar objeto de estado.
 */
export function getCoordinateRandom(
  seed: WorldSeed,
  x: number,
  y: number,
  salt = 0
): number {
  const coordHash = hashCoordinates(seed, x, y, salt);
  const state = (coordHash + 0x6d2b79f5) >>> 0;
  let z = state;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
}
