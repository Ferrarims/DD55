import { useCallback } from 'react';
import { CombatEntity, CellData, GridPosition } from '../../../../game/types';
import { executeAttack } from '../../../../game/combatEngine';

export interface UseOpportunityAttackResolverProps {
  pendingOpportunityAttack: any;
  setPendingOpportunityAttack: (val: any) => void;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  grid: CellData[][];
  torches: GridPosition[];
  getHeroLightRadiusInCells: () => number;
  addCombatLog: (actorName: string, title: string, detail: string, type?: any) => void;
  triggerAttackVisualEffect: (
    from: GridPosition,
    to: GridPosition,
    isRanged: boolean,
    hit: boolean,
    damage: number,
    isCritical?: boolean
  ) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (
    targetType: 'hero' | 'monster',
    damage: number,
    attackerName: string,
    damageType: string,
    targetMonsterId?: string,
    overrideHitDice?: string
  ) => void;
  checkGridTriggers: (monsterId: string, x: number, y: number) => void;
  advanceTurn: () => void;
}

export function useOpportunityAttackResolver({
  pendingOpportunityAttack,
  setPendingOpportunityAttack,
  entities,
  setEntities,
  grid,
  torches,
  getHeroLightRadiusInCells,
  addCombatLog,
  triggerAttackVisualEffect,
  setLatestRoll,
  processDamageAndCheckKill,
  checkGridTriggers,
  advanceTurn
}: UseOpportunityAttackResolverProps) {
  const handleResolveOpportunityAttack = useCallback((accepted: boolean) => {
    if (!pendingOpportunityAttack) return;

    const { monster, triggerStep, decision, hero, atkToUse, isDarkEnv } = pendingOpportunityAttack;

    let finalMonsterHp = monster.currentHp;
    let isMonsterDead = false;
    let heroOpportunityResult: any = null;

    if (accepted) {
      // 1. Executa o ataque de oportunidade
      const atkRes = executeAttack(hero, monster, 'normal', atkToUse, {
        isDarkEnvironment: isDarkEnv,
        torches: torches,
        heroLightRadius: getHeroLightRadiusInCells(),
        heroX: hero.x,
        heroY: hero.y
      }, entities, grid);

      heroOpportunityResult = {
        damage: atkRes.damage,
        hit: atkRes.hit,
        isCritical: atkRes.isCritical,
        logTitle: `[Ataque de Oportunidade] ` + atkRes.logTitle,
        logDetail: atkRes.logDetail,
        triggerStep: triggerStep
      };

      if (atkRes.hit) {
        finalMonsterHp = Math.max(0, finalMonsterHp - atkRes.damage);
        isMonsterDead = finalMonsterHp <= 0;
      }
    }

    // 2. Atualiza as entidades
    setEntities(prev =>
      prev.map(ent => {
        if (ent.id === monster.id) {
          return {
            ...ent,
            x: isMonsterDead ? triggerStep.x : decision.newPosition.x,
            y: isMonsterDead ? triggerStep.y : decision.newPosition.y,
            currentHp: finalMonsterHp,
            isDead: isMonsterDead,
            hasAction: false,
            remainingMovement: 0
          };
        }
        let nextEnt = { ...ent };
        if (ent.type === 'hero') {
          if (accepted) {
            nextEnt.hasReaction = false;
          }
          if (!isMonsterDead && decision.attackExecuted && decision.attackResult && decision.attackResult.hit && decision.attackResult.damage > 0) {
            setTimeout(() => {
              processDamageAndCheckKill(
                'hero',
                decision.attackResult!.damage,
                monster.name,
                'Cortante',
                monster.id
              );
            }, 50);
          }
        }
        return nextEnt;
      })
    );

    // 3. Registra logs e gera os efeitos visuais de ataque do herói
    if (accepted && heroOpportunityResult) {
      addCombatLog(
        hero.name,
        heroOpportunityResult.logTitle,
        heroOpportunityResult.logDetail,
        heroOpportunityResult.hit ? 'damage' : 'attack'
      );
      addCombatLog(
        hero.name,
        '🛡️ REAÇÃO GASTA',
        'Você utilizou sua Reação para realizar um Ataque de Oportunidade contra o inimigo em movimento.',
        'system'
      );
      triggerAttackVisualEffect(
        { x: hero.x, y: hero.y },
        { x: heroOpportunityResult.triggerStep.x, y: heroOpportunityResult.triggerStep.y },
        false,
        heroOpportunityResult.hit,
        heroOpportunityResult.damage,
        heroOpportunityResult.isCritical
      );
    }

    // 4. Se não morreu e se movimentou, checa os gatilhos de grid
    if (!isMonsterDead && (decision.newPosition.x !== monster.x || decision.newPosition.y !== monster.y)) {
      checkGridTriggers(monster.id, decision.newPosition.x, decision.newPosition.y);
    }

    // 5. Ataque de retorno do monstro caso tenha sobrevivido e atacado
    if (!isMonsterDead && decision.attackExecuted && decision.attackResult) {
      const dist = Math.max(
        Math.abs(decision.newPosition.x - hero.x),
        Math.abs(decision.newPosition.y - hero.y)
      );
      const isMonsterRanged = dist > 1.5;
      triggerAttackVisualEffect(
        { x: decision.newPosition.x, y: decision.newPosition.y },
        { x: hero.x, y: hero.y },
        isMonsterRanged,
        decision.attackResult.hit,
        decision.attackResult.damage,
        decision.attackResult.isCritical
      );

      setLatestRoll({
        id: Math.random().toString(),
        attackerName: monster.name,
        defenderName: hero.name,
        logTitle: decision.attackResult.logTitle,
        logDetail: decision.attackResult.logDetail,
        isCritical: decision.attackResult.isCritical,
        isFumble: decision.attackResult.isFumble,
        damage: decision.attackResult.damage,
        hit: decision.attackResult.hit
      });
    }

    if (decision.logActionName) {
      addCombatLog(monster.name, decision.logActionName, decision.logDetail, 'attack');
    }

    // Limpa o estado
    setPendingOpportunityAttack(null);

    // Avança o turno
    const delayTime = decision.attackExecuted ? 600 : decision.logActionName ? 300 : 50;
    setTimeout(() => {
      advanceTurn();
    }, delayTime);

  }, [
    pendingOpportunityAttack,
    setEntities,
    addCombatLog,
    triggerAttackVisualEffect,
    setLatestRoll,
    processDamageAndCheckKill,
    checkGridTriggers,
    advanceTurn,
    torches,
    grid,
    getHeroLightRadiusInCells,
    setPendingOpportunityAttack
  ]);

  return {
    handleResolveOpportunityAttack
  };
}
