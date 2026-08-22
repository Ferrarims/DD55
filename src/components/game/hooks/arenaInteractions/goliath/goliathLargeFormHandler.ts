import React from 'react';
import { CombatEntity, CellData } from '../../../../../game/types';
import { getEntitySizeInSquares } from '../../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../../lib/api/references';
import { formatRoundsToTime } from '../interactionUtils';

export function createGoliathLargeFormHandler({
  entities,
  setEntities,
  grid,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  largeFormUses,
  setLargeFormUses,
  activeLargeForm,
  setActiveLargeForm,
  largeFormRoundsLeft,
  setLargeFormRoundsLeft,
  addCombatLog,
}: {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  largeFormUses: number;
  setLargeFormUses: React.Dispatch<React.SetStateAction<number>>;
  activeLargeForm: boolean;
  setActiveLargeForm: (val: boolean) => void;
  largeFormRoundsLeft: number;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
}) {
  const handleLargeForm = () => {
    if (!isBattleOver && !isHeroTurn) return;
    const hero = isBattleOver ? entities.find(e => e.type === 'hero') : activeEntity;

    if (!hero || hero.type !== 'hero' || hero.isDead) return;

    if (activeLargeForm) {
      setActiveLargeForm(false);
      addCombatLog(hero.name, '🪨 Forma Grande Encerrada', `Você voltou ao seu tamanho normal. A contagem foi pausada (${formatRoundsToTime(largeFormRoundsLeft)} restantes).`, 'system');
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio', speed: Math.max(1, e.speed - 2), remainingMovement: Math.max(0, e.remainingMovement - 2) } : e));
      return;
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    if (largeFormUses <= 0 && (largeFormRoundsLeft <= 0 || largeFormRoundsLeft === 100)) {
      addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', largeFormRoundsLeft <= 0 ? 'Você já usou todas as cargas diárias e esgotou a duração total de 10 minutos até o próximo Descanso Longo!' : 'Você já usou seu crescimento diário hoje!', 'system');
      return;
    }

    const pushedMonsterIds = new Set<string>();
    const monsterPushedPositions: { [id: string]: { x: number; y: number } } = {};
    const displacementLogs: string[] = [];

    const adjacentMonsters = entities.filter(e => {
      if (e.type !== 'monster' || e.isDead) return false;
      const mSize = getEntitySizeInSquares(e.size || 'Médio');
      const expandedCells = [{ x: hero.x + 1, y: hero.y }, { x: hero.x, y: hero.y + 1 }, { x: hero.x + 1, y: hero.y + 1 }];
      return expandedCells.some(cell => cell.x >= e.x && cell.x < e.x + mSize && cell.y >= e.y && cell.y < e.y + mSize);
    });

    adjacentMonsters.forEach(monster => {
      let dx = Math.sign(monster.x - hero.x);
      let dy = Math.sign(monster.y - hero.y);
      if (dx === 0 && dy === 0) dx = 1;
      const targetX = monster.x + dx;
      const targetY = monster.y + dy;
      if (targetY < 0 || targetY >= grid.length || targetX < 0 || targetX >= (grid[0]?.length || 150)) return;
      const targetCell = grid[targetY]?.[targetX];
      if (!targetCell || targetCell.terrain === 'wall' || targetCell.movementCost === Infinity) return;

      const occupied = entities.find(e => {
        if (e.isDead) return false;
        if (e.id === hero.id) return targetX >= hero.x && targetX < hero.x + 2 && targetY >= hero.y && targetY < hero.y + 2;
        const otherPushedPos = monsterPushedPositions[e.id];
        const ex = otherPushedPos ? otherPushedPos.x : e.x;
        const ey = otherPushedPos ? otherPushedPos.y : e.y;
        const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) : (e.size || 'Médio'));
        return targetX >= ex && targetX < ex + eSize && targetY >= ey && targetY < ey + eSize;
      });

      if (!occupied) {
        pushedMonsterIds.add(monster.id);
        monsterPushedPositions[monster.id] = { x: targetX, y: targetY };
        displacementLogs.push(`${monster.name} foi empurrado para trás pelo crescimento de ${hero.name}!`);
      }
    });

    const targetSize = 2;
    for (let dx = 0; dx < targetSize; dx++) {
      for (let dy = 0; dy < targetSize; dy++) {
        const cx = hero.x + dx;
        const cy = hero.y + dy;
        if (cx < 0 || cx >= 150 || cy < 0 || cy >= 150) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', 'Não há espaço suficiente perto das bordas do mundo para você crescer!', 'system');
          return;
        }
        const cell = grid[cy]?.[cx];
        if (!cell || cell.terrain === 'wall' || cell.movementCost === Infinity) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', 'Não há espaço suficiente (bloqueado por rocha ou parede) para você crescer!', 'system');
          return;
        }
        const occupied = entities.find(e => {
          if (e.isDead || e.id === hero.id) return false;
          if (pushedMonsterIds.has(e.id)) return false;
          const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) : (e.size || 'Médio'));
          return cx >= e.x && cx < e.x + eSize && cy >= e.y && cy < e.y + eSize;
        });
        if (occupied) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', `Não há espaço suficiente (ocupado por ${occupied.name}) para você crescer!`, 'system');
          return;
        }
      }
    }

    if (largeFormRoundsLeft <= 0) {
      setLargeFormUses(prev => prev - 1);
      setLargeFormRoundsLeft(100);
    } else if (largeFormRoundsLeft === 100) {
      setLargeFormUses(prev => prev - 1);
    }

    setActiveLargeForm(true);
    addCombatLog(hero.name, largeFormRoundsLeft < 100 && largeFormRoundsLeft > 0 ? '🪨 FORMA GRANDE RETOMADA!' : '🪨 FORMA GRANDE ATIVADA!', `Seu corpo se expande para o tamanho de um gigante! Você tem Vantagem em testes de Força e seu Deslocamento aumenta em +3m (+2 cel) (${formatRoundsToTime(largeFormRoundsLeft)} restantes).`, 'system');

    displacementLogs.forEach(logText => {
      addCombatLog('Mestre do Jogo', '💨 Inimigo Deslocado', logText, 'system');
    });

    setEntities(prev => prev.map(e => {
      if (e.id === hero.id) {
        return { ...e, hasBonusAction: !isBattleOver ? false : e.hasBonusAction, size: 'Grande', speed: e.speed + 2, remainingMovement: e.remainingMovement + 2 };
      }
      if (pushedMonsterIds.has(e.id)) {
        const newPos = monsterPushedPositions[e.id];
        return { ...e, x: newPos.x, y: newPos.y };
      }
      return e;
    }));
  };

  return { handleLargeForm };
}
