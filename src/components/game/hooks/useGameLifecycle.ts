import React, { useEffect } from 'react';
import { CombatEntity, CellData, BiomeType, CombatLog } from '../../../game/types';
import {
  calculateHeroInitiativeBonus,
  calculateStatModifier,
  calculateEffectiveHeroSpeedCells,
} from '../utils/platformUtils';
import {
  getEntitySizeInSquares,
  determineMonsterSize,
  findSafeMonsterSpawnPosition,
} from '../../../game/combatUtils';
import { getRaceIcon, RACES_REFERENCE } from '../../../lib/api/references';
import { getBalancedEncounterForLevel } from '../../../game/bestiaryData';
import { getXpForCr } from '../../../game/dndLootTables';

interface UseGameLifecycleProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  activeEntityIndex: number;
  setActiveEntityIndex: React.Dispatch<React.SetStateAction<number>>;
  character: any;
  getActiveFeats: () => string[];
  addCombatLog: (
    actorName: string,
    title: string,
    detail: string,
    type: any
  ) => void;
  setLatestInitiativeRoll: (roll: any) => void;
  isBattleOver: boolean;
  setIsBattleOver: (over: boolean) => void;
  prevHadVisibleMonstersRef: React.MutableRefObject<boolean>;
  torches: any[];
  isNight: boolean;
  biome: BiomeType;
  droppedLoot: any[];
  setDroppedLoot: React.Dispatch<React.SetStateAction<any[]>>;
  collectLootItem: (id: string) => Promise<void> | void;
  chests: any[];
  openChest: (id: string) => Promise<void> | void;
  addLootItemToInventory: (item: any) => Promise<void> | void;
  setVictoryData: React.Dispatch<React.SetStateAction<any>>;
  setShowVictorySummaryModal?: (val: boolean) => void;
  setActiveRevelation: (rev: any) => void;
  victoryLogged: React.MutableRefObject<boolean>;
  mapStreak: number;
  activeLargeForm: boolean;
  onCharacterUpdated?: () => Promise<void> | void;
  lastEncounterPos: { x: number; y: number };
  setLastEncounterPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  combatDifficulty: "easy" | "medium" | "hard";
  grid: CellData[][];
  setGrid: React.Dispatch<React.SetStateAction<CellData[][]>>;
  restPoints: any[];
  advanceTurn: () => void;
  isEntityVisible: (ent: CombatEntity) => boolean;
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
}

export function useGameLifecycle({
  entities,
  setEntities,
  activeEntityIndex,
  setActiveEntityIndex,
  character,
  getActiveFeats,
  addCombatLog,
  setLatestInitiativeRoll,
  isBattleOver,
  setIsBattleOver,
  prevHadVisibleMonstersRef,
  torches,
  isNight,
  biome,
  droppedLoot,
  setDroppedLoot,
  collectLootItem,
  chests,
  openChest,
  addLootItemToInventory,
  setVictoryData,
  setShowVictorySummaryModal,
  setActiveRevelation,
  victoryLogged,
  mapStreak,
  activeLargeForm,
  onCharacterUpdated,
  lastEncounterPos,
  setLastEncounterPos,
  combatDifficulty,
  grid,
  setGrid,
  restPoints,
  advanceTurn,
  isEntityVisible,
  shouldHideEntityDetails,
}: UseGameLifecycleProps) {
  const heroEntity = entities.find(e => e.type === 'hero');
  const isHeroDead = heroEntity ? (heroEntity.isDead || heroEntity.currentHp <= 0) : false;
  const activeEntity = entities[activeEntityIndex];

  // 1. Inicializar Novo Combate Procedural
  useEffect(() => {
    if (entities.length === 0) return;

    const visibleMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    const hasVisibleMonsters = visibleMonsters.length > 0;

    if (hasVisibleMonsters && !prevHadVisibleMonstersRef.current) {
      prevHadVisibleMonstersRef.current = true;
      setIsBattleOver(false);

      const logRolls: string[] = [];
      const rollDetails: Array<{ id: string; name: string; icon: string; d20: number; mod: number; total: number; isHero: boolean }> = [];

      const updatedEntities = entities.map(ent => {
        if (ent.isDead) return ent;

        let totalMod = 0;
        if (ent.type === 'hero') {
          totalMod = calculateHeroInitiativeBonus(character, getActiveFeats()).totalMod;
        } else if (ent.stats?.dex !== undefined) {
          totalMod = calculateStatModifier(ent.stats.dex);
        }

        const d20 = Math.floor(Math.random() * 20) + 1;
        const newInit = d20 + totalMod;

        const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
        const isEntHidden = shouldHideEntityDetails(ent);
        const entName = isEntHidden ? 'Inimigo Oculto' : ent.name;
        logRolls.push(`• ${entName}: d20(${d20}) ${modStr} = ${newInit}`);

        rollDetails.push({
          id: ent.id,
          name: entName,
          icon: isEntHidden ? '❓' : (ent.icon || (ent.type === 'hero' ? getRaceIcon(character?.race || character?.charRace) : '🧟')),
          d20,
          mod: totalMod,
          total: newInit,
          isHero: ent.type === 'hero'
        });

        return {
          ...ent,
          initiative: newInit,
          hasAction: true,
          hasBonusAction: true,
          hasReaction: true,
          remainingMovement: ent.speed,
          attacksRemaining: 0
        };
      });

      // Ordenar por ordem decrescente de iniciativa
      const sorted = [...updatedEntities].sort((a, b) => b.initiative - a.initiative);
      const sortedRollDetails = [...rollDetails].sort((a, b) => b.total - a.total);

      setEntities(sorted);
      setActiveEntityIndex(0);

      // Disparar o Alerta Flutuante de Iniciativa
      setLatestInitiativeRoll({
        id: Date.now().toString(),
        rolls: sortedRollDetails,
        firstToActName: sorted[0]?.name || 'Herói'
      });

      // Registrar o evento e rolagens de iniciativa no Histórico de Combate
      const sorted0Name = shouldHideEntityDetails(sorted[0]) ? 'Inimigo Oculto' : (sorted[0]?.name || 'Herói');
      addCombatLog(
        'Mestre do Jogo',
        '⚔️ INIMIGOS REVELADOS! (Iniciativa Rolada)',
        `Inimigo(s) detectado(s) no campo de visão! O movimento de exploração foi encerrado para o combate.\n\n🎲 ROLAGENS DE INICIATIVA:\n${logRolls.join('\n')}\n\n👑 Primeiro a agir: ${sorted0Name} (Inic ${sorted[0]?.initiative})!`,
        'system'
      );
    } else if (!hasVisibleMonsters && prevHadVisibleMonstersRef.current) {
      prevHadVisibleMonstersRef.current = false;
      setIsBattleOver(true);
    }
  }, [entities, torches, isNight, biome, isBattleOver, isEntityVisible, shouldHideEntityDetails, character, getActiveFeats]);

  // 2. Monitorar Coleta de Loot quando o Herói pisa em um quadrado contendo itens
  useEffect(() => {
    if (!heroEntity || heroEntity.isDead) return;
    if (heroEntity.conditions?.includes('Voando')) return;
    const heroX = heroEntity.x;
    const heroY = heroEntity.y;

    const itemsOnCell = droppedLoot.filter(loot => loot.x === heroX && loot.y === heroY && !loot.isCollected);
    if (itemsOnCell.length > 0) {
      itemsOnCell.forEach(l => {
        collectLootItem(l.id);
      });
    }
  }, [heroEntity?.x, heroEntity?.y, heroEntity?.conditions, droppedLoot, collectLootItem]);

  // 3. Monitorar Abertura de Baús quando o Herói pisa na célula de um baú fechado
  useEffect(() => {
    if (!heroEntity || heroEntity.isDead) return;
    if (heroEntity.conditions?.includes('Voando')) return;
    const heroX = heroEntity.x;
    const heroY = heroEntity.y;

    const chestOnCell = chests.find(c => c.x === heroX && c.y === heroY && !c.isOpened);
    if (chestOnCell) {
      openChest(chestOnCell.id);
    }
  }, [heroEntity?.x, heroEntity?.y, heroEntity?.conditions, chests, openChest]);

  // 4. Monitorar Fim da Batalha para recolhimento automático de espólios restantes no chão
  useEffect(() => {
    if (isBattleOver && !isHeroDead) {
      const uncollected = droppedLoot.filter(l => !l.isCollected);
      if (uncollected.length > 0) {
        uncollected.forEach(async (l) => {
          await addLootItemToInventory(l.item);
        });

        setVictoryData((v: any) => {
          if (!v) return v;
          const prevLoot = v.loot || [];
          const nextLoot = [...prevLoot];
          uncollected.forEach(l => {
            if (!nextLoot.some((i: any) => i.id === l.item.id)) {
              nextLoot.push(l.item);
            }
          });
          return {
            ...v,
            loot: nextLoot
          };
        });

        setDroppedLoot(prev => prev.map(l => ({ ...l, isCollected: true })));

        addCombatLog(
          'Mestre do Jogo',
          '🧺 Recolhimento Automático',
          `Todas as moedas e espólios restantes no chão do grid (${uncollected.length} item(ns)) foram recolhidos automaticamente para o seu inventário e área de troca de armas!`,
          'loot'
        );
      }
    }
  }, [isBattleOver, isHeroDead, droppedLoot, addLootItemToInventory, setVictoryData, setDroppedLoot, addCombatLog]);

  // 5. Monitorar Fim do Combate para limpar a aura celestial e sincronizar XP/Bestiário de monstros mortos
  useEffect(() => {
    if (isBattleOver) {
      setActiveRevelation(null);
      const deadMonsters = entities.filter(e => e.type === 'monster' && (e.isDead || e.currentHp <= 0));
      const hasDefeatedMonsters = deadMonsters.length > 0;

      if (!victoryLogged.current && !isHeroDead) {
        victoryLogged.current = true;
        // Apenas registra vitória e exibe o modal de resumo se realmente houver criaturas derrotadas
        if (hasDefeatedMonsters) {
          addCombatLog('Mestre do Jogo', '🏆 VITÓRIA!', 'Você derrotou todos os inimigos!', 'system');
          if (setShowVictorySummaryModal) {
            setShowVictorySummaryModal(true);
          }
        }
      }

      if (!isHeroDead) {
        if (deadMonsters.length > 0) {
          setVictoryData((prev: any) => {
            const currentLoot = prev?.loot || [];
            let currentXp = prev?.totalXp || 0;
            const currentDefeated = { ...(prev?.defeatedMonsters || {}) };
            const currentDmg = prev?.totalDamageDealt || 0;
            const multiplier = Math.max(1, mapStreak);

            deadMonsters.forEach(m => {
              const cleanName = m.name.replace(/ #?\d+$/, '').trim();
              const mXp = (m.xpValue || getXpForCr(m.cr || 0.25)) * multiplier;

              const recordedCount = currentDefeated[cleanName] || 0;
              const actualDeadCountWithThisName = deadMonsters.filter(dm => dm.name.replace(/ #?\d+$/, '').trim() === cleanName).length;

              if (recordedCount < actualDeadCountWithThisName) {
                const diff = actualDeadCountWithThisName - recordedCount;
                currentDefeated[cleanName] = actualDeadCountWithThisName;
                currentXp += diff * mXp;
              }
            });

            return {
              totalXp: currentXp,
              loot: currentLoot,
              defeatedMonsters: currentDefeated,
              totalDamageDealt: currentDmg
            };
          });
        }
      }
    }
  }, [isBattleOver, isHeroDead, entities, mapStreak, setActiveRevelation, addCombatLog, setVictoryData, setShowVictorySummaryModal, victoryLogged]);

  // 6. Monitorar término imediato do combate quando não houver monstros vivos na tela
  useEffect(() => {
    if (!isBattleOver && entities.length > 0) {
      const allMonsters = entities.filter(e => e.type === 'monster');
      const livingMonsters = allMonsters.filter(e => !e.isDead && e.currentHp > 0);
      const hero = entities.find(e => e.type === 'hero');
      // Só marca término imediato por vitória se existiam monstros na tela (allMonsters.length > 0) e todos morreram
      if (hero && !hero.isDead && allMonsters.length > 0 && livingMonsters.length === 0) {
        setIsBattleOver(true);
      }
    }
  }, [entities, isBattleOver, setIsBattleOver]);

  // 7. Monitorar Morte do Herói em tempo real
  useEffect(() => {
    if (isHeroDead && !isBattleOver) {
      setIsBattleOver(true);
      addCombatLog('Mestre do Jogo', '💀 DERROTA!', 'Seu herói tombou em combate. Todos os itens e XP não salvos foram perdidos.', 'kill');
    }
  }, [isHeroDead, isBattleOver, setIsBattleOver, addCombatLog]);

  // 8. Efeito para recalcular o peso do inventário e ajustar o deslocamento em tempo real
  useEffect(() => {
    if (!character || isBattleOver) return;

    setEntities(prev => {
      const heroIdx = prev.findIndex(e => e.type === 'hero' && !e.isDead);
      if (heroIdx === -1) return prev;
      const hero = prev[heroIdx];

      const heroSpeedGridCells = calculateEffectiveHeroSpeedCells(character, activeLargeForm);

      if (hero.speed === heroSpeedGridCells) return prev; // No change

      const nextEntities = [...prev];
      nextEntities[heroIdx] = { ...hero, speed: heroSpeedGridCells };
      return nextEntities;
    });
  }, [character, activeLargeForm, isBattleOver, setEntities]);

  // 9. Monitorar morte por exaustão (Nível 6)
  useEffect(() => {
    if ((character?.exhaustion_level || 0) >= 6 && heroEntity && !heroEntity.isDead && heroEntity.currentHp > 0) {
      addCombatLog('Mestre do Jogo', '💀 EXAUSTÃO FATAL', 'Você sucumbiu à exaustão e desmaiou (Nível 6/6)!', 'kill');

      const newEntities = [...entities];
      const heroIdx = newEntities.findIndex(e => e.type === 'hero');
      if (heroIdx !== -1) {
        newEntities[heroIdx].currentHp = 0;
        newEntities[heroIdx].isDead = true;
        setEntities(newEntities);
      }

      character.exhaustion_level = 3;
      import('../../../lib/api/characterService').then(({ updateCharacter }) => {
        updateCharacter(character.id, { exhaustion_level: 3, current_hp: 0 }).then(() => {
          if (onCharacterUpdated) onCharacterUpdated();
        }).catch(e => console.warn(e));
      });
    }
  }, [character?.exhaustion_level, heroEntity?.currentHp, heroEntity?.isDead, entities, addCombatLog, setEntities, onCharacterUpdated, character]);

  // 10. Lógica do Mapa Infinito: Spawnar novos monstros se afastar do último encontro
  useEffect(() => {
    if (isHeroDead || biome === 'Arena de Testes') return;
    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    const dist = Math.sqrt(Math.pow(hero.x - lastEncounterPos.x, 2) + Math.pow(hero.y - lastEncounterPos.y, 2));
    if (dist >= 14) {
      // Spawn new encounter
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

      // Update grid to ensure monster spawn points are walkable
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
      setIsBattleOver(false); // Retoma o combate
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

  // 11. Pular o turno de criaturas mortas caso o turno caia nelas
  useEffect(() => {
    if (!activeEntity || isBattleOver) return;
    if (activeEntity.isDead) {
      advanceTurn();
    }
  }, [activeEntityIndex, activeEntity?.isDead, isBattleOver, advanceTurn]);
}
