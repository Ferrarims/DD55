import React from 'react';
import { CombatEntity, CellData, PowerUp, BiomeType, WeatherType } from '../../../game/types';
import { useGridHazardsAndPowerups } from './gridMovement/useGridHazardsAndPowerups';
import { useOpportunityAttacks } from './gridMovement/useOpportunityAttacks';
import { useHeroCellClickInteraction } from './gridMovement/useHeroCellClickInteraction';
import { executeHeroDirectionalMove } from './gridMovement/executeHeroDirectionalMove';

export interface UseArenaGridMovementProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  activeEntityIndex: number;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  character: any;
  activeLargeForm: boolean;
  isHalfling: boolean;
  secondWindUses: number;
  hasHeroicInspiration: boolean;
  isTeleportTargetMode: boolean;
  isGoliath: boolean;
  isSfxEnabled: boolean;
  biome: BiomeType;
  weather: WeatherType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  currentSelectedAttack: any;
  hazards: any[];
  setHazards: React.Dispatch<React.SetStateAction<any[]>>;
  powerups: PowerUp[];
  setPowerUps: React.Dispatch<React.SetStateAction<PowerUp[]>>;
  restPoints: any[];
  setRestPoints: React.Dispatch<React.SetStateAction<any[]>>;
  droppedLoot: any[];
  chests: any[];
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  triggerAttackVisualEffect: (source: { x: number; y: number }, target: { x: number; y: number }, isRanged: boolean, hit: boolean, damage: number, isCritical?: boolean) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  processHeroAttackExecution: (hero: CombatEntity, targetMonster: CombatEntity, atkToUse: any) => void;
  collectLootItem: (id: string) => void;
  openChest: (id: string) => void;
  setPendingHalflingLuckInfo: (info: any) => void;
  setPendingHeroicInspirationInfo: (info: any) => void;
  setPendingTacticalMindInfo: (info: any) => void;
  setShowTacticalMindAlertModal: (val: boolean) => void;
  setPendingRestPointId: (id: string | null) => void;
  setIsTeleportTargetMode: (val: boolean) => void;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  isEntityVisible: (e: CombatEntity) => boolean;
  getHeroLightRadiusInCells: () => number;
  expandMapIfNeeded?: (x: number, y: number) => void;
}

export function useArenaGridMovement({
  entities,
  setEntities,
  grid,
  activeEntityIndex,
  isBattleOver,
  character,
  activeLargeForm,
  isHalfling,
  secondWindUses,
  hasHeroicInspiration,
  isTeleportTargetMode,
  isGoliath,
  isSfxEnabled,
  biome,
  weather,
  isNight,
  torches,
  currentSelectedAttack,
  hazards,
  setHazards,
  powerups,
  setPowerUps,
  restPoints,
  setRestPoints,
  droppedLoot,
  chests,
  addCombatLog,
  setFloatingTexts,
  triggerAttackVisualEffect,
  setLatestRoll,
  processDamageAndCheckKill,
  processHeroAttackExecution,
  collectLootItem,
  openChest,
  setPendingHalflingLuckInfo,
  setPendingHeroicInspirationInfo,
  setPendingTacticalMindInfo,
  setShowTacticalMindAlertModal,
  setPendingRestPointId,
  setIsTeleportTargetMode,
  setGoliathAncestryUses,
  setMovementStepsCount,
  setTotalGameTurns,
  isEntityVisible,
  getHeroLightRadiusInCells,
  expandMapIfNeeded,
}: UseArenaGridMovementProps) {
  const {
    checkGridTriggers,
    checkPassiveHazardDetection,
    handleDisarmHazard,
    handleActiveSearch,
  } = useGridHazardsAndPowerups({
    entities,
    setEntities,
    character,
    activeLargeForm,
    isHalfling,
    secondWindUses,
    hasHeroicInspiration,
    hazards,
    setHazards,
    powerups,
    setPowerUps,
    restPoints,
    setRestPoints,
    addCombatLog,
    setFloatingTexts,
    setPendingHalflingLuckInfo,
    setPendingHeroicInspirationInfo,
    setPendingTacticalMindInfo,
    setShowTacticalMindAlertModal,
    setPendingRestPointId,
  });

  const { checkOpportunityAttacks } = useOpportunityAttacks({
    entities,
    setEntities,
    grid,
    character,
    activeLargeForm,
    biome,
    weather,
    isNight,
    torches,
    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    getHeroLightRadiusInCells,
  });

  const moveHeroDirection = (dx: number, dy: number) => {
    executeHeroDirectionalMove({
      dx,
      dy,
      entities,
      setEntities,
      grid,
      activeEntityIndex,
      isBattleOver,
      character,
      activeLargeForm,
      isSfxEnabled,
      addCombatLog,
      checkOpportunityAttacks,
      checkGridTriggers,
      setMovementStepsCount,
      setTotalGameTurns,
      expandMapIfNeeded,
    });
  };

  const { handleCellClick } = useHeroCellClickInteraction({
    entities,
    setEntities,
    grid,
    activeEntityIndex,
    isBattleOver,
    character,
    activeLargeForm,
    isTeleportTargetMode,
    isGoliath,
    restPoints,
    droppedLoot,
    chests,
    hazards,
    handleDisarmHazard,
    currentSelectedAttack,
    addCombatLog,
    setFloatingTexts,
    processHeroAttackExecution,
    collectLootItem,
    openChest,
    setPendingRestPointId,
    setIsTeleportTargetMode,
    setGoliathAncestryUses,
    isEntityVisible,
    checkGridTriggers,
    moveHeroDirection,
  });

  return {
    checkGridTriggers,
    checkPassiveHazardDetection,
    handleDisarmHazard,
    handleActiveSearch,
    moveHeroDirection,
    handleCellClick,
  };
}
