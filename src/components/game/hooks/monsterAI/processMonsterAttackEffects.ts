import { CombatEntity, GridPosition } from '../../../../game/types';

export function processMonsterAttackAndVisuals({
  decision,
  monster,
  hero,
  currentProps,
}: {
  decision: any;
  monster: CombatEntity;
  hero: CombatEntity;
  currentProps: any;
}) {
  if (decision.attackExecuted && decision.attackResult && decision.attackResult.hit && decision.attackResult.damage > 0) {
    setTimeout(() => {
      currentProps.processDamageAndCheckKill(
        'hero',
        decision.attackResult.damage,
        monster.name,
        'Cortante',
        monster.id
      );
    }, 50);
  }

  if (decision.attackExecuted && decision.attackResult) {
    const dist = Math.max(
      Math.abs(decision.newPosition.x - hero.x),
      Math.abs(decision.newPosition.y - hero.y)
    );
    const isMonsterRanged = dist > 1.5;
    currentProps.triggerAttackVisualEffect(
      { x: decision.newPosition.x, y: decision.newPosition.y },
      { x: hero.x, y: hero.y },
      isMonsterRanged,
      decision.attackResult.hit,
      decision.attackResult.damage,
      decision.attackResult.isCritical
    );

    currentProps.setLatestRoll({
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
    currentProps.addCombatLog(monster.name, decision.logActionName, decision.logDetail, 'attack');
  }
}
