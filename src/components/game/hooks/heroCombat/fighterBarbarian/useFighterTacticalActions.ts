import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';
import { updateCharacter } from '../../../../../lib/api/characterService';

export function useFighterTacticalActions(props: UseHeroCombatActionsProps) {
  const {
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    secondWindUses,
    secondWindMaxUses,
    pendingTacticalMindInfo,
    indomitableUses,
    indomitableMaxUses,
    addCombatLog,
    setSecondWindUses,
    setPendingTacticalMindInfo,
    setShowTacticalMindAlertModal,
    setIndomitableUses,
  } = props;

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
            ac: (e.ac ?? e.armor_class) + 3,
            armor_class: (e.ac ?? e.armor_class) + 3
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

  return {
    handleHeroTacticalMind,
    handleAcceptTacticalMindAlert,
    handleDeclineTacticalMindAlert,
    handleHeroIndomitable,
  };
}
