import { BiomeType, WeatherType, CombatEntity, CellData, LootItem, PowerUp, GridPosition } from '../../../game/types';
import { generateProceduralArena, GeneratedMap } from '../../../game/arenaGenerator';
import { getBalancedEncounterForLevel } from '../../../game/bestiaryData';
import { determineMonsterSize, getEntitySizeInSquares, findSafeMonsterSpawnPosition } from '../../../game/combatUtils';
import { getRaceInfo, getRaceIcon, RACES_REFERENCE } from '../../../lib/api/references';

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

/**
 * Cria a entidade combatente do herói a partir do perfil do personagem.
 */
export function createHeroEntity(
  character: any,
  spawnPos: GridPosition,
  heroMaxHp: number,
  heroCurrentHp: number,
  heroTempHp: number,
  heroSpeedGridCells: number
): CombatEntity {
  const raceInfo = character?.race ? getRaceInfo(character.race) : null;
  let heroHasDarkvision = false;
  let heroDarkvisionRange = 0;
  if (raceInfo) {
    const trait = raceInfo.traits.find(t => t.name.toLowerCase().includes('visão no escuro'));
    if (trait) {
      heroHasDarkvision = true;
      heroDarkvisionRange = trait.name.includes('36') || trait.description.toLowerCase().includes('36') ? 36 : 18;
    }
  }

  const heroDexMod = Math.floor(((character?.dexterity || 10) - 10) / 2);
  const heroInit = Math.floor(Math.random() * 20) + 1 + heroDexMod;

  return {
    id: 'hero',
    name: character?.name || 'Herói',
    type: 'hero',
    x: spawnPos.x,
    y: spawnPos.y,
    maxHp: heroMaxHp,
    currentHp: heroCurrentHp,
    tempHp: heroTempHp,
    armor_class: character?.ac || 14,
    ac: character?.ac || 14,
    speed: heroSpeedGridCells,
    remainingMovement: 0,
    initiative: heroInit,
    icon: character?.avatar_url || getRaceIcon(character?.race || character?.charRace || character?.species, character?.icon),
    color: '#3b82f6',
    attackBonus: 0,
    damageDice: '1d8',
    range: 1.5,
    hasAction: false,
    hasBonusAction: false,
    hasReaction: false,
    isDead: false,
    attacksRemaining: 0,
    conditions: [],
    hasDarkvision: heroHasDarkvision,
    darkvisionRange: heroDarkvisionRange,
    size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
    level: character?.level || 1,
    charClass: character?.class_name || character?.charClass || character?.class || ''
  };
}

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

  // Gerar encontro balanceado para o nível do herói
  const encounter = initialBiome === 'Arena de Testes'
    ? { monsters: [], encounterDifficulty: 'Arena de Testes (Sem Monstros)', totalCr: 0 }
    : getBalancedEncounterForLevel(heroLevel, initialBiome, difficulty);
  const monsterTemplates = encounter.monsters;

  const usedPositions = new Set<string>();
  usedPositions.add(`${heroSpawn.x},${heroSpawn.y}`);

  const monsters: CombatEntity[] = monsterTemplates.map((template, idx) => {
    const mSize = getEntitySizeInSquares(template.size || determineMonsterSize(template.name, template.traits));
    const angle = (idx / monsterTemplates.length) * Math.PI * 2;

    const safePos = findSafeMonsterSpawnPosition({
      grid,
      monsterSize: mSize,
      heroPos: heroSpawn,
      heroSize: 1,
      usedPositions,
      minDistanceToHero: 6,
      maxDistanceToHero: 12,
      preferredAngle: angle
    });

    const hasDv = (template.senses && (template.senses.toLowerCase().includes('darkvision') || template.senses.toLowerCase().includes('visão no escuro'))) ||
                  (template.traits && template.traits.some(t => t.name.toLowerCase().includes('darkvision') || (t.text && t.text.toLowerCase().includes('visão no escuro'))));
    let dvRange = 18;
    if (template.senses) {
      const match = template.senses.match(/(\d+)\s*(ft|pés)/i);
      if (match) {
        dvRange = parseInt(match[1], 10) * 0.3;
      }
    }

    return {
      ...template,
      id: `monster-${idx}`,
      name: `${template.name} #${idx + 1}`,
      x: safePos.x,
      y: safePos.y,
      currentHp: template.hp,
      maxHp: template.hp,
      isDead: false,
      remainingMovement: template.speed,
      hasAction: true,
      hasBonusAction: true,
      type: 'monster',
      tempHp: 0,
      initiative: 0,
      hasReaction: true,
      conditions: [],
      hasDarkvision: hasDv,
      darkvisionRange: dvRange,
      size: template.size || determineMonsterSize(template.name, template.traits)
    } as CombatEntity;
  });

  // Garantir que as células onde os monstros nascem são caminháveis
  monsters.forEach(m => {
    const mSize = getEntitySizeInSquares(m.size || 'Médio');
    for (let dy = 0; dy < mSize; dy++) {
      for (let dx = 0; dx < mSize; dx++) {
        if (grid[m.y + dy]?.[m.x + dx]) {
          grid[m.y + dy][m.x + dx] = {
            ...grid[m.y + dy][m.x + dx],
            terrain: 'normal',
            movementCost: 1
          };
        }
      }
    }
  });

  // Função para encontrar posições válidas, totalmente desobstruídas e fora de obstáculos
  const findValidClearPosition = (
    size: number,
    minDist: number,
    maxDist: number,
    requireWalkablePerimeter: boolean = true
  ): { x: number; y: number; size: number } => {
    const candidates: { x: number; y: number; dist: number }[] = [];

    for (let r = Math.max(3, heroSpawn.y - maxDist); r <= Math.min(mapHeight - size - 3, heroSpawn.y + maxDist); r++) {
      for (let c = Math.max(3, heroSpawn.x - maxDist); c <= Math.min(mapWidth - size - 3, heroSpawn.x + maxDist); c++) {
        const dist = Math.hypot(c - heroSpawn.x, r - heroSpawn.y);
        if (dist >= minDist && dist <= maxDist) {
          candidates.push({ x: c, y: r, dist });
        }
      }
    }

    // Embaralhar ligeiramente para posições variadas e orgânicas
    candidates.sort((a, b) => a.dist - b.dist + (Math.random() * 6 - 3));

    for (const cand of candidates) {
      let isClear = true;

      // Verificar se todas as células do objeto estão livres de paredes, água ou obstáculos
      for (let dy = 0; dy < size && isClear; dy++) {
        for (let dx = 0; dx < size && isClear; dx++) {
          const tx = cand.x + dx;
          const ty = cand.y + dy;
          const cell = grid[ty]?.[tx];

          if (!cell) {
            isClear = false;
            break;
          }

          if (
            cell.terrain === 'wall' ||
            cell.terrain === 'water' ||
            cell.movementCost === Infinity ||
            cell.obstacleType !== undefined ||
            usedPositions.has(`${tx},${ty}`)
          ) {
            isClear = false;
            break;
          }
        }
      }

      // Se solicitado, verificar se há espaço caminhável acessível em volta do acampamento
      if (isClear && requireWalkablePerimeter) {
        let walkableNeighbors = 0;
        for (let dy = -1; dy <= size; dy++) {
          for (let dx = -1; dx <= size; dx++) {
            if (dx >= 0 && dx < size && dy >= 0 && dy < size) continue;
            const px = cand.x + dx;
            const py = cand.y + dy;
            const pCell = grid[py]?.[px];
            if (pCell && pCell.terrain !== 'wall' && pCell.movementCost !== Infinity && !pCell.obstacleType) {
              walkableNeighbors++;
            }
          }
        }
        if (walkableNeighbors < 3) {
          isClear = false;
        }
      }

      if (isClear) {
        // Reservar posições e garantir que estejam totalmente limpas no grid
        for (let dy = 0; dy < size; dy++) {
          for (let dx = 0; dx < size; dx++) {
            const tx = cand.x + dx;
            const ty = cand.y + dy;
            usedPositions.add(`${tx},${ty}`);
            if (grid[ty]?.[tx]) {
              grid[ty][tx] = {
                ...grid[ty][tx],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined,
                obstacleWidth: 1,
                obstacleHeight: 1,
                obstacleOriginX: tx,
                obstacleOriginY: ty
              };
            }
          }
        }
        return { x: cand.x, y: cand.y, size };
      }
    }

    // Se tamanho 2x2 não coube sem colidir com obstáculos, tenta 1x1
    if (size > 1) {
      return findValidClearPosition(1, minDist, maxDist, false);
    }

    // Fallback de emergência: busca a célula livre mais próxima do herói
    for (let d = 2; d < 40; d++) {
      for (let dy = -d; dy <= d; dy++) {
        for (let dx = -d; dx <= d; dx++) {
          const tx = heroSpawn.x + dx;
          const ty = heroSpawn.y + dy;
          if (tx >= 3 && tx < mapWidth - 3 && ty >= 3 && ty < mapHeight - 3) {
            const cell = grid[ty]?.[tx];
            if (cell && cell.terrain !== 'wall' && !usedPositions.has(`${tx},${ty}`)) {
              usedPositions.add(`${tx},${ty}`);
              grid[ty][tx] = {
                ...grid[ty][tx],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined,
                obstacleWidth: 1,
                obstacleHeight: 1,
                obstacleOriginX: tx,
                obstacleOriginY: ty
              };
              return { x: tx, y: ty, size: 1 };
            }
          }
        }
      }
    }

    return { x: heroSpawn.x + 3, y: heroSpawn.y + 3, size: 1 };
  };

  // Gerar acampamento (rest point) fora de obstáculos
  const campsitePos = findValidClearPosition(2, 5, 14, true);
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

  // Gerar baú fora de obstáculos
  const chestPos = findValidClearPosition(1, 6, 16, false);
  const chests = [
    {
      id: `chest-${Date.now()}-1`,
      x: chestPos.x,
      y: chestPos.y,
      rarity: 'raro' as const,
      isOpened: false
    }
  ];

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
    hazards: [],
    powerups: [],
    restPoints,
    droppedLoot: [],
    lastEncounterPos: heroSpawn
  };
}

