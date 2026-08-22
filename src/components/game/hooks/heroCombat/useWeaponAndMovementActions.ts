import { useCallback } from 'react';
import { CombatEntity } from '../../../../game/types';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities } from '../../../../game/combatUtils';
import { UseHeroCombatActionsProps } from './types';

export interface UseWeaponAndMovementActionsHelpers {
  processHeroAttackExecution: (
    hero: CombatEntity,
    targetEntity: CombatEntity,
    atkToUse: any,
    options?: {
      isOffHand?: boolean;
      isMastery?: boolean;
      masteryName?: string;
      customDamageDice?: string;
      isCleave?: boolean;
      canUseNick?: boolean;
    }
  ) => boolean;
}

export function useWeaponAndMovementActions(
  props: UseHeroCombatActionsProps,
  helpers: UseWeaponAndMovementActionsHelpers
) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    currentSelectedAttack,
    activeLargeForm,

    addCombatLog,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    getActiveFeats,
    isEntityVisible,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
  } = props;

  const { processHeroAttackExecution } = helpers;

  // Ação de Atacar (Ataque com Arma)
  const handleHeroAttack = useCallback((overrideAtk?: any, targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity || activeEntity.type !== 'hero') {
      addCombatLog('Mestre do Jogo', '⚠️ Não é o seu turno', 'Você só pode atacar durante o turno do seu herói!', 'system');
      return;
    }
    const hero = activeEntity;
    if (!hero.hasAction && (hero.attacksRemaining || 0) <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const atkToUse = overrideAtk || currentSelectedAttack;
    if (!atkToUse) {
      addCombatLog('Mestre do Jogo', '⚠️ Nenhuma Arma Selecionada', 'Selecione uma arma ou ataque na barra de ações antes de desferir um ataque!', 'system');
      return;
    }

    if (atkToUse) {
      const props = (atkToUse.properties || '').toLowerCase();
      const hasLoading = props.includes('recarga') || props.includes('loading') || props.includes('carregar');
      const activeFeatsList = getActiveFeats();
      const hasCrossbowExpert = activeFeatsList.some((f: string) => f.toLowerCase().includes('bestas') || f.toLowerCase().includes('crossbow'));
      
      if (hasLoading && !hasCrossbowExpert) {
        const attackedWeapons = hero.attackedWeaponNamesThisAction || [];
        const hasAttackedWithOther = attackedWeapons.length > 0 && attackedWeapons.some(name => name !== atkToUse.name);
        if (hasAttackedWithOther) {
          addCombatLog(
            'Mestre do Jogo',
            '⚠️ Recarga Impedida',
            `Você não pode atacar com "${atkToUse.name || 'esta arma'}" (propriedade Recarga) porque já realizou ataques com outra arma nesta mesma ação!`,
            'system'
          );
          return;
        }
      }
    }

    const ammoReq = checkAmmunitionRequirement(atkToUse);
    if (ammoReq) {
      const count = getCharacterAmmoCount(ammoReq);
      if (count <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Sem Munição!', `Você não possui ${ammoReq.type} para usar ${atkToUse?.name || 'sua arma'}!`, 'system');
        return;
      }
    }

    if (targetEntity) {
      processHeroAttackExecution(hero, targetEntity, atkToUse);
      return;
    }

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Nenhum Alvo Visível',
        'Você está na escuridão total (sem visão no escuro, percepção às cegas ou fonte de luz equipada e acesa) e não consegue ver nenhum alvo para atacar!',
        'system'
      );
      return;
    }

    let rangeCells = hero.range || 1;
    if (atkToUse) {
      rangeCells = getWeaponMaxRangeCells(atkToUse);
    }

    const monstersInRange = aliveMonsters.filter(m => {
      const dist = getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm);
      return dist <= rangeCells;
    });

    if (monstersInRange.length === 0) {
      const sortedMonsters = [...aliveMonsters].sort((a, b) => {
        const distA = getDistanceBetweenEntities(hero, a, character?.race, activeLargeForm);
        const distB = getDistanceBetweenEntities(hero, b, character?.race, activeLargeForm);
        return distA - distB;
      });
      const closest = sortedMonsters[0];
      const closestDist = getDistanceBetweenEntities(hero, closest, character?.race, activeLargeForm);

      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Alvo Fora de Alcance',
        `O inimigo mais próximo (${closest.name}) está a ${closestDist * 1.5}m (${closestDist} cel). O alcance de ${atkToUse?.name || 'sua arma'} é de ${rangeCells * 1.5}m (${rangeCells} cel).`,
        'system'
      );
      return;
    }

    if (monstersInRange.length === 1) {
      processHeroAttackExecution(hero, monstersInRange[0], atkToUse);
    } else {
      setTargetCandidates(monstersInRange);
      setPendingAttackInfo({ type: 'weapon', overrideAtk: atkToUse });
      setShowTargetModal(true);
    }
  }, [
    activeEntity,
    activeLargeForm,
    addCombatLog,
    character,
    checkAmmunitionRequirement,
    currentSelectedAttack,
    entities,
    getActiveFeats,
    getCharacterAmmoCount,
    getDistanceBetweenEntities,
    isBattleOver,
    isEntityVisible,
    isHeroTurn,
    processHeroAttackExecution,
    setPendingAttackInfo,
    setShowTargetModal,
    setTargetCandidates
  ]);

  // Ação de Disparada (Dash)
  const handleHeroDash = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            remainingMovement: e.remainingMovement + e.speed,
            hasAction: false
          };
        }
        return e;
      })
    );
    addCombatLog(hero.name, '🏃 DISPARADA (DASH)!', `Usou a Ação para ganhar +${hero.speed * 1.5}m de movimento adicional neste turno.`, 'system');
  }, [activeEntity, addCombatLog, isBattleOver, isHeroTurn, setEntities]);

  // Ataque Extra de Maestria Cleave (Fender/Trespassar)
  const handleHeroCleaveAttack = useCallback((atkToUse: any, targetEntity: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    const baseDamageDice = atkToUse?.damage || hero.damageDice || '1d8';
    const cleanDice = baseDamageDice.split(/[+-]/)[0].trim();

    const success = processHeroAttackExecution(hero, targetEntity, atkToUse, {
      isMastery: true,
      masteryName: 'Cleave (Fender)',
      customDamageDice: cleanDice,
      isCleave: true
    });

    if (success) {
      setEntities(prev =>
        prev.map(e => e.id === hero.id ? { ...e, usedCleaveThisTurn: true } : e)
      );
      addCombatLog('Mestre do Jogo', '🪓 Cleave Realizado!', `Você desferiu o ataque de Cleave (Fender) com sucesso contra ${targetEntity.name}!`, 'system');
    }

    setShowTargetModal(false);
    setPendingAttackInfo(null);
  }, [activeEntity, addCombatLog, isBattleOver, isHeroTurn, processHeroAttackExecution, setEntities, setPendingAttackInfo, setShowTargetModal]);

  return {
    handleHeroAttack,
    handleHeroDash,
    handleHeroCleaveAttack
  };
}
