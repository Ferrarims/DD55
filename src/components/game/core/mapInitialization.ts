import { BiomeType, CombatEntity, CellData, LootItem, PowerUp, GridPosition } from '../../../game/types';
import { generateProceduralArena } from '../../../game/arenaGenerator';
import { createHeroEntity } from './initialization/createHeroEntity';
import { findValidClearPosition } from './initialization/findValidClearPosition';
import { initializeArenaMonsters } from './initialization/initializeArenaMonsters';

export interface MapInitializationResult {
  biome: BiomeType;
  grid: CellData[][];
  heroSpawn: GridPosition;
  torches: GridPosition[];
  monsters: CombatEntity[];
  chests: Array<{ id: string; x: number; y: number; rarity: 'comum' | 'raro' | 'lendário'; isOpened: boolean }>;
  hazards: Array<{ id: string; x: number; y: number; type: 'spikes' | 'mushrooms' | 'mud' | 'web' | 'fire_vent'; name: string; isTriggered: boolean }>;
  powerups: PowerUp[];
  restPoints: Array<{ id: string; x: number; y: number; size?: number; isUsed: boolean }>;
  droppedLoot: Array<{ id: string; x: number; y: number; item: LootItem; isCollected: boolean }>;
  lastEncounterPos: GridPosition;
}

export { createHeroEntity };

/**
 * Inicializa um novo mapa de arena procedimental, monstros, baús, armadilhas e pontos de descanso.
 */
export function initializeArenaMap(
  initialBiome: BiomeType = 'Masmorra',
  heroLevel: number = 1,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  mapWidth: number = 150,
  mapHeight: number = 150
): MapInitializationResult {
  const proceduralMap = generateProceduralArena(initialBiome, mapWidth, mapHeight, 0);
  const grid = proceduralMap.grid;
  const heroSpawn = proceduralMap.heroSpawn || { x: 75, y: 75 };

  const usedPositions = new Set<string>();
  usedPositions.add(`${heroSpawn.x},${heroSpawn.y}`);

  // 1. Gerar monstros balanceados para o encontro
  const monsters = initializeArenaMonsters({
    grid,
    heroSpawn,
    initialBiome,
    heroLevel,
    difficulty,
    usedPositions,
  });

  // 2. Gerar acampamento (rest point) fora de obstáculos
  const campsitePos = findValidClearPosition({
    grid,
    heroSpawn,
    mapWidth,
    mapHeight,
    usedPositions,
    size: 2,
    minDist: 5,
    maxDist: 14,
    requireWalkablePerimeter: true,
  });

  const restPoints = [
    {
      id: `rest-${Date.now()}-1`,
      x: campsitePos.x,
      y: campsitePos.y,
      size: campsitePos.size,
      isUsed: false,
      icon: '⛺'
    }
  ];

  // 3. Gerar baú fora de obstáculos
  const chestPos = findValidClearPosition({
    grid,
    heroSpawn,
    mapWidth,
    mapHeight,
    usedPositions,
    size: 1,
    minDist: 6,
    maxDist: 16,
    requireWalkablePerimeter: false,
  });

  const chests = [
    {
      id: `chest-${Date.now()}-1`,
      x: chestPos.x,
      y: chestPos.y,
      rarity: 'raro' as const,
      isOpened: false
    }
  ];

  // 4. Gerar armadilhas e perigos procedurais (hazards)
  const hazards: Array<{
    id: string;
    x: number;
    y: number;
    type: 'spikes' | 'mushrooms' | 'mud' | 'web' | 'fire_vent';
    name: string;
    icon?: string;
    dc?: number;
    isTriggered: boolean;
    isHidden?: boolean;
    isDisarmed?: boolean;
  }> = [];

  if (initialBiome !== 'Arena de Testes') {
    const hazardTypes: Array<{
      type: 'spikes' | 'mushrooms' | 'mud' | 'web' | 'fire_vent';
      name: string;
      icon: string;
      dc: number;
    }> = [
      { type: 'spikes', name: 'Armadilha de Espinhos', icon: '⚙️', dc: 13 },
      { type: 'mushrooms', name: 'Esporos Venenosos', icon: '🍄', dc: 12 },
      { type: 'web', name: 'Teia Escondida', icon: '🕸️', dc: 12 },
      { type: 'mud', name: 'Poça de Lama', icon: '🟤', dc: 11 },
      { type: 'fire_vent', name: 'Gêiser de Fogo', icon: '🔥', dc: 14 },
    ];

    const hazardCount = Math.floor(Math.random() * 3) + 3; // 3 a 5 armadilhas
    for (let i = 0; i < hazardCount; i++) {
      const hConfig = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
      const hPos = findValidClearPosition({
        grid,
        heroSpawn,
        mapWidth,
        mapHeight,
        usedPositions,
        size: 1,
        minDist: 4,
        maxDist: 22,
        requireWalkablePerimeter: false,
      });

      hazards.push({
        id: `hazard-${Date.now()}-${i}`,
        x: hPos.x,
        y: hPos.y,
        type: hConfig.type,
        name: hConfig.name,
        icon: hConfig.icon,
        dc: hConfig.dc,
        isTriggered: false,
        isHidden: true, // Ocultas para serem detectadas via Percepção Passiva ou Investigação
        isDisarmed: false,
      });
    }
  }

  // 5. Tochas no cenário
  const initialTorches: GridPosition[] = [];
  if (initialBiome === 'Caverna' || initialBiome === 'Masmorra') {
    initialTorches.push({ x: heroSpawn.x - 1, y: heroSpawn.y - 1 });
    initialTorches.push({ x: heroSpawn.x + 1, y: heroSpawn.y + 1 });
    monsters.forEach(m => {
      const hasDv = (m.senses && (m.senses.toLowerCase().includes('darkvision') || m.senses.toLowerCase().includes('visão no escuro'))) ||
                    (m.traits && m.traits.some(t => t.name.toLowerCase().includes('darkvision') || (t.text && t.text.toLowerCase().includes('visão no escuro'))));
      const intVal = m.stats?.int !== undefined ? m.stats.int : 10;
      if (!hasDv && intVal >= 8) {
        initialTorches.push({ x: m.x, y: m.y });
      }
    });
  }

  return {
    biome: initialBiome,
    grid,
    heroSpawn,
    torches: initialTorches,
    monsters,
    chests,
    hazards,
    powerups: [],
    restPoints,
    droppedLoot: [],
    lastEncounterPos: heroSpawn
  };
}
