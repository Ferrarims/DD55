import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from './types';
import { CombatEntity } from '../../../../game/types';
import { getDistanceBetweenEntities } from '../../../../game/combatUtils';

interface SpellsAndMasteryHelpers {
  processHeroAttackExecution: (
    attacker: CombatEntity,
    target: CombatEntity,
    atkToUse: any,
    options?: any
  ) => boolean;
}

export function useSpellsAndMasteryActions(
  props: UseHeroCombatActionsProps,
  helpers: SpellsAndMasteryHelpers
) {
  const { processHeroAttackExecution } = helpers;

  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    spellSlots,
    spellSlotsMax,
    currentSelectedAttack,
    weaponMasteryInfo,
    activeLargeForm,

    addCombatLog,
    processDamageAndCheckKill,
    isEntityVisible,
    setSpellSlots,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
  } = props;

  // Conjurar Magia / Ataque Mágico (Bola de Fogo / Míssil Mágico)
  const handleHeroMagicSpell = useCallback((targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (spellSlots <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Espaços de Magia Esgotados', 'Você já utilizou todos os seus Espaços de Magia neste combate!', 'system');
      return;
    }

    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return;

    if (targetEntity) {
      const remaining = spellSlots - 1;
      setSpellSlots(remaining);

      const spellDamage = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + 3;

      addCombatLog(
        hero.name,
        `🪄 CONJUROU MAGIA em ${targetEntity.name}!`,
        `Lançou Míssil Arcano/Explosão e causou ${spellDamage} de Dano de Fogo! (Slots restantes: ${remaining}/${spellSlotsMax})`,
        'attack'
      );
      processDamageAndCheckKill(targetEntity.id, spellDamage, hero.name, 'Fogo', 'hero');

      setEntities(prev =>
        prev.map(e => {
          if (e.id === hero.id) return { ...e, hasAction: false };
          return e;
        })
      );
      setShowTargetModal(false);
      setPendingAttackInfo(null);
      return;
    }

    if (aliveMonsters.length === 1) {
      handleHeroMagicSpell(aliveMonsters[0]);
    } else {
      setTargetCandidates(aliveMonsters);
      setPendingAttackInfo({ type: 'magic' });
      setShowTargetModal(true);
    }
  }, [activeEntity, addCombatLog, entities, isBattleOver, isEntityVisible, isHeroTurn, processDamageAndCheckKill, setEntities, setPendingAttackInfo, setShowTargetModal, setSpellSlots, setTargetCandidates, spellSlots, spellSlotsMax]);

  // Maestria em Arma (Weapon Mastery)
  const handleHeroWeaponMastery = useCallback((overrideMasteryName?: string, targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    if (!hero.hasAction && (hero.attacksRemaining || 0) <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const masteryName = overrideMasteryName || weaponMasteryInfo?.name || 'Maestria de Arma';
    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return;

    const atkToUse = currentSelectedAttack;
    const ammoReq = checkAmmunitionRequirement(atkToUse);
    if (ammoReq) {
      const count = getCharacterAmmoCount(ammoReq);
      if (count <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Sem Munição!', `Você não possui ${ammoReq.type} para usar a Maestria com ${atkToUse?.name || 'sua arma'}!`, 'system');
        return;
      }
    }

    if (targetEntity) {
      const success = processHeroAttackExecution(hero, targetEntity, atkToUse, {
        isMastery: true,
        masteryName
      });

      if (success) {
        let extraEffectLog = '';
        const mLower = masteryName.toLowerCase();

        if (mLower.includes('topple') || mLower.includes('derrubar')) {
          const conSave = Math.floor(Math.random() * 20) + 1 + 1;
          const strMod = Math.max(0, Math.floor(((character?.strength || 10) - 10) / 2));
          const dexMod = Math.max(0, Math.floor(((character?.dexterity || 10) - 10) / 2));
          const pb = 2 + Math.floor(((character?.level || 1) - 1) / 4);
          const dc = 8 + pb + Math.max(strMod, dexMod);

          if (conSave < dc) {
            extraEffectLog = ` 💥 MAESTRIA DERRUBAR! ${targetEntity.name} falhou no teste de CON (Rolou ${conSave} vs CD ${dc}) e CAIU CAÍDO!`;
          } else {
            extraEffectLog = ` 🛡️ ${targetEntity.name} resistiu ao Derrubar (Salvaguarda de CON ${conSave} vs CD ${dc}).`;
          }
        } else if (mLower.includes('push') || mLower.includes('empurrar')) {
          extraEffectLog = ` 💥 MAESTRIA EMPURRAR! ${targetEntity.name} foi empurrado 3 metros (2 células) para trás!`;
        } else if (mLower.includes('vex') || mLower.includes('vexar') || mLower.includes('provocar') || mLower.includes('afligir')) {
          extraEffectLog = ` 🎯 MAESTRIA AFLIGIR! Concede VANTAGEM na próxima jogada de ataque contra ${targetEntity.name}!`;
        } else if (mLower.includes('sap') || mLower.includes('enfraquecer')) {
          extraEffectLog = ` 🛡️ MAESTRIA ENFRAQUECER! Impõe DESVANTAGEM no próximo ataque de ${targetEntity.name}!`;
        } else if (mLower.includes('slow') || mLower.includes('lentidão') || mLower.includes('lentidao')) {
          extraEffectLog = ` 🐢 MAESTRIA LENTIDÃO! Reduz o deslocamento de ${targetEntity.name} em 3 metros!`;
        } else if (mLower.includes('cleave') || mLower.includes('fender') || mLower.includes('varrer') || mLower.includes('trespassar')) {
          const secondMonster = aliveMonsters.find(m => m.id !== targetEntity.id && getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm) <= 1);
          if (secondMonster) {
            const cleaveDmg = Math.floor(Math.random() * 6) + 1;
            processDamageAndCheckKill(secondMonster.id, cleaveDmg, hero.name, currentSelectedAttack?.damage_type || 'Cortante', 'hero');
            extraEffectLog = ` 🪓 MAESTRIA TRESPASSAR! Golpe atingiu também ${secondMonster.name} causando +${cleaveDmg} de dano!`;
          } else {
            extraEffectLog = ` 🪓 MAESTRIA TRESPASSAR! Golpe de varredura executado com sucesso!`;
          }
        } else if (mLower.includes('nick') || mLower.includes('corte rápido') || mLower.includes('golpe rápido') || mLower.includes('ágil') || mLower.includes('agil')) {
          extraEffectLog = ` ⚡ MAESTRIA ÁGIL! Ataque veloz realizado de forma fluida sem gastar sua Ação Bônus!`;
        } else {
          extraEffectLog = ` 🎯 MAESTRIA DE ARMA (${masteryName}) aplicada com sucesso!`;
        }

        if (extraEffectLog) {
          addCombatLog(hero.name, `🎯 EFEITO DE MAESTRIA (${masteryName})`, extraEffectLog, 'system');
        }
      }
      return;
    }

    let rangeCells = hero.range || 1;
    if (currentSelectedAttack?.range) {
      const parsed = parseFloat(currentSelectedAttack.range);
      if (!isNaN(parsed) && parsed > 0) rangeCells = Math.max(1, Math.round(parsed / 1.5));
    }

    const monstersInRange = aliveMonsters.filter(m => {
      const dist = Math.max(Math.abs(hero.x - m.x), Math.abs(hero.y - m.y));
      return dist <= rangeCells;
    });

    if (monstersInRange.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', `Nenhum inimigo está no alcance de ${currentSelectedAttack?.name || 'sua arma'} para aplicar Maestria!`, 'system');
      return;
    }

    if (monstersInRange.length === 1) {
      handleHeroWeaponMastery(masteryName, monstersInRange[0]);
    } else {
      setTargetCandidates(monstersInRange);
      setPendingAttackInfo({ type: 'weapon', overrideAtk: { ...currentSelectedAttack, name: `${currentSelectedAttack?.name} [Maestria: ${masteryName}]` } });
      setShowTargetModal(true);
    }
  }, [activeEntity, activeLargeForm, addCombatLog, character?.dexterity, character?.level, character?.race, character?.strength, checkAmmunitionRequirement, currentSelectedAttack, entities, getCharacterAmmoCount, isBattleOver, isEntityVisible, isHeroTurn, processDamageAndCheckKill, processHeroAttackExecution, setPendingAttackInfo, setShowTargetModal, setTargetCandidates, weaponMasteryInfo?.name]);

  return {
    handleHeroMagicSpell,
    handleHeroWeaponMastery,
  };
}
