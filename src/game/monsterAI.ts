import { CellData, CombatEntity, GridPosition } from './types';
import { executeAttack, AttackResult } from './combatEngine';
import { findPathAStar } from './aStarPathfinding';
import {
  getMonsterSizeInSquares,
  getDistanceBetweenEntities,
  monsterHasRangedAttack,
} from './ai/aiDistanceUtils';
import { planMonsterMovement } from './ai/aiMovementPlanner';

export interface MonsterDecision {
  newPosition: GridPosition;
  pathTaken?: GridPosition[];
  attackExecuted: boolean;
  attackResult?: AttackResult;
  logActionName: string;
  logDetail: string;
}

export {
  getMonsterSizeInSquares,
  getDistanceBetweenEntities,
  monsterHasRangedAttack,
};

export function executeMonsterTurnAI(
  monster: CombatEntity,
  hero: CombatEntity,
  grid: CellData[][],
  allEntities: CombatEntity[],
  isDarkEnvironment?: boolean,
  torches?: { x: number; y: number }[],
  heroLightRadius?: number,
  heroX?: number,
  heroY?: number
): MonsterDecision {
  const currentPos: GridPosition = { x: monster.x, y: monster.y };
  const monsterSize = getMonsterSizeInSquares(monster.size);

  const occupiedPositions: GridPosition[] = [];
  allEntities.forEach(e => {
    if (e.isDead || e.id === monster.id) return;
    const eSize = getMonsterSizeInSquares(e.size);
    for (let dx = 0; dx < eSize; dx++) {
      for (let dy = 0; dy < eSize; dy++) {
        occupiedPositions.push({ x: e.x + dx, y: e.y + dy });
      }
    }
  });

  const distToHero = getDistanceBetweenEntities(monster, hero);

  // 0. Incapacitado (inclui Paralisado, Atordoado, Inconsciente, Petrificado)
  const isIncapacitated = monster.conditions.some(c => 
    c === 'Incapacitado' || c === 'Incapacitated' ||
    c === 'Paralisado' || c === 'Paralyzed' ||
    c === 'Atordoado' || c === 'Stunned' ||
    c === 'Inconsciente' || c === 'Unconscious' ||
    c === 'Petrificado' || c === 'Petrified'
  );

  if (isIncapacitated || monster.isDead) {
    const mainCond = monster.conditions.find(c => ['Incapacitado', 'Incapacitated', 'Paralisado', 'Paralyzed', 'Atordoado', 'Stunned', 'Inconsciente', 'Unconscious', 'Petrificado', 'Petrified'].includes(c)) || 'Incapacitado';
    return {
      newPosition: currentPos,
      attackExecuted: false,
      logActionName: `🌀 ${monster.name} (${mainCond})`,
      logDetail: `${monster.name} está sob a condição ${mainCond} e não pode realizar ações ou se mover neste turno.`
    };
  }

  // 0.1. Condições de movimento (Caído, Agarrado, Contido, Lento, Exaustão)
  const isProne = monster.conditions.some(c => c === 'Caído' || c === 'Prone');
  const isImmobilized = monster.conditions.some(c => 
    c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled' ||
    c === 'Contido' || c === 'Restringido' || c === 'Restrained'
  );
  const isSlowed = monster.conditions.some(c => c === 'Lento' || c === 'Slow');
  const exhaustion = monster.exhaustionLevel || 0;
  
  let baseSpeed = monster.remainingMovement !== undefined ? monster.remainingMovement : monster.speed;
  if (exhaustion > 0) {
    baseSpeed = Math.max(0, baseSpeed - exhaustion);
  }
  if (isSlowed && monster.remainingMovement === monster.speed) {
    baseSpeed = Math.max(0, baseSpeed - 2);
  }
  let speedForTurn = isImmobilized ? 0 : baseSpeed;
  let stoodUpText = '';

  if (isImmobilized) {
    stoodUpText = `✊ ${monster.name} está sob uma condição que impede movimento (Velocidade 0). `;
  } else if (isProne && monster.speed > 0) {
    const standUpCost = Math.floor(monster.speed / 2);
    speedForTurn = Math.max(0, speedForTurn - standUpCost);
    monster.conditions = monster.conditions.filter(c => c !== 'Caído' && c !== 'Prone');
    stoodUpText = `💥 ${monster.name} levantou-se (Prone -> Normal) gastando ${standUpCost * 1.5}m de movimento. `;
  }

  // Arquétipo
  let archetype: 'brute' | 'skirmisher' | 'mage' = 'brute';
  const nameLower = monster.name.toLowerCase();
  const hasRanged = monsterHasRangedAttack(monster);
  if (nameLower.includes('goblin') || nameLower.includes('kobold') || nameLower.includes('ladino') || nameLower.includes('assassino')) {
    archetype = 'skirmisher';
  } else if (hasRanged || nameLower.includes('mago') || nameLower.includes('bruxo') || nameLower.includes('xamã') || nameLower.includes('shaman')) {
    archetype = 'mage';
  }

  const isHeroHidden = hero.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
  if (distToHero > 30 || (isHeroHidden && distToHero > 8)) {
    return {
      newPosition: currentPos,
      attackExecuted: false,
      logActionName: isProne ? `🐾 ${monster.name} levantou-se` : '',
      logDetail: stoodUpText || (isHeroHidden ? `👻 ${monster.name} procura pelo alvo, mas ${hero.name} está escondido (Invisível)!` : '')
    };
  }

  const isFrightened = monster.conditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened');
  if (isFrightened && distToHero > monster.range) {
    return {
      newPosition: currentPos,
      attackExecuted: false,
      logActionName: `😱 ${monster.name} está Amedrontado!`,
      logDetail: stoodUpText + `Não consegue se aproximar do herói por causa do medo.`
    };
  }

  // Hit and run do Skirmisher
  let hasAlreadyAttackedBeforeMoving = false;
  let attackResult: AttackResult | undefined = undefined;
  let attackExecuted = false;
  let logActionName = `${monster.name} agiu no combate`;
  let logDetail = stoodUpText;

  if (archetype === 'skirmisher' && distToHero <= monster.range && monster.hasAction) {
    attackResult = executeAttack(monster, hero, 'normal', undefined, isDarkEnvironment !== undefined ? {
      isDarkEnvironment, torches: torches || [], heroLightRadius, heroX, heroY
    } : undefined, allEntities);
    attackExecuted = true;
    hasAlreadyAttackedBeforeMoving = true;
    logActionName = attackResult.logTitle;
    logDetail += attackResult.logDetail + ' e recuou rapidamente! ';

    const escapeX = Math.max(1, Math.min(grid[0].length - 2, monster.x + (monster.x > hero.x ? 3 : -3)));
    const escapeY = Math.max(1, Math.min(grid.length - 2, monster.y + (monster.y > hero.y ? 3 : -3)));
    const path = findPathAStar(grid, currentPos, { x: escapeX, y: escapeY }, occupiedPositions, monster.conditions?.includes('Voando') || false, monsterSize);
    
    let pathTaken: GridPosition[] = [];
    let newPosition = { ...currentPos };
    if (path.length > 1) {
      let stepIndex = Math.min(path.length - 1, speedForTurn);
      while (stepIndex > 0 && occupiedPositions.some(p => p.x === path[stepIndex].x && p.y === path[stepIndex].y)) {
        stepIndex--;
      }
      if (stepIndex > 0) {
        newPosition = path[stepIndex];
        pathTaken = path.slice(0, stepIndex + 1);
      }
    }
    return { newPosition, pathTaken, attackExecuted, attackResult, logActionName, logDetail };
  }

  // Movimentação planejada
  const isLowHp = monster.currentHp <= Math.floor(monster.maxHp * 0.2);
  const planned = planMonsterMovement({
    monster,
    hero,
    grid,
    occupiedPositions,
    speedForTurn,
    monsterSize,
    distToHero,
    archetype,
    isLowHp,
  });

  const newPosition = planned.newPosition;
  const pathTaken = planned.pathTaken;
  logDetail += planned.actionLogSuffix;

  if (planned.shouldFleeEarly) {
    return {
      newPosition,
      pathTaken,
      attackExecuted: false,
      logActionName: `🏃 ${monster.name} recuou em pânico!`,
      logDetail
    };
  }

  // Ataque após movimentação
  const newDistToHero = getDistanceBetweenEntities({ ...monster, x: newPosition.x, y: newPosition.y }, hero);
  const isHeroFlying = hero.conditions?.includes('Voando');

  if (isHeroFlying && !hasRanged) {
    return {
      newPosition,
      pathTaken,
      attackExecuted: false,
      logActionName: `🕊️ ${monster.name} não alcança o alvo`,
      logDetail: logDetail + `${hero.name} está voando a 3m do chão e ${monster.name} não possui ataques à distância.`
    };
  }

  if (!hasAlreadyAttackedBeforeMoving) {
    if (newDistToHero <= monster.range && monster.hasAction) {
      const movedMonster = { ...monster, x: newPosition.x, y: newPosition.y };
      attackResult = executeAttack(movedMonster, hero, 'normal', undefined, isDarkEnvironment !== undefined ? {
        isDarkEnvironment, torches: torches || [], heroLightRadius, heroX, heroY
      } : undefined, allEntities);
      attackExecuted = true;
      logActionName = attackResult.logTitle;
      logDetail += attackResult.logDetail;
    } else {
      logActionName = `🐾 ${monster.name} movimentou-se no combate.`;
      if (!logDetail) logDetail = `Nenhum alvo ao alcance no momento.`;
    }
  }

  return {
    newPosition,
    pathTaken,
    attackExecuted,
    attackResult,
    logActionName,
    logDetail
  };
}
