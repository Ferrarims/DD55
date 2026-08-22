import React from 'react';
import { CombatEntity, CellData } from '../../../../game/types';
import { createGoliathAncestryHandlers } from './goliath/goliathAncestryTriggers';
import { createGoliathLargeFormHandler } from './goliath/goliathLargeFormHandler';

export interface UseGoliathInteractionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  goliathAncestryUses: number;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  largeFormUses: number;
  setLargeFormUses: React.Dispatch<React.SetStateAction<number>>;
  activeLargeForm: boolean;
  setActiveLargeForm: (val: boolean) => void;
  largeFormRoundsLeft: number;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  pendingGoliathHitInfo: { targetId: string; damage: number } | null;
  setPendingGoliathHitInfo: (val: any) => void;
  pendingGoliathDamageInfo: { damageDealt: number; attackerId: string | null; attackerName: string; isWithin60Ft: boolean } | null;
  setPendingGoliathDamageInfo: (val: any) => void;
  setIsVictoryScreenVisible: (val: boolean) => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
}

export function useGoliathInteractions(props: UseGoliathInteractionsProps) {
  const {
    handleExecuteGoliathHit,
    handleExecuteGoliathDamage,
  } = createGoliathAncestryHandlers(props);

  const { handleLargeForm } = createGoliathLargeFormHandler(props);

  return {
    handleExecuteGoliathHit,
    handleExecuteGoliathDamage,
    handleLargeForm,
  };
}
