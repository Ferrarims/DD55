import { WorldSeed } from './types';
import { hashCoordinates } from './seed';

/**
 * Função de interpolação quintica suave (SmootherStep de Perlin): 6t^5 - 15t^4 + 10t^3.
 * Elimina descontinuidades de primeira e segunda ordem nas bordas do grid.
 */
function smootherStep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Interpolação linear pura entre a e b.
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Retorna um pseudo-gradiente/valor pseudoaleatório unitário [0, 1] para um ponto de grade inteiro (gx, gy).
 */
function getLatticeValue(seed: WorldSeed, gx: number, gy: number, salt = 0): number {
  const hash = hashCoordinates(seed, gx, gy, salt);
  return (hash >>> 0) / 4294967295;
}

/**
 * Coherent 2D Value Noise determinístico e contínuo.
 * Retorna um valor no intervalo [0, 1].
 * Todas as transições são suaves sem descontinuidades nas divisões de inteiros ou bordas de chunk.
 */
export function sampleNoise2D(
  seed: WorldSeed,
  worldX: number,
  worldY: number,
  scale = 100,
  salt = 0
): number {
  const safeScale = scale <= 0 ? 1 : scale;
  const sampleX = worldX / safeScale;
  const sampleY = worldY / safeScale;

  const x0 = Math.floor(sampleX);
  const y0 = Math.floor(sampleY);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const fx = sampleX - x0;
  const fy = sampleY - y0;

  const sx = smootherStep(fx);
  const sy = smootherStep(fy);

  const n00 = getLatticeValue(seed, x0, y0, salt);
  const n10 = getLatticeValue(seed, x1, y0, salt);
  const n01 = getLatticeValue(seed, x0, y1, salt);
  const n11 = getLatticeValue(seed, x1, y1, salt);

  const ix0 = lerp(n00, n10, sx);
  const ix1 = lerp(n01, n11, sx);

  return lerp(ix0, ix1, sy);
}

/**
 * Fractal (Octave) 2D Noise para gerar variações em múltiplas escalas (macro e micro relevo).
 * Retorna um valor no intervalo [0, 1].
 */
export function sampleFractalNoise2D(
  seed: WorldSeed,
  worldX: number,
  worldY: number,
  octaves = 3,
  persistence = 0.5,
  scale = 120,
  salt = 0
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const currentScale = (scale <= 0 ? 1 : scale) / frequency;
    const n = sampleNoise2D(seed, worldX, worldY, currentScale, salt + i * 31);
    total += n * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return maxValue > 0 ? total / maxValue : 0.5;
}
