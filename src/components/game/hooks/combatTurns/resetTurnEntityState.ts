import { CombatEntity } from '../../../../game/types';

interface ResetTurnEntityStateProps {
  prevEntities: CombatEntity[];
  targetNextIdx: number;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
}

export function resetTurnEntityState({
  prevEntities,
  targetNextIdx,
  addCombatLog,
}: ResetTurnEntityStateProps): CombatEntity[] {
  return prevEntities.map((e, idx) => {
    let isStillGrappled = e.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
    let currentConditions = [...e.conditions];
    let currentGrappledById = e.grappledById;

    // Verificar se o agarrador ainda existe e está ao alcance
    if (isStillGrappled && currentGrappledById) {
      const grappler = prevEntities.find(g => g.id === currentGrappledById);
      if (!grappler || grappler.isDead) {
        currentConditions = currentConditions.filter(c => c !== 'Agarrado' && c !== 'Agarrada' && c !== 'Grappled');
        currentGrappledById = undefined;
        isStillGrappled = false;
      } else {
        const dist = Math.max(Math.abs(e.x - grappler.x), Math.abs(e.y - grappler.y));
        const maxReach = grappler.range || 1;
        if (dist > maxReach) {
          currentConditions = currentConditions.filter(c => c !== 'Agarrado' && c !== 'Agarrada' && c !== 'Grappled');
          currentGrappledById = undefined;
          isStillGrappled = false;
        }
      }
    }

    if (idx === targetNextIdx) {
      const hasSlow = currentConditions.some(c => c === 'Lento' || c === 'Slow');
      const cleanedConditions = currentConditions.filter(c => c !== 'Esquivando' && c !== 'Dodge' && c !== 'Desengajando' && c !== 'Lento' && c !== 'Slow');
      
      const isImmobilized = cleanedConditions.some(c => 
        c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled' ||
        c === 'Contido' || c === 'Restringido' || c === 'Restrained' ||
        c === 'Paralisado' || c === 'Paralyzed' ||
        c === 'Petrificado' || c === 'Petrified' ||
        c === 'Atordoado' || c === 'Stunned' ||
        c === 'Inconsciente' || c === 'Unconscious'
      );

      const isIncapacitated = cleanedConditions.some(c => 
        c === 'Incapacitado' || c === 'Incapacitated' ||
        c === 'Paralisado' || c === 'Paralyzed' ||
        c === 'Petrificado' || c === 'Petrified' ||
        c === 'Atordoado' || c === 'Stunned' ||
        c === 'Inconsciente' || c === 'Unconscious'
      );

      const exhaustion = e.exhaustionLevel || 0;
      const isDeadByExhaustion = exhaustion >= 6;

      let baseMovement = isImmobilized ? 0 : e.speed;
      if (!isImmobilized && exhaustion > 0) {
        baseMovement = Math.max(0, baseMovement - exhaustion);
      }
      const finalMovement = hasSlow ? Math.max(0, baseMovement - 2) : baseMovement;

      if (hasSlow) {
        addCombatLog('Mestre do Jogo', '🐢 Efeito de Lento', `${e.name} iniciou o turno sob o efeito Lento (Slow), reduzindo seu deslocamento em 3m (2 células) para este turno!`, 'system');
      }

      if (isDeadByExhaustion) {
        addCombatLog('Mestre do Jogo', '💀 Morte por Exaustão', `${e.name} atingiu o Nível 6 de Exaustão e sucumbiu!`, 'kill');
      }

      return {
        ...e,
        isDead: e.isDead || isDeadByExhaustion,
        currentHp: isDeadByExhaustion ? 0 : e.currentHp,
        remainingMovement: isDeadByExhaustion ? 0 : finalMovement,
        hasAction: !isIncapacitated && !isDeadByExhaustion,
        hasBonusAction: !isIncapacitated && !isDeadByExhaustion,
        hasReaction: !isIncapacitated && !isDeadByExhaustion,
        hasAttackedThisTurn: false,
        attacksRemaining: 0,
        usedSavageAttackerThisTurn: false,
        usedPiercerThisTurn: false,
        usedTavernBrawlerRerollThisTurn: false,
        usedTavernBrawlerPushThisTurn: false,
        offHandAttackUsedThisTurn: false,
        usedCleaveThisTurn: false,
        usedNickThisTurn: false,
        attackedWeaponNamesThisTurn: [],
        attackedWeaponNamesThisAction: [],
        conditions: cleanedConditions,
        grappledById: currentGrappledById
      };
    }

    return {
      ...e,
      conditions: currentConditions,
      grappledById: currentGrappledById
    };
  });
}
