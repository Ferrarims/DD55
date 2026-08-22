import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';
import { CombatEntity } from '../../../../../game/types';

export function useNaturalAndMonkActions(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    focusPointsUses,
    focusPointsMaxUses,
    wildShapeUses,
    wildShapeMaxUses,
    addCombatLog,
    processDamageAndCheckKill,
    isEntityVisible,
    setFocusPointsUses,
    setWildShapeUses,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
  } = props;

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
            ac: (e.ac ?? e.armor_class) + 1,
            armor_class: (e.ac ?? e.armor_class) + 1,
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

  return {
    handleHeroFlurryOfBlows,
    handleHeroWildShape,
  };
}
