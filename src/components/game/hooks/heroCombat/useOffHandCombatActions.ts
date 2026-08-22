import { useCallback } from 'react';
import { CombatEntity } from '../../../../game/types';
import { isLightWeapon, getOffHandDamageDice } from '../../../../game/combatEngine';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities } from '../../../../game/combatUtils';
import { UseHeroCombatActionsProps } from './types';
import { validateOffHandAttack } from './offHandValidationHelper';

export interface UseOffHandCombatActionsHelpers {
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

export function useOffHandCombatActions(
  props: UseHeroCombatActionsProps,
  helpers: UseOffHandCombatActionsHelpers
) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    characterAttacks,
    selectedAttackIndex,
    weaponMasteryInfo,
    activeLargeForm,

    addCombatLog,
    getActiveFeats,
    isEntityVisible,
    setFloatingTexts,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
  } = props;

  const { processHeroAttackExecution } = helpers;

  // Ataque com Segunda Arma / Mão Inapta (Combate com Duas Armas Leves)
  const handleHeroOffHandAttack = useCallback((overrideAtk?: any, targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    const selectedAtk = characterAttacks[selectedAttackIndex] || characterAttacks[0];
    const selectedAtkName = selectedAtk?.name || '';
    const usedPrimaryAtk = characterAttacks.find(a => (hero.attackedWeaponNamesThisTurn || []).includes(a.name));

    const isNickWeapon = selectedAtk?.mastery?.toLowerCase().includes('nick') || 
                         selectedAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('nick') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                         (weaponMasteryInfo && weaponMasteryInfo.name.toLowerCase().includes('nick'));
    
    const canUseNick = Boolean(isNickWeapon && !hero.usedNickThisTurn);

    if (!canUseNick && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno e a maestria Nick já foi usada ou não se aplica a esta arma!', 'system');
      return;
    }

    const validation = validateOffHandAttack(hero, character, selectedAtkName, selectedAtk, setFloatingTexts, addCombatLog);
    if (!validation.canProceed) return;

    const { offHandWeaponName, hasShieldEquipped, rawW2 } = validation;

    let atkToUse = overrideAtk;
    if (!atkToUse) {
      const offHandLower = offHandWeaponName.toLowerCase();
      atkToUse = characterAttacks.find((a: any) => {
        const nameLower = (a.name || '').toLowerCase();
        return nameLower === offHandLower || nameLower.includes(offHandLower) || offHandLower.includes(nameLower);
      });
    }

    if (!atkToUse) {
      atkToUse = {
        name: offHandWeaponName,
        attack_bonus: hero.attackBonus,
        damage: isLightWeapon(offHandWeaponName) ? (offHandWeaponName.toLowerCase().includes('adaga') ? '1d4' : '1d6') : (hero.damageDice || '1d6'),
        damage_type: 'Cortante',
        range: '1.5m'
      };
    }

    setEntities(prev => prev.map(e => {
      if (e.id === hero.id) {
        const newAc = hasShieldEquipped ? Math.max(10, (e.ac ?? e.armor_class) - 2) : (e.ac ?? e.armor_class);
        return { ...e, ac: newAc, armor_class: newAc, offHandAttackUsedThisTurn: true };
      }
      return e;
    }));

    if (hasShieldEquipped) {
      addCombatLog(
        hero.name,
        '🛡️ ESCUDO INATIVO NESTE TURNO!',
        `O escudo (${rawW2}) permanece equipado no inventário, mas fica inativo (-2 CA) durante o ataque com a mão inábil!`,
        'system'
      );
    }

    const activeFeatsList = getActiveFeats();
    const hasTWF = activeFeatsList.some(f => 
      typeof f === 'string' && (f.toLowerCase().includes('combate com duas armas') || f.toLowerCase().includes('two-weapon fighting'))
    ) || character?.fighting_style === 'Combate com Duas Armas' || (character as any)?.fightingStyle === 'Combate com Duas Armas';

    const baseDamage = atkToUse.damage || hero.damageDice || '1d6';
    const offHandDmgInfo = getOffHandDamageDice(baseDamage, hasTWF);

    if (targetEntity) {
      const success = processHeroAttackExecution(hero, targetEntity, atkToUse, {
        isOffHand: true,
        canUseNick: canUseNick,
        customDamageDice: offHandDmgInfo.diceStr
      });

      if (success) {
        setEntities(prev =>
          prev.map(e => e.id === hero.id ? { 
            ...e, 
            hasBonusAction: canUseNick ? e.hasBonusAction : false,
            usedNickThisTurn: canUseNick ? true : e.usedNickThisTurn
          } : e)
        );
        if (canUseNick) {
          addCombatLog('Mestre do Jogo', '⚔️ Maestria Nick (Corte Rápido)', 'O ataque extra foi realizado como parte da ação de Ataque, não consumindo sua Ação Bônus!', 'system');
        }
      }
      return;
    }

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return;

    let rangeCells = hero.range || 1;
    if (atkToUse) {
      rangeCells = getWeaponMaxRangeCells(atkToUse);
    }

    const monstersInRange = aliveMonsters.filter(m => getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm) <= rangeCells);
    if (monstersInRange.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', `Nenhum inimigo está no alcance de ${atkToUse?.name || offHandWeaponName}!`, 'system');
      return;
    }

    if (monstersInRange.length === 1) {
      handleHeroOffHandAttack(atkToUse, monstersInRange[0]);
    } else {
      setTargetCandidates(monstersInRange);
      setPendingAttackInfo({ type: 'offhand', overrideAtk: atkToUse });
      setShowTargetModal(true);
    }
  }, [activeEntity, activeLargeForm, addCombatLog, character, characterAttacks, entities, getActiveFeats, isBattleOver, isEntityVisible, isHeroTurn, processHeroAttackExecution, selectedAttackIndex, setEntities, setFloatingTexts, setPendingAttackInfo, setShowTargetModal, setTargetCandidates, weaponMasteryInfo]);

  // Ativar Ataque com Mão Inapta (Abrir modal ou atacar)
  const handleTriggerHeroOffHandAttack = useCallback((targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    const selectedAtk = characterAttacks[selectedAttackIndex] || characterAttacks[0];
    const usedPrimaryAtk = characterAttacks.find(a => (hero.attackedWeaponNamesThisTurn || []).includes(a.name));

    const isNickWeapon = selectedAtk?.mastery?.toLowerCase().includes('nick') || 
                         selectedAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('nick') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                         (weaponMasteryInfo && weaponMasteryInfo.name.toLowerCase().includes('nick'));
                         
    const canUseNick = Boolean(isNickWeapon && !hero.usedNickThisTurn);

    if (!hero.hasBonusAction && !canUseNick) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno e a maestria Nick já foi usada ou não se aplica a esta arma!', 'system');
      return;
    }

    const monsters = entities.filter(e => e.type === 'monster' && !e.isDead && e.currentHp > 0);
    const monstersInRange = monsters.filter(m => getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm) <= 1.5);

    if (monstersInRange.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', `Nenhum inimigo está no alcance para realizar o ataque com a mão inapta!`, 'system');
      return;
    }

    if (targetEntity) {
      handleHeroOffHandAttack(undefined, targetEntity);
    } else if (monstersInRange.length === 1) {
      handleHeroOffHandAttack(undefined, monstersInRange[0]);
    } else {
      setTargetCandidates(monstersInRange);
      setPendingAttackInfo({ type: 'offhand' });
      setShowTargetModal(true);
    }
  }, [activeEntity, activeLargeForm, addCombatLog, characterAttacks, entities, handleHeroOffHandAttack, isBattleOver, isHeroTurn, selectedAttackIndex, setPendingAttackInfo, setShowTargetModal, setTargetCandidates, weaponMasteryInfo]);

  return {
    handleHeroOffHandAttack,
    handleTriggerHeroOffHandAttack
  };
}
