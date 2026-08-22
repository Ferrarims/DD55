import { BiomeType, CombatEntity, CellData, GridPosition } from '../../../../game/types';
import { getBalancedEncounterForLevel } from '../../../../game/bestiaryData';
import { determineMonsterSize, getEntitySizeInSquares, findSafeMonsterSpawnPosition } from '../../../../game/combatUtils';

interface InitializeArenaMonstersProps {
  grid: CellData[][];
  heroSpawn: GridPosition;
  initialBiome: BiomeType;
  heroLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  usedPositions: Set<string>;
}

export function initializeArenaMonsters({
  grid,
  heroSpawn,
  initialBiome,
  heroLevel,
  difficulty,
  usedPositions,
}: InitializeArenaMonstersProps): CombatEntity[] {
  const encounter = initialBiome === 'Arena de Testes'
    ? { monsters: [], encounterDifficulty: 'Arena de Testes (Sem Monstros)', totalCr: 0 }
    : getBalancedEncounterForLevel(heroLevel, initialBiome, difficulty);
  const monsterTemplates = encounter.monsters;

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

  return monsters;
}
