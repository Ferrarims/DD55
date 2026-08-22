import { useRef } from 'react';
import { BiomeType } from '../../../../../game/types';
import { useHeroCombatActions } from '../../useHeroCombatActions';
import { useArenaGridMovement } from '../../useArenaGridMovement';

export interface UseArenaActionsAndMovementControllerProps {
  entities: any[];
  setEntities: any;
  activeEntity: any;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  character: any;
  currentSelectedAttack: any;
  characterAttacks: any[];
  selectedAttackIndex: number;
  weaponMasteryInfo: any;
  biome: BiomeType;
  weather: any;
  isNight: boolean;
  torches: any[];
  grid: any;
  activeAdvantageMode: any;
  gwmActive: boolean;
  sharpshooterActive: boolean;
  activeLargeForm: any;
  isGoliath: boolean;
  goliathAncestryUses: number;
  isHalfling: boolean;
  hasHeroicInspiration: boolean;
  isOrc: boolean;
  adrenalineRushUses: number;
  adrenalineRushMaxUses: number;
  healingHandsUses: number;
  celestialRevelationUses: number;
  channelDivinityUses: number;
  channelDivinityMaxUses: number;
  breathWeaponUses: number;
  breathWeaponDetails: any;
  spellSlots: number;
  spellSlotsMax: number;
  secondWindUses: number;
  secondWindMaxUses: number;
  indomitableUses: number;
  indomitableMaxUses: number;
  recklessAttackActive: boolean;
  bardicInspirationUses: number;
  bardicInspirationMaxUses: number;
  layOnHandsPool: number;
  layOnHandsMaxPool: number;
  focusPointsUses: number;
  focusPointsMaxUses: number;
  wildShapeUses: number;
  wildShapeMaxUses: number;
  superiorityDiceUses: number;
  superiorityDiceMaxUses: number;
  pendingTacticalMindInfo: any;
  isSfxEnabled: boolean;
  addCombatLog: any;
  triggerAttackVisualEffect: any;
  setLatestRoll: any;
  processDamageAndCheckKill: any;
  consumeThrownWeapon: any;
  setDroppedLoot: any;
  checkAmmunitionRequirement: any;
  getCharacterAmmoCount: any;
  consumeAmmunition: any;
  getActiveFeats: any;
  getHeroLightRadiusInCells: any;
  isEntityVisible: any;
  setRollAdvantageState: any;
  setPendingGoliathHitInfo: any;
  setTargetCandidates: any;
  setPendingAttackInfo: any;
  setShowTargetModal: any;
  setShowAttackModal: any;
  setPendingHalflingLuckInfo: any;
  setPendingHeroicInspirationInfo: any;
  setFloatingTexts: any;
  setAdrenalineRushUses: any;
  setHealingHandsUses: any;
  setCelestialRevelationUses: any;
  setShowRevelationMenu: any;
  handleExecuteCelestialRevelation: any;
  setChannelDivinityUses: any;
  setSelectedBreathTargets: any;
  setBreathWeaponShape: any;
  setShowBreathWeaponModal: any;
  setBreathWeaponUses: any;
  setActiveEffects: any;
  setSpellSlots: any;
  setSecondWindUses: any;
  setPendingTacticalMindInfo: any;
  setShowTacticalMindAlertModal: any;
  setIndomitableUses: any;
  setRecklessAttackActive: any;
  setBardicInspirationUses: any;
  setLayOnHandsPool: any;
  setFocusPointsUses: any;
  setWildShapeUses: any;
  setSuperiorityDiceUses: any;
  activeEntityIndex: number;
  isTeleportTargetMode: boolean;
  hazards: any;
  setHazards: any;
  powerups: any;
  setPowerUps: any;
  restPoints: any;
  setRestPoints: any;
  droppedLoot: any;
  chests: any;
  collectLootItem: any;
  openChest: any;
  setPendingRestPointId: any;
  setIsTeleportTargetMode: any;
  setGoliathAncestryUses: any;
  setMovementStepsCount: any;
  setTotalGameTurns: any;
  expandMapIfNeeded: any;
}

export function useArenaActionsAndMovementController(props: UseArenaActionsAndMovementControllerProps) {
  const moveHeroDirectionRef = useRef<(dx: number, dy: number) => void>(() => {});

  const heroCombatActions = useHeroCombatActions({
    ...props,
    moveHeroDirection: (dx: number, dy: number) => moveHeroDirectionRef.current(dx, dy),
  });

  const {
    checkGridTriggers,
    moveHeroDirection,
    handleCellClick,
  } = useArenaGridMovement({
    ...props,
    processHeroAttackExecution: heroCombatActions.processHeroAttackExecution,
  });

  moveHeroDirectionRef.current = moveHeroDirection;

  return {
    heroCombatActions,
    moveHeroDirection,
    handleCellClick,
    checkGridTriggers,
  };
}
