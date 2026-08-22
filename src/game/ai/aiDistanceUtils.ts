import { CombatEntity } from '../types';

export function getMonsterSizeInSquares(sizeStr?: string): number {
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

export function getDistanceBetweenEntities(
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
