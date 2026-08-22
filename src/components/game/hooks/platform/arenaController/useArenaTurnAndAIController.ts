import { useCombatTurns } from '../../useCombatTurns';
import { useOpportunityAttackResolver } from '../useOpportunityAttackResolver';
import { useMonsterTurnAI } from '../../useMonsterTurnAI';
import { useGameKeyboard } from '../../useGameKeyboard';
import { BiomeType } from '../../../../../game/types';

export interface UseArenaTurnAndAIControllerProps {
  entities: any[];
  setEntities: any;
  activeEntityIndex: number;
  setActiveEntityIndex: any;
  currentTurnRound: number;
  setCurrentTurnRound: any;
  isBattleOver: boolean;
  setIsBattleOver: any;
  setIsVictoryScreenVisible: any;
  grid: any;
  torches: any[];
  biome: BiomeType;
  weather: any;
  isNight: boolean;
  character: any;
  activeLargeForm: any;
  activeDraconicFlight: any;
  activeRevelation: any;
  setActiveDraconicFlight: any;
  setDraconicFlightRoundsLeft: any;
  setActiveLargeForm: any;
  setLargeFormRoundsLeft: any;
  setActiveRevelation: any;
  setRadiantSoulRoundsLeft: any;
  addCombatLog: any;
  triggerAttackVisualEffect: any;
  setLatestRoll: any;
  processDamageAndCheckKill: any;
  checkGridTriggers: any;
  currentSelectedAttack: any;
  getHeroLightRadiusInCells: any;
  setHighlightedPath: any;
  setShowTargetModal: any;
  setPendingAttackInfo: any;
  pendingOpportunityAttack: any;
  setPendingOpportunityAttack: any;
  activeEntity: any;
  entitiesRef: any;
  isHeroTurn: boolean;
  moveHeroDirection: (dx: number, dy: number) => void;
}

export function useArenaTurnAndAIController({
  entities,
  setEntities,
  activeEntityIndex,
  setActiveEntityIndex,
  currentTurnRound,
  setCurrentTurnRound,
  isBattleOver,
  setIsBattleOver,
  setIsVictoryScreenVisible,
  grid,
  torches,
  biome,
  weather,
  isNight,
  character,
  activeLargeForm,
  activeDraconicFlight,
  activeRevelation,
  setActiveDraconicFlight,
  setDraconicFlightRoundsLeft,
  setActiveLargeForm,
  setLargeFormRoundsLeft,
  setActiveRevelation,
  setRadiantSoulRoundsLeft,
  addCombatLog,
  triggerAttackVisualEffect,
  setLatestRoll,
  processDamageAndCheckKill,
  checkGridTriggers,
  currentSelectedAttack,
  getHeroLightRadiusInCells,
  setHighlightedPath,
  setShowTargetModal,
  setPendingAttackInfo,
  pendingOpportunityAttack,
  setPendingOpportunityAttack,
  activeEntity,
  entitiesRef,
  isHeroTurn,
  moveHeroDirection,
}: UseArenaTurnAndAIControllerProps) {
  // Turnos de Combate
  const { advanceTurn } = useCombatTurns({
    entities,
    setEntities,
    activeEntityIndex,
    setActiveEntityIndex,
    currentTurnRound,
    setCurrentTurnRound,
    isBattleOver,
    setIsBattleOver,
    setIsVictoryScreenVisible,
    grid,
    torches,
    biome,
    weather,
    isNight,
    character,
    activeLargeForm,
    activeDraconicFlight,
    activeRevelation,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    setActiveLargeForm,
    setLargeFormRoundsLeft,
    setActiveRevelation,
    setRadiantSoulRoundsLeft,
    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    checkGridTriggers,
    currentSelectedAttack,
    getHeroLightRadiusInCells,
    setHighlightedPath,
    setShowTargetModal,
    setPendingAttackInfo,
  });

  // Ataques de Oportunidade
  const { handleResolveOpportunityAttack } = useOpportunityAttackResolver({
    pendingOpportunityAttack,
    setPendingOpportunityAttack,
    entities,
    setEntities,
    grid,
    torches,
    getHeroLightRadiusInCells,
    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    checkGridTriggers,
    advanceTurn
  });

  // IA dos Monstros
  useMonsterTurnAI({
    activeEntity,
    activeEntityIndex,
    isBattleOver,
    entities,
    entitiesRef,
    setEntities,
    grid,
    biome,
    isNight,
    torches,
    character,
    activeLargeForm,
    currentSelectedAttack,
    getHeroLightRadiusInCells,
    advanceTurn,
    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    checkGridTriggers,
    onTriggerOpportunityAttack: setPendingOpportunityAttack,
  });

  // Teclado
  useGameKeyboard({
    isHeroTurn,
    isBattleOver,
    activeEntity,
    grid,
    entities,
    moveHeroDirection,
  });

  return { advanceTurn, handleResolveOpportunityAttack };
}
