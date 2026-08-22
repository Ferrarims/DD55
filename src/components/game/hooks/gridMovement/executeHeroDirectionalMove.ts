import React from 'react';
import { CombatEntity, CellData } from '../../../../game/types';
import { getDistanceBetweenEntities, getEntitySizeInSquares } from '../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../lib/api/references';
import { playMoveSound } from '../../../../lib/audio';

interface ExecuteHeroDirectionalMoveProps {
  dx: number;
  dy: number;
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  activeEntityIndex: number;
  isBattleOver: boolean;
  character: any;
  activeLargeForm: boolean;
  isSfxEnabled: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  checkOpportunityAttacks: (hero: CombatEntity, targetX: number, targetY: number, isBattleOver: boolean) => void;
  checkGridTriggers: (entityId: string, tx: number, ty: number) => void;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  expandMapIfNeeded?: (x: number, y: number) => void;
}

export function executeHeroDirectionalMove({
  dx,
  dy,
  entities,
  setEntities,
  grid,
  activeEntityIndex,
  isBattleOver,
  character,
  activeLargeForm,
  isSfxEnabled,
  addCombatLog,
  checkOpportunityAttacks,
  checkGridTriggers,
  setMovementStepsCount,
  setTotalGameTurns,
  expandMapIfNeeded,
}: ExecuteHeroDirectionalMoveProps) {
  const activeEntity = entities[activeEntityIndex];
  const isHeroActive = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;
  const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
  if (hasLivingMonsters && !isBattleOver && !isHeroActive) {
    addCombatLog('Mestre do Jogo', '⚠️ Turno Inimigo', 'Aguarde o seu turno para se mover!', 'system');
    return;
  }

  const hero = entities.find(e => e.type === 'hero' && !e.isDead);
  if (!hero || hero.isDead) return;

  const isImmobilized = hero.conditions?.some(c => 
    c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled' ||
    c === 'Contido' || c === 'Restringido' || c === 'Restrained' ||
    c === 'Paralisado' || c === 'Paralyzed' ||
    c === 'Petrificado' || c === 'Petrified' ||
    c === 'Atordoado' || c === 'Stunned' ||
    c === 'Inconsciente' || c === 'Unconscious'
  );
  if (isImmobilized) {
    const mainCond = hero.conditions.find(c => ['Agarrado', 'Agarrada', 'Grappled', 'Contido', 'Restringido', 'Restrained', 'Paralisado', 'Paralyzed', 'Petrificado', 'Petrified', 'Atordoado', 'Stunned', 'Inconsciente', 'Unconscious'].includes(c)) || 'Imobilizado';
    addCombatLog('Mestre do Jogo', `⚠️ Condição: ${mainCond}`, `Você está sob a condição ${mainCond}! Seu deslocamento é 0.`, 'system');
    return;
  }

  const isFrightened = hero.conditions?.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened');
  if (isFrightened && hasLivingMonsters) {
    const currentClosestDist = Math.min(
      999,
      ...entities
        .filter(e => e.type === 'monster' && !e.isDead)
        .map(m => getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm))
    );
    const newClosestDist = Math.min(
      999,
      ...entities
        .filter(e => e.type === 'monster' && !e.isDead)
        .map(m =>
          getDistanceBetweenEntities({ ...hero, x: hero.x + dx, y: hero.y + dy }, m, character?.race, activeLargeForm)
        )
    );
    if (newClosestDist < currentClosestDist) {
      addCombatLog(
        'Mestre do Jogo',
        '😱 Amedrontado',
        'Você está Amedrontado e não pode se aproximar voluntariamente da fonte do medo!',
        'system'
      );
      return;
    }
  }

  const isProne = hero.conditions?.some(c => c === 'Caído' || c === 'Prone');
  const grappledVictim = entities.find(e => e.type === 'monster' && !e.isDead && e.grappledById === hero.id);

  const targetX = hero.x + dx;
  const targetY = hero.y + dy;

  const heroSize = getEntitySizeInSquares(
    hero.type === 'hero'
      ? hero.size || (activeLargeForm ? 'Grande' : character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')
      : hero.size || 'Médio'
  );

  for (let r = 0; r < heroSize; r++) {
    for (let c = 0; c < heroSize; c++) {
      const tx = targetX + c;
      const ty = targetY + r;

      if (tx < 0 || tx >= (grid[0]?.length || 150) || ty < 0 || ty >= grid.length) {
        return;
      }

      const cell = grid[ty]?.[tx];
      if (!cell || cell.terrain === 'wall' || cell.movementCost === Infinity) {
        return;
      }

      const occupied = entities.find(e => {
        if (e.id === hero.id || e.isDead || (grappledVictim && e.id === grappledVictim.id)) return false;
        const eSize = getEntitySizeInSquares(
          e.type === 'hero'
            ? e.size || (activeLargeForm ? 'Grande' : character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')
            : e.size || 'Médio'
        );
        return tx >= e.x && tx < e.x + eSize && ty >= e.y && ty < e.y + eSize;
      });

      if (occupied) {
        return;
      }
    }
  }

  let stepCost = 1;
  for (let r = 0; r < heroSize; r++) {
    for (let c = 0; c < heroSize; c++) {
      const cell = grid[targetY + r]?.[targetX + c];
      if (cell && cell.movementCost > stepCost) {
        stepCost = cell.movementCost;
      }
    }
  }

  // Rastejar sob Caído dobra o custo de movimento (+1 pé por pé)
  if (isProne) {
    stepCost += 1;
  }
  // Arrastar criatura agarrada custa 1 pé extra por pé de movimento
  if (grappledVictim) {
    stepCost += 1;
  }

  if (hasLivingMonsters && !isBattleOver && (hero.remainingMovement <= 0 || hero.remainingMovement < stepCost)) {
    addCombatLog('Mestre do Jogo', '⚠️ Movimento Esgotado', 'Seu deslocamento acabou neste turno!', 'system');
    return;
  }

  checkOpportunityAttacks(hero, targetX, targetY, isBattleOver);

  const prevHeroX = hero.x;
  const prevHeroY = hero.y;

  setEntities(prev =>
    prev.map(e => {
      if (e.id === hero.id) {
        return {
          ...e,
          x: targetX,
          y: targetY,
          remainingMovement: isBattleOver ? e.remainingMovement : Math.max(0, e.remainingMovement - stepCost),
        };
      }
      if (grappledVictim && e.id === grappledVictim.id) {
        return {
          ...e,
          x: prevHeroX,
          y: prevHeroY
        };
      }
      return e;
    })
  );

  if (isSfxEnabled) playMoveSound();
  setMovementStepsCount(prev => prev + 1);
  if (isBattleOver) {
    setTotalGameTurns(prev => prev + 1);
  }

  checkGridTriggers(hero.id, targetX, targetY);
  expandMapIfNeeded?.(targetX, targetY);
}
