import React, { useCallback } from 'react';
import { CombatEntity, CellData, BiomeType, WeatherType, LootItem, GridPosition } from '../../../game/types';
import { executeAttack, isTwoHandedWeaponLocal, isLightWeapon, getOffHandDamageDice } from '../../../game/combatEngine';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities, adjustDamageForDex, hasThrownProperty, getAttacksPerAction, getEntitySizeInSquares, getDamageTypeColor } from '../../../game/combatUtils';
import { playAttackSound } from '../../../lib/audio';

import { UseHeroCombatActionsProps } from './heroCombat/types';
import { useRacialCombatActions } from './heroCombat/useRacialCombatActions';
import { useClassCombatActions } from './heroCombat/useClassCombatActions';
import { useSpellsAndMasteryActions } from './heroCombat/useSpellsAndMasteryActions';
export type { UseHeroCombatActionsProps };

export function useHeroCombatActions(props: UseHeroCombatActionsProps) {
  const racialActions = useRacialCombatActions(props);
  const classActions = useClassCombatActions(props);

  const {
    handleAdrenalineRush,
    handleHealingHands,
    handleCelestialRevelation,
    handleExecuteBreathWeapon,
    handleOpenBreathWeaponModal
  } = racialActions;

  const {
    handleHeroChannelDivinity,
    handleHeroTacticalMind,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
    handleHeroIndomitable,
    handleHeroRecklessAttack,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
    handleHeroManeuver,
  } = classActions;
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    currentSelectedAttack,
    characterAttacks,
    selectedAttackIndex,
    weaponMasteryInfo,
    biome,
    isNight,
    torches,
    grid,
    activeAdvantageMode,
    gwmActive,
    sharpshooterActive,
    activeLargeForm,
    isGoliath,
    goliathAncestryUses,
    isHalfling,
    hasHeroicInspiration,
    isOrc,
    adrenalineRushUses,
    adrenalineRushMaxUses,
    healingHandsUses,
    celestialRevelationUses,
    channelDivinityUses,
    channelDivinityMaxUses,
    breathWeaponUses,
    breathWeaponDetails,
    spellSlots,
    spellSlotsMax,
    secondWindUses,
    secondWindMaxUses,
    indomitableUses,
    indomitableMaxUses,
    recklessAttackActive,
    bardicInspirationUses,
    bardicInspirationMaxUses,
    layOnHandsPool,
    layOnHandsMaxPool,
    focusPointsUses,
    focusPointsMaxUses,
    wildShapeUses,
    wildShapeMaxUses,
    superiorityDiceUses,
    superiorityDiceMaxUses,
    pendingTacticalMindInfo,
    isSfxEnabled,

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
    isEntityVisible,
    setRollAdvantageState,
    setPendingGoliathHitInfo,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
    setShowAttackModal,
    setPendingHalflingLuckInfo,
    setPendingHeroicInspirationInfo,
    setFloatingTexts,
    setAdrenalineRushUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setShowRevelationMenu,
    handleExecuteCelestialRevelation,
    setChannelDivinityUses,
    setSelectedBreathTargets,
    setBreathWeaponShape,
    setShowBreathWeaponModal,
    setBreathWeaponUses,
    setActiveEffects,
    setSpellSlots,
    setSecondWindUses,
    setPendingTacticalMindInfo,
    setShowTacticalMindAlertModal,
    setIndomitableUses,
    setRecklessAttackActive,
    setBardicInspirationUses,
    setLayOnHandsPool,
    setFocusPointsUses,
    setWildShapeUses,
    setSuperiorityDiceUses,
  } = props;

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

    const hasThrown = hasThrownProperty(atkToUse);
    const isThrownAttack = hasThrown && dist > 1;

    const isMelee = !isPureRanged && !isThrownAttack;
    const isRanged = isPureRanged || isThrownAttack;

    const heroReach = atkToUse ? getWeaponMaxRangeCells(atkToUse) : 1;
    if (hero.conditions?.includes('Voando') && isMelee && heroReach < 2) {
      addCombatLog('Mestre do Jogo', '⚠️ Voo (3m de altura)', 'Você está voando a 3m do chão e não consegue acertar alvos com armas de corpo a corpo de alcance padrão (1.5m)!', 'system');
      return false;
    }

    const strMod = Math.floor(((character.strength || 10) - 10) / 2);
    const dexMod = Math.floor(((character.dexterity || 10) - 10) / 2);

    let atkBonus = atkToUse?.attack_bonus !== undefined ? Number(atkToUse.attack_bonus) : hero.attackBonus;
    let dmgDice = options?.customDamageDice || atkToUse?.damage || hero.damageDice;

    if (isThrownAttack) {
      atkBonus = atkBonus - strMod + dexMod;
      dmgDice = adjustDamageForDex(dmgDice, strMod, dexMod);

      const thrownWeaponName = atkToUse?.name || 'Adaga';
      const weaponIcon = thrownWeaponName.toLowerCase().includes('machadinha') ? '🪓' :
                         thrownWeaponName.toLowerCase().includes('dardo') ? '🎯' : '🗡️';

      consumeThrownWeapon(thrownWeaponName);
      setDroppedLoot(prev => [...prev, {
        id: `thrown_${Date.now()}_${Math.random()}`,
        x: targetEntity.x,
        y: targetEntity.y,
        item: {
          id: `item_thrown_${Date.now()}`,
          name: thrownWeaponName,
          type: 'weapon',
          icon: weaponIcon,
          rarity: 'comum',
          value: 10,
          description: `Arma arremessada recuperável (${thrownWeaponName}). Pise no local para recuperá-la para o inventário.`
        },
        isCollected: false
      }]);
      addCombatLog(
        'Mestre do Jogo',
        '🪓 Arma Arremessada',
        `Você arremessou ${thrownWeaponName}! Ela caiu no chão em (${targetEntity.x}, ${targetEntity.y}) e poderá ser recuperada ao pisar no local.`,
        'loot'
      );
    } else {
      const ammoReq = checkAmmunitionRequirement(atkToUse);
      if (ammoReq) {
        const count = getCharacterAmmoCount(ammoReq);
        if (count <= 0) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Munição!', `Você não possui ${ammoReq.type} para usar ${atkToUse?.name || 'sua arma'}!`, 'system');
          return false;
        }
        consumeAmmunition(ammoReq);

        if (Math.random() < 0.5) {
          setDroppedLoot(prev => [...prev, {
            id: `ammo_recovered_${Date.now()}_${Math.random()}`,
            x: targetEntity.x,
            y: targetEntity.y,
            item: {
              id: `item_ammo_${Date.now()}`,
              name: `1x ${ammoReq.type}`,
              type: 'weapon',
              icon: '🏹',
              rarity: 'comum',
              value: 1,
              description: `Munição recuperada após o disparo (${ammoReq.type}).`
            },
            isCollected: false
          }]);
          addCombatLog(
            'Mestre do Jogo',
            '🏹 Munição Recuperada',
            `Uma unidade de ${ammoReq.type} foi disparada e caiu no chão em (${targetEntity.x}, ${targetEntity.y}). Poderá ser coletada!`,
            'loot'
          );
        }
      }
    }

    let atkName = atkToUse?.name || 'Ataque com Arma';
    if (options?.isOffHand) atkName = `${atkName} (Mão Inapta)`;
    if (options?.isMastery && options?.masteryName) atkName = `${atkName} [Maestria: ${options.masteryName}]`;

    const isTwoHanded = atkToUse?.properties?.toLowerCase().includes('duas mãos') || 
                       atkToUse?.properties?.toLowerCase().includes('two-handed') || 
                       (atkToUse?.name && isTwoHandedWeaponLocal(atkToUse.name, atkToUse.properties));

    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

    const atkRes = executeAttack(hero, targetEntity, activeAdvantageMode, {
      name: atkName,
      attackBonus: atkBonus,
      damageDice: dmgDice,
      damageType: atkToUse?.damage_type || 'Físico',
      mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
      properties: atkToUse?.properties || undefined,
      range: atkToUse?.range || undefined,
      gwmToggled: gwmActive && isMelee && isTwoHanded,
      sharpshooterToggled: sharpshooterActive && isRanged
    }, {
      isDarkEnvironment: isDarkEnv,
      torches: torches,
      heroLightRadius: getHeroLightRadiusInCells(),
      heroX: hero.x,
      heroY: hero.y
    }, entities, grid);

    const applyAttackResult = (res: typeof atkRes) => {
      setRollAdvantageState('normal');
      triggerAttackVisualEffect(
        { x: hero.x, y: hero.y },
        { x: targetEntity.x, y: targetEntity.y },
        isRanged,
        res.hit,
        res.damage,
        res.isCritical
      );

      setLatestRoll({
        id: Math.random().toString(),
        attackerName: hero.name,
        defenderName: targetEntity.name,
        logTitle: res.logTitle,
        logDetail: res.logDetail,
        isCritical: res.isCritical,
        isFumble: res.isFumble,
        damage: res.damage,
        hit: res.hit
      });

      addCombatLog(hero.name, res.logTitle, res.logDetail, 'attack');
      processDamageAndCheckKill(targetEntity.id, res.damage, hero.name, atkToUse?.damage_type || 'Cortante', 'hero');

      const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
      const showFire = gType === '' || gType.includes('fogo') || gType.includes('fire');
      const showFrost = gType === '' || gType.includes('gelo') || gType.includes('frost');
      const showHill = gType === '' || gType.includes('colina') || gType.includes('hill');

      const isTargetAlreadyProne = targetEntity.conditions?.some((c: string) => c === 'Caído' || c === 'Prone' || c === 'Caido');
      const isLargeOrSmaller = getEntitySizeInSquares(targetEntity.size) <= 2;

      const canUseHill = showHill && isLargeOrSmaller && !isTargetAlreadyProne;
      const hasHitAncestry = showFire || showFrost || canUseHill;

      const didHitWithAttackRoll = res.attackRollHit ?? (res.hit && !res.isGraze);

      if (isGoliath && goliathAncestryUses > 0 && didHitWithAttackRoll && res.damage > 0 && hasHitAncestry) {
        setPendingGoliathHitInfo({
          targetId: targetEntity.id,
          damage: res.damage
        });
      }

      setEntities(prev =>
        prev.map(e => {
          if (e.id === hero.id) {
            const newConditions = e.conditions.filter(c => c !== 'Invisível' && c !== 'Invisible');
            if (e.conditions.includes('Invisível') || e.conditions.includes('Invisible')) {
              addCombatLog(
                hero.name,
                '👁️ REVELADO AO ATACAR!',
                'Ao desferir um ataque, você revelou sua posição e perdeu a condição Invisível!',
                'system'
              );
            }

            const props = (atkToUse?.properties || '').toLowerCase();
            const hasLoading = props.includes('recarga') || props.includes('loading') || props.includes('carregar');
            const activeFeatsList = getActiveFeats();
            const hasCrossbowExpert = activeFeatsList.some((f: string) => f.toLowerCase().includes('bestas') || f.toLowerCase().includes('crossbow'));
            const baseMaxAtks = (hasLoading && !hasCrossbowExpert) ? 1 : getAttacksPerAction(character || e);
            const effectiveMaxAtks = baseMaxAtks;

            const currentWeapons = e.attackedWeaponNamesThisTurn || [];
            const updatedWeapons = atkToUse?.name ? [...currentWeapons, atkToUse.name] : currentWeapons;

            const currentWeaponsAction = e.attackedWeaponNamesThisAction || [];
            const updatedWeaponsAction = atkToUse?.name ? [...currentWeaponsAction, atkToUse.name] : currentWeaponsAction;

            if (options?.isCleave) {
              return {
                ...e,
                hasAttackedThisTurn: true,
                usedCleaveThisTurn: true,
                conditions: newConditions,
                attackedWeaponNamesThisTurn: updatedWeapons
              };
            }

            if (options?.isOffHand) {
              return {
                ...e,
                hasBonusAction: options.canUseNick ? e.hasBonusAction : false,
                hasAttackedThisTurn: true,
                offHandAttackUsedThisTurn: true,
                conditions: newConditions,
                attackedWeaponNamesThisTurn: updatedWeapons
              };
            }

            const forceZeroAttacks = hasLoading && !hasCrossbowExpert;

            if (forceZeroAttacks) {
              addCombatLog(
                'Mestre do Jogo',
                '🏹 Propriedade Recarga (Loading)',
                'Você só pode disparar uma peça de munição por ação com esta arma (Regra D&D 5.5e)! Ela consumiu todos os ataques deste turno.',
                'system'
              );
              return {
                ...e,
                hasAction: false,
                isActionSurgeActive: false,
                hasAttackedThisTurn: true,
                attacksRemaining: 0,
                conditions: newConditions,
                attackedWeaponNamesThisTurn: updatedWeapons,
                attackedWeaponNamesThisAction: updatedWeaponsAction
              };
            }

            const currentAttacksLeft = e.attacksRemaining || 0;
            if (currentAttacksLeft > 1) {
              const nextLeft = currentAttacksLeft - 1;
              addCombatLog('Mestre do Jogo', '⚔️ Ataque Extra!', `Você ainda tem ${nextLeft} ataque(s) nesta Ação!`, 'system');
              return {
                ...e,
                hasAction: false,
                isActionSurgeActive: false,
                hasAttackedThisTurn: true,
                attacksRemaining: nextLeft,
                conditions: newConditions,
                attackedWeaponNamesThisTurn: updatedWeapons,
                attackedWeaponNamesThisAction: updatedWeaponsAction
              };
            } else if (currentAttacksLeft === 1) {
              return {
                ...e,
                hasAction: false,
                isActionSurgeActive: false,
                hasAttackedThisTurn: true,
                attacksRemaining: 0,
                conditions: newConditions,
                attackedWeaponNamesThisTurn: updatedWeapons,
                attackedWeaponNamesThisAction: updatedWeaponsAction
              };
            } else {
              const maxAtks = effectiveMaxAtks;
              if (maxAtks > 1) {
                const nextLeft = maxAtks - 1;
                addCombatLog('Mestre do Jogo', '⚔️ Ataque Extra!', `Você ainda tem ${nextLeft} ataque(s) nesta Ação!`, 'system');
                return {
                  ...e,
                  hasAction: false,
                  isActionSurgeActive: false,
                  hasAttackedThisTurn: true,
                  attacksRemaining: nextLeft,
                  conditions: newConditions,
                  attackedWeaponNamesThisTurn: updatedWeapons,
                  attackedWeaponNamesThisAction: updatedWeaponsAction
                };
              } else {
                return {
                  ...e,
                  hasAction: false,
                  isActionSurgeActive: false,
                  hasAttackedThisTurn: true,
                  attacksRemaining: 0,
                  conditions: newConditions,
                  attackedWeaponNamesThisTurn: updatedWeapons,
                  attackedWeaponNamesThisAction: updatedWeaponsAction
                };
              }
            }
          }
          return e;
        })
      );

      setShowAttackModal(false);
      setShowTargetModal(false);
      setPendingAttackInfo(null);

      // Verificar elegibilidade para Maestria Cleave (Fender/Trespassar)
      const masteryName = options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined);
      const isCleaveWeapon = masteryName && (
        masteryName.toLowerCase().includes('cleave') || 
        masteryName.toLowerCase().includes('fender') || 
        masteryName.toLowerCase().includes('varrer') || 
        masteryName.toLowerCase().includes('trespassar')
      );

      const didCleaveHit = res.hit && !res.isGraze;
      if (hero.type === 'hero' && didCleaveHit && isCleaveWeapon && !hero.usedCleaveThisTurn && !options?.isCleave) {
        const rangeCells = getWeaponMaxRangeCells(atkToUse);
        const cleaveCandidates = entities.filter(m => {
          if (m.type !== 'monster' || m.isDead) return false;
          if (m.id === targetEntity.id) return false;
          const distToOriginal = Math.max(Math.abs(m.x - targetEntity.x), Math.abs(m.y - targetEntity.y));
          if (distToOriginal > 1) return false;
          const distToHero = getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm);
          if (distToHero > rangeCells) return false;
          return true;
        });

        if (cleaveCandidates.length > 0) {
          setTimeout(() => {
            setTargetCandidates(cleaveCandidates);
            setPendingAttackInfo({ 
              type: 'cleave', 
              overrideAtk: atkToUse, 
              originalTargetId: targetEntity.id 
            });
            setShowTargetModal(true);
            addCombatLog('Mestre do Jogo', '🪓 Maestria Cleave (Fender) Ativada!', `Você acertou um golpe com ${atkToUse?.name || 'sua arma'}! Pode realizar um ataque extra sem bônus de atributo no dano contra uma criatura adjacente qualificada.`, 'system');
          }, 600);
        }
      }
    };

    if (isHalfling && !atkRes.isTotalCover && !atkRes.logTitle?.includes('Cobertura Total') && atkRes.isFumble) {
      setPendingHalflingLuckInfo({
        title: `Sorte de Pequenino: Ataque contra ${targetEntity.name}`,
        description: `Você rolou um 1 natural (falha crítica) no ataque com ${atkName}!`,
        rollDetails: `${atkRes.logTitle}\n${atkRes.logDetail}`,
        onReroll: () => {
          const newAtkRes = executeAttack(hero, targetEntity, activeAdvantageMode, {
            name: atkName,
            attackBonus: atkBonus,
            damageDice: dmgDice,
            damageType: atkToUse?.damage_type || 'Físico',
            mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
            properties: atkToUse?.properties || undefined,
            range: atkToUse?.range || undefined,
            gwmToggled: gwmActive && isMelee && isTwoHanded,
            sharpshooterToggled: sharpshooterActive && isRanged
          }, {
            isDarkEnvironment: isDarkEnv,
            torches,
            heroLightRadius: getHeroLightRadiusInCells(),
            heroX: hero.x,
            heroY: hero.y
          }, entities, grid);
          applyAttackResult(newAtkRes);
        },
        onDecline: () => {
          applyAttackResult(atkRes);
        }
      });
      return true;
    }

    if (!atkRes.hit && !atkRes.isTotalCover && !atkRes.logTitle?.includes('Cobertura Total') && hasHeroicInspiration) {
      setPendingHeroicInspirationInfo({
        type: 'attack',
        title: `Ataque contra ${targetEntity.name}`,
        description: `Seu ataque com ${atkName} errou o alvo!`,
        rollDetails: `${atkRes.logTitle}\n${atkRes.logDetail}`,
        onReroll: () => {
          const newAtkRes = executeAttack(hero, targetEntity, 'advantage', {
            name: atkName,
            attackBonus: atkBonus,
            damageDice: dmgDice,
            damageType: atkToUse?.damage_type || 'Físico',
            mastery: options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined),
            properties: atkToUse?.properties || undefined,
            range: atkToUse?.range || undefined,
            gwmToggled: gwmActive && isMelee && isTwoHanded,
            sharpshooterToggled: sharpshooterActive && isRanged
          }, {
            isDarkEnvironment: isDarkEnv,
            torches,
            heroLightRadius: getHeroLightRadiusInCells(),
            heroX: hero.x,
            heroY: hero.y
          }, entities, grid);
          applyAttackResult(newAtkRes);
        },
        onDecline: () => {
          applyAttackResult(atkRes);
        }
      });
      return true;
    }

    applyAttackResult(atkRes);
    return true;
  }, [
    activeAdvantageMode,
    activeEntity,
    activeLargeForm,
    addCombatLog,
    adjustDamageForDex,
    biome,
    character,
    checkAmmunitionRequirement,
    consumeAmmunition,
    consumeThrownWeapon,
    entities,
    executeAttack,
    getActiveFeats,
    getCharacterAmmoCount,
    getDamageTypeColor,
    getDistanceBetweenEntities,
    getEntitySizeInSquares,
    getHeroLightRadiusInCells,
    getWeaponMaxRangeCells,
    grid,
    goliathAncestryUses,
    gwmActive,
    hasHeroicInspiration,
    hasThrownProperty,
    isGoliath,
    isHalfling,
    isNight,
    isTwoHandedWeaponLocal,
    moveHeroDirection,
    processDamageAndCheckKill,
    setDroppedLoot,
    setEntities,
    setLatestRoll,
    setPendingGoliathHitInfo,
    setPendingHalflingLuckInfo,
    setPendingHeroicInspirationInfo,
    setRollAdvantageState,
    setShowAttackModal,
    setShowTargetModal,
    setPendingAttackInfo,
    setTargetCandidates,
    sharpshooterActive,
    torches,
    triggerAttackVisualEffect,
    weaponMasteryInfo
  ]);

  const spellsAndMasteryActions = useSpellsAndMasteryActions(props, { processHeroAttackExecution });
  const {
    handleHeroMagicSpell,
    handleHeroWeaponMastery
  } = spellsAndMasteryActions;

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
    getWeaponMaxRangeCells,
    isBattleOver,
    isEntityVisible,
    isHeroTurn,
    processHeroAttackExecution,
    setPendingAttackInfo,
    setShowTargetModal,
    setTargetCandidates
  ]);

  // Outras funções utilitárias do Herói
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

  // 1.1 Ataque com Segunda Arma / Mão Inapta (Ação Bônus - Combate com Duas Armas Leves)
  const handleHeroOffHandAttack = useCallback((overrideAtk?: any, targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    const selectedAtk = characterAttacks[selectedAttackIndex] || characterAttacks[0];
    const selectedAtkName = selectedAtk?.name || '';
    const offHandWeaponName = selectedAtkName;

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

    const usedPrimaryAtk = characterAttacks.find(a => (hero.attackedWeaponNamesThisTurn || []).includes(a.name));
    
    const isNickWeapon = atkToUse?.mastery?.toLowerCase().includes('nick') || 
                         atkToUse?.mastery?.toLowerCase().includes('corte rápido') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('nick') ||
                         usedPrimaryAtk?.mastery?.toLowerCase().includes('corte rápido') ||
                         (weaponMasteryInfo && weaponMasteryInfo.name.toLowerCase().includes('nick'));
    
    const canUseNick = Boolean(isNickWeapon && !hero.usedNickThisTurn);

    if (!canUseNick && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno e a maestria Nick já foi usada ou não se aplica a esta arma!', 'system');
      return;
    }

    const attackedWeapons = hero.attackedWeaponNamesThisTurn || [];
    const allAttacksWereLight = attackedWeapons.length > 0 && attackedWeapons.every((name: string) => isLightWeapon(name));

    if (!allAttacksWereLight) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Ataque com Mão Inapta Bloqueado',
        'Você só pode realizar o ataque com a segunda arma se todos os seus ataques anteriores neste turno tiverem sido feitos com armas leves!',
        'system'
      );
      return;
    }

    if (!isLightWeapon(selectedAtkName) || attackedWeapons.includes(selectedAtkName)) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Seleção de Arma Inválida',
        'Você precisa selecionar uma arma leve diferente da que usou para seus ataques principais para realizar o ataque com a segunda arma!',
        'system'
      );
      return;
    }

    let slots: Record<string, string | null> = {};
    if (character?.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character?.equipmentSlots) {
      slots = character.equipmentSlots;
    }

    const w1Name = attackedWeapons[0] || slots['empunhadura_1'] || selectedAtk?.name || character?.equipped_weapon || character?.equippedWeapon || 'Arma Principal';
    const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
    const hasShieldEquipped = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

    if (!offHandWeaponName || offHandWeaponName.toLowerCase().trim() === w1Name.toLowerCase().trim()) {
      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: hero.x,
        y: hero.y,
        text: !offHandWeaponName ? '⚠️ Escolha arma na troca!' : '⚠️ Arma igual à principal!',
        color: '#f87171',
        progress: 0
      }]);
      return;
    }

    setEntities(prev => prev.map(e => {
      if (e.id === hero.id) {
        return { 
          ...e, 
          ac: hasShieldEquipped ? Math.max(10, e.armor_class - 2) : e.armor_class,
          offHandAttackUsedThisTurn: true 
        };
      }
      return e;
    }));

    if (hasShieldEquipped) {
      addCombatLog(
        hero.name,
        '🛡️ ESCUDO INATIVO NESTE TURNO!',
        `O escudo (${rawW2}) permanece equipado no inventário, mas fica inativo perdendo o bônus de CA (-2 CA) durante o ataque com a mão inábil, voltando a funcionar no próximo turno!`,
        'system'
      );
    }

    const activeFeatsList = getActiveFeats();
    const hasTWF = activeFeatsList.some(f => 
      typeof f === 'string' && (
        f.toLowerCase().includes('combate com duas armas') || 
        f.toLowerCase().includes('two-weapon fighting')
      )
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

    const monstersInRange = aliveMonsters.filter(m => {
      const dist = getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm);
      return dist <= rangeCells;
    });

    if (monstersInRange.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', `Nenhum inimigo está no alcance de ${atkToUse?.name || offHandWeaponName} para realizar o ataque com a mão inapta!`, 'system');
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

  // 1.15 Ataque Extra de Maestria Cleave (Fender/Trespassar)
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

  // 1.2 Atacar com Segunda Arma / Mão Inapta (Ação Bônus)
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

    const attackedWeapons = hero.attackedWeaponNamesThisTurn || [];
    const allAttacksWereLight = attackedWeapons.length > 0 && attackedWeapons.every((name: string) => isLightWeapon(name));
    if (!allAttacksWereLight) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Ataque com Mão Inapta Bloqueado',
        'Você só pode realizar o ataque com a segunda arma se todos os seus ataques anteriores neste turno tiverem sido feitos com armas leves!',
        'system'
      );
      return;
    }

    const selectedAtkName = selectedAtk?.name || '';
    if (!isLightWeapon(selectedAtkName) || attackedWeapons.includes(selectedAtkName)) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Seleção de Arma Inválida',
        'Você precisa selecionar uma arma leve diferente da que usou para seus ataques principais para realizar o ataque com a segunda arma!',
        'system'
      );
      return;
    }

    let slots: Record<string, string | null> = {};
    if (character?.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character?.equipmentSlots) {
      slots = character.equipmentSlots;
    }

    const offHandWeaponName = selectedAtk?.name || slots['empunhadura_2'] || '';
    const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
    const hasShieldEquipped = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

    if (!offHandWeaponName) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Escolha uma arma na tela de troca de armas',
        `Nenhuma arma foi selecionada na tela de troca de armas. Você deve escolher uma arma para realizar o ataque com a mão inábil!`,
        'system'
      );
      return;
    }

    if (hasShieldEquipped) {
      setEntities(prev => prev.map(e => {
        if (e.id === hero.id) {
          return { ...e, ac: Math.max(10, e.armor_class - 2) };
        }
        return e;
      }));

      addCombatLog(
        hero.name,
        '🛡️ ESCUDO INATIVO NESTE TURNO!',
        `O escudo (${rawW2}) permanece equipado no inventário, mas fica inativo perdendo o bônus de CA (-2 CA) durante o ataque com a mão inábil, voltando a funcionar no próximo turno!`,
        'system'
      );
    }

    const monsters = entities.filter(e => e.type === 'monster' && !e.isDead && e.currentHp > 0);
    const monstersInRange = monsters.filter(m => {
      const dist = getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm);
      return dist <= 1.5;
    });

    if (monstersInRange.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', `Nenhum inimigo está no alcance para realizar o ataque com a mão inapta!`, 'system');
      return;
    }

    let atkToUse = characterAttacks.find((a: any) => {
      const nameLower = (a.name || '').toLowerCase();
      const offHandLower = offHandWeaponName.toLowerCase();
      return nameLower === offHandLower || nameLower.includes(offHandLower) || offHandLower.includes(nameLower);
    });

    if (!atkToUse) {
      atkToUse = {
        name: offHandWeaponName,
        attack_bonus: hero.attackBonus,
        damage: isLightWeapon(offHandWeaponName) ? (offHandWeaponName.toLowerCase().includes('adaga') ? '1d4' : '1d6') : (hero.damageDice || '1d6'),
        damage_type: 'Cortante',
        range: '1.5m'
      };
    }

    if (monstersInRange.length === 1) {
      handleHeroOffHandAttack(atkToUse, monstersInRange[0]);
    } else {
      setTargetCandidates(monstersInRange);
      setPendingAttackInfo({ type: 'offhand', overrideAtk: atkToUse });
      setShowTargetModal(true);
    }
  }, [activeEntity, activeLargeForm, addCombatLog, character, characterAttacks, entities, handleHeroOffHandAttack, isBattleOver, isHeroTurn, selectedAttackIndex, setEntities, setPendingAttackInfo, setShowTargetModal, setTargetCandidates, weaponMasteryInfo]);

  return {
    processHeroAttackExecution,
    handleHeroAttack,
    handleHeroOffHandAttack,
    handleHeroCleaveAttack,
    handleTriggerHeroOffHandAttack,
    handleHeroDash,
    handleAdrenalineRush,
    handleHealingHands,
    handleCelestialRevelation,
    handleHeroChannelDivinity,
    handleExecuteBreathWeapon,
    handleOpenBreathWeaponModal,
    handleHeroMagicSpell,
    handleHeroWeaponMastery,
    handleHeroTacticalMind,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
    handleHeroIndomitable,
    handleHeroRecklessAttack,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
    handleHeroManeuver,
  };
}
