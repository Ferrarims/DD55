import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';

export function useDivineHeroActions(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    channelDivinityUses,
    channelDivinityMaxUses,
    bardicInspirationUses,
    bardicInspirationMaxUses,
    layOnHandsPool,
    layOnHandsMaxPool,
    addCombatLog,
    setChannelDivinityUses,
    setBardicInspirationUses,
    setLayOnHandsPool,
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
            ac: (e.ac ?? e.armor_class) + 2,
            armor_class: (e.ac ?? e.armor_class) + 2,
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

  return {
    handleHeroChannelDivinity,
    handleHeroBardicInspiration,
    handleHeroLayOnHands,
  };
}
