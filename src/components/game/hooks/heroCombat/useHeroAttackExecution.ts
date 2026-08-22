import { useCallback } from 'react';
import { CombatEntity } from '../../../../game/types';
import { executeAttack, isTwoHandedWeaponLocal } from '../../../../game/combatEngine';
import { calculateCover } from '../../../../game/coverMechanics';
import {
  getWeaponMaxRangeCells,
  getDistanceBetweenEntities,
} from '../../../../game/combatUtils';
import { UseHeroCombatActionsProps } from './types';
import { handleThrownOrAmmunition } from './heroAttackAmmunitionHelper';
import { handlePostHeroAttackEffects } from './attackExecution/heroAttackEffectHandler';
import { handleHeroAttackRerollModals } from './attackExecution/heroAttackRerollHandler';

export function useHeroAttackExecution(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    character,
    weaponMasteryInfo,
    biome,
    isNight,
    torches,
    grid,
    activeAdvantageMode,
    gwmActive,
    activeLargeForm,
    isGoliath,
    goliathAncestryUses,
    isHalfling,
    hasHeroicInspiration,

    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    moveHeroDirection,
    consumeThrownWeapon,
    setDroppedLoot,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    consumeAmmunition,
    getActiveFeats,
    getHeroLightRadiusInCells,
    setRollAdvantageState,
    setPendingGoliathHitInfo,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
    setShowAttackModal,
    setPendingHalflingLuckInfo,
    setPendingHeroicInspirationInfo,
  } = props;

  const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
  const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

  // Processar Execução de Ataque do Herói
  const processHeroAttackExecution = useCallback((
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
  ): boolean => {
    let dist = getDistanceBetweenEntities(hero, targetEntity, character?.race, activeLargeForm);
    const maxRangeCells = getWeaponMaxRangeCells(atkToUse);
    const isPureRanged = atkToUse?.range && (atkToUse.range.includes('m/') || atkToUse.range.includes('m /') || atkToUse.name.includes('Arco') || atkToUse.name.includes('Besta') || atkToUse.name.includes('Funda'));

    if (dist > maxRangeCells && !isPureRanged && dist <= maxRangeCells + 1 && (hero.remainingMovement || 0) >= 1) {
      const dx = Math.sign(targetEntity.x - hero.x);
      const dy = Math.sign(targetEntity.y - hero.y);
      if (dx !== 0 || dy !== 0) {
        moveHeroDirection(dx, dy);
        const currentHero = activeEntity || hero;
        dist = getDistanceBetweenEntities(currentHero, targetEntity, character?.race, activeLargeForm);
      }
    }

    if (dist > maxRangeCells) {
      addCombatLog('Mestre do Jogo', '⚠️ Fora de Alcance', `O alvo está a ${dist * 1.5}m, mas o alcance máximo é ${maxRangeCells * 1.5}m.`, 'system');
      return false;
    }

    const isMelee = !isPureRanged;
    const heroReach = atkToUse ? getWeaponMaxRangeCells(atkToUse) : 1;
    if (hero.conditions?.includes('Voando') && isMelee && heroReach < 2) {
      addCombatLog('Mestre do Jogo', '⚠️ Voo (3m de altura)', 'Você está voando a 3m do chão e não consegue acertar alvos com armas de corpo a corpo de alcance padrão (1.5m)!', 'system');
      return false;
    }

    const isTwoHanded = atkToUse?.properties?.toLowerCase().includes('duas mãos') || 
                       atkToUse?.properties?.toLowerCase().includes('two-handed') || 
                       (atkToUse?.name && isTwoHandedWeaponLocal(atkToUse.name, atkToUse.properties));

    const activeFeatsList = getActiveFeats();
    const heroWithFeats: CombatEntity = {
      ...hero,
      feats: activeFeatsList,
      stats: {
        str: character?.strength ?? character?.str ?? hero.stats?.str ?? 10,
        dex: character?.dexterity ?? character?.dex ?? hero.stats?.dex ?? 10,
        con: character?.constitution ?? character?.con ?? hero.stats?.con ?? 10,
        int: character?.intelligence ?? character?.int ?? hero.stats?.int ?? 10,
        wis: character?.wisdom ?? character?.wis ?? hero.stats?.wis ?? 10,
        cha: character?.charisma ?? character?.cha ?? hero.stats?.cha ?? 10
      },
      fightingStyle: character?.fighting_style || character?.fightingStyle || hero.fightingStyle
    };

    const prelimCover = calculateCover(heroWithFeats, targetEntity, grid, entities);
    if (prelimCover.degree === 'total') {
      addCombatLog('Mestre do Jogo', '🛡️ Cobertura Total (Total Cover)', `${targetEntity.name} está em Cobertura Total em relação a você e não pode ser alvejado diretamente!`, 'system');
      return false;
    }

    const ammoRes = handleThrownOrAmmunition(
      atkToUse, hero, targetEntity, dist, character,
      consumeThrownWeapon, consumeAmmunition, checkAmmunitionRequirement, getCharacterAmmoCount, setDroppedLoot, addCombatLog
    );
    if (!ammoRes.canProceed) return false;

    let atkBonus = ammoRes.atkBonus;
    let dmgDice = options?.customDamageDice || ammoRes.dmgDice;
    let atkName = atkToUse?.name || 'Ataque com Arma';
    if (options?.isOffHand) atkName = `${atkName} (Mão Inapta)`;
    if (options?.isMastery && options?.masteryName) atkName = `${atkName} [Maestria: ${options.masteryName}]`;

    const atkRes = executeAttack(heroWithFeats, targetEntity, activeAdvantageMode, {
      name: atkName,
      attackBonus: atkBonus,
      damageDice: dmgDice,
      damageType: atkToUse?.damage_type || 'Físico',
      mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
      properties: atkToUse?.properties || undefined,
      range: atkToUse?.range || undefined,
      gwmToggled: gwmActive && isMelee && isTwoHanded,
      sharpshooterToggled: false
    }, {
      isDarkEnvironment: isDarkEnv,
      torches: torches,
      heroLightRadius: getHeroLightRadiusInCells(),
      heroX: hero.x,
      heroY: hero.y
    }, entities, grid);

    if (atkRes.isTotalCover) {
      addCombatLog('Mestre do Jogo', '🛡️ Cobertura Total (Total Cover)', atkRes.logDetail || `${targetEntity.name} está em Cobertura Total em relação a você!`, 'system');
      return false;
    }

    const applyAttackResult = (res: typeof atkRes) => {
      handlePostHeroAttackEffects({
        res,
        hero,
        targetEntity,
        atkToUse,
        character,
        activeFeatsList,
        options,
        isMelee,
        ammoRes,
        isGoliath,
        goliathAncestryUses,
        entities,
        activeLargeForm,
        weaponMasteryInfo,
        setRollAdvantageState,
        triggerAttackVisualEffect,
        setLatestRoll,
        addCombatLog,
        processDamageAndCheckKill,
        setPendingGoliathHitInfo,
        setEntities,
        setShowAttackModal,
        setShowTargetModal,
        setPendingAttackInfo,
        setTargetCandidates,
      });
    };

    const didHandleReroll = handleHeroAttackRerollModals({
      atkRes,
      isHalfling,
      hasHeroicInspiration,
      targetEntity,
      atkName,
      heroWithFeats,
      activeAdvantageMode,
      atkBonus,
      dmgDice,
      atkToUse,
      options,
      weaponMasteryInfo,
      gwmActive,
      isMelee,
      isTwoHanded,
      isDarkEnv,
      torches,
      heroLightRadius: getHeroLightRadiusInCells(),
      hero,
      entities,
      grid,
      setPendingHalflingLuckInfo,
      setPendingHeroicInspirationInfo,
      applyAttackResult,
    });

    if (didHandleReroll) {
      return true;
    }

    applyAttackResult(atkRes);
    return true;
  }, [
    activeAdvantageMode, activeEntity, activeLargeForm, addCombatLog, character, checkAmmunitionRequirement,
    consumeAmmunition, consumeThrownWeapon, entities, getActiveFeats, getCharacterAmmoCount, getHeroLightRadiusInCells,
    grid, goliathAncestryUses, gwmActive, hasHeroicInspiration, isDarkEnv, isGoliath, isHalfling, moveHeroDirection,
    processDamageAndCheckKill, setDroppedLoot, setEntities, setLatestRoll, setPendingAttackInfo, setPendingGoliathHitInfo,
    setPendingHalflingLuckInfo, setPendingHeroicInspirationInfo, setRollAdvantageState, setShowAttackModal, setShowTargetModal,
    setTargetCandidates, torches, triggerAttackVisualEffect, weaponMasteryInfo
  ]);

  return { processHeroAttackExecution };
}
