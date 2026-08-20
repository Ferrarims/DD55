import { WorldSeed } from './types';

/**
 * Misturador bitwise (Avalanche Mixer) de 32 bits derivado do MurmurHash3.
 * Garante dispersão uniforme de bits mesmo com pequenas variações na entrada.
 */
export function mix32(n: number): number {
  let h = n >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Hash determinístico de string baseado no algoritmo FNV-1a / Murmur3 de 32-bit.
 */
export function hashString(str: string, seed = 0): number {
  let h = (seed ^ 0x811c9dc5) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return mix32(h);
}

/**
 * Converte qualquer WorldSeed (string ou número) em um número inteiro determinístico de 32 bits (uint32).
 */
export function hashSeed(seed: WorldSeed): number {
  if (typeof seed === 'number') {
    if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) {
      return mix32(seed);
    }
    return hashString(seed.toString());
  }
  return hashString(seed);
}

/**
 * Combina uma seed base com coordenadas x, y e salt opcional de forma determinística.
 * Útil para derivar seeds independentes por chunk, tile ou canal sem colisão.
 */
export function hashCoordinates(
  seed: WorldSeed,
  x: number,
  y: number,
  salt = 0
): number {
  const base = hashSeed(seed);
  let h = (base ^ (salt >>> 0)) >>> 0;
  h = Math.imul(h ^ (x | 0), 0x27d4eb2d);
  h = Math.imul(h ^ (y | 0), 0x165667b1);
  return mix32(h);
}
