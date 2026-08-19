import { CombatEntity } from '../../../game/types';

export interface TurnManagementResult {
  nextEntityIndex: number;
  nextTurnRound: number;
  updatedEntities: CombatEntity[];
  isBattleOver?: boolean;
  isVictory?: boolean;
}

/**
 * Reseta os recursos (ações, movimento, atalhos de mestria) para o início do turno de uma entidade.
 */
export function resetEntityTurnResources(entity: CombatEntity): CombatEntity {
  const isGrappled = entity.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
  const hasSlow = entity.conditions.some(c => c === 'Lento' || c === 'Slow');
  const cleanedConditions = entity.conditions.filter(
    c => c !== 'Esquivando' && c !== 'Dodge' && c !== 'Desengajando' && c !== 'Lento' && c !== 'Slow'
  );
  
  const baseMovement = isGrappled ? 0 : (entity.speed || 6);
  const finalMovement = hasSlow ? Math.max(0, baseMovement - 2) : baseMovement;

  return {
    ...entity,
    conditions: cleanedConditions,
    remainingMovement: finalMovement,
    hasAction: true,
    hasBonusAction: true,
    hasReaction: true,
    hasAttackedThisTurn: false,
    attacksRemaining: 0,
    usedNickThisTurn: false,
    usedCleaveThisTurn: false,
    usedSavageAttackerThisTurn: false,
    usedPiercerThisTurn: false,
    usedTavernBrawlerRerollThisTurn: false,
    usedTavernBrawlerPushThisTurn: false,
    attackedWeaponNamesThisTurn: []
  };
}

/**
 * Verifica se a batalha terminou (todos os monstros mortos ou herói morto).
 */
export function checkBattleEndStatus(entities: CombatEntity[]): { isOver: boolean; isVictory: boolean; isDefeat: boolean } {
  const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead);
  const hero = entities.find(e => e.type === 'hero');

  if (aliveMonsters.length === 0) {
    return { isOver: true, isVictory: true, isDefeat: false };
  }

  if (hero && hero.isDead) {
    return { isOver: true, isVictory: false, isDefeat: true };
  }

  return { isOver: false, isVictory: false, isDefeat: false };
}

/**
 * Gerencia a progressão de turnos e rodadas no combate (D&D 5.5e).
 */
export function advanceCombatTurn(
  entities: CombatEntity[],
  activeEntityIndex: number,
  currentTurnRound: number
): TurnManagementResult {
  if (!entities || entities.length === 0) {
    return {
      nextEntityIndex: 0,
      nextTurnRound: currentTurnRound,
      updatedEntities: entities
    };
  }

  let nextIdx = activeEntityIndex;
  let roundIncrement = 0;

  for (let i = 1; i <= entities.length; i++) {
    const candidate = (activeEntityIndex + i) % entities.length;
    if (candidate === 0) {
      roundIncrement += 1;
    }
    if (entities[candidate] && !entities[candidate].isDead) {
      nextIdx = candidate;
      break;
    }
  }

  const updatedEntities = entities.map((ent, idx) => {
    if (idx === nextIdx) {
      return resetEntityTurnResources(ent);
    }
    return ent;
  });

  return {
    nextEntityIndex: nextIdx,
    nextTurnRound: currentTurnRound + roundIncrement,
    updatedEntities
  };
}

