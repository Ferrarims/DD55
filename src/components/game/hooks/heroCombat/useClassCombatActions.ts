import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from './types';
import { CombatEntity } from '../../../../game/types';
import { updateCharacter } from '../../../../lib/api/characterService';

export function useClassCombatActions(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    channelDivinityUses,
    channelDivinityMaxUses,
    secondWindUses,
    secondWindMaxUses,
    pendingTacticalMindInfo,
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

    addCombatLog,
    processDamageAndCheckKill,
    isEntityVisible,
    setChannelDivinityUses,
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
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
  } = props;

  // Canalizar Divindade (Clérigo / Paladino)
  const handleHeroChannelDivinity = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (channelDivinityUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já utilizou suas cargas de Canalizar Divindade!', 'system');
      return;
    }

    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const remaining = channelDivinityUses - 1;
    setChannelDivinityUses(remaining);

    const healAmount = Math.floor(Math.random() * 8) + 1 + Math.floor(Math.random() * 8) + 1 + (hero.level || 1);
    const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
    const recovered = newHp - hero.currentHp;

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            currentHp: newHp,
            hasAction: false
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '✨ CANALIZAR DIVINDADE!',
      `Canalizou energia divina restaurando ${recovered} PV! (Usos restantes: ${remaining}/${channelDivinityMaxUses})`,
      'heal'
    );
  }, [activeEntity, addCombatLog, channelDivinityMaxUses, channelDivinityUses, isBattleOver, isHeroTurn, setChannelDivinityUses, setEntities]);

  // Mente Tática (Tactical Mind - Guerreiro Nív 2+)
  const handleHeroTacticalMind = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (secondWindUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Mente Tática consome 1 uso de Retomar o Fôlego, e seus usos estão esgotados!', 'system');
      return;
    }

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

    const bonusRoll = Math.floor(Math.random() * 10) + 1;
    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            attackBonus: e.attackBonus + bonusRoll
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🧠 MENTE TÁTICA (TACTICAL MIND)!',
      `Gastou 1 uso de Retomar o Fôlego para canalizar foco tático! Somou +${bonusRoll} (1d10) de bônus em suas jogadas neste turno! (Retomar o Fôlego restante: ${remaining}/${secondWindMaxUses})`,
      'system'
    );
  }, [activeEntity, addCombatLog, character, isBattleOver, isHeroTurn, secondWindMaxUses, secondWindUses, setEntities, setSecondWindUses]);

  const handleAcceptTacticalMindAlert = useCallback(() => {
    if (!pendingTacticalMindInfo) return;
    if (secondWindUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Mente Tática consome 1 uso de Retomar o Fôlego, e seus usos estão esgotados!', 'system');
      setShowTacticalMindAlertModal(false);
      return;
    }

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

    const bonusRoll = Math.floor(Math.random() * 10) + 1;
    const newTotal = pendingTacticalMindInfo.rollTotal + bonusRoll;
    const passed = newTotal >= pendingTacticalMindInfo.dc;

    if (passed) {
      addCombatLog(
        activeEntity?.name || 'Guerreiro',
        '🧠 MENTE TÁTICA BEM-SUCEDIDA!',
        `Gastou 1 uso de Retomar o Fôlego para somar +${bonusRoll} (1d10) ao ${pendingTacticalMindInfo.checkName}. Novo total: ${newTotal} vs CD ${pendingTacticalMindInfo.dc} (Passou! O uso foi consumido).`,
        'system'
      );
      pendingTacticalMindInfo.onApplyBonus(bonusRoll);
    } else {
      setSecondWindUses(secondWindUses);
      addCombatLog(
        activeEntity?.name || 'Guerreiro',
        '🧠 MENTE TÁTICA (AINDA FALHOU)',
        `Tentou aplicar o bônus de +${bonusRoll} (1d10) ao ${pendingTacticalMindInfo.checkName}, totalizando ${newTotal} vs CD ${pendingTacticalMindInfo.dc}. Como o teste ainda falhou, o uso de Retomar o Fôlego foi POUPADO (${secondWindUses}/${secondWindMaxUses})!`,
        'system'
      );
      pendingTacticalMindInfo.onDecline();
    }

    setShowTacticalMindAlertModal(false);
    setPendingTacticalMindInfo(null);
  }, [activeEntity?.name, addCombatLog, character, pendingTacticalMindInfo, secondWindMaxUses, secondWindUses, setPendingTacticalMindInfo, setSecondWindUses, setShowTacticalMindAlertModal]);

  const handleDeclineTacticalMindAlert = useCallback(() => {
    if (pendingTacticalMindInfo) {
      addCombatLog(
        activeEntity?.name || 'Guerreiro',
        '🧠 Mente Tática Recusada',
        `Optou por não gastar Retomar o Fôlego no ${pendingTacticalMindInfo.checkName}.`,
        'system'
      );
      pendingTacticalMindInfo.onDecline();
    }
    setShowTacticalMindAlertModal(false);
    setPendingTacticalMindInfo(null);
  }, [activeEntity?.name, addCombatLog, pendingTacticalMindInfo, setPendingTacticalMindInfo, setShowTacticalMindAlertModal]);

  // Indomável (Indomitable - Guerreiro Nív 9+)
  const handleHeroIndomitable = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (indomitableUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já gastou todas as suas cargas de Indomável!', 'system');
      return;
    }

    const remaining = indomitableUses - 1;
    setIndomitableUses(remaining);

    const heroLevel = character?.level || 1;
    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            ac: e.armor_class + 3
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🛡️ INDOMÁVEL (INDOMITABLE)!',
      `Recusou a derrota! Ganhou +${heroLevel} de bônus indomável e +3 de CA neste combate! (Usos restantes: ${remaining}/${indomitableMaxUses})`,
      'system'
    );
  }, [activeEntity, addCombatLog, character?.level, indomitableMaxUses, indomitableUses, isBattleOver, isHeroTurn, setEntities, setIndomitableUses]);

  // Ataque Imprudente (Reckless Attack - Bárbaro Nív 2+)
  const handleHeroRecklessAttack = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    setRecklessAttackActive(prev => !prev);
    const nextState = !recklessAttackActive;

    addCombatLog(
      hero.name,
      nextState ? '🪓 ATAQUE IMPRUDENTE ATIVADO!' : '🪓 ATAQUE IMPRUDENTE DESATIVADO',
      nextState
        ? 'Abandonou toda a defesa por força bruta! Seus ataques corpo a corpo possuem VANTAGEM neste turno, mas inimigos também atacam você com vantagem.'
        : 'Retornou à postura de combate normal.',
      'system'
    );
  }, [activeEntity, addCombatLog, isBattleOver, isHeroTurn, recklessAttackActive, setRecklessAttackActive]);

  // Inspiração Bárdica (Bardic Inspiration - Bardo)
  const handleHeroBardicInspiration = useCallback(() => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead) || activeEntity;
    if (!hero || hero.isDead) return;

    if (!isBattleOver && !isHeroTurn) return;

    if (bardicInspirationUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Suas cargas de Inspiração Bárdica acabaram!', 'system');
      return;
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno!', 'system');
      return;
    }

    const remaining = bardicInspirationUses - 1;
    setBardicInspirationUses(remaining);

    const dieSize = (character?.level || 1) >= 15 ? 12 : (character?.level || 1) >= 10 ? 10 : (character?.level || 1) >= 5 ? 8 : 6;
    const inspireRoll = Math.floor(Math.random() * dieSize) + 1;

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            hasBonusAction: isBattleOver ? e.hasBonusAction : false,
            ac: e.armor_class + 2,
            attackBonus: e.attackBonus + inspireRoll
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🪕 INSPIRAÇÃO BÁRDICA!',
      `Tocou uma canção heroica ganhando d${dieSize} (+${inspireRoll}) em ataque e +2 na CA! (Usos restantes: ${remaining}/${bardicInspirationMaxUses})`,
      'heal'
    );
  }, [activeEntity, addCombatLog, bardicInspirationMaxUses, bardicInspirationUses, character?.level, entities, isBattleOver, isHeroTurn, setBardicInspirationUses, setEntities]);

  // Imposição de Mãos (Lay on Hands - Paladino)
  const handleHeroLayOnHands = useCallback(() => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead) || activeEntity;
    if (!hero || hero.isDead) return;

    if (!isBattleOver && !isHeroTurn) return;

    if (layOnHandsPool <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Reserva Esgotada', 'Sua reserva de cura de Imposição de Mãos está vazia!', 'system');
      return;
    }

    if (!isBattleOver && !hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const healAmount = Math.min(layOnHandsPool, 5);
    const remaining = layOnHandsPool - healAmount;
    setLayOnHandsPool(remaining);

    const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
    const recovered = newHp - hero.currentHp;

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            currentHp: newHp,
            hasAction: isBattleOver ? e.hasAction : false
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '✨ IMPOSIÇÃO DE MÃOS!',
      `Tocou as próprias feridas com luz sagrada restaurando ${recovered} PV! (Reserva restante: ${remaining}/${layOnHandsMaxPool} PV)`,
      'heal'
    );
  }, [activeEntity, addCombatLog, entities, isBattleOver, isHeroTurn, layOnHandsMaxPool, layOnHandsPool, setEntities, setLayOnHandsPool]);

  // Rajada de Golpes / Ki (Flurry of Blows - Monge)
  const handleHeroFlurryOfBlows = useCallback((targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (focusPointsUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Pontos de Foco Esgotados', 'Seus Pontos de Foco (Ki) estão esgotados!', 'system');
      return;
    }

    if (!hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno!', 'system');
      return;
    }

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return;

    if (targetEntity) {
      const remaining = focusPointsUses - 1;
      setFocusPointsUses(remaining);

      const dieSize = (character?.level || 1) >= 17 ? 12 : (character?.level || 1) >= 11 ? 10 : (character?.level || 1) >= 5 ? 8 : 6;
      const dexMod = Math.max(1, Math.floor(((character?.dexterity || 10) - 10) / 2));
      const dmg = Math.floor(Math.random() * dieSize) + 1 + dexMod;

      addCombatLog(
        hero.name,
        `👊 RAJADA DE GOLPES em ${targetEntity.name}!`,
        `Gastou 1 Ponto de Foco e desferiu um ataque desarmado devastador causando ${dmg} de dano! (Foco restante: ${remaining}/${focusPointsMaxUses})`,
        'attack'
      );
      processDamageAndCheckKill(targetEntity.id, dmg, hero.name, 'Concussão', 'hero');

      setEntities(prev =>
        prev.map(e => {
          if (e.id === hero.id) return { ...e, hasBonusAction: false };
          return e;
        })
      );
      setShowTargetModal(false);
      setPendingAttackInfo(null);
      return;
    }

    const adjacentMonsters = aliveMonsters.filter(m => Math.max(Math.abs(hero.x - m.x), Math.abs(hero.y - m.y)) <= 1);
    if (adjacentMonsters.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', 'Nenhum inimigo está adjacente para Artes Marciais!', 'system');
      return;
    }

    if (adjacentMonsters.length === 1) {
      handleHeroFlurryOfBlows(adjacentMonsters[0]);
    } else {
      setTargetCandidates(adjacentMonsters);
      setPendingAttackInfo({ type: 'weapon', overrideAtk: { name: 'Rajada de Golpes (Desarmado)', damage: '1d6+DES' } });
      setShowTargetModal(true);
    }
  }, [activeEntity, addCombatLog, character?.dexterity, character?.level, entities, focusPointsMaxUses, focusPointsUses, isBattleOver, isEntityVisible, isHeroTurn, processDamageAndCheckKill, setEntities, setFocusPointsUses, setPendingAttackInfo, setShowTargetModal, setTargetCandidates]);

  // Forma Selvagem (Wild Shape - Druida)
  const handleHeroWildShape = useCallback(() => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (wildShapeUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Suas cargas de Forma Selvagem se esgotaram!', 'system');
      return;
    }

    if (!hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Sua Ação Bônus já foi gasta neste turno!', 'system');
      return;
    }

    const remaining = wildShapeUses - 1;
    setWildShapeUses(remaining);

    const tempHpGain = (character?.level || 1) * 4;
    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            tempHp: e.tempHp + tempHpGain,
            ac: e.armor_class + 1,
            hasBonusAction: false
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🐻 FORMA SELVAGEM (WILD SHAPE)!',
      `Transformou-se em uma besta primal recebendo +${tempHpGain} PV Temporários e +1 na CA! (Usos restantes: ${remaining}/${wildShapeMaxUses})`,
      'heal'
    );
  }, [activeEntity, addCombatLog, character?.level, isBattleOver, isHeroTurn, setEntities, setWildShapeUses, wildShapeMaxUses, wildShapeUses]);

  // Manobra Tática (Battle Master)
  const handleHeroManeuver = useCallback((targetEntity?: CombatEntity) => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (superiorityDiceUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Dados Esgotados', 'Seus Dados de Superioridade estão esgotados!', 'system');
      return;
    }

    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return;

    if (targetEntity) {
      const remaining = superiorityDiceUses - 1;
      setSuperiorityDiceUses(remaining);

      const dieSize = (character?.level || 1) >= 18 ? 12 : (character?.level || 1) >= 10 ? 10 : 8;
      const maneuverDmg = Math.floor(Math.random() * dieSize) + 1 + Math.floor(Math.random() * 6) + 1 + 3;

      addCombatLog(
        hero.name,
        `⚔️ MANOBRA TÁTICA em ${targetEntity.name}!`,
        `Gastou 1 Dado de Superioridade (1d${dieSize}) e executou Golpe Ameaçador/Prostrar causando ${maneuverDmg} de Dano Físico! (Dados restantes: ${remaining}/${superiorityDiceMaxUses})`,
        'attack'
      );
      processDamageAndCheckKill(targetEntity.id, maneuverDmg, hero.name, 'Concussão', 'hero');

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

    const adjacentMonsters = aliveMonsters.filter(m => Math.max(Math.abs(hero.x - m.x), Math.abs(hero.y - m.y)) <= 1);
    if (adjacentMonsters.length === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora de Alcance', 'Nenhum inimigo está adjacente para uma Manobra Tática!', 'system');
      return;
    }

    if (adjacentMonsters.length === 1) {
      handleHeroManeuver(adjacentMonsters[0]);
    } else {
      setTargetCandidates(adjacentMonsters);
      setPendingAttackInfo({ type: 'weapon', overrideAtk: { name: 'Manobra Tática (Mestre da Batalha)', damage: '1d8+1d8+FOR' } });
      setShowTargetModal(true);
    }
  }, [activeEntity, addCombatLog, character?.level, entities, isBattleOver, isEntityVisible, isHeroTurn, processDamageAndCheckKill, setEntities, setPendingAttackInfo, setShowTargetModal, setSuperiorityDiceUses, setTargetCandidates, superiorityDiceMaxUses, superiorityDiceUses]);

  return {
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
  };
}
