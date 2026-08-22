import React, { useRef, useCallback } from 'react';
import { CombatEntity, CellData, WeatherType, BiomeType } from '../../../game/types';
import { checkBattleEndStatus } from '../core/turnManagement';
import { processEndOfTurnEffects } from './combatTurns/endOfTurnEffects';
import { resetTurnEntityState } from './combatTurns/resetTurnEntityState';

export interface UseCombatTurnsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  activeEntityIndex: number;
  setActiveEntityIndex: React.Dispatch<React.SetStateAction<number>>;
  currentTurnRound: number;
  setCurrentTurnRound: React.Dispatch<React.SetStateAction<number>>;
  isBattleOver: boolean;
  setIsBattleOver: (val: boolean) => void;
  setIsVictoryScreenVisible: (val: boolean) => void;
  grid: CellData[][];
  torches: { x: number; y: number }[];
  biome: BiomeType;
  weather: WeatherType;
  isNight: boolean;
  character: any;
  activeLargeForm: boolean;
  activeDraconicFlight: boolean;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveDraconicFlight: (val: boolean) => void;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveLargeForm: (val: boolean) => void;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveRevelation: (val: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null) => void;
  setRadiantSoulRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  triggerAttackVisualEffect: (source: { x: number; y: number }, target: { x: number; y: number }, isRanged: boolean, hit: boolean, damage: number, isCritical?: boolean) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  checkGridTriggers: (entityId: string, tx: number, ty: number) => void;
  currentSelectedAttack: any;
  getHeroLightRadiusInCells: () => number;
  setHighlightedPath: (path: { x: number; y: number }[]) => void;
  setShowTargetModal: (val: boolean) => void;
  setPendingAttackInfo: (val: any) => void;
}

export function useCombatTurns({
  entities,
  setEntities,
  activeEntityIndex,
  setActiveEntityIndex,
  setCurrentTurnRound,
  isBattleOver,
  setIsBattleOver,
  setIsVictoryScreenVisible,
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
  setHighlightedPath,
  setShowTargetModal,
  setPendingAttackInfo,
}: UseCombatTurnsProps) {
  const entitiesRef = useRef<CombatEntity[]>(entities);
  entitiesRef.current = entities;

  const advanceTurn = useCallback(() => {
    const currentEntity = entities[activeEntityIndex];
    setHighlightedPath([]);
    setShowTargetModal(false);
    setPendingAttackInfo(null);
    
    // 1. Processar efeitos especiais de fim de turno
    processEndOfTurnEffects({
      currentEntity,
      entities,
      setEntities,
      character,
      activeRevelation,
      activeDraconicFlight,
      activeLargeForm,
      setActiveDraconicFlight,
      setDraconicFlightRoundsLeft,
      setActiveLargeForm,
      setLargeFormRoundsLeft,
      setActiveRevelation,
      setRadiantSoulRoundsLeft,
      addCombatLog,
    });

    setEntities(prev => {
      // 2. Verificar fim de batalha
      const battleStatus = checkBattleEndStatus(prev);
      if (battleStatus.isVictory && !isBattleOver) {
        setIsBattleOver(true);
        return prev;
      }
      if (battleStatus.isDefeat && !isBattleOver) {
        setIsBattleOver(true);
        setIsVictoryScreenVisible(true);
        addCombatLog('Mestre do Jogo', '💀 DERROTA!', 'Seu herói caiu no combate...', 'kill');
        return prev;
      }

      // 3. Determinar próximo índice de entidade ativa
      let targetNextIdx = activeEntityIndex;
      for (let i = 1; i <= prev.length; i++) {
        const candidate = (activeEntityIndex + i) % prev.length;
        if (candidate === 0) {
          setCurrentTurnRound(r => r + 1);
        }
        if (!prev[candidate]?.isDead) {
          targetNextIdx = candidate;
          break;
        }
      }

      const calculatedNextIdx = targetNextIdx;
      setTimeout(() => {
        setActiveEntityIndex(calculatedNextIdx);
      }, 0);

      // 4. Resetar estados e condições para o turno entrante
      return resetTurnEntityState({
        prevEntities: prev,
        targetNextIdx,
        addCombatLog,
      });
    });
  }, [
    activeEntityIndex,
    entities,
    activeRevelation,
    character,
    activeDraconicFlight,
    activeLargeForm,
    isBattleOver,
    addCombatLog,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    setActiveLargeForm,
    setLargeFormRoundsLeft,
    setActiveRevelation,
    setRadiantSoulRoundsLeft,
    setHighlightedPath,
    setShowTargetModal,
    setPendingAttackInfo,
    setCurrentTurnRound,
    setIsBattleOver,
    setIsVictoryScreenVisible,
    setEntities,
    setActiveEntityIndex
  ]);

  return {
    advanceTurn,
  };
}
