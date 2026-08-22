import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';
import { CombatEntity } from '../../../../../game/types';

export function useBarbarianAndManeuverActions(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    character,
    recklessAttackActive,
    superiorityDiceUses,
    superiorityDiceMaxUses,
    addCombatLog,
    processDamageAndCheckKill,
    isEntityVisible,
    setRecklessAttackActive,
    setSuperiorityDiceUses,
    setTargetCandidates,
    setPendingAttackInfo,
    setShowTargetModal,
  } = props;

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
    handleHeroRecklessAttack,
    handleHeroManeuver,
  };
}
