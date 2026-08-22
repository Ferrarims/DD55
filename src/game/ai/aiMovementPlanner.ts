import { CellData, CombatEntity, GridPosition } from '../types';
import { findPathAStar } from '../aStarPathfinding';
import { getDistanceBetweenEntities } from './aiDistanceUtils';

interface PlanMonsterMovementProps {
  monster: CombatEntity;
  hero: CombatEntity;
  grid: CellData[][];
  occupiedPositions: GridPosition[];
  speedForTurn: number;
  monsterSize: number;
  distToHero: number;
  archetype: 'brute' | 'skirmisher' | 'mage';
  isLowHp: boolean;
}

export interface PlannedMovement {
  newPosition: GridPosition;
  pathTaken: GridPosition[];
  shouldFleeEarly: boolean;
  actionLogSuffix: string;
}

export function planMonsterMovement({
  monster,
  hero,
  grid,
  occupiedPositions,
  speedForTurn,
  monsterSize,
  distToHero,
  archetype,
  isLowHp,
}: PlanMonsterMovementProps): PlannedMovement {
  const currentPos: GridPosition = { x: monster.x, y: monster.y };
  let newPosition: GridPosition = { ...currentPos };
  let pathTaken: GridPosition[] = [];
  const isFlying = monster.conditions?.includes('Voando') || false;

  // 1. Fuga em pânico com HP muito baixo (<= 20%)
  if (isLowHp && distToHero <= 2) {
    const escapeX = Math.max(1, Math.min(grid[0].length - 2, monster.x + (monster.x > hero.x ? 2 : -2)));
    const escapeY = Math.max(1, Math.min(grid.length - 2, monster.y + (monster.y > hero.y ? 2 : -2)));
    const path = findPathAStar(grid, currentPos, { x: escapeX, y: escapeY }, occupiedPositions, isFlying, monsterSize);
    
    if (path.length > 1) {
      let stepIndex = Math.min(path.length - 1, speedForTurn);
      while (stepIndex > 0 && occupiedPositions.some(p => p.x === path[stepIndex].x && p.y === path[stepIndex].y)) {
        stepIndex--;
      }
      if (stepIndex > 0) {
        newPosition = path[stepIndex];
        pathTaken = path.slice(0, stepIndex + 1);
        return {
          newPosition,
          pathTaken,
          shouldFleeEarly: true,
          actionLogSuffix: `Movimentou-se para longe (${newPosition.x}, ${newPosition.y}).`
        };
      }
    }
  }

  // 2. Mago recuando se o herói estiver colado
  if (archetype === 'mage' && distToHero <= 2) {
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
        return {
          newPosition,
          pathTaken,
          shouldFleeEarly: false,
          actionLogSuffix: `Recuou taticamente para (${newPosition.x}, ${newPosition.y}) buscando manter distância. `
        };
      }
    }
  }

  // 3. Avanço em direção ao herói se estiver fora de alcance
  if (distToHero > monster.range) {
    const heroPos: GridPosition = { x: hero.x, y: hero.y };
    const path = findPathAStar(grid, currentPos, heroPos, occupiedPositions, isFlying, monsterSize);

    if (path.length > 2) {
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
      while (chosenStep > 0 && occupiedPositions.some(p => p.x === path[chosenStep].x && p.y === path[chosenStep].y)) {
        chosenStep--;
      }
      if (chosenStep > 0) {
        newPosition = path[chosenStep];
        pathTaken = path.slice(0, chosenStep + 1);
        return {
          newPosition,
          pathTaken,
          shouldFleeEarly: false,
          actionLogSuffix: `Avançou no grid para (${newPosition.x}, ${newPosition.y}). `
        };
      }
    }
  }

  return {
    newPosition,
    pathTaken,
    shouldFleeEarly: false,
    actionLogSuffix: ''
  };
}
