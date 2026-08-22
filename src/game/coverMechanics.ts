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

  // Algoritmo de linha de visão (Bresenham) entre (x0, y0) e (x1, y1)
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;
  let totalSteps = 0;

  let solidWallCount = 0;
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

    // Verificar se a célula no caminho possui parede sólida ou obstáculo
    if (currY >= 0 && currY < grid.length && currX >= 0 && currX < grid[0].length) {
      const cell = grid[currY][currX];
      if (cell) {
        const obs = cell.obstacleType;
        if (cell.terrain === 'wall') {
          if (obs === 'brick_wall' || obs === 'monolith') {
            solidWallCount++;
          } else if (obs === 'tree' || obs === 'rock' || obs === 'cactus' || obs === 'pillar' || obs === 'ruins') {
            hasMediumObstacle = true;
          } else if (obs === 'fallen_log' || obs === 'cell_bars') {
            hasLowObstacle = true;
          } else {
            hasMediumObstacle = true;
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

  // Verificar obstáculos adjacentes ao defensor que estejam no lado do atacante
  let defenderNearMedium = false;
  let defenderNearLow = false;

  const dirX = x1 - x0;
  const dirY = y1 - y0;

  for (let cy = Math.max(0, y1 - 1); cy <= Math.min(grid.length - 1, y1 + 1); cy++) {
    for (let cx = Math.max(0, x1 - 1); cx <= Math.min(grid[0].length - 1, x1 + 1); cx++) {
      const cell = grid[cy]?.[cx];
      if (cell && (cell.terrain === 'wall' || cell.obstacleType)) {
        const obs = cell.obstacleType;
        const distToDef = Math.max(Math.abs(cx - x1), Math.abs(cy - y1));
        if (distToDef === 1) {
          const defToObsX = cx - x1;
          const defToObsY = cy - y1;
          
          // Produto escalar: se dot < 0, o obstáculo está entre o defensor e o atacante
          const dot = defToObsX * dirX + defToObsY * dirY;
          if (dot < 0) {
            if (obs === 'fallen_log' || obs === 'cell_bars') {
              defenderNearLow = true;
            } else {
              defenderNearMedium = true;
            }
          }
        }
      }
    }
  }

  // Regras Oficiais de Cobertura D&D 5.5e (2024):
  // 1. Cobertura Total: Paredes de alvenaria ou parede sólida no caminho direto de visão
  if (solidWallCount >= 1) {
    return {
      degree: 'total',
      acBonus: 0,
      dexSaveBonus: 0,
      description: 'Cobertura Total'
    };
  }

  // 2. Três Quartos de Cobertura (+5 CA): defenderNearMedium, monólito, ruínas, árvores densas, pedras grandes ou 2+ criaturas no caminho
  if (defenderNearMedium || hasMediumObstacle || interveningCreatures >= 2) {
    return {
      degree: 'three_quarters',
      acBonus: 5,
      dexSaveBonus: 5,
      description: 'Três Quartos de Cobertura (+5 CA)'
    };
  }

  // 3. Meia Cobertura (+2 CA): Tronco caído (fallen_log), grades de cela, ou 1 criatura no caminho
  if (defenderNearLow || hasLowObstacle || interveningCreatures === 1) {
    return {
      degree: 'half',
      acBonus: 2,
      dexSaveBonus: 2,
      description: 'Meia Cobertura (+2 CA)'
    };
  }

  return {
    degree: 'none',
    acBonus: 0,
    dexSaveBonus: 0,
    description: 'Sem Cobertura'
  };
}
