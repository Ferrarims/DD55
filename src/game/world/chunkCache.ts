import { GeneratedChunk, WorldSeed, ChunkCoordinates } from './types';
import { generateChunk } from './chunkGenerator';

export interface WorldChunkCacheOptions {
  readonly maxCapacity?: number;
}

export const DEFAULT_CHUNK_CACHE_CAPACITY = 64;

/**
 * Cria a chave composta única para indexação de chunks no cache em memória.
 */
export function getChunkCacheKey(
  worldSeed: WorldSeed,
  chunkX: number,
  chunkY: number
): string {
  return `${worldSeed}::${chunkX}_${chunkY}`;
}

/**
 * Gerenciador de Cache em Memória com política de descarte LRU (Least Recently Used) para chunks de mundo.
 */
export class WorldChunkCache {
  private readonly maxCapacity: number;
  private readonly cache: Map<string, GeneratedChunk>;

  constructor(options?: WorldChunkCacheOptions) {
    const capacity = options?.maxCapacity ?? DEFAULT_CHUNK_CACHE_CAPACITY;
    this.maxCapacity = Math.max(1, capacity);
    this.cache = new Map<string, GeneratedChunk>();
  }

  /**
   * Retorna a capacidade máxima configurada no cache.
   */
  public getCapacity(): number {
    return this.maxCapacity;
  }

  /**
   * Retorna o número atual de chunks mantidos em memória.
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Verifica se o chunk especificado já está presente no cache sem atualizar o status LRU.
   */
  public has(worldSeed: WorldSeed, chunkX: number, chunkY: number): boolean {
    const key = getChunkCacheKey(worldSeed, chunkX, chunkY);
    return this.cache.has(key);
  }

  /**
   * Obtém o chunk do cache se existir (atualizando sua prioridade LRU), ou o gera determinística e o armazena.
   * Reutiliza estritamente a mesma referência em memória enquanto estiver no cache.
   */
  public getOrGenerateChunk(
    worldSeed: WorldSeed,
    chunkX: number,
    chunkY: number
  ): GeneratedChunk {
    const key = getChunkCacheKey(worldSeed, chunkX, chunkY);

    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      // Atualiza posição no LRU re-inserindo no final do Map
      this.cache.delete(key);
      this.cache.set(key, existing);
      return existing;
    }

    const generated = generateChunk(worldSeed, chunkX, chunkY);
    this.setChunk(key, generated);
    return generated;
  }

  /**
   * Consulta uma janela retangular de chunks ao redor de um chunk central (por padrão, janela de 3 × 3 chunks, radius = 1).
   * Todos os chunks da janela são recuperados do cache ou gerados e armazenados.
   */
  public getChunkWindow(
    worldSeed: WorldSeed,
    centerChunkX: number,
    centerChunkY: number,
    radius = 1
  ): GeneratedChunk[] {
    const safeRadius = Math.max(0, Math.floor(radius));
    const chunks: GeneratedChunk[] = [];

    for (let dy = -safeRadius; dy <= safeRadius; dy++) {
      for (let dx = -safeRadius; dx <= safeRadius; dx++) {
        const targetX = centerChunkX + dx;
        const targetY = centerChunkY + dy;
        const chunk = this.getOrGenerateChunk(worldSeed, targetX, targetY);
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  /**
   * Consulta uma janela 3 × 3 chunks a partir de um objeto ChunkCoordinates central.
   */
  public get3x3Window(
    worldSeed: WorldSeed,
    centerChunk: ChunkCoordinates
  ): GeneratedChunk[] {
    return this.getChunkWindow(worldSeed, centerChunk.chunkX, centerChunk.chunkY, 1);
  }

  /**
   * Retorna todos os chunks atualmente carregados no cache sem alterar a ordem LRU.
   */
  public getLoadedChunks(): readonly GeneratedChunk[] {
    return Array.from(this.cache.values());
  }

  /**
   * Limpa completamente todos os chunks mantidos em memória.
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Insere um chunk no cache respeitando a política de capacidade e descarte LRU.
   */
  private setChunk(key: string, chunk: GeneratedChunk): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxCapacity) {
      // Remove o elemento mais antigo (primeira chave do Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, chunk);
  }
}
