import React, { useCallback, useEffect } from 'react';
import { BiomeType, CombatEntity, CellData } from '../../../../game/types';
import { determineMonsterSize, getEntitySizeInSquares, findSafeMonsterSpawnPosition } from '../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../lib/api/references';
import { ChestData, RestPointData } from './types';

export interface UseArenaSpawningProps {
  biome: BiomeType;
  grid: CellData[][];
  setGrid: React.Dispatch<React.SetStateAction<CellData[][]>>;
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  movementStepsCount: number;
  chests: ChestData[];
  restPoints: RestPointData[];
  character: any;
  setIsBattleOver: (val: boolean) => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  worldTilesCacheRef: React.MutableRefObject<Map<string, CellData>>;
  hasSpawnedMonstersRef: React.MutableRefObject<boolean>;
  spawnStepsThresholdRef: React.MutableRefObject<number>;
  pendingMonstersRef: React.MutableRefObject<CombatEntity[]>;
}

export function useArenaSpawning({
  biome,
  grid,
  setGrid,
  entities,
  setEntities,
  movementStepsCount,
  chests,
  restPoints,
  character,
  setIsBattleOver,
  addCombatLog,
  worldTilesCacheRef,
  hasSpawnedMonstersRef,
  spawnStepsThresholdRef,
  pendingMonstersRef,
}: UseArenaSpawningProps) {

  // Expansão dinâmica do mapa infinito
  const expandMapIfNeeded = useCallback((heroX: number, heroY: number) => {
    setGrid(prevGrid => {
      if (!prevGrid || prevGrid.length === 0) return prevGrid;
      const currentRows = prevGrid.length;
      const currentCols = prevGrid[0].length;

      let needExpand = false;
      let expandRight = 0;
      let expandBottom = 0;
      let expandLeft = 0;
      let expandTop = 0;

      if (heroX < 15) { expandLeft = 50; needExpand = true; }
      if (heroX >= currentCols - 15) { expandRight = 50; needExpand = true; }
      if (heroY < 15) { expandTop = 50; needExpand = true; }
      if (heroY >= currentRows - 15) { expandBottom = 50; needExpand = true; }

      if (!needExpand) return prevGrid;

      const newCols = currentCols + expandLeft + expandRight;
      const newRows = currentRows + expandTop + expandBottom;

      const newGrid: CellData[][] = [];
      for (let r = 0; r < newRows; r++) {
        const row: CellData[] = [];
        for (let c = 0; c < newCols; c++) {
          const oldC = c - expandLeft;
          const oldR = r - expandTop;
          const cacheKey = `${c},${r}`;

          if (oldR >= 0 && oldR < currentRows && oldC >= 0 && oldC < currentCols) {
            const cell = prevGrid[oldR][oldC];
            worldTilesCacheRef.current.set(cacheKey, cell);
            row.push(cell);
          } else if (worldTilesCacheRef.current.has(cacheKey)) {
            row.push(worldTilesCacheRef.current.get(cacheKey)!);
          } else {
            const isWall = Math.random() < 0.12;
            const isDifficult = Math.random() < 0.08;
            const newCell: CellData = {
              x: c,
              y: r,
              terrain: isWall ? 'wall' : (isDifficult ? 'difficult' : 'normal'),
              movementCost: isWall ? Infinity : (isDifficult ? 2 : 1)
            };
            worldTilesCacheRef.current.set(cacheKey, newCell);
            row.push(newCell);
          }
        }
        newGrid.push(row);
      }

      if (expandLeft > 0 || expandTop > 0) {
        setEntities(prevEntities => prevEntities.map(ent => ({
          ...ent,
          x: ent.x + expandLeft,
          y: ent.y + expandTop
        })));
      }

      return newGrid;
    });
  }, [setEntities, setGrid, worldTilesCacheRef]);

  // Spawnar monstros após alguns passos de exploração
  useEffect(() => {
    if (biome === 'Arena de Testes') return;
    if (!hasSpawnedMonstersRef.current && movementStepsCount >= spawnStepsThresholdRef.current && pendingMonstersRef.current.length > 0) {
      hasSpawnedMonstersRef.current = true;
      setIsBattleOver(false);
      const rawMonsters = pendingMonstersRef.current;

      setEntities(prev => {
        const hero = prev.find(e => e.type === 'hero');
        const heroPos = hero ? { x: hero.x, y: hero.y } : { x: 75, y: 75 };
        const heroSize = getEntitySizeInSquares(hero?.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'));

        const usedPositions = new Set<string>();
        for (let hr = 0; hr < heroSize; hr++) {
          for (let hc = 0; hc < heroSize; hc++) {
            usedPositions.add(`${heroPos.x + hc},${heroPos.y + hr}`);
          }
        }
        chests.forEach(c => usedPositions.add(`${c.x},${c.y}`));
        restPoints.forEach(rp => {
          const rpSize = rp.size || 1;
          for (let dy = 0; dy < rpSize; dy++) {
            for (let dx = 0; dx < rpSize; dx++) {
              usedPositions.add(`${rp.x + dx},${rp.y + dy}`);
            }
          }
        });

        const positionedMonsters = rawMonsters.map((m, idx) => {
          const mSize = getEntitySizeInSquares(m.size || determineMonsterSize(m.name, m.traits));
          const angle = (idx / rawMonsters.length) * Math.PI * 2;

          const safePos = findSafeMonsterSpawnPosition({
            grid,
            monsterSize: mSize,
            heroPos,
            heroSize,
            usedPositions,
            minDistanceToHero: 6,
            maxDistanceToHero: 12,
            preferredAngle: angle
          });

          const mDexMod = Math.floor(((m.stats?.dex || 10) - 10) / 2);
          const init = Math.floor(Math.random() * 20) + 1 + mDexMod;

          return {
            ...m,
            x: safePos.x,
            y: safePos.y,
            initiative: init
          };
        });

        setGrid(currentGrid => {
          if (!currentGrid || currentGrid.length === 0) return currentGrid;
          const nextGrid = [...currentGrid];
          positionedMonsters.forEach(m => {
            const mSize = getEntitySizeInSquares(m.size || 'Médio');
            for (let dy = 0; dy < mSize; dy++) {
              for (let dx = 0; dx < mSize; dx++) {
                const tx = m.x + dx;
                const ty = m.y + dy;
                if (nextGrid[ty]?.[tx]) {
                  nextGrid[ty][tx] = {
                    ...nextGrid[ty][tx],
                    terrain: 'normal',
                    movementCost: 1,
                    obstacleType: undefined
                  };
                }
              }
            }
          });
          return nextGrid;
        });

        if (!hero) return [...positionedMonsters];
        return [hero, ...positionedMonsters].sort((a, b) => b.initiative - a.initiative);
      });

      addCombatLog(
        'Mestre do Jogo',
        '⚠️ EMBOSCA! Inimigos à espreita!',
        `Após avançar ${movementStepsCount} passos, inimigos surgem das sombras e cercam a área!`,
        'system'
      );
    }
  }, [movementStepsCount, grid, chests, restPoints, character, biome, addCombatLog, hasSpawnedMonstersRef, pendingMonstersRef, setEntities, setGrid, setIsBattleOver, spawnStepsThresholdRef]);

  return { expandMapIfNeeded };
}
