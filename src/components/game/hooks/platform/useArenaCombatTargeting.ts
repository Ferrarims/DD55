import { useState, useEffect, RefObject } from 'react';
import { CombatEntity, GridPosition } from '../../../../game/types';

export interface UseArenaCombatTargetingProps {
  activeEntityIndex: number;
  entitiesRef: RefObject<CombatEntity[]>;
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
}

export function useArenaCombatTargeting({
  activeEntityIndex,
  entitiesRef,
  setEntities
}: UseArenaCombatTargetingProps) {
  const [selectedAction, setSelectedAction] = useState<'move' | 'attack' | 'end'>('move');
  const [targetEntityId, setTargetEntityId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<GridPosition[]>([]);

  // Resetar reação do herói no início do seu turno
  useEffect(() => {
    const currentEntity = entitiesRef.current?.[activeEntityIndex];
    if (currentEntity && currentEntity.type === 'hero' && !currentEntity.hasReaction) {
      setEntities(prev => prev.map(e => e.id === currentEntity.id ? { ...e, hasReaction: true } : e));
    }
  }, [activeEntityIndex, entitiesRef, setEntities]);

  return {
    selectedAction,
    setSelectedAction,
    targetEntityId,
    setTargetEntityId,
    highlightedPath,
    setHighlightedPath
  };
}
