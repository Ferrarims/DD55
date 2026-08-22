import React, { useState } from 'react';
import { HeroActionPanel } from './ui/HeroActionPanel';
import { ArenaTopbar } from './ui/ArenaTopbar';
import { GameCanvasArea } from './ui/GameCanvasArea';
import { SurvivalStatusPanel } from './ui/SurvivalStatusPanel';
import { InitiativeListPanel } from './ui/InitiativeListPanel';
import { EncounterSummaryPanel } from './ui/EncounterSummaryPanel';
import { CombatHistoryPanel } from './ui/CombatHistoryPanel';
import { GameModalsContainer } from './modals/GameModalsContainer';
import { GameContext } from './context/GameContext';
import { useGameInventoryActions } from "./hooks/useGameInventoryActions";
import { useGamePlatformState } from "./hooks/useGamePlatformState";
import { useArenaInteractions } from "./hooks/useArenaInteractions";
import { useArenaCombatController } from "./hooks/platform/useArenaCombatController";
import { useArenaCanvasElements } from "./hooks/platform/useArenaCanvasElements";
import { useGameExitHandler } from "./hooks/platform/useGameExitHandler";

interface GamePlatformProps {
  character: any;
  onExitGame: () => void;
  onCharacterUpdated?: () => Promise<void> | void;
  difficulty?: "easy" | "medium" | "hard";
}
export const GamePlatform: React.FC<GamePlatformProps> = ({
  character,
  onExitGame,
  onCharacterUpdated,
  difficulty = 'medium'
}) => {
  const gamePlatformState = useGamePlatformState({
    character,
    onExitGame,
    onCharacterUpdated,
    difficulty: difficulty as 'easy' | 'medium' | 'hard'
  });

  const {
    canvasRef, minimapRef, activeRevelation, setActiveRevelation, processDamageAndCheckKill,
    isAmbientSoundEnabled, setIsAmbientSoundEnabled, isSfxEnabled, setIsSfxEnabled,
    isShowMinimap, setIsShowMinimap, isShowZoomControls, setIsShowZoomControls,
    proceduralWorldEnabled, setProceduralWorldEnabled, addCombatLog, biome, grid, setGrid,
    torches, entities, setEntities, activeEntityIndex, isBattleOver, setIsBattleOver,
    victoryLogged, prevHadVisibleMonstersRef, isSaving, is3dMode, isNight, entitiesRef,
    getActiveFeats, secondWindMaxUses, actionSurgeMaxUses, rageMaxUses, channelDivinityMaxUses,
    spellSlotsMax, focusPointsMaxUses, totalGameTurns, setTotalGameTurns, lastMealTurn,
    lastShortRestTurn, prevTurns, setMovementStepsCount, setIsVictoryScreenVisible,
    setFloatingTexts, setPendingShortRestItem, setShowShortRestModal, isFullscreenMap, cols, rows,
    secondWindUses, actionSurgeUses, setActionSurgeUses, rageUses, setRageUses,
    channelDivinityUses, setChannelDivinityUses, spellSlots, setSpellSlots, focusPointsUses,
    setFocusPointsUses, goliathAncestryUses, setGoliathAncestryUses, draconicFlightUses,
    setDraconicFlightUses, activeDraconicFlight, setActiveDraconicFlight, draconicFlightRoundsLeft,
    setDraconicFlightRoundsLeft, largeFormUses, setLargeFormUses, activeLargeForm,
    setActiveLargeForm, largeFormRoundsLeft, setLargeFormRoundsLeft, setRadiantSoulRoundsLeft,
    pendingGoliathHitInfo, setPendingGoliathHitInfo, pendingGoliathDamageInfo,
    setPendingGoliathDamageInfo, pendingShortRestItem, itemQuantities, setItemQuantities,
    setShowItemModal, setShowTargetModal, setTargetCandidates, setPendingAttackInfo,
    setHitDiceToSpend, setSecondWindUses
  } = gamePlatformState;

  const [, forceR] = useState(0);

  // Handler para Executar Descanso Longo no Acampamento do Mapa
  const activeEntity = entities[activeEntityIndex];
  const heroEntity = entities.find(e => e.type === 'hero');
  const isHeroDead = heroEntity ? (heroEntity.isDead || heroEntity.currentHp <= 0) : false;
  const isHeroTurn = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;

  const { removeConsumableFromCharacter, handleUseItem } = useGameInventoryActions({
    character, activeEntity, entities, setEntities, itemQuantities, setItemQuantities,
    addCombatLog, isHeroTurn, isBattleOver, setShowItemModal, setShowTargetModal,
    setTargetCandidates, setPendingAttackInfo, processDamageAndCheckKill, getActiveFeats,
    setPendingShortRestItem, setHitDiceToSpend, setShowShortRestModal, onCharacterUpdated,
  });

  const arenaInteractions = useArenaInteractions({
    entities, setEntities, grid, setGrid, character, onCharacterUpdated, activeEntity,
    activeEntityIndex, isHeroTurn, isBattleOver, setIsBattleOver, biome, isNight, torches,
    secondWindUses, setSecondWindUses, secondWindMaxUses, actionSurgeUses, setActionSurgeUses,
    actionSurgeMaxUses, rageUses, setRageUses, rageMaxUses, channelDivinityUses, setChannelDivinityUses,
    channelDivinityMaxUses, spellSlots, setSpellSlots, spellSlotsMax, focusPointsUses, setFocusPointsUses,
    focusPointsMaxUses, goliathAncestryUses, setGoliathAncestryUses, draconicFlightUses,
    setDraconicFlightUses, activeDraconicFlight, setActiveDraconicFlight, draconicFlightRoundsLeft,
    setDraconicFlightRoundsLeft, largeFormUses, setLargeFormUses, activeLargeForm, setActiveLargeForm,
    largeFormRoundsLeft, setLargeFormRoundsLeft, activeRevelation, setActiveRevelation,
    setRadiantSoulRoundsLeft, pendingGoliathHitInfo, setPendingGoliathHitInfo, pendingGoliathDamageInfo,
    setPendingGoliathDamageInfo, pendingShortRestItem, setPendingShortRestItem, setShowShortRestModal,
    totalGameTurns, setTotalGameTurns, lastMealTurn, lastShortRestTurn, prevTurns, setMovementStepsCount,
    setIsVictoryScreenVisible, victoryLogged, prevHadVisibleMonstersRef, addCombatLog, setFloatingTexts,
    setItemQuantities, processDamageAndCheckKill, removeConsumableFromCharacter, getActiveFeats, entitiesRef,
  });

  const {
    handleExecuteCelestialRevelation, handleExecuteGoliathHit, handleExecuteGoliathDamage,
    handleDraconicFlight, handleLargeForm, handleHeroDodge, handleHeroHide, confirmGameShortRest,
    handleHeroSecondWind, handleHeroActionSurge, handleHeroRage, handleHeroDisengage,
    handleHeroStandUp, handleHeroEscapeGrapple, handleHeroSearchArea, handleHeroFirstAid,
  } = arenaInteractions;

  const {
    heroCombatActions, handleCellClick, advanceTurn, handleResolveOpportunityAttack
  } = useArenaCombatController({
    character, onCharacterUpdated, gamePlatformState, handleExecuteCelestialRevelation, isHeroTurn, activeEntity
  });

  const {
    handleHeroAttack,
    handleHeroOffHandAttack,
    handleHeroCleaveAttack,
    handleTriggerHeroOffHandAttack,
    handleHeroDash,
    handleAdrenalineRush,
    handleHealingHands,
    handleCelestialRevelation,
    handleHeroChannelDivinity,
    handleExecuteBreathWeapon,
    handleOpenBreathWeaponModal,
    handleHeroMagicSpell,
    handleHeroIndomitable,
    handleHeroRecklessAttack,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
    handleHeroManeuver,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
  } = heroCombatActions;

  const { renderCanvasElement, renderMinimapElement } = useArenaCanvasElements({
    canvasRef,
    minimapRef,
    isFullscreenMap,
    is3dMode,
    cols,
    rows,
    entities,
    handleCellClick
  });

  const { handleExitGame } = useGameExitHandler({
    character,
    entities,
    secondWindUses,
    secondWindMaxUses,
    onCharacterUpdated,
    onExitGame
  });

  const gameContextValue = {
    ...gamePlatformState,
    renderCanvasElement,
    renderMinimapElement,
    handleExitGame,
    forceUpdate: () => forceR(p => p + 1),
    // De heroCombatActions
    handleHeroAttack,
    handleTriggerHeroOffHandAttack,
    handleHeroDash,
    handleAdrenalineRush,
    handleCelestialRevelation,
    handleHeroChannelDivinity,
    handleOpenBreathWeaponModal,
    handleHeroMagicSpell,
    handleHeroIndomitable,
    handleHeroRecklessAttack,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
    handleHeroManeuver,
    // De arenaInteractions
    handleDraconicFlight,
    handleLargeForm,
    handleHeroDodge,
    handleHeroHide,
    handleHeroSecondWind,
    handleHeroActionSurge,
    handleHeroRage,
    handleHeroDisengage,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
    handleHeroSearchArea,
    handleHeroFirstAid,
    // De useCombatTurns
    advanceTurn,
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-amber-500/40 p-2 md:p-3 space-y-2.5 shadow-2xl">
      
      {/* Topbar da Arena de Batalha */}
      <ArenaTopbar />

      {/* Seção Principal de 3 Colunas Otimizadas: Mapa Arena (5 cols) | Ações do Personagem (4 cols) | Iniciativa & Logs (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* COLUNA 1: Arena / Mapa Canvas 2D (lg:col-span-5) e Fullscreen Map Overlay */}
        <GameCanvasArea />

        {/* CONTÊINER PARA COLUNA 2 E 3 (Suporta Tela Cheia) */}
        <div className={isFullscreenMap ? "contents" : "lg:col-span-7 grid grid-cols-1 lg:grid-cols-7 gap-3"}>
        {/* COLUNA 2: Painel de Ações / Vitória / Derrota (lg:col-span-4) */}
        <HeroActionPanel />
        {/* COLUNA 3: Ordem de Iniciativa, Detalhes do Encontro & Histórico de Combate (lg:col-span-3) */}
        <div className={isFullscreenMap ? "fixed top-4 right-4 bottom-4 z-[9999] w-[360px] overflow-y-auto custom-scrollbar flex flex-col gap-4 p-2 bg-slate-900/95 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md" : "lg:col-span-3 space-y-2.5"}>
          
          {/* Status de Sobrevivência */}
          <SurvivalStatusPanel />

          {/* Ordem de Iniciativa */}
          <InitiativeListPanel />

          {/* Informações do Encontro & Monstros (ND, Quantidade, XP) */}
          <EncounterSummaryPanel />

          {/* Histórico de Combate */}
          <CombatHistoryPanel />

        </div>

        </div>

      </div>

      {/* Modais e Painéis Flutuantes Extraídos */}
      <GameModalsContainer />
      {/* Fim do componente */}
    </div>
    </GameContext.Provider>
  );
};
