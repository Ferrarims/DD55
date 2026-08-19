import { useEffect } from 'react';
import { CombatEntity, CellData } from '../../../game/types';

interface UseGameKeyboardProps {
  isHeroTurn: boolean;
  isBattleOver: boolean;
  activeEntity: CombatEntity | undefined;
  grid: CellData[][];
  entities: CombatEntity[];
  moveHeroDirection: (dx: number, dy: number) => void;
}

export function useGameKeyboard({
  isHeroTurn,
  isBattleOver,
  activeEntity,
  grid,
  entities,
  moveHeroDirection
}: UseGameKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar captura em inputs de texto se existirem
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
      const isHeroTurnCurrent = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;
      if (hasLivingMonsters && !isBattleOver && !isHeroTurnCurrent) return;

      const key = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(key)) {
        e.preventDefault();
      }

      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        moveHeroDirection(0, -1);
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        moveHeroDirection(0, 1);
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        moveHeroDirection(-1, 0);
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        moveHeroDirection(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHeroTurn, isBattleOver, activeEntity, grid, entities, moveHeroDirection]);
}
