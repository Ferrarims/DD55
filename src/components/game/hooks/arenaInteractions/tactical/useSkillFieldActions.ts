import React from 'react';
import { CombatEntity } from '../../../../../game/types';
import { rollSkillCheck, calculateSkillBonus } from '../../../../../game/skills/skillsEngine';

interface UseSkillFieldActionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  handleActiveSearch?: (heroX: number, heroY: number) => void;
}

export function useSkillFieldActions({
  entities,
  setEntities,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  addCombatLog,
  setFloatingTexts,
  handleActiveSearch,
}: UseSkillFieldActionsProps) {
  /**
   * Investigar Área (Investigação ou Percepção ativa para encontrar armadilhas e pistas)
   */
  const handleHeroSearchArea = () => {
    if (!activeEntity || activeEntity.type !== 'hero' || activeEntity.isDead) return;
    if (!isBattleOver && !activeEntity.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    if (!isBattleOver) {
      setEntities(prev =>
        prev.map(e => (e.id === activeEntity.id ? { ...e, hasAction: false } : e))
      );
    }

    if (handleActiveSearch) {
      handleActiveSearch(activeEntity.x, activeEntity.y);
    } else {
      const rollRes = rollSkillCheck(character, 'investigation', {
        reason: 'Investigar Área'
      });
      addCombatLog(
        activeEntity.name,
        '🔍 INVESTIGAR ÁREA',
        `${rollRes.logText}. Você inspecionou o ambiente cuidadosamente.`,
        'system'
      );
    }
  };

  /**
   * Primeiros Socorros (Medicina CD 10 para aplicar curativos e tratar ferimentos no campo)
   */
  const handleHeroFirstAid = () => {
    if (!activeEntity || activeEntity.type !== 'hero' || activeEntity.isDead) return;
    if (!isBattleOver && !activeEntity.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const dc = 10;
    const rollRes = rollSkillCheck(character, 'medicine', {
      dc,
      reason: 'Primeiros Socorros / Curativos de Campo'
    });

    if (!isBattleOver) {
      setEntities(prev =>
        prev.map(e => (e.id === activeEntity.id ? { ...e, hasAction: false } : e))
      );
    }

    if (rollRes.passed) {
      const wisMod = calculateSkillBonus(character, 'medicine').abilityMod;
      const healedTemp = Math.max(1, Math.floor(Math.random() * 4) + 1 + Math.max(0, wisMod));

      setEntities(prev =>
        prev.map(e => {
          if (e.id === activeEntity.id) {
            const currentTemp = e.tempHp || 0;
            const newTemp = Math.max(currentTemp, healedTemp);
            return {
              ...e,
              tempHp: newTemp,
            };
          }
          return e;
        })
      );

      setFloatingTexts(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: activeEntity.x,
          y: activeEntity.y,
          text: `🩺 +${healedTemp} PV Temp (Curativos)`,
          color: '#34d399',
          progress: 0
        }
      ]);

      addCombatLog(
        activeEntity.name,
        '🩺 PRIMEIROS SOCORROS (MEDICINA) - SUCESSO!',
        `${rollRes.logText}. Você aplicou bandagens emergenciais e garantiu ${healedTemp} Pontos de Vida Temporários!`,
        'heal'
      );
    } else {
      setFloatingTexts(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: activeEntity.x,
          y: activeEntity.y,
          text: '✕ Falha nos Curativos',
          color: '#f87171',
          progress: 0
        }
      ]);

      addCombatLog(
        activeEntity.name,
        '🩺 PRIMEIROS SOCORROS (MEDICINA) - FALHA',
        `${rollRes.logText}. Você tentou estancar o ferimento mas os curativos não surtiram efeito imediato.`,
        'system'
      );
    }
  };

  return {
    handleHeroSearchArea,
    handleHeroFirstAid,
  };
}
