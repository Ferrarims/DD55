import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from './types';
import { CombatEntity } from '../../../../game/types';
import { playAttackSound } from '../../../../lib/audio';
import { getDamageTypeColor } from '../../../../game/combatUtils';
import { isTargetInLine, isTargetInCone } from '../../../../lib/mechanics/breathWeaponCalculator';

export function useRacialCombatActions(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    isOrc,
    adrenalineRushUses,
    adrenalineRushMaxUses,
    healingHandsUses,
    celestialRevelationUses,
    breathWeaponUses,
    breathWeaponDetails,
    isSfxEnabled,

    addCombatLog,
    processDamageAndCheckKill,
    isEntityVisible,
    setFloatingTexts,
    setAdrenalineRushUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setShowRevelationMenu,
    handleExecuteCelestialRevelation,
    setSelectedBreathTargets,
    setBreathWeaponShape,
    setShowBreathWeaponModal,
    setBreathWeaponUses,
    setActiveEffects,
  } = props;

  // Pico de Adrenalina (Orc)
  const handleAdrenalineRush = useCallback(() => {
    const inCombat = !isBattleOver;
    const hero = inCombat ? activeEntity : entities.find(e => e.type === 'hero');
    if (!hero || hero.isDead) return;

    if (!isOrc) return;

    if (adrenalineRushUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já usou todas as cargas de Pico de Adrenalina até um Descanso Curto ou Longo!', 'system');
      return;
    }

    if (inCombat && !isHeroTurn) {
      addCombatLog('Mestre do Jogo', '⚠️ Não é seu turno', 'Aguarde o seu turno para usar Pico de Adrenalina!', 'system');
      return;
    }

    if (inCombat && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno!', 'system');
      return;
    }

    const level = Number(character?.level) || hero.level || 1;
    const pb = character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
    const currentTempHp = hero.tempHp || 0;
    const newTempHp = Math.max(currentTempHp, 3);

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            remainingMovement: e.remainingMovement + e.speed,
            tempHp: newTempHp,
            hasBonusAction: inCombat ? false : e.hasBonusAction
          };
        }
        return e;
      })
    );

    setAdrenalineRushUses(prev => Math.max(0, prev - 1));

    addCombatLog(
      hero.name,
      '⚡ PICO DE ADRENALINA (ADRENALINE RUSH)!',
      `Usou uma Ação Bônus para realizar a Disparada (Dash) (+${hero.speed * 1.5}m de movimento adicional) e ganhou +${pb} Pontos de Vida Temporários! (${adrenalineRushUses - 1}/${adrenalineRushMaxUses} usos restantes)`,
      'system'
    );

    setFloatingTexts(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        x: hero.x,
        y: hero.y,
        text: `🏃 Dash! +${pb} PV Temp`,
        color: '#f59e0b',
        progress: 0
      }
    ]);
  }, [activeEntity, addCombatLog, adrenalineRushMaxUses, adrenalineRushUses, character?.level, character?.proficiencyBonus, entities, isBattleOver, isHeroTurn, isOrc, setAdrenalineRushUses, setEntities, setFloatingTexts]);

  // Mãos Curativas (Aasimar)
  const handleHealingHands = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (healingHandsUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já usou suas Mãos Curativas!', 'system');
      return;
    }
    
    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const adjacentAllies = entities.filter(e => e.type === 'hero' && !e.isDead && e.currentHp < e.maxHp && e.id !== hero.id && Math.max(Math.abs(e.x - hero.x), Math.abs(e.y - hero.y)) <= 1);
    
    let target = hero;
    if (adjacentAllies.length > 0) {
      target = adjacentAllies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
    } else if (hero.currentHp >= hero.maxHp) {
       addCombatLog('Mestre do Jogo', '⚠️', 'Você já está com a vida no máximo e não há aliados adjacentes feridos!', 'system');
       return;
    }

    const pb = character?.pb || Math.floor(((character?.level || 1) - 1) / 4) + 2;
    let healAmount = 0;
    let healRolls = [];
    for(let i=0; i<pb; i++){
       const roll = Math.floor(Math.random() * 4) + 1;
       healAmount += roll;
       healRolls.push(roll);
    }

    const newHp = Math.min(target.maxHp, target.currentHp + healAmount);
    const recovered = newHp - target.currentHp;

    setEntities(prev =>
      prev.map(e => {
        if (e.id === target.id) {
          return { ...e, currentHp: newHp };
        }
        if (e.id === hero.id && target.id !== hero.id) {
          return { ...e, hasAction: false };
        }
        return e;
      })
    );

    if (target.id === hero.id) {
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasAction: false } : e));
    }

    setHealingHandsUses(prev => prev - 1);

    addCombatLog(
      hero.name,
      '✨ MÃOS CURATIVAS!',
      `Canalizou energia divina em ${target.name}! Curou +${recovered} PV (Rolagem: [${healRolls.join(', ')}] = ${healAmount}).`,
      'system'
    );
    
    setFloatingTexts(prev => [...prev, {
       id: Math.random().toString(),
       x: target.x,
       y: target.y,
       text: `+${recovered} PV`,
       color: '#34d399',
       progress: 0
    }]);
  }, [activeEntity, addCombatLog, character?.level, character?.pb, entities, healingHandsUses, isBattleOver, isHeroTurn, setEntities, setFloatingTexts, setHealingHandsUses]);

  // Aasimar: Revelação Celestial
  const handleCelestialRevelation = useCallback((type: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica') => {
    if (!isBattleOver && !isHeroTurn) return;
    const hero = isBattleOver ? entities.find(e => e.type === 'hero') : activeEntity;

    if (!hero || hero.type !== 'hero' || hero.isDead) return;

    if (celestialRevelationUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já usou sua Revelação Celestial!', 'system');
      return;
    }
    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    setCelestialRevelationUses(prev => prev - 1);
    setShowRevelationMenu(false);
    handleExecuteCelestialRevelation(type);
  }, [activeEntity, addCombatLog, celestialRevelationUses, entities, handleExecuteCelestialRevelation, isBattleOver, isHeroTurn, setCelestialRevelationUses, setShowRevelationMenu]);

  // Executar Baforada Dracônica (Arma de Sopro)
  const handleExecuteBreathWeapon = useCallback((shape: 'cone' | 'line', selectedTargets: CombatEntity[], primaryTarget?: CombatEntity) => {
    const inCombat = !isBattleOver;
    const hero = inCombat ? activeEntity : entities.find(e => e.type === 'hero');
    if (!hero || hero.isDead) return;

    if (inCombat && !isHeroTurn) return;

    if (breathWeaponUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Usos Esgotados', 'Você já usou todas as baforadas para este descanso!', 'system');
      return;
    }
    if (inCombat && !hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    if (!breathWeaponDetails) return;

    const maxDist = shape === 'cone' ? 3 : 6;
    const shapeLabel = shape === 'cone' ? 'Cone de 4.5m (15ft)' : 'Linha de 9m (30ft)';

    if (primaryTarget) {
      const invalidTarget = selectedTargets.find(t => {
        if (t.id === primaryTarget.id) return false;
        if (shape === 'line') return !isTargetInLine(hero, t, primaryTarget, maxDist);
        if (shape === 'cone') return !isTargetInCone(hero, t, primaryTarget, maxDist);
        return false;
      });

      if (invalidTarget) {
        const msg = `O alvo ${invalidTarget.name} não está na trajetória da baforada!`;
        alert(msg);
        addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora da Área', msg, 'system');
        return;
      }
    }

    let totalDamageRoll = 0;
    const rolls: number[] = [];
    for (let i = 0; i < breathWeaponDetails.diceCount; i++) {
      const r = Math.floor(Math.random() * 10) + 1;
      rolls.push(r);
      totalDamageRoll += r;
    }

    selectedTargets.forEach(target => {
      const targetDexMod = target.saves?.dex ?? Math.floor(((target.stats?.dex || 10) - 10) / 2);
      let saveRollD20 = Math.floor(Math.random() * 20) + 1;
      if (target.conditions?.includes('Esquivando') || target.conditions?.includes('Dodge')) {
        const d2 = Math.floor(Math.random() * 20) + 1;
        saveRollD20 = Math.max(saveRollD20, d2);
      }
      const targetExhaustion = target.exhaustionLevel || 0;
      const saveTotal = saveRollD20 + targetDexMod - (targetExhaustion * 2);
      const passedSave = saveTotal >= breathWeaponDetails.dc;

      const finalDamage = passedSave ? Math.floor(totalDamageRoll / 2) : totalDamageRoll;

      const saveMsg = passedSave
        ? `🎲 Teste DEX (CD ${breathWeaponDetails.dc}): d20(${saveRollD20})+${targetDexMod}=${saveTotal} (Passou! Metade do dano: ${finalDamage})`
        : `🎲 Teste DEX (CD ${breathWeaponDetails.dc}): d20(${saveRollD20})+${targetDexMod}=${saveTotal} (Falhou! Dano total: ${finalDamage})`;

      addCombatLog(
        hero.name,
        `🔥 BAFORADA (${shapeLabel}) em ${target.name}!`,
        `Exalou energia de ${breathWeaponDetails.damageType} [Dano rolado: ${totalDamageRoll} (${rolls.join('+')})]. ${saveMsg}`,
        'attack'
      );

      processDamageAndCheckKill(target.id, finalDamage, hero.name, breathWeaponDetails.damageType, 'hero');

      const dtColor = getDamageTypeColor(breathWeaponDetails.damageType);
      setFloatingTexts(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: target.x,
          y: target.y,
          text: `-${finalDamage}`,
          color: dtColor.primary,
          progress: 0
        }
      ]);
    });

    let avgTargetX = hero.x + 3;
    let avgTargetY = hero.y;
    if (selectedTargets.length > 0) {
      avgTargetX = selectedTargets.reduce((sum, t) => sum + t.x, 0) / selectedTargets.length;
      avgTargetY = selectedTargets.reduce((sum, t) => sum + t.y, 0) / selectedTargets.length;
      if (avgTargetX === hero.x && avgTargetY === hero.y) {
        avgTargetX += 3;
      }
    }

    setActiveEffects(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        type: shape === 'cone' ? 'breath_cone' : 'breath_line',
        startX: hero.x,
        startY: hero.y,
        endX: avgTargetX,
        endY: avgTargetY,
        progress: 0,
        hit: true,
        damageType: breathWeaponDetails.damageType
      }
    ]);

    if (isSfxEnabled) playAttackSound();

    setBreathWeaponUses(prev => Math.max(0, prev - 1));
    if (inCombat) {
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, hasAction: false } : e));
    }
    setShowBreathWeaponModal(false);
  }, [activeEntity, addCombatLog, breathWeaponDetails, breathWeaponUses, isBattleOver, isHeroTurn, isSfxEnabled, processDamageAndCheckKill, setActiveEffects, setBreathWeaponUses, setEntities, setFloatingTexts, setShowBreathWeaponModal]);

  const handleOpenBreathWeaponModal = useCallback(() => {
    setSelectedBreathTargets([]);
    setBreathWeaponShape('cone');
    setShowBreathWeaponModal(true);
  }, [setBreathWeaponShape, setShowBreathWeaponModal, setSelectedBreathTargets]);

  return {
    handleAdrenalineRush,
    handleHealingHands,
    handleCelestialRevelation,
    handleExecuteBreathWeapon,
    handleOpenBreathWeaponModal
  };
}
