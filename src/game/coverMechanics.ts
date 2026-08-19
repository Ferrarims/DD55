import { CellData, CombatEntity } from './types';

export type CoverDegree = 'none' | 'half' | 'three_quarters' | 'total';

export interface CoverResult {
  degree: CoverDegree;
  acBonus: number;
  dexSaveBonus: number;
  description: string;
}

export function calculateCover(
  attacker: CombatEntity,
  defender: CombatEntity,
  grid?: CellData[][],
  allEntities?: CombatEntity[]
): CoverResult {
  if (!grid || grid.length === 0) {
    return { degree: 'none', acBonus: 0, dexSaveBonus: 0, description: 'Sem Cobertura' };
  }

  const x0 = attacker.x;
  const y0 = attacker.y;
  const x1 = defender.x;
  const y1 = defender.y;

  // Se o atacante e o defensor estiverem na mesma posição ou adjacentes (distância <= 1), sem cobertura
  const dist = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  if (dist <= 1) {
    return { degree: 'none', acBonus: 0, dexSaveBonus: 0, description: 'Sem Cobertura' };
  }

  // Bresenham's line algorithm entre (x0, y0) e (x1, y1)
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;
  let totalSteps = 0;

  let hasWallOrHeavy = false;
  let hasMediumObstacle = false;
  let hasLowObstacle = false;
  let interveningCreatures = 0;

  while (true) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }

    // Se chegou na posição do defensor, encerra a varredura
    if (currX === x1 && currY === y1) break;
    totalSteps++;

    // Verificar se a célula no caminho possui parede sólida ou obstáculo pesado
    if (currY >= 0 && currY < grid.length && currX >= 0 && currX < grid[0].length) {
      const cell = grid[currY][currX];
      if (cell) {
        const obs = cell.obstacleType;
        if (cell.terrain === 'wall') {
          if (!obs || obs === 'brick_wall' || obs === 'monolith' || obs === 'ruins') {
            hasWallOrHeavy = true;
          } else if (obs === 'tree' || obs === 'rock' || obs === 'cactus' || obs === 'pillar') {
            hasMediumObstacle = true;
          } else if (obs === 'fallen_log') {
            hasLowObstacle = true;
          }
        }
      }
    }

    // Verificar criatura interveniente no caminho
    if (allEntities && allEntities.length > 0) {
      const creatureInWay = allEntities.some(
        ent => !ent.isDead && ent.id !== attacker.id && ent.id !== defender.id && ent.x === currX && ent.y === currY
      );
      if (creatureInWay) {
        interveningCreatures++;
      }
    }
  }

  // Verificar obstáculos específicos entre o atacante e o defensor próximos ao defensor
  // No D&D 5e, um obstáculo fornece cobertura apenas se estiver ENTRE o atacante e o defensor.
  let defenderNearMedium = false;
  let defenderNearLow = false;
  let defenderNearHeavy = false;

  // Vetor do atacante ao defensor
  const dirX = x1 - x0;
  const dirY = y1 - y0;

  for (let cy = Math.max(0, y1 - 1); cy <= Math.min(grid.length - 1, y1 + 1); cy++) {
    for (let cx = Math.max(0, x1 - 1); cx <= Math.min(grid[0].length - 1, x1 + 1); cx++) {
      const cell = grid[cy][cx];
      if (cell && cell.obstacleType) {
        const obs = cell.obstacleType;
        const distToDef = Math.max(Math.abs(cx - x1), Math.abs(cy - y1));
        if (distToDef <= 1) {
          // Verificar se o obstáculo está na direção do atacante (ou seja, entre o atacante e o defensor)
          const obsToAttX = x0 - cx;
          const obsToAttY = y0 - cy;
          const defToObsX = cx - x1;
          const defToObsY = cy - y1;
          
          // Produto escalar para verificar se o obstáculo está no lado do atacante
          const dot = defToObsX * dirX + defToObsY * dirY;
          // Se dot < 0, o obstáculo está apontando na direção oposta (em direção ao atacante)
          if (dot < 0) {
            if (!obs || obs === 'brick_wall' || obs === 'monolith' || obs === 'ruins') {
              defenderNearHeavy = true;
            } else if (obs === 'rock' || obs === 'tree' || obs === 'cactus' || obs === 'pillar') {
              defenderNearMedium = true;
            } else if (obs === 'fallen_log') {
              defenderNearLow = true;
            }
          }
        }
      }
    }
  }

  // Regras de Cobertura Baseadas no Tipo de Obstáculo Próximo ao Defensor / Linha de Visão:
  // 1. Cobertura Total: Paredes, monólitos ou barreiras sólidas pesadas bloqueando o caminho
  if (hasWallOrHeavy || defenderNearHeavy) {
    return {
      degree: 'total',
      acBonus: 0,
      dexSaveBonus: 0,
      description: 'Cobertura Total'
    };
  }

  // 2. Três Quartos de Cobertura (+5 CA): Objetos maiores como árvores ou pedras grandes
  if (defenderNearMedium || hasMediumObstacle || interveningCreatures >= 2) {
    return {
      degree: 'three_quarters',
      acBonus: 5,
      dexSaveBonus: 5,
      description: 'Três Quartos de Cobertura (+5 CA)'
    };
  }

  // 3. Cobertura Média / Parcial (+2 CA): Objetos baixos como árvores caídas (fallen_log) ou 1 criatura
  if (defenderNearLow || hasLowObstacle || interveningCreatures === 1) {
    return {
      degree: 'half',
      acBonus: 2,
      dexSaveBonus: 2,
      description: 'Cobertura Média / Parcial (+2 CA)'
    };
  }

  // Se não há obstáculo próximo ao defensor ou no caminho, sem cobertura
  return {
    degree: 'none',
    acBonus: 0,
    dexSaveBonus: 0,
    description: 'Sem Cobertura'
  };
}
