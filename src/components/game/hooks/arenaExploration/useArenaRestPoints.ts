import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { UseArenaExplorationProps, RestPointData } from './types';
import { executeLongRest } from './rest/executeLongRest';
import { executeShortRest } from './rest/executeShortRest';

export interface UseArenaRestPointsProps extends UseArenaExplorationProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  restPoints: RestPointData[];
  setRestPoints: React.Dispatch<React.SetStateAction<RestPointData[]>>;
  totalGameTurns: number;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  lastMealTurn: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  lastLongRestTurn: React.MutableRefObject<number>;
  prevTurns: React.MutableRefObject<number>;
}

export function useArenaRestPoints(props: UseArenaRestPointsProps) {
  const useRestPoint = (restPointId: string) => {
    executeLongRest(props, restPointId);
  };

  const useShortRestPoint = (restPointId: string) => {
    executeShortRest(props, restPointId);
  };

  return {
    useRestPoint,
    useShortRestPoint,
  };
}
