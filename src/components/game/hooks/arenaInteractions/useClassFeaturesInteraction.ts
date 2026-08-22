import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { getAttacksPerAction } from '../../../../game/combatUtils';
import { updateCharacter } from '../../../../lib/api/characterService';

export interface UseClassFeaturesInteractionProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  secondWindUses: number;
  setSecondWindUses: React.Dispatch<React.SetStateAction<number>>;
  secondWindMaxUses: number;
  actionSurgeUses: number;
  setActionSurgeUses: React.Dispatch<React.SetStateAction<number>>;
  actionSurgeMaxUses: number;
  rageUses: number;
  setRageUses: React.Dispatch<React.SetStateAction<number>>;
  rageMaxUses: number;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  getActiveFeats: () => string[];
}

export function useClassFeaturesInteraction({
  entities,
  setEntities,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  secondWindUses,
  setSecondWindUses,
  secondWindMaxUses,
  actionSurgeUses,
  setActionSurgeUses,
  actionSurgeMaxUses,
  rageUses,
  setRageUses,
  rageMaxUses,
  addCombatLog,
  getActiveFeats,
}: UseClassFeaturesInteractionProps) {

  // Segundo Fôlego / Recuperar Fôlego (Second Wind)
  const handleHeroSecondWind = () => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead) || activeEntity;
    if (!hero || hero.isDead) return;

    if (!isBattleOver && !isHeroTurn) return;

    if (secondWindUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já usou todas as cargas de Recuperar Fôlego!', 'system');
      return;
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    if (hero.currentHp >= hero.maxHp) {
      addCombatLog('Mestre do Jogo', '⚠️ Vida no Máximo (100%)', 'Seus pontos de vida já estão em 100% (máximo), não é possível usar o Recuperar Fôlego.', 'system');
      return;
    }

    const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
    const hasFortitude = getActiveFeats().includes('Dádiva da Fortitude');
    const extraHeal = hasFortitude ? Math.max(0, conMod) : 0;

    let healAmount = Math.floor(Math.random() * 10) + 1 + (hero.level || 1);
    if (hasFortitude) healAmount += extraHeal;

    const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
    const recovered = newHp - hero.currentHp;
    const remaining = secondWindUses - 1;

    setSecondWindUses(remaining);

    if (character && Array.isArray(character.class_resources)) {
      const updatedRes = character.class_resources.map((r: any) => {
        if (!r) return r;
        const name = (r.name || '').toLowerCase();
        if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
          return { ...r, used: Math.max(0, (r.max || secondWindMaxUses) - remaining) };
        }
        return r;
      });
      character.class_resources = updatedRes;
      if (character.id) {
        updateCharacter(character.id, { class_resources: updatedRes }).catch(err => console.warn(err));
      }
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            currentHp: newHp,
            hasBonusAction: isBattleOver ? e.hasBonusAction : false
          };
        }
        return e;
      })
    );
    addCombatLog(
      hero.name,
      '⚡ RECUPERAR FÔLEGO (SECOND WIND)!',
      `Invocou a resiliência de combate e recuperou ${recovered} PV!${hasFortitude ? ` (+ ${extraHeal} de Dádiva da Fortitude)` : ''} (Usos restantes: ${remaining}/${secondWindMaxUses})`,
      'heal'
    );
  };

  // Surto de Ação (Action Surge)
  const handleHeroActionSurge = () => {
    if (isBattleOver) {
      addCombatLog('Mestre do Jogo', '⚠️ Apenas em Combate', 'O Surto de Ação só pode ser utilizado durante um combate ativo!', 'system');
      return;
    }
    if (!isHeroTurn || !activeEntity) return;
    const hero = activeEntity;

    if (hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Necessária', 'Você precisa utilizar sua Ação Principal antes de usar o Surto de Ação!', 'system');
      return;
    }

    if ((hero.attacksRemaining || 0) > 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Ataques Pendentes', 'Você precisa realizar todos os seus ataques da Ação Principal (incluindo Ataque Extra) antes de usar o Surto de Ação!', 'system');
      return;
    }

    if (actionSurgeUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já usou seu Surto de Ação neste descanso!', 'system');
      return;
    }

    const remaining = actionSurgeUses - 1;
    setActionSurgeUses(remaining);

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            hasAction: true,
            attacksRemaining: 0,
            isActionSurgeActive: true,
            attackedWeaponNamesThisAction: []
          };
        }
        return e;
      })
    );

    const atksPerAction = getAttacksPerAction(hero) || getAttacksPerAction(character);
    const attackDesc = atksPerAction > 1 ? ` (incluindo os ${atksPerAction} ataques do Ataque Extra)` : '';

    addCombatLog(
      hero.name,
      '⚡ SURTO DE AÇÃO (ACTION SURGE)!',
      `Superou os limites corporais e GANHOU UMA AÇÃO PRINCIPAL ADICIONAL COMPLETA${attackDesc}! (Usos restantes: ${remaining}/${actionSurgeMaxUses})`,
      'system'
    );
  };

  // Fúria (Rage)
  const handleHeroRage = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (rageUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já gastou todos os seus usos de Fúria!', 'system');
      return;
    }

    if (!hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    const remaining = rageUses - 1;
    setRageUses(remaining);

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            hasBonusAction: false,
            ac: (e.ac ?? e.armor_class) + 1,
            armor_class: (e.ac ?? e.armor_class) + 1
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🔥 FÚRIA BÁRBARA ATIVADA!',
      `Entrou em estado selvagem de combate (+2 no Dano e +1 na CA)! (Usos restantes: ${remaining}/${rageMaxUses})`,
      'heal'
    );
  };

  return {
    handleHeroSecondWind,
    handleHeroActionSurge,
    handleHeroRage
  };
}
