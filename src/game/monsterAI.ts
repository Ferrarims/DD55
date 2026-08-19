import { CellData, CombatEntity, GridPosition } from './types';
import { findPathAStar } from './aStarPathfinding';
import { executeAttack, AttackResult } from './combatEngine';

function getMonsterSizeInSquares(sizeStr?: string): number {
  if (!sizeStr) return 1;
  const s = sizeStr.toLowerCase();
  if (s.includes('tiny') || s.includes('miudo') || s.includes('miúdo') || s.includes('diminuto')) return 1;
  if (s.includes('small') || s.includes('pequeno')) return 1;
  if (s.includes('medium') || s.includes('médio') || s.includes('medio')) return 1;
  if (s.includes('large') || s.includes('grande')) return 2;
  if (s.includes('huge') || s.includes('enorme')) return 3;
  if (s.includes('gargantuan') || s.includes('imenso') || s.includes('colossal')) return 4;
  return 1;
}

function getDistanceBetweenEntities(
  e1: { x: number; y: number; size?: string },
  e2: { x: number; y: number; size?: string }
): number {
  const s1 = getMonsterSizeInSquares(e1.size);
  const s2 = getMonsterSizeInSquares(e2.size);
  
  let minDist = Infinity;
  for (let x1 = e1.x; x1 < e1.x + s1; x1++) {
    for (let y1 = e1.y; y1 < e1.y + s1; y1++) {
      for (let x2 = e2.x; x2 < e2.x + s2; x2++) {
        for (let y2 = e2.y; y2 < e2.y + s2; y2++) {
          const d = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
          if (d < minDist) {
            minDist = d;
          }
        }
      }
    }
  }
  return minDist;
}

export interface MonsterDecision {
  newPosition: GridPosition;
  pathTaken?: GridPosition[];
  attackExecuted: boolean;
  attackResult?: AttackResult;
  logActionName: string;
  logDetail: string;
}

export function monsterHasRangedAttack(monster: CombatEntity): boolean {
  if (monster.range > 1) return true;
  if (monster.actions && monster.actions.length > 0) {
    for (const act of monster.actions) {
      if (act.type === 'Ranged' || act.range) {
        return true;
      }
    }
  }
  return false;
}

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
  const heroPos: GridPosition = { x: hero.x, y: hero.y };

  const monsterSize = getMonsterSizeInSquares(monster.size);

  // Posicoes ocupadas por outras entidades vivas (considerando o tamanho de cada uma)
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

  // Distância Grid D&D (Chebyshev) até o herói (permite ataques em todas as 8 direções incluindo diagonais)
  const distToHero = getDistanceBetweenEntities(monster, hero);

  let newPosition = { ...currentPos };
  let attackExecuted = false;
  let attackResult: AttackResult | undefined = undefined;
  let logActionName = `${monster.name} agiu no combate`;
  let logDetail = '';

  // 0. SUPORTE À CONDIÇÃO INCAPACITADO (INCAPACITATED)
  const isIncapacitated = monster.conditions.some(c => c === 'Incapacitado' || c === 'Incapacitated');
  if (isIncapacitated) {
    return {
      newPosition: currentPos,
      attackExecuted: false,
      logActionName: `🌀 ${monster.name} Incapacitado`,
      logDetail: `${monster.name} está Incapacitado e não pode realizar ações ou se mover neste turno.`
    };
  }

  // 0. SUPORTE À CONDIÇÃO CAÍDO (PRONE): O monstro tenta levantar-se gastando metade do deslocamento
  const isProne = monster.conditions.some(c => c === 'Caído' || c === 'Prone');
  const isGrappled = monster.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
  const isSlowed = monster.conditions.some(c => c === 'Lento' || c === 'Slow');
  
  let baseSpeed = monster.remainingMovement !== undefined ? monster.remainingMovement : monster.speed;
  if (isSlowed && monster.remainingMovement === monster.speed) {
    baseSpeed = Math.max(0, baseSpeed - 2);
  }
  let speedForTurn = isGrappled ? 0 : baseSpeed;
  let stoodUpText = '';

  if (isGrappled) {
    stoodUpText = `✊ ${monster.name} está sob a condição Agarrado e não pode se mover (Velocidade 0). `;
    logDetail = stoodUpText;
  } else if (isProne) {
    if (monster.speed > 0) {
      const standUpCost = Math.floor(monster.speed / 2);
      speedForTurn = Math.max(0, monster.speed - standUpCost);
      monster.conditions = monster.conditions.filter(c => c !== 'Caído' && c !== 'Prone');
      stoodUpText = `💥 ${monster.name} levantou-se (Prone -> Normal) gastando ${standUpCost * 1.5}m de movimento. `;
      logDetail = stoodUpText;
    }
  }

  // Determinar Arquétipo do Monstro
  let archetype: 'brute' | 'skirmisher' | 'mage' = 'brute';
  const nameLower = monster.name.toLowerCase();
  const hasRanged = monsterHasRangedAttack(monster);
  if (nameLower.includes('goblin') || nameLower.includes('kobold') || nameLower.includes('ladino') || nameLower.includes('assassino')) {
    archetype = 'skirmisher';
  } else if (hasRanged || nameLower.includes('mago') || nameLower.includes('bruxo') || nameLower.includes('xamã') || nameLower.includes('shaman')) {
    archetype = 'mage';
  }

  // 0. Verificação de Visão / Percepção (Monstros sempre rastreiam e perseguem o herói)
  let canSeeHero = true;
  const isHeroHidden = hero.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
  if (isHeroHidden && distToHero > 8) {
    canSeeHero = false;
  }

  // 0.5 Se o monstro estiver muito longe do herói (> 30 células), ele apenas aguarda
  if (distToHero > 30 || (!canSeeHero && distToHero > 8)) {
    return {
      newPosition,
      attackExecuted: false,
      logActionName: isProne ? `🐾 ${monster.name} levantou-se` : '',
      logDetail: stoodUpText || (isHeroHidden ? `👻 ${monster.name} procura pelo alvo, mas ${hero.name} está escondido (Invisível)!` : '')
    };
  }

  // 1. Verificar FSM: Se HP do monstro estiver abaixo de 20%, ele tenta recuar
  const isLowHp = monster.currentHp <= Math.floor(monster.maxHp * 0.2);

  if (isLowHp && distToHero <= 2) {
    // Tenta fugir para longe do herói
    const escapeX = Math.max(1, Math.min(grid[0].length - 2, monster.x + (monster.x > hero.x ? 2 : -2)));
    const escapeY = Math.max(1, Math.min(grid.length - 2, monster.y + (monster.y > hero.y ? 2 : -2)));

    const isFlying = monster.conditions?.includes('Voando') || false;
    const path = findPathAStar(grid, currentPos, { x: escapeX, y: escapeY }, occupiedPositions, isFlying, monsterSize);
    if (path.length > 1) {
      let stepIndex = Math.min(path.length - 1, speedForTurn);
      while (
        stepIndex > 0 &&
        occupiedPositions.some(p => p.x === path[stepIndex].x && p.y === path[stepIndex].y)
      ) {
        stepIndex--;
      }
      if (stepIndex > 0) {
        newPosition = path[stepIndex];
        const pathTaken = path.slice(0, stepIndex + 1);
        logActionName = `🏃 ${monster.name} recuou em pânico!`;
        logDetail = stoodUpText + `Movimentou-se para longe (${newPosition.x}, ${newPosition.y}).`;
        return { newPosition, pathTaken, attackExecuted, logActionName, logDetail };
      }
    }
  }

  const isFrightened = monster.conditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened');

  let pathTaken: GridPosition[] = [];

  // 2. Movimentação Baseada no Arquétipo
  const isFlying = monster.conditions?.includes('Voando') || false;

  let hasAlreadyAttackedBeforeMoving = false;

  if (isFrightened) {
     if (distToHero > monster.range) {
        logActionName = `😱 ${monster.name} está Amedrontado!`;
        logDetail = stoodUpText + `Não consegue se aproximar do herói por causa do medo.`;
        return { newPosition, pathTaken, attackExecuted: false, logActionName, logDetail };
     }
  } else if (archetype === 'skirmisher' && distToHero <= monster.range && monster.hasAction) {
    // Skirmishers atacam e fogem (Hit-and-Run)
    attackResult = executeAttack(monster, hero, 'normal', undefined, isDarkEnvironment !== undefined ? {
      isDarkEnvironment, torches: torches || [], heroLightRadius, heroX, heroY
    } : undefined, allEntities);
    attackExecuted = true;
    hasAlreadyAttackedBeforeMoving = true;
    logActionName = attackResult.logTitle;
    logDetail = stoodUpText + attackResult.logDetail + ' e recuou rapidamente! ';

    // Tenta fugir após o ataque
    const escapeX = Math.max(1, Math.min(grid[0].length - 2, monster.x + (monster.x > hero.x ? 3 : -3)));
    const escapeY = Math.max(1, Math.min(grid.length - 2, monster.y + (monster.y > hero.y ? 3 : -3)));
    const path = findPathAStar(grid, currentPos, { x: escapeX, y: escapeY }, occupiedPositions, isFlying, monsterSize);
    
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
  } else if (archetype === 'mage' && distToHero <= 2) {
    // Magos tentam recuar se o herói estiver muito perto (distância <= 2)
    const escapeX = Math.max(1, Math.min(grid[0].length - 2, monster.x + (monster.x > hero.x ? 3 : -3)));
    const escapeY = Math.max(1, Math.min(grid.length - 2, monster.y + (monster.y > hero.y ? 3 : -3)));
    const path = findPathAStar(grid, currentPos, { x: escapeX, y: escapeY }, occupiedPositions, isFlying, monsterSize);
    
    if (path.length > 1) {
      let stepIndex = Math.min(path.length - 1, speedForTurn);
      while (stepIndex > 0 && occupiedPositions.some(p => p.x === path[stepIndex].x && p.y === path[stepIndex].y)) {
        stepIndex--;
      }
      if (stepIndex > 0) {
        newPosition = path[stepIndex];
        pathTaken = path.slice(0, stepIndex + 1);
        logDetail = stoodUpText + `Recuou taticamente para (${newPosition.x}, ${newPosition.y}) buscando manter distância. `;
      }
    }
  } else if (distToHero > monster.range) {
    // Se não estiver ao alcance do ataque, move-se em direção ao herói usando A*
    const path = findPathAStar(grid, currentPos, heroPos, occupiedPositions, isFlying, monsterSize);

    if (path.length > 2) {
      // Encontrar a primeira posição no caminho onde o monstro atinge o alcance do herói
      let targetStepIndex = path.length - 1;
      for (let i = 0; i < path.length; i++) {
        const d = getDistanceBetweenEntities({ ...monster, x: path[i].x, y: path[i].y }, hero);
        if (d <= monster.range) {
          targetStepIndex = i;
          break;
        }
      }
      const maxSteps = Math.min(targetStepIndex, speedForTurn);
      let chosenStep = maxSteps;
      while (
        chosenStep > 0 &&
        occupiedPositions.some(p => p.x === path[chosenStep].x && p.y === path[chosenStep].y)
      ) {
        chosenStep--;
      }
      if (chosenStep > 0) {
        newPosition = path[chosenStep];
        pathTaken = path.slice(0, chosenStep + 1);
        logDetail = stoodUpText + `Avançou no grid para (${newPosition.x}, ${newPosition.y}). `;
      }
    }
  }

  // 3. Atualizar distância com a nova posição para ver se pode atacar (inclui diagonais)
  const newDistToHero = getDistanceBetweenEntities({ ...monster, x: newPosition.x, y: newPosition.y }, hero);

  const isHeroFlying = hero.conditions?.includes('Voando');

  if (isHeroFlying && !hasRanged) {
    logActionName = `🕊️ ${monster.name} não alcança o alvo`;
    logDetail = stoodUpText + `${hero.name} está voando a 3m do chão e ${monster.name} não possui ataques à distância.`;
    return {
      newPosition,
      pathTaken,
      attackExecuted: false,
      attackResult: undefined,
      logActionName,
      logDetail
    };
  }

  if (!hasAlreadyAttackedBeforeMoving) {
    if (newDistToHero <= monster.range && monster.hasAction) {
      const movedMonster = {
        ...monster,
        x: newPosition.x,
        y: newPosition.y
      };
      attackResult = executeAttack(movedMonster, hero, 'normal', undefined, isDarkEnvironment !== undefined ? {
        isDarkEnvironment,
        torches: torches || [],
        heroLightRadius,
        heroX,
        heroY
      } : undefined, allEntities);
      attackExecuted = true;
      logActionName = attackResult.logTitle;
      logDetail += attackResult.logDetail;
    } else {
      logActionName = `🐾 ${monster.name} movimentou-se no combate.`;
      if (!logDetail) logDetail = stoodUpText + `Nenhum alvo ao alcance no momento.`;
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
