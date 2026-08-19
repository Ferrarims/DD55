import React, { useState, useEffect, useMemo } from 'react';
import { CombatEntity, CombatLog } from '../../../../game/types';

export interface UseHeroSpecialAbilitiesStateProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  activeEntityIndex: number;
  isBattleOver: boolean;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveRevelation: (val: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null | ((prev: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null) => 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null)) => void;
  activeDraconicFlight: boolean;
  setActiveDraconicFlight: (val: boolean | ((prev: boolean) => boolean)) => void;
  setDraconicFlightRoundsLeft: (val: number | ((prev: number) => number)) => void;
  activeLargeForm: boolean;
  breathWeaponMaxUses: number;
  goliathAncestryMaxUses: number;
  setGoliathAncestryUses: (val: number | ((prev: number) => number)) => void;
  adrenalineRushMaxUses: number;
  setAdrenalineRushUses: (val: number | ((prev: number) => number)) => void;
  relentlessEnduranceMaxUses: number;
  setRelentlessEnduranceUses: (val: number | ((prev: number) => number)) => void;
  isHuman: boolean;
  setHasHeroicInspiration: (val: boolean | ((prev: boolean) => boolean)) => void;
  luckyPoints: number;
  setLuckyPoints: (val: number | ((prev: number) => number)) => void;
  luckyMaxPoints: number;
  setRollAdvantageState: (val: 'normal' | 'advantage' | 'disadvantage' | ((prev: 'normal' | 'advantage' | 'disadvantage') => 'normal' | 'advantage' | 'disadvantage')) => void;
  usableInventoryItems: Array<{ id: string; baseQty?: number }>;
  addCombatLog: (actorName: string, title: string, detail: string, type?: CombatLog['type'] | 'spell') => void;
}

export function useHeroSpecialAbilitiesState({
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
  usableInventoryItems,
  addCombatLog
}: UseHeroSpecialAbilitiesStateProps) {
  const [radiantSoulRoundsLeft, setRadiantSoulRoundsLeft] = useState<number>(10);
  const [breathWeaponUses, setBreathWeaponUses] = useState<number>(breathWeaponMaxUses);
  const [recklessAttackActive, setRecklessAttackActive] = useState<boolean>(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    setBreathWeaponUses(breathWeaponMaxUses);
  }, [breathWeaponMaxUses]);

  useEffect(() => {
    setGoliathAncestryUses(goliathAncestryMaxUses);
  }, [goliathAncestryMaxUses]);

  useEffect(() => {
    setAdrenalineRushUses(adrenalineRushMaxUses);
  }, [adrenalineRushMaxUses]);

  useEffect(() => {
    setRelentlessEnduranceUses(relentlessEnduranceMaxUses);
  }, [relentlessEnduranceMaxUses]);

  useEffect(() => {
    setHasHeroicInspiration(isHuman);
  }, [isHuman, setHasHeroicInspiration]);

  useEffect(() => {
    setLuckyPoints(luckyMaxPoints);
  }, [luckyMaxPoints, setLuckyPoints]);

  useEffect(() => {
    setItemQuantities(prev => {
      const next = { ...prev };
      usableInventoryItems.forEach(item => {
        if (!(item.id in next)) {
          next[item.id] = (item as any).baseQty || 1;
        }
      });
      return next;
    });
  }, [usableInventoryItems]);

  const hasDamageAncestry = useMemo(() => {
    const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return gType === '' || 
           gType.includes('pedra') || gType.includes('stone') ||
           gType.includes('tempestade') || gType.includes('storm');
  }, [character]);

  // Contagem regressiva de voo fora de combate
  useEffect(() => {
    if (!isBattleOver) return;
    if (!activeDraconicFlight && activeRevelation !== 'Alma Radiante') return;

    const interval = setInterval(() => {
      if (activeDraconicFlight) {
        setDraconicFlightRoundsLeft(prev => {
          if (prev <= 0.5) {
            setActiveDraconicFlight(false);
            addCombatLog('Mestre do Jogo', '🐉 Voo Dracônico Expirado', 'Asas espectrais se dissipam e você pousa com segurança.', 'system');
            setEntities(entPrev => entPrev.map(e => e.type === 'hero' ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
            return 0;
          }
          return Math.max(0, prev - 0.5);
        });
      }
      if (activeRevelation === 'Alma Radiante') {
        setRadiantSoulRoundsLeft(prev => {
          if (prev <= 0.5) {
            setActiveRevelation(null);
            addCombatLog('Mestre do Jogo', '🌟 Alma Radiante Expirada', 'As asas radiantes se dissipam e você pousa com segurança.', 'system');
            setEntities(entPrev => entPrev.map(e => e.type === 'hero' ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
            return 10;
          }
          return prev - 0.5;
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isBattleOver, activeDraconicFlight, activeRevelation, activeLargeForm, character, addCombatLog, setEntities, setDraconicFlightRoundsLeft, setActiveDraconicFlight]);

  const activeEntity = entities[activeEntityIndex];

  const handleUseLuckyPoint = () => {
    if (luckyPoints <= 0) return;
    setLuckyPoints(prev => Math.max(0, prev - 1));
    setRollAdvantageState('advantage');

    const heroName = activeEntity?.name || character?.name || 'Herói';
    addCombatLog(
      heroName,
      '🍀 Ponto de Sorte Ativado!',
      `Você gastou 1 Ponto de Sorte (${luckyPoints - 1}/${luckyMaxPoints} restantes). Seu próximo teste de d20 terá VANTAGEM!`,
      'system'
    );
  };

  return {
    activeRevelation,
    setActiveRevelation,
    radiantSoulRoundsLeft,
    setRadiantSoulRoundsLeft,
    breathWeaponUses,
    setBreathWeaponUses,
    recklessAttackActive,
    setRecklessAttackActive,
    itemQuantities,
    setItemQuantities,
    handleUseLuckyPoint,
    hasDamageAncestry
  };
}
