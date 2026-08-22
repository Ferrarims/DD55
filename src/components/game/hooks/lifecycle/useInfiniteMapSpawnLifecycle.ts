import React, { useEffect } from 'react';
import { CombatEntity, CellData, BiomeType } from '../../../../game/types';
import { calculateEffectiveHeroSpeedCells } from '../../utils/platformUtils';
import { getEntitySizeInSquares, determineMonsterSize, findSafeMonsterSpawnPosition } from '../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../lib/api/references';
import { getBalancedEncounterForLevel } from '../../../../game/bestiaryData';

export interface UseInfiniteMapSpawnLifecycleProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  activeEntity?: CombatEntity;
  activeEntityIndex: number;
  character: any;
  activeLargeForm: boolean;
  isBattleOver: boolean;
  setIsBattleOver: (over: boolean) => void;
  isHeroDead: boolean;
  biome: BiomeType;
  lastEncounterPos: { x: number; y: number };
  setLastEncounterPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  combatDifficulty: "easy" | "medium" | "hard";
  grid: CellData[][];
  setGrid: React.Dispatch<React.SetStateAction<CellData[][]>>;
  chests: any[];
  restPoints: any[];
  victoryLogged: React.MutableRefObject<boolean>;
  prevHadVisibleMonstersRef: React.MutableRefObject<boolean>;
  addCombatLog: (actorName: string, title: string, detail: string, type: any) => void;
  advanceTurn: () => void;
}

export function useInfiniteMapSpawnLifecycle({
  entities,
  setEntities,
  activeEntity,
  activeEntityIndex,
  character,
  activeLargeForm,
  isBattleOver,
  setIsBattleOver,
  isHeroDead,
  biome,
  lastEncounterPos,
  setLastEncounterPos,
  combatDifficulty,
  grid,
  setGrid,
  chests,
  restPoints,
  victoryLogged,
  prevHadVisibleMonstersRef,
  addCombatLog,
  advanceTurn,
}: UseInfiniteMapSpawnLifecycleProps) {
  // Efeito para recalcular o peso do inventário e ajustar o deslocamento em tempo real
  useEffect(() => {
    if (!character || isBattleOver) return;

    setEntities(prev => {
      const heroIdx = prev.findIndex(e => e.type === 'hero' && !e.isDead);
      if (heroIdx === -1) return prev;
      const hero = prev[heroIdx];

      const heroSpeedGridCells = calculateEffectiveHeroSpeedCells(character, activeLargeForm);
      if (hero.speed === heroSpeedGridCells) return prev;

      const nextEntities = [...prev];
      nextEntities[heroIdx] = { ...hero, speed: heroSpeedGridCells };
      return nextEntities;
    });
  }, [character, activeLargeForm, isBattleOver, setEntities]);

  // Lógica do Mapa Infinito: Spawnar novos monstros se afastar do último encontro
  useEffect(() => {
    if (isHeroDead || biome === 'Arena de Testes') return;
    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    const dist = Math.sqrt(Math.pow(hero.x - lastEncounterPos.x, 2) + Math.pow(hero.y - lastEncounterPos.y, 2));
    if (dist >= 14) {
      setLastEncounterPos({ x: hero.x, y: hero.y });
      const heroLevel = character.level || 1;
      const activeDifficulty = combatDifficulty;

      const encounter = getBalancedEncounterForLevel(heroLevel, biome, activeDifficulty);
      const monsterTemplates = encounter.monsters;

      const currentUsedPositions = new Set<string>();
      const heroSize = getEntitySizeInSquares(hero.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'));
      entities.forEach(e => {
        if (e.isDead) return;
        const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio')) : (e.size || 'Médio'));
        for (let dx = 0; dx < eSize; dx++) {
          for (let dy = 0; dy < eSize; dy++) {
            currentUsedPositions.add(`${e.x + dx},${e.y + dy}`);
          }
        }
      });
      chests.forEach(c => currentUsedPositions.add(`${c.x},${c.y}`));
      restPoints.forEach(rp => {
        const rpSize = rp.size || 1;
        for (let dy = 0; dy < rpSize; dy++) {
          for (let dx = 0; dx < rpSize; dx++) {
            currentUsedPositions.add(`${rp.x + dx},${rp.y + dy}`);
          }
        }
      });

      const newMonsters: CombatEntity[] = monsterTemplates.map((template, idx) => {
        const mSize = getEntitySizeInSquares(template.size || determineMonsterSize(template.name, template.traits));
        const angle = (idx / monsterTemplates.length) * Math.PI * 2;

        const safePos = findSafeMonsterSpawnPosition({
          grid,
          monsterSize: mSize,
          heroPos: { x: hero.x, y: hero.y },
          heroSize,
          usedPositions: currentUsedPositions,
          minDistanceToHero: 6,
          maxDistanceToHero: 12,
          preferredAngle: angle
        });

        return {
          ...template,
          id: `monster-${Date.now()}-${idx}`,
          x: safePos.x,
          y: safePos.y,
          currentHp: template.hp,
          maxHp: template.hp,
          isDead: false,
          remainingMovement: template.speed,
          hasAction: true,
          hasBonusAction: true,
          type: 'monster',
          tempHp: 0,
          initiative: 0,
          hasReaction: true,
          conditions: [],
          size: template.size || determineMonsterSize(template.name, template.traits)
        } as CombatEntity;
      });

      setGrid(prev => {
         const newGrid = [...prev];
         newMonsters.forEach(m => {
           const mSize = getEntitySizeInSquares(m.size || 'Médio');
           for (let dy = 0; dy < mSize; dy++) {
             for (let dx = 0; dx < mSize; dx++) {
               if (newGrid[m.y + dy]?.[m.x + dx]) {
                 newGrid[m.y + dy][m.x + dx] = { ...newGrid[m.y + dy][m.x + dx], terrain: 'normal', movementCost: 1 };
               }
             }
           }
         });
         return newGrid;
      });

      setEntities(prev => [...prev, ...newMonsters]);
      setIsBattleOver(false);
      victoryLogged.current = false;
      prevHadVisibleMonstersRef.current = false;

      addCombatLog(
        'Mestre do Jogo',
        '⚔️ Novos Inimigos!',
        'Você explorou mais a fundo a região e encontrou um novo grupo de monstros! Prepare-se para a batalha!',
        'system'
      );
    }
  }, [entities, lastEncounterPos, isHeroDead, biome, character, combatDifficulty, chests, restPoints, grid, setGrid, setEntities, setIsBattleOver, victoryLogged, prevHadVisibleMonstersRef, addCombatLog, setLastEncounterPos]);

  // Pular o turno de criaturas mortas caso o turno caia nelas
  useEffect(() => {
    if (!activeEntity || isBattleOver) return;
    if (activeEntity.isDead) {
      advanceTurn();
    }
  }, [activeEntityIndex, activeEntity?.isDead, isBattleOver, advanceTurn]);
}
