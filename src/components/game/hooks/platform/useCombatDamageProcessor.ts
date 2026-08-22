import React, { useMemo } from 'react';
import { CombatEntity, CombatLog } from '../../../../game/types';
import { useImpendingAttackDetails } from './combatDamage/useImpendingAttackDetails';
import { useDamageProcessorExecutor } from './combatDamage/useDamageProcessorExecutor';

export interface UseCombatDamageProcessorProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
  recklessAttackActive: boolean;
  rollAdvantageState: 'normal' | 'advantage' | 'disadvantage';
  currentSelectedAttack: any;
  activeLargeForm: boolean;
  weather: 'clear' | 'rain' | 'fog' | 'snow' | 'storm' | 'heatwave' | 'wind';
  isEntityVisible: (ent: CombatEntity) => boolean;
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
  getActiveFeats: () => string[];
  addCombatLog: (actorName: string, title: string, detail: string, type?: CombatLog['type'] | 'spell') => void;
  setFloatingTexts: (val: any[] | ((prev: any[]) => any[])) => void;
  processedDeathIdsRef: React.MutableRefObject<Set<string>>;
  mapStreak: number;
  isOrc: boolean;
  relentlessEnduranceUses: number;
  setRelentlessEnduranceUses: (val: number | ((prev: number) => number)) => void;
  setShowRelentlessModal: (val: boolean) => void;
  isGoliath: boolean;
  goliathAncestryUses: number;
  setPendingGoliathDamageInfo: (info: any) => void;
  setVictoryData: (val: any | ((prev: any) => any)) => void;
  setDroppedLoot: (val: any[] | ((prev: any[]) => any[])) => void;
}

export function useCombatDamageProcessor(props: UseCombatDamageProcessorProps) {
  const {
    recklessAttackActive,
    rollAdvantageState,
    entities,
  } = props;

  const activeAdvantageMode = useMemo(() => {
    if (recklessAttackActive) return 'advantage';
    return rollAdvantageState;
  }, [recklessAttackActive, rollAdvantageState]);

  const impendingAttackDetails = useImpendingAttackDetails({
    entities: props.entities,
    recklessAttackActive: props.recklessAttackActive,
    currentSelectedAttack: props.currentSelectedAttack,
    character: props.character,
    activeLargeForm: props.activeLargeForm,
    weather: props.weather,
    isEntityVisible: props.isEntityVisible,
    getActiveFeats: props.getActiveFeats,
  });

  const { processDamageAndCheckKill } = useDamageProcessorExecutor(props);

  const heroEntity = entities.find(e => e.type === 'hero');
  const isHeroDead = heroEntity ? (heroEntity.isDead || heroEntity.currentHp <= 0) : false;

  return {
    activeAdvantageMode,
    impendingAttackDetails,
    processDamageAndCheckKill,
    isHeroDead
  };
}
