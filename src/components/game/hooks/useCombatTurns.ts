import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CombatEntity, CellData, WeatherType, BiomeType } from '../../../game/types';
import { advanceCombatTurn, checkBattleEndStatus } from '../core/turnManagement';
import { executeMonsterTurnAI } from '../../../game/monsterAI';
import { executeAttack } from '../../../game/combatEngine';
import { getWeaponMaxRangeCells, hasThrownProperty, getDistanceBetweenEntities, getEntitySizeInSquares } from '../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../lib/api/references';

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
}: UseCombatTurnsProps) {
  const entitiesRef = useRef<CombatEntity[]>(entities);
  entitiesRef.current = entities;

  const advanceTurn = useCallback(() => {
    const currentEntity = entities[activeEntityIndex];
    setHighlightedPath([]);
    setShowTargetModal(false);
    setPendingAttackInfo(null);
    
    // Efeitos de fim de turno
    if (currentEntity && currentEntity.type === 'hero' && !currentEntity.isDead) {
      if (activeRevelation === 'Consumo Radiante') {
        const dmg = character?.pb || Math.floor(((character?.level || 1) - 1) / 4) + 2;
        entities.forEach(e => {
          if (e.isDead) return;
          const dist = Math.max(Math.abs(e.x - currentEntity.x), Math.abs(e.y - currentEntity.y));
          if (dist <= 2 && e.id !== currentEntity.id) {
            const newHp = Math.max(0, e.currentHp - dmg);
            if (newHp === 0 && e.type === 'monster') {
               addCombatLog('Mestre do Jogo', '🔥 Consumo Radiante', `${e.name} foi desintegrado pela luz! (${dmg} dano radiante)`, 'kill');
            } else if (newHp < e.currentHp) {
               addCombatLog('Mestre do Jogo', '🔥 Consumo Radiante', `${e.name} sofreu ${dmg} dano radiante da aura.`, 'damage');
            }
          }
        });
      }

      if (activeDraconicFlight) {
        setDraconicFlightRoundsLeft(prev => {
          if (prev <= 1) {
            setActiveDraconicFlight(false);
            addCombatLog('Mestre do Jogo', '🐉 Voo Dracônico Expirado', 'Asas espectrais se dissipam no fim do seu turno.', 'system');
            setEntities(entPrev => entPrev.map(e => e.type === 'hero' ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
            return 0;
          }
          return Math.max(0, prev - 1);
        });
      }
      if (activeLargeForm) {
        setLargeFormRoundsLeft(prev => {
          if (prev <= 1) {
            setActiveLargeForm(false);
            addCombatLog('Mestre do Jogo', '🪨 Forma Grande Expirada', 'Seu corpo encolhe de volta ao tamanho normal no fim do seu turno.', 'system');
            setEntities(entPrev => entPrev.map(e => e.type === 'hero' ? {
              ...e,
              size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
              speed: Math.max(1, e.speed - 2),
              remainingMovement: Math.max(0, e.remainingMovement - 2)
            } : e));
            return 0;
          }
          return Math.max(0, prev - 1);
        });
      }
      if (activeRevelation === 'Alma Radiante') {
        setRadiantSoulRoundsLeft(prev => {
          if (prev <= 1) {
            setActiveRevelation(null);
            addCombatLog('Mestre do Jogo', '🌟 Alma Radiante Expirada', 'As asas radiantes se dissipam no fim do seu turno.', 'system');
            setEntities(entPrev => entPrev.map(e => e.type === 'hero' ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
            return 10;
          }
          return prev - 1;
        });
      }
    }

    setEntities(prev => {
      const currentEnt = prev[activeEntityIndex];
      if (currentEnt && currentEnt.type === 'hero' && !currentEnt.isDead) {
        if (activeRevelation === 'Consumo Radiante') {
          const dmg = character?.pb || Math.floor(((character?.level || 1) - 1) / 4) + 2;
          prev = prev.map(e => {
            if (e.isDead) return e;
            const dist = Math.max(Math.abs(e.x - currentEnt.x), Math.abs(e.y - currentEnt.y));
            if (dist <= 2 && e.id !== currentEnt.id) {
              const newHp = Math.max(0, e.currentHp - dmg);
              if (newHp === 0 && e.type === 'monster') {
                 return { ...e, currentHp: newHp, isDead: true };
              } else if (newHp < e.currentHp) {
                 return { ...e, currentHp: newHp };
              }
            }
            return e;
          });
        }
        
        prev = prev.map(e => {
           if (e.isDead) return e;
           let updated = false;
           let newConditions = [...e.conditions];
           if (newConditions.includes('Amedrontado_New')) {
              newConditions = newConditions.filter(c => c !== 'Amedrontado_New');
              newConditions.push('Amedrontado');
              updated = true;
           } else if (newConditions.includes('Amedrontado')) {
              newConditions = newConditions.filter(c => c !== 'Amedrontado');
              updated = true;
           }
           return updated ? { ...e, conditions: newConditions } : e;
        });
      }

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

      return prev.map((e, idx) => {
        let isStillGrappled = e.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
        let currentConditions = [...e.conditions];
        let currentGrappledById = e.grappledById;

        if (isStillGrappled && currentGrappledById) {
          const grappler = prev.find(g => g.id === currentGrappledById);
          if (!grappler || grappler.isDead) {
            currentConditions = currentConditions.filter(c => c !== 'Agarrado' && c !== 'Agarrada' && c !== 'Grappled');
            currentGrappledById = undefined;
            isStillGrappled = false;
          } else {
            const dist = Math.max(Math.abs(e.x - grappler.x), Math.abs(e.y - grappler.y));
            const maxReach = grappler.range || 1;
            if (dist > maxReach) {
              currentConditions = currentConditions.filter(c => c !== 'Agarrado' && c !== 'Agarrada' && c !== 'Grappled');
              currentGrappledById = undefined;
              isStillGrappled = false;
            }
          }
        }

        if (idx === targetNextIdx) {
          const hasSlow = currentConditions.some(c => c === 'Lento' || c === 'Slow');
          const cleanedConditions = currentConditions.filter(c => c !== 'Esquivando' && c !== 'Dodge' && c !== 'Desengajando' && c !== 'Lento' && c !== 'Slow');
          const finalIsGrappled = cleanedConditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
          const baseMovement = finalIsGrappled ? 0 : e.speed;
          const finalMovement = hasSlow ? Math.max(0, baseMovement - 2) : baseMovement;

          if (hasSlow) {
            addCombatLog('Mestre do Jogo', '🐢 Efeito de Lento', `${e.name} iniciou o turno sob o efeito Lento (Slow), reduzindo seu deslocamento em 3m (2 células) para este turno!`, 'system');
          }

          return {
            ...e,
            remainingMovement: finalMovement,
            hasAction: true,
            hasBonusAction: true,
            hasReaction: true,
            hasAttackedThisTurn: false,
            attacksRemaining: 0,
            usedSavageAttackerThisTurn: false,
            usedPiercerThisTurn: false,
            usedTavernBrawlerRerollThisTurn: false,
            usedTavernBrawlerPushThisTurn: false,
            offHandAttackUsedThisTurn: false,
            usedCleaveThisTurn: false,
            usedNickThisTurn: false,
            attackedWeaponNamesThisTurn: [],
            attackedWeaponNamesThisAction: [],
            conditions: cleanedConditions,
            grappledById: currentGrappledById
          };
        }
        return {
          ...e,
          conditions: currentConditions,
          grappledById: currentGrappledById
        };
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
