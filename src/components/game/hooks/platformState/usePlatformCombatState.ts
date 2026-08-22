import React, { useState } from 'react';
import { CombatEntity, LootItem } from '../../../../game/types';
import { useArenaCombatTargeting } from '../platform/useArenaCombatTargeting';
import { useCombatModalsState } from '../platform/useCombatModalsState';
import { useHeroWeaponFeatsConfig } from '../platform/useHeroWeaponFeatsConfig';
import { useHeroCombatStatsAndWeapons } from '../platform/useHeroCombatStatsAndWeapons';
import { useHeroSpecialAbilitiesState } from '../platform/useHeroSpecialAbilitiesState';
import { useCombatDamageProcessor } from '../platform/useCombatDamageProcessor';
import { VictoryData } from '../arenaExploration/types';

export interface UsePlatformCombatStateProps {
  character: any;
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
  activeEntityIndex: number;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveRevelation: (val: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null) => void;
  activeDraconicFlight: boolean;
  setActiveDraconicFlight: (val: boolean) => void;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  activeLargeForm: boolean;
  isBattleOver: boolean;
  weather: any;
  mapStreak: number;
  processedDeathIdsRef: React.MutableRefObject<Set<string>>;
  setVictoryData: React.Dispatch<React.SetStateAction<VictoryData | null>>;
  setDroppedLoot: React.Dispatch<React.SetStateAction<any[]>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Hero capabilities
  getActiveFeats: () => string[];
  shouldHideEntityDetails: (entity: CombatEntity) => boolean;
  isEntityVisible: (entity: CombatEntity) => boolean;
  isDragonborn: boolean;
  breathWeaponMaxUses: number;
  isGoliath: boolean;
  goliathAncestryMaxUses: number;
  goliathAncestryUses: number;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  isOrc: boolean;
  adrenalineRushMaxUses: number;
  setAdrenalineRushUses: React.Dispatch<React.SetStateAction<number>>;
  relentlessEnduranceMaxUses: number;
  relentlessEnduranceUses: number;
  setRelentlessEnduranceUses: React.Dispatch<React.SetStateAction<number>>;
  isHuman: boolean;
  setHasHeroicInspiration: (val: boolean) => void;
  luckyPoints: number;
  setLuckyPoints: React.Dispatch<React.SetStateAction<number>>;
  luckyMaxPoints: number;
}

export function usePlatformCombatState(props: UsePlatformCombatStateProps) {
  const {
    character,
    entities,
    setEntities,
    entitiesRef,
    activeEntityIndex,
    activeRevelation,
    setActiveRevelation,
    activeDraconicFlight,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    activeLargeForm,
    isBattleOver,
    weather,
    mapStreak,
    processedDeathIdsRef,
    setVictoryData,
    setDroppedLoot,
    addCombatLog,
    setFloatingTexts,
    getActiveFeats,
    shouldHideEntityDetails,
    isEntityVisible,
    breathWeaponMaxUses,
    goliathAncestryMaxUses,
    goliathAncestryUses,
    setGoliathAncestryUses,
    isOrc,
    adrenalineRushMaxUses,
    setAdrenalineRushUses,
    relentlessEnduranceMaxUses,
    relentlessEnduranceUses,
    setRelentlessEnduranceUses,
    isHuman,
    setHasHeroicInspiration,
    luckyPoints,
    setLuckyPoints,
    luckyMaxPoints,
    isGoliath,
  } = props;

  // Modificador de d20 para Ataque
  const [rollAdvantageState, setRollAdvantageState] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  // Alvejamento e Seleção de Alvo
  const targeting = useArenaCombatTargeting({
    activeEntityIndex,
    entitiesRef,
    setEntities
  });

  // Modais de Combate
  const modals = useCombatModalsState();

  // Talentos de Armas
  const weaponFeats = useHeroWeaponFeatsConfig({
    getActiveFeats
  });

  // Estatísticas de Combate e Armas
  const statsAndWeapons = useHeroCombatStatsAndWeapons({
    character,
    entities,
    setEntities,
    activeEntityIndex,
    versatileTwoHandedWeapons: weaponFeats.versatileTwoHandedWeapons,
    getActiveFeats,
    shouldHideEntityDetails,
    addCombatLog,
    isVersatileWeapon: weaponFeats.isVersatileWeapon,
    getVersatileDamage: weaponFeats.getVersatileDamage
  });

  // Habilidades Especiais
  const specialAbilities = useHeroSpecialAbilitiesState({
    character,
    entities,
    setEntities,
    activeEntityIndex,
    isBattleOver,
    activeRevelation,
    setActiveRevelation,
    activeDraconicFlight,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    activeLargeForm,
    breathWeaponMaxUses,
    goliathAncestryMaxUses,
    setGoliathAncestryUses,
    adrenalineRushMaxUses,
    setAdrenalineRushUses,
    relentlessEnduranceMaxUses,
    setRelentlessEnduranceUses,
    isHuman,
    setHasHeroicInspiration,
    luckyPoints,
    setLuckyPoints,
    luckyMaxPoints,
    setRollAdvantageState,
    usableInventoryItems: statsAndWeapons.usableInventoryItems,
    addCombatLog
  });

  // Processamento de Dano
  const damageProcessor = useCombatDamageProcessor({
    character,
    entities,
    setEntities,
    entitiesRef,
    recklessAttackActive: specialAbilities.recklessAttackActive,
    rollAdvantageState,
    currentSelectedAttack: statsAndWeapons.currentSelectedAttack,
    activeLargeForm,
    weather,
    isEntityVisible,
    shouldHideEntityDetails,
    getActiveFeats,
    addCombatLog,
    setFloatingTexts,
    processedDeathIdsRef,
    mapStreak,
    isOrc,
    relentlessEnduranceUses,
    setRelentlessEnduranceUses,
    setShowRelentlessModal: modals.setShowRelentlessModal,
    isGoliath,
    goliathAncestryUses,
    setPendingGoliathDamageInfo: modals.setPendingGoliathDamageInfo,
    setVictoryData,
    setDroppedLoot
  });

  return {
    rollAdvantageState,
    setRollAdvantageState,
    ...targeting,
    ...modals,
    ...weaponFeats,
    ...statsAndWeapons,
    ...specialAbilities,
    ...damageProcessor,
  };
}
