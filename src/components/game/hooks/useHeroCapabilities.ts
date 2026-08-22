import { CombatEntity, CellData } from '../../../game/types';
import { useHeroVisibility } from './heroCapabilities/useHeroVisibility';
import { useRacialCapabilities } from './heroCapabilities/useRacialCapabilities';
import { useClassCapabilities } from './heroCapabilities/useClassCapabilities';
import { useAmmoCapabilities } from './heroCapabilities/useAmmoCapabilities';

export interface UseHeroCapabilitiesProps {
  character: any;
  entities: CombatEntity[];
  grid: CellData[][];
  torches: { x: number; y: number }[];
  biome: string;
  isNight: boolean;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  onCharacterUpdated?: () => Promise<void> | void;
}

export function useHeroCapabilities({
  character,
  entities,
  grid,
  torches,
  biome,
  isNight,
  activeRevelation,
  onCharacterUpdated,
}: UseHeroCapabilitiesProps) {
  const {
    getActiveFeats,
    getHeroLightRadiusInCells,
    heroHasBlindFighting,
    isEntityVisible,
    isEntityVisibleByBlindFightingOnly,
    shouldHideEntityDetails,
    getEntityCover,
    isMonsterDefeated,
    shouldHideMonsterStats,
  } = useHeroVisibility({
    character,
    entities,
    grid,
    torches,
    biome,
    isNight,
    activeRevelation,
  });

  const {
    isDragonborn,
    breathWeaponMaxUses,
    draconicFlightMaxUses,
    isGoliath,
    largeFormMaxUses,
    breathWeaponDetails,
    luckyMaxPoints,
    hasLuckyFeat,
    goliathAncestryMaxUses,
    isHalfling,
    isHuman,
    isOrc,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isAasimar,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
  } = useRacialCapabilities({
    character,
    getActiveFeats,
  });

  const {
    secondWindMaxUses,
    actionSurgeMaxUses,
    rageMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    indomitableMaxUses,
    superiorityDiceMaxUses,
    bardicInspirationMaxUses,
    layOnHandsMaxPool,
    focusPointsMaxUses,
    wildShapeMaxUses,
    hasMagicCapability,
    hasSecondWindCapability,
  } = useClassCapabilities({
    character,
  });

  const {
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    consumeAmmunition,
    consumeThrownWeapon,
  } = useAmmoCapabilities({
    character,
    onCharacterUpdated,
  });

  return {
    getActiveFeats,
    getHeroLightRadiusInCells,
    heroHasBlindFighting,
    isEntityVisible,
    isEntityVisibleByBlindFightingOnly,
    shouldHideEntityDetails,
    getEntityCover,
    isMonsterDefeated,
    shouldHideMonsterStats,
    isDragonborn,
    breathWeaponMaxUses,
    draconicFlightMaxUses,
    isGoliath,
    largeFormMaxUses,
    breathWeaponDetails,
    luckyMaxPoints,
    hasLuckyFeat,
    goliathAncestryMaxUses,
    isHalfling,
    isHuman,
    isOrc,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isAasimar,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    secondWindMaxUses,
    actionSurgeMaxUses,
    rageMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    indomitableMaxUses,
    superiorityDiceMaxUses,
    bardicInspirationMaxUses,
    layOnHandsMaxPool,
    focusPointsMaxUses,
    wildShapeMaxUses,
    hasMagicCapability,
    hasSecondWindCapability,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    consumeAmmunition,
    consumeThrownWeapon,
  };
}
