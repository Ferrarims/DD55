import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { RACES_REFERENCE } from '../../../../lib/api/references';

interface ProcessEndOfTurnEffectsProps {
  currentEntity: CombatEntity;
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  activeDraconicFlight: boolean;
  activeLargeForm: boolean;
  setActiveDraconicFlight: (val: boolean) => void;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveLargeForm: (val: boolean) => void;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setActiveRevelation: (val: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null) => void;
  setRadiantSoulRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
}

export function processEndOfTurnEffects({
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
}: ProcessEndOfTurnEffectsProps) {
  if (!currentEntity || currentEntity.type !== 'hero' || currentEntity.isDead) return;

  // 1. Consumo Radiante
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

  // 2. Voo Dracônico
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

  // 3. Forma Grande (Golias)
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

  // 4. Alma Radiante (Aasimar)
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
