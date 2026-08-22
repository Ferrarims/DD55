import React from 'react';
import { CombatEntity, CellData } from '../../../../game/types';
import { getDistanceBetweenEntities, getEntitySizeInSquares, getWeaponMaxRangeCells } from '../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../lib/api/references';

export interface UseHeroCellClickInteractionProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  activeEntityIndex: number;
  isBattleOver: boolean;
  character: any;
  activeLargeForm: boolean;
  isTeleportTargetMode: boolean;
  isGoliath: boolean;
  restPoints: any[];
  droppedLoot: any[];
  chests: any[];
  hazards?: any[];
  handleDisarmHazard?: (id: string) => void;
  currentSelectedAttack: any;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  processHeroAttackExecution: (hero: CombatEntity, targetMonster: CombatEntity, atkToUse: any) => void;
  collectLootItem: (id: string) => void;
  openChest: (id: string) => void;
  setPendingRestPointId: (id: string | null) => void;
  setIsTeleportTargetMode: (val: boolean) => void;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  isEntityVisible: (e: CombatEntity) => boolean;
  checkGridTriggers: (entityId: string, tx: number, ty: number) => void;
  moveHeroDirection: (dx: number, dy: number) => void;
}

export function useHeroCellClickInteraction({
  entities,
  setEntities,
  grid,
  activeEntityIndex,
  isBattleOver,
  character,
  activeLargeForm,
  isTeleportTargetMode,
  isGoliath,
  restPoints,
  droppedLoot,
  chests,
  hazards,
  handleDisarmHazard,
  currentSelectedAttack,
  addCombatLog,
  setFloatingTexts,
  processHeroAttackExecution,
  collectLootItem,
  openChest,
  setPendingRestPointId,
  setIsTeleportTargetMode,
  setGoliathAncestryUses,
  isEntityVisible,
  checkGridTriggers,
  moveHeroDirection,
}: UseHeroCellClickInteractionProps) {
  const handleCellClick = (x: number, y: number) => {
    const activeEntity = entities[activeEntityIndex];
    const isHeroActive = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;
    const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
    if (hasLivingMonsters && !isBattleOver && !isHeroActive) {
      addCombatLog('Mestre do Jogo', '⚠️ Turno Inimigo', 'Aguarde o seu turno para interagir!', 'system');
      return;
    }

    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero || hero.isDead) return;

    if (isTeleportTargetMode && isGoliath) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist > 6) {
        addCombatLog('Mestre do Jogo', '⚠️ Fora de Alcance', 'O destino do teleporte deve ser até 9m (6 quadrados).', 'system');
        return;
      }

      const heroSize = getEntitySizeInSquares(hero.size || 'Médio');
      for (let dx = 0; dx < heroSize; dx++) {
        for (let dy = 0; dy < heroSize; dy++) {
          const cx = x + dx;
          const cy = y + dy;
          if (cx < 0 || cx >= (grid[0]?.length || 150) || cy < 0 || cy >= grid.length) {
            addCombatLog('Mestre do Jogo', '⚠️ Fora dos Limites', 'O espaço selecionado fica fora dos limites!', 'system');
            return;
          }
          const cCell = grid[cy]?.[cx];
          if (!cCell || cCell.terrain === 'wall' || cCell.movementCost === Infinity) {
            addCombatLog('Mestre do Jogo', '⚠️ Terreno Bloqueado', 'O espaço selecionado é obstruído por obstáculos!', 'system');
            return;
          }
          const cOccupied = entities.find(e => {
            if (e.isDead || e.id === hero.id) return false;
            const eSize = getEntitySizeInSquares(
              e.type === 'hero'
                ? e.size || (activeLargeForm ? 'Grande' : character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')
                : e.size || 'Médio'
            );
            return cx >= e.x && cx < e.x + eSize && cy >= e.y && cy < e.y + eSize;
          });
          if (cOccupied) {
            addCombatLog('Mestre do Jogo', '⚠️ Espaço Ocupado', `Espaço obstruído por ${cOccupied.name}!`, 'system');
            return;
          }
        }
      }

      const inCombat = !isBattleOver;
      setEntities(prev =>
        prev.map(e =>
          e.id === hero.id
            ? {
                ...e,
                x,
                y,
                hasBonusAction: inCombat ? false : e.hasBonusAction,
              }
            : e
        )
      );

      setGoliathAncestryUses(prev => Math.max(0, prev - 1));
      setIsTeleportTargetMode(false);

      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '🌌', color: '#a855f7', progress: 0 },
        { id: Math.random().toString(), x, y, text: '🌌 Teleporte!', color: '#a855f7', progress: 0 },
      ]);

      addCombatLog(
        hero.name,
        '🌌 PASSO DAS NUVENS (TELEPORTE)',
        'Você se desmaterializou e reapareceu instantaneamente em um piscar de olhos!',
        'system'
      );
      checkGridTriggers(hero.id, x, y);
      return;
    }

    const restPointOnCell = restPoints.find(rp => {
      const size = rp.size || 2;
      return x >= rp.x && x < rp.x + size && y >= rp.y && y < rp.y + size;
    });
    if (restPointOnCell) {
      const size = restPointOnCell.size || 2;
      let minDistance = Infinity;
      for (let dr = 0; dr < size; dr++) {
        for (let dc = 0; dc < size; dc++) {
          const cx = restPointOnCell.x + dc;
          const cy = restPointOnCell.y + dr;
          const d = Math.max(Math.abs(hero.x - cx), Math.abs(hero.y - cy));
          if (d < minDistance) minDistance = d;
        }
      }
      if (minDistance <= 1) {
        const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
        if (hasLivingMonsters) {
          addCombatLog(
            'Mestre da Arena',
            '⚠️ Inimigos na área',
            'Você não pode realizar um Descanso Longo no acampamento enquanto houver monstros vivos na área!',
            'system'
          );
          setFloatingTexts(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              x,
              y,
              text: '⚠️ Inimigos na área',
              color: '#f87171',
              progress: 0,
            },
          ]);
          return;
        }

        setPendingRestPointId(restPointOnCell.id);
        return;
      }
    }

    const targetMonster = entities.find(e => {
      if (e.type !== 'monster' || e.isDead || !isEntityVisible(e)) return false;
      const eSize = getEntitySizeInSquares(e.size || 'Médio');
      return x >= e.x && x < e.x + eSize && y >= e.y && y < e.y + eSize;
    });
    if (targetMonster && (hero.hasAction || (hero.attacksRemaining || 0) > 0)) {
      const dist = getDistanceBetweenEntities(hero, targetMonster, character?.race, activeLargeForm);
      const atkToUse = currentSelectedAttack;
      const maxRangeCells = getWeaponMaxRangeCells(atkToUse);
      if (dist <= maxRangeCells) {
        processHeroAttackExecution(hero, targetMonster, atkToUse);
        return;
      }
    }

    const uncollectedLootOnCell = droppedLoot.find(loot => loot.x === x && loot.y === y && !loot.isCollected);
    if (uncollectedLootOnCell) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist <= 1) {
        collectLootItem(uncollectedLootOnCell.id);
        return;
      }
    }

    // Interagir com Armadilha Revelada (Desarmar)
    const revealedHazard = hazards?.find(
      h => !h.isHidden && !h.isTriggered && !h.isDisarmed && h.x === x && h.y === y
    );
    if (revealedHazard && handleDisarmHazard) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist <= 1) {
        handleDisarmHazard(revealedHazard.id);
        return;
      }
    }

    const closedChestOnCell = chests.find(c => c.x === x && c.y === y && !c.isOpened);
    if (closedChestOnCell) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist <= 1) {
        openChest(closedChestOnCell.id);
        return;
      }
    }

    const dx = x - hero.x;
    const dy = y - hero.y;

    if (dx === 0 && dy === 0) return;

    let dirX = 0;
    let dirY = 0;

    if (dx > 0) dirX = 1;
    else if (dx < 0) dirX = -1;

    if (dy > 0) dirY = 1;
    else if (dy < 0) dirY = -1;

    moveHeroDirection(dirX, dirY);
  };

  return { handleCellClick };
}
