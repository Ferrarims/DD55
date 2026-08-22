import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';

export function useOrcAndAasimarActions(props: UseHeroCombatActionsProps) {
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
    addCombatLog,
    setFloatingTexts,
    setAdrenalineRushUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setShowRevelationMenu,
    handleExecuteCelestialRevelation,
  } = props;

  // 1. Pico de Adrenalina (Orc)
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

  // 2. Mãos Curativas (Aasimar)
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

  // 3. Revelação Celestial (Aasimar)
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

  return {
    handleAdrenalineRush,
    handleHealingHands,
    handleCelestialRevelation,
  };
}
