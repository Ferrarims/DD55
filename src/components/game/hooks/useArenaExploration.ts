import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiomeType, WeatherType, CombatEntity, CellData, LootItem, PowerUp } from '../../../game/types';
import { initializeArenaMap, createHeroEntity } from '../core/mapInitialization';
import { determineMonsterSize, getEntitySizeInSquares, findSafeMonsterSpawnPosition } from '../../../game/combatUtils';
import { getBalancedEncounterForLevel } from '../../../game/bestiaryData';
import { getXpForCr } from '../../../game/dndLootTables';
import { parseSpeedToGridCells, RACES_REFERENCE, getRaceInfo, getRaceIcon } from '../../../lib/api/references';
import { addItemToInventory, updateCharacter } from '../../../lib/api/characterService';
import { fetchMonstersFromDb } from '../../../lib/api/monstersService';
import { getAllShopCatalog, getRandomItemFromDatabase, parseCoinsToGoldNumber, getLevelFromXp, parseWeightToKg, getItemWeight } from '../../../lib/mechanics/xpAndLootManager';
import { calculateResources, calculateRaceResources } from '../../../lib/mechanics/resourcesParser';
import { playCollectSound } from '../../../lib/audio';

export interface UseArenaExplorationProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  onExitGame: () => void;
  isSfxEnabled: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: 'attack' | 'damage' | 'heal' | 'kill' | 'system' | 'spell' | 'loot') => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Capability max values and functions
  secondWindMaxUses: number;
  healingHandsMaxUses: number;
  celestialRevelationMaxUses: number;
  draconicFlightMaxUses: number;
  largeFormMaxUses: number;
  goliathAncestryMaxUses: number;
  adrenalineRushMaxUses: number;
  relentlessEnduranceMaxUses: number;
  isHuman: boolean;
  actionSurgeMaxUses: number;
  rageMaxUses: number;
  channelDivinityMaxUses: number;
  spellSlotsMax: number;
  indomitableMaxUses: number;
  superiorityDiceMaxUses: number;
  bardicInspirationMaxUses: number;
  layOnHandsMaxPool: number;
  focusPointsMaxUses: number;
  wildShapeMaxUses: number;
  luckyMaxPoints: number;

  // Capability Setters for Rest resets
  setSecondWindUses: React.Dispatch<React.SetStateAction<number>>;
  setHealingHandsUses: React.Dispatch<React.SetStateAction<number>>;
  setCelestialRevelationUses: React.Dispatch<React.SetStateAction<number>>;
  setDraconicFlightUses: React.Dispatch<React.SetStateAction<number>>;
  setActiveDraconicFlight: (val: boolean) => void;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setLargeFormUses: React.Dispatch<React.SetStateAction<number>>;
  setActiveLargeForm: (val: boolean) => void;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  setAdrenalineRushUses: React.Dispatch<React.SetStateAction<number>>;
  setRelentlessEnduranceUses: React.Dispatch<React.SetStateAction<number>>;
  setHasHeroicInspiration: (val: boolean) => void;
  setActionSurgeUses: React.Dispatch<React.SetStateAction<number>>;
  setRageUses: React.Dispatch<React.SetStateAction<number>>;
  setChannelDivinityUses: React.Dispatch<React.SetStateAction<number>>;
  setSpellSlots: React.Dispatch<React.SetStateAction<number>>;
  setIndomitableUses: React.Dispatch<React.SetStateAction<number>>;
  setSuperiorityDiceUses: React.Dispatch<React.SetStateAction<number>>;
  setBardicInspirationUses: React.Dispatch<React.SetStateAction<number>>;
  setLayOnHandsPool: React.Dispatch<React.SetStateAction<number>>;
  setFocusPointsUses: React.Dispatch<React.SetStateAction<number>>;
  setWildShapeUses: React.Dispatch<React.SetStateAction<number>>;
  setLuckyPoints: React.Dispatch<React.SetStateAction<number>>;
  setActiveRevelation: (val: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null) => void;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  activeLargeForm: boolean;
}

export function useArenaExploration({
  character,
  onCharacterUpdated,
  onExitGame,
  isSfxEnabled,
  addCombatLog,
  setFloatingTexts,
  secondWindMaxUses,
  healingHandsMaxUses,
  celestialRevelationMaxUses,
  draconicFlightMaxUses,
  largeFormMaxUses,
  goliathAncestryMaxUses,
  adrenalineRushMaxUses,
  relentlessEnduranceMaxUses,
  isHuman,
  actionSurgeMaxUses,
  rageMaxUses,
  channelDivinityMaxUses,
  spellSlotsMax,
  indomitableMaxUses,
  superiorityDiceMaxUses,
  bardicInspirationMaxUses,
  layOnHandsMaxPool,
  focusPointsMaxUses,
  wildShapeMaxUses,
  luckyMaxPoints,
  setSecondWindUses,
  setHealingHandsUses,
  setCelestialRevelationUses,
  setDraconicFlightUses,
  setActiveDraconicFlight,
  setDraconicFlightRoundsLeft,
  setLargeFormUses,
  setActiveLargeForm,
  setLargeFormRoundsLeft,
  setGoliathAncestryUses,
  setAdrenalineRushUses,
  setRelentlessEnduranceUses,
  setHasHeroicInspiration,
  setActionSurgeUses,
  setRageUses,
  setChannelDivinityUses,
  setSpellSlots,
  setIndomitableUses,
  setSuperiorityDiceUses,
  setBardicInspirationUses,
  setLayOnHandsPool,
  setFocusPointsUses,
  setWildShapeUses,
  setLuckyPoints,
  setActiveRevelation,
  activeRevelation,
  activeLargeForm,
}: UseArenaExplorationProps) {
  // Configurações do Cenário e Clima
  const [biome, setBiome] = useState<BiomeType>('Masmorra');
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [torches, setTorches] = useState<{ x: number; y: number }[]>([]);
  const [entities, setEntities] = useState<CombatEntity[]>([]);
  const [activeEntityIndex, setActiveEntityIndex] = useState<number>(0);
  const [currentTurnRound, setCurrentTurnRound] = useState<number>(1);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [weatherTime, setWeatherTime] = useState<number>(0);
  const [isNightManual, setIsNightManual] = useState<boolean>(false);
  const [combatDifficulty, setCombatDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Estado do Jogo
  const [isBattleOver, setIsBattleOver] = useState<boolean>(false);
  const [isVictoryScreenVisible, setIsVictoryScreenVisible] = useState<boolean>(false);
  const [showVictorySummaryModal, setShowVictorySummaryModal] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{
    totalXp: number;
    loot: LootItem[];
    defeatedMonsters: Record<string, number>;
    totalDamageDealt?: number;
  } | null>(null);

  // Espólios, Baús, Armadilhas e Acampamentos
  const [droppedLoot, setDroppedLoot] = useState<{ id: string; x: number; y: number; item: LootItem; isCollected: boolean }[]>([]);
  const [chests, setChests] = useState<{ id: string; x: number; y: number; rarity: 'comum' | 'raro' | 'lendário'; isOpened: boolean }[]>([]);
  const [hazards, setHazards] = useState<{ id: string; x: number; y: number; type: 'spikes' | 'mushrooms' | 'mud' | 'web' | 'fire_vent'; name: string; isTriggered: boolean }[]>([]);
  const [powerups, setPowerUps] = useState<PowerUp[]>([]);
  const [restPoints, setRestPoints] = useState<{ id: string; x: number; y: number; size?: number; isUsed: boolean; icon?: string }[]>([]);
  const [pendingRestPointId, setPendingRestPointId] = useState<string | null>(null);

  // Sistema de Tempo e Sobrevivência
  const [totalGameTurns, setTotalGameTurns] = useState<number>(0);
  const [movementStepsCount, setMovementStepsCount] = useState<number>(0);
  const lastMealTurn = useRef<number>(0);
  const lastShortRestTurn = useRef<number>(0);
  const lastLongRestTurn = useRef<number>(0);
  const prevTurns = useRef<number>(0);

  // Streak de Mapas
  const [mapStreak, setMapStreak] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastEncounterPos, setLastEncounterPos] = useState<{ x: number; y: number }>({ x: 75, y: 75 });

  // Refs de Controle para evitar duplicações
  const processedDeathIdsRef = useRef<Set<string>>(new Set());
  const collectedLootIdsRef = useRef<Set<string>>(new Set());
  const openedChestIdsRef = useRef<Set<string>>(new Set());
  const exploredCellsRef = useRef<Set<string>>(new Set());
  const victoryLogged = useRef<boolean>(false);
  const prevHadVisibleMonstersRef = useRef<boolean>(false);
  const pendingMonstersRef = useRef<CombatEntity[]>([]);
  const hasSpawnedMonstersRef = useRef<boolean>(false);
  const spawnStepsThresholdRef = useRef<number>(5);

  // Cache persistente de posições e terreno explorado para o mapa infinito
  const worldTilesCacheRef = useRef<Map<string, CellData>>(new Map());

  // Função para expandir o mapa infinitamente e salvar posições importantes já visitadas
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
            // Restaurar posição importante já visitada anteriormente pelo mesmo caminho
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
  }, []);

  // Spawnar monstros após alguns passos de exploração (aleatório entre 5 e 10 passos)
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
        // Registrar células ocupadas pelo herói
        for (let hr = 0; hr < heroSize; hr++) {
          for (let hc = 0; hc < heroSize; hc++) {
            usedPositions.add(`${heroPos.x + hc},${heroPos.y + hr}`);
          }
        }
        // Registrar baús e acampamentos
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

        // Garantir que as células de spawn dos monstros no grid estão livres
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
  }, [movementStepsCount, grid, chests, restPoints, character]);

  // Inicializar Novo Combate Procedural
  const initNewCombat = async (selectedBiome?: BiomeType, keepUnsavedData: boolean = false, overrideDifficulty?: 'easy' | 'medium' | 'hard') => {
    setGrid([]);
    setEntities([]);

    fetchMonstersFromDb().catch(e => {
      console.warn('Erro ao atualizar monstros do banco:', e);
    });

    setIsBattleOver(false);
    victoryLogged.current = false;
    setDroppedLoot([]);
    setHazards([]);
    setPowerUps([]);
    setRestPoints([]);
    processedDeathIdsRef.current?.clear();
    collectedLootIdsRef.current?.clear();
    openedChestIdsRef.current?.clear();
    exploredCellsRef.current?.clear();
    worldTilesCacheRef.current?.clear();
    prevHadVisibleMonstersRef.current = false;
    hasSpawnedMonstersRef.current = false;
    pendingMonstersRef.current = [];
    spawnStepsThresholdRef.current = Math.floor(Math.random() * 6) + 5;
    
    const biomes: BiomeType[] = ['Caverna', 'Masmorra', 'Floresta', 'Pântano', 'Deserto'];
    const weathers: WeatherType[] = ['clear', 'rain', 'snow', 'wind', 'storm', 'fog'];

    const chosenBiome = selectedBiome || biomes[Math.floor(Math.random() * biomes.length)];
    setBiome(chosenBiome);
    setTotalGameTurns(0);
    setMovementStepsCount(0);
    lastMealTurn.current = 0;
    if (!keepUnsavedData) {
      lastLongRestTurn.current = 0;
      lastShortRestTurn.current = 0;
    } else {
      lastShortRestTurn.current = totalGameTurns;
    }

    if (chosenBiome === 'Caverna' || chosenBiome === 'Masmorra') {
      setWeather('clear');
      setIsNightManual(true);
    } else if (chosenBiome === 'Deserto') {
      const desertWeathers: WeatherType[] = ['clear', 'wind'];
      setWeather(desertWeathers[Math.floor(Math.random() * desertWeathers.length)]);
      setIsNightManual(false);
    } else {
      const chosenWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(chosenWeather);
      setIsNightManual(false);
    }

    const heroMaxHp = character.max_hp || 20;
    const className = (character.class_name || character.charClass || '').toLowerCase();
    
    let currentMapNumber = 1;
    let heroCurrentHp = heroMaxHp;
    let heroTempHp = 0;
    let hpRecoveredOnShortRest = 0;
    let hitDieSides = 8;

    if (!keepUnsavedData) {
      // ===== DESCANSO LONGO =====
      setVictoryData({ totalXp: 0, loot: [], defeatedMonsters: {}, totalDamageDealt: 0 });
      setShowVictorySummaryModal(false);
      setMapStreak(1);
      currentMapNumber = 1;

      setSecondWindUses(secondWindMaxUses);
      setHealingHandsUses(healingHandsMaxUses);

      if (character) {
        const newExhaustion = Math.max(0, (character.exhaustion_level || 0) - 1);
        character.exhaustion_level = newExhaustion;
        
        const resources = character.class_resources ? [...character.class_resources] : [];
        const resetRes = resources.map((r: any) => r ? { ...r, used: 0 } : r);
        character.class_resources = resetRes;

        if (character.id) {
          updateCharacter(character.id, { exhaustion_level: newExhaustion, class_resources: resetRes }).catch(err => console.warn(err));
        }
      }
      setCelestialRevelationUses(celestialRevelationMaxUses);
      setDraconicFlightUses(draconicFlightMaxUses);
      setActiveDraconicFlight(false);
      setDraconicFlightRoundsLeft(100);
      setLargeFormUses(largeFormMaxUses);
      setActiveLargeForm(false);
      setLargeFormRoundsLeft(100);
      setGoliathAncestryUses(goliathAncestryMaxUses);
      setAdrenalineRushUses(adrenalineRushMaxUses);
      setRelentlessEnduranceUses(relentlessEnduranceMaxUses);
      setHasHeroicInspiration(isHuman);
      setActionSurgeUses(actionSurgeMaxUses);
      setRageUses(rageMaxUses);
      setChannelDivinityUses(channelDivinityMaxUses);
      setSpellSlots(spellSlotsMax);
      setIndomitableUses(indomitableMaxUses);
      setSuperiorityDiceUses(superiorityDiceMaxUses);
      setBardicInspirationUses(bardicInspirationMaxUses);
      setLayOnHandsPool(layOnHandsMaxPool);
      setFocusPointsUses(focusPointsMaxUses);
      setWildShapeUses(wildShapeMaxUses);
      setLuckyPoints(luckyMaxPoints);

      heroCurrentHp = heroMaxHp;
      heroTempHp = 0;
    } else {
      // ===== DESCANSO CURTO =====
      const nextStreak = mapStreak + 1;
      setMapStreak(nextStreak);
      currentMapNumber = nextStreak;

      setAdrenalineRushUses(adrenalineRushMaxUses);
      setSecondWindUses(prev => Math.min(secondWindMaxUses, prev + 1));
      setActionSurgeUses(actionSurgeMaxUses);
      setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));

      if (className.includes('bruxo') || className.includes('warlock')) {
        setSpellSlots(spellSlotsMax);
      }

      if (character && Array.isArray(character.class_resources)) {
        const updatedResources = character.class_resources.map((r: any) => {
          if (!r) return r;
          const name = (r.name || '').toLowerCase();
          if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
            const currentUsed = typeof r.used === 'number' ? r.used : 0;
            return { ...r, used: Math.max(0, currentUsed - 1) };
          }
          if (r.reset === 'short' || r.reset === 'short/long') {
            return { ...r, used: 0 };
          }
          return r;
        });
        character.class_resources = updatedResources;
        if (character.id) {
          updateCharacter(character.id, { class_resources: updatedResources }).catch(err => console.warn(err));
        }
      }

      const currentHero = entities.find(e => e.type === 'hero');
      const prevHp = (currentHero && currentHero.currentHp > 0) ? currentHero.currentHp : (character.current_hp ?? heroMaxHp);

      if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
      else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
      else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

      const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
      const heroLevel = Number(character.level) || 1;

      let totalHealRoll = 0;
      for (let i = 0; i < heroLevel; i++) {
        const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
        totalHealRoll += Math.max(1, dieRoll + conMod);
      }

      heroCurrentHp = Math.min(heroMaxHp, prevHp + totalHealRoll);
      hpRecoveredOnShortRest = heroCurrentHp - prevHp;
      heroTempHp = currentHero ? currentHero.tempHp : 0;
    }

    const heroLevel = character.level || 1;
    const activeDifficulty = overrideDifficulty || combatDifficulty;
    if (overrideDifficulty) setCombatDifficulty(overrideDifficulty);

    const initMapResult = initializeArenaMap(chosenBiome, heroLevel, activeDifficulty, 150, 150);

    setGrid(initMapResult.grid);
    setTorches(initMapResult.torches);
    setChests(initMapResult.chests);
    setHazards(initMapResult.hazards);
    setPowerUps(initMapResult.powerups);
    setRestPoints(initMapResult.restPoints);
    setLastEncounterPos(initMapResult.heroSpawn);

    const heroSpeedGridCells = parseSpeedToGridCells(character.speed || '9m');
    const heroEntity = createHeroEntity(
      character,
      initMapResult.heroSpawn,
      heroMaxHp,
      heroCurrentHp,
      heroTempHp,
      heroSpeedGridCells
    );

    if (chosenBiome === 'Arena de Testes') {
      pendingMonstersRef.current = [];
      hasSpawnedMonstersRef.current = true;
    } else {
      pendingMonstersRef.current = initMapResult.monsters;
    }

    setEntities([heroEntity]);
    setActiveEntityIndex(0);
    setCurrentTurnRound(1);

    addCombatLog(
      'Mestre da Arena',
      `🗺️ MAPA #${currentMapNumber}: ${chosenBiome.toUpperCase()} (Dificuldade: ${activeDifficulty.toUpperCase()})`,
      chosenBiome === 'Arena de Testes'
        ? `Bem-vindo à Arena de Testes Pacífica. Nenhum monstro surgirá neste mapa. Aproveite para testar comandos, feitiços e movimentação.`
        : `Você entrou na área. O terreno começa silencioso... Avance alguns passos para explorar o território e encontrar inimigos.`,
      'system'
    );
  };

  const addLootItemToInventory = async (item: LootItem) => {
    if (!character) return;
    if (item.type === 'gold') {
      const currentGold = parseCoinsToGoldNumber(character.coins);
      const newGold = currentGold + (item.value || 0);
      character.coins = `${newGold} PO`;
      if (character.id) {
        try {
          await updateCharacter(character.id, { coins: character.coins });
        } catch (err) {
          console.error('Erro ao atualizar ouro:', err);
        }
      }
    } else {
      if (character.id) {
        try {
          const catalog = getAllShopCatalog();
          const cleanName = item.name.replace(/^1x\s*/i, '').replace(/^\d+\s+/, '').trim();
          const shopItem = catalog.find(i => i.name.toLowerCase() === cleanName.toLowerCase());
          const itemId = shopItem ? shopItem.id : null;
          if (!itemId) {
             console.warn("Item não encontrado no banco de dados:", cleanName);
             addCombatLog('Mestre do Jogo', '⚠️ Item Desconhecido', `O item ${cleanName} não existe no banco de dados e não pôde ser adicionado.`, 'system');
             return;
          }
          
          const addedData = await addItemToInventory(character.id, itemId, 1, null);
          if (!character.character_inventory) character.character_inventory = [];
          
          const existingInvIndex = character.character_inventory.findIndex((inv: any) => inv.item_id === itemId && !inv.equip_slot);
          if (existingInvIndex !== -1) {
             character.character_inventory[existingInvIndex].quantity += 1;
          } else {
             character.character_inventory.push(addedData);
          }
        } catch (err) {
          console.error('Erro ao atualizar inventário com item recuperado:', err);
        }
      }
    }
    if (onCharacterUpdated) {
      onCharacterUpdated();
    }
  };

  const collectLootItem = async (lootId: string) => {
    const hero = entities.find(e => e.type === 'hero');
    if (hero?.conditions?.includes('Voando')) {
      addCombatLog(
        character.name || 'Herói',
        '⚠️ Impossível Coletar do Chão',
        'Você está voando (a 3m de altura) e não consegue pegar itens do chão! Pouse ou recolha o voo para pegar.',
        'system'
      );
      return;
    }

    if (collectedLootIdsRef.current.has(lootId)) return;
    const targetLoot = droppedLoot.find(l => l.id === lootId && !l.isCollected);
    if (!targetLoot) return;

    collectedLootIdsRef.current.add(lootId);

    addCombatLog(
      character.name || 'Herói',
      `🎒 Espólio Coletado: ${targetLoot.item.name} ${targetLoot.item.icon}`,
      `Você guardou na mochila: ${targetLoot.item.name} (${targetLoot.item.rarity.toUpperCase()}). ${targetLoot.item.description}`,
      'loot'
    );

    await addLootItemToInventory(targetLoot.item);

    setVictoryData(v => {
      const prevXp = v?.totalXp || 0;
      const prevLoot = v?.loot || [];
      const prevDefeated = v?.defeatedMonsters || {};
      if (prevLoot.some(i => i.id === targetLoot.item.id)) return v;
      return {
        totalXp: prevXp,
        loot: [...prevLoot, targetLoot.item],
        defeatedMonsters: prevDefeated
      };
    });

    setDroppedLoot(prev => prev.map(l => l.id === lootId ? { ...l, isCollected: true } : l));
    if (isSfxEnabled) playCollectSound();
  };

  const openChest = (chestId: string) => {
    const hero = entities.find(e => e.type === 'hero');
    if (hero?.conditions?.includes('Voando')) {
      addCombatLog(
        character.name || 'Herói',
        '⚠️ Impossível Abrir Baú',
        'Você está voando (a 3m de altura) e não consegue abrir baús no chão! Pouse ou recolha o voo para interagir.',
        'system'
      );
      return;
    }

    if (openedChestIdsRef.current.has(chestId)) return;
    const targetChest = chests.find(c => c.id === chestId && !c.isOpened);
    if (!targetChest) return;

    openedChestIdsRef.current.add(chestId);

    const timestamp = Date.now();
    const lootItems: LootItem[] = [];

    let minGold = 12, maxGold = 38;
    if (targetChest.rarity === 'raro') { minGold = 40; maxGold = 95; }
    if (targetChest.rarity === 'lendário') { minGold = 100; maxGold = 300; }
    const goldValue = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
    lootItems.push({
      id: `gold-chest-${timestamp}`,
      name: `${goldValue} Peças de Ouro (PO)`,
      type: 'gold',
      rarity: 'comum',
      value: goldValue,
      description: `Moedas de ouro brilhantes encontradas dentro de um baú ${targetChest.rarity}.`,
      icon: '💰'
    });

    const qtyConsumables = targetChest.rarity === 'lendário' ? 2 : 1;
    for (let i = 0; i < qtyConsumables; i++) {
      const potionItem = getRandomItemFromDatabase({ category: 'potion' });
      lootItems.push({
        ...potionItem,
        id: `item-chest-${timestamp}-${i}`
      });
    }

    if (targetChest.rarity === 'raro' || targetChest.rarity === 'lendário' || Math.random() < 0.4) {
      const equipCategory = Math.random() < 0.5 ? 'weapon' : 'armor';
      const equipItem = getRandomItemFromDatabase({ category: equipCategory, rarity: targetChest.rarity as any });
      lootItems.push({
        ...equipItem,
        id: `equip-chest-${timestamp}`
      });
    }

    setChests(prev => prev.map(c => c.id === chestId ? { ...c, isOpened: true } : c));
    if (isSfxEnabled) playCollectSound();

    // Spawna loot em volta do baú
    const newLootEntities: { id: string; x: number; y: number; item: LootItem; isCollected: boolean }[] = [];
    lootItems.forEach((item, idx) => {
      const offsets = [
        { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 1 }
      ];
      const offset = offsets[idx % offsets.length];
      const lx = Math.max(0, Math.min(149, targetChest.x + offset.dx));
      const ly = Math.max(0, Math.min(149, targetChest.y + offset.dy));
      newLootEntities.push({
        id: `loot-${targetChest.id}-${idx}-${Date.now()}`,
        x: lx,
        y: ly,
        item,
        isCollected: false
      });
    });

    setDroppedLoot(prev => [...prev, ...newLootEntities]);
    addCombatLog('Mestre da Arena', `📦 Baú Aberto (${targetChest.rarity.toUpperCase()})!`, `Você abriu um baú e encontrou: ${lootItems.map(l => l.name).join(', ')}!`, 'loot');
  };

  const useRestPoint = (restPointId: string) => {
    const rp = restPoints.find(r => r.id === restPointId && !r.isUsed);
    if (!rp) return;

    const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
    if (hasLivingMonsters) {
      addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Longo enquanto houver monstros vivos na área!', 'system');
      return;
    }

    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    if (hero.currentHp < 1) {
      addCombatLog('Mestre da Arena', '⚠️ Inconsciente', 'Você precisa ter pelo menos 1 Ponto de Vida para iniciar um Descanso Longo!', 'system');
      return;
    }

    setActiveDraconicFlight(false);
    setActiveLargeForm(false);
    if (activeRevelation === 'Alma Radiante') {
      setActiveRevelation(null);
    }

    setEntities(prevEntities =>
      prevEntities.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            currentHp: e.maxHp,
            tempHp: 0,
            hasAction: true,
            hasBonusAction: true,
            hasReaction: true,
            size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
            conditions: e.conditions.filter(c => c !== 'Voando')
          };
        }
        return e;
      })
    );

    if (character) {
      const charLevel = character.level || 1;
      const newExhaustion = Math.max(0, (character.exhaustion_level || 0) - 1);
      character.hit_dice_current = charLevel;
      character.exhaustion_level = newExhaustion;
      
      const resources = character.class_resources ? [...character.class_resources] : [];
      let waterResource = resources.find((r: any) => r.name === "Cantil de Água");
      if (waterResource) {
        waterResource.used = 0;
      }
      character.class_resources = resources;

      if (character.id) {
        updateCharacter(character.id, {
          current_hp: hero.maxHp,
          hit_dice_current: charLevel,
          exhaustion_level: newExhaustion,
          class_resources: resources
        }).catch(err => console.warn('Erro ao atualizar descanso longo no Supabase:', err));
      }
    }

    setSecondWindUses(secondWindMaxUses);
    setHealingHandsUses(healingHandsMaxUses);
    setActionSurgeUses(actionSurgeMaxUses);
    setRageUses(rageMaxUses);
    setChannelDivinityUses(channelDivinityMaxUses);
    setSpellSlots(spellSlotsMax);
    setIndomitableUses(indomitableMaxUses);
    setSuperiorityDiceUses(superiorityDiceMaxUses);
    setBardicInspirationUses(bardicInspirationMaxUses);
    setLayOnHandsPool(layOnHandsMaxPool);
    setFocusPointsUses(focusPointsMaxUses);
    setWildShapeUses(wildShapeMaxUses);
    setLuckyPoints(luckyMaxPoints);
    setDraconicFlightUses(draconicFlightMaxUses);
    setDraconicFlightRoundsLeft(100);
    setLargeFormUses(largeFormMaxUses);
    setLargeFormRoundsLeft(100);
    setGoliathAncestryUses(goliathAncestryMaxUses);
    setAdrenalineRushUses(adrenalineRushMaxUses);
    setRelentlessEnduranceUses(relentlessEnduranceMaxUses);
    setHasHeroicInspiration(isHuman);

    setFloatingTexts(prev => [...prev, {
      id: Math.random().toString(),
      x: hero.x,
      y: hero.y,
      text: '🏕️ DESCANSO LONGO!',
      color: '#fbbf24',
      progress: 0
    }]);

    addCombatLog(
      'Mestre da Arena',
      '🏕️ DESCANSO LONGO REALIZADO!',
      `Seu herói descansou no Acampamento! Pontos de Vida (100%), Espaços de Magia, Fúrias, Surtos e todas as habilidades foram completamente restaurados!`,
      'heal'
    );

    setRestPoints(prev => prev.filter(r => r.id !== restPointId));

    const newTurns = totalGameTurns + 133;
    prevTurns.current = newTurns;
    lastLongRestTurn.current = newTurns;
    lastShortRestTurn.current = newTurns;
    lastMealTurn.current = newTurns;
    setTotalGameTurns(newTurns);
    setMovementStepsCount(0);
  };

  const useShortRestPoint = (restPointId: string) => {
    const rp = restPoints.find(r => r.id === restPointId && !r.isUsed);
    if (!rp) return;

    const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
    if (hasLivingMonsters) {
      addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Curto enquanto houver monstros vivos na área!', 'system');
      return;
    }

    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    if (hero.currentHp < 1) {
      addCombatLog('Mestre da Arena', '⚠️ Inconsciente', 'Você precisa ter pelo menos 1 Ponto de Vida para iniciar um Descanso Curto!', 'system');
      return;
    }

    setActiveDraconicFlight(false);
    if (activeRevelation === 'Alma Radiante') {
      setActiveRevelation(null);
    }

    const className = (character.class_name || character.charClass || '').toLowerCase();
    
    setSecondWindUses(prev => Math.min(secondWindMaxUses, prev + 1));
    setActionSurgeUses(actionSurgeMaxUses);
    setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));
    setAdrenalineRushUses(adrenalineRushMaxUses);
    if (className.includes('bruxo') || className.includes('warlock')) {
      setSpellSlots(spellSlotsMax);
    }
    setFocusPointsUses(prev => Math.min(focusPointsMaxUses, prev + 1));

    const currentHitDice = character.hit_dice_current ?? character.level ?? 1;
    let hitDieSides = 8;
    if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
    else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
    else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

    const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
    let rollHp = 0;
    let diceSpent = Math.min(currentHitDice, 1);
    if (currentHitDice > 0) {
      const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
      rollHp = Math.max(1, dieRoll + conMod);
    }

    const newHp = Math.min(hero.maxHp, hero.currentHp + rollHp);
    const recovered = newHp - hero.currentHp;
    const newHitDice = Math.max(0, currentHitDice - diceSpent);

    if (character) {
      character.current_hp = newHp;
      character.hit_dice_current = newHitDice;
      if (character.id) {
        updateCharacter(character.id, {
          current_hp: newHp,
          hit_dice_current: newHitDice
        }).catch(err => console.error("Error updating short rest in DB:", err));
      }
    }

    setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasAction: false } : e));

    if (onCharacterUpdated) {
      onCharacterUpdated();
    }

    const newTurns = totalGameTurns + 17;
    prevTurns.current = newTurns;
    lastShortRestTurn.current = newTurns;
    setTotalGameTurns(newTurns);
    setMovementStepsCount(0);

    setFloatingTexts(prev => [...prev, {
      id: Math.random().toString(),
      x: hero.x,
      y: hero.y,
      text: '☕ DESCANSO CURTO (1h)!',
      color: '#34d399',
      progress: 0
    }]);

    addCombatLog(
      'Mestre da Arena',
      '☕ DESCANSO CURTO REALIZADO (1 Hora)',
      `Seu herói realizou um Descanso Curto de 1 hora no Acampamento. Gastou ${diceSpent} Dado(s) de Vida, recuperou +${recovered} PV e recarregou habilidades de Descanso Curto.`,
      'heal'
    );

    setRestPoints(prev => prev.filter(r => r.id !== restPointId));
  };

  const handleFinishExploration = () => {
    setIsBattleOver(true);
    setIsVictoryScreenVisible(true);
    addCombatLog('Mestre do Jogo', '🚪 MAPA FINALIZADO!', 'Você encerrou a exploração do mapa e pode reivindicar suas recompensas!', 'system');
  };

  const handleClaimLootAndSave = async () => {
    if (!character.id || !victoryData) return;
    setIsSaving(true);
    try {
      const currentXp = (character.xp || 0) + victoryData.totalXp;
      const targetLvl = getLevelFromXp(currentXp);
      const hasLevelUpAvailable = targetLvl > (character.level || 1);

      const catalog = getAllShopCatalog();
      const equipmentSet = new Set((character.character_inventory || []).map((inv: any) => inv.items?.name?.toLowerCase()));
      
      for (const item of victoryData.loot) {
        if (item.type !== 'gold') {
          if (!equipmentSet.has(item.name.toLowerCase())) {
             const cleanName = item.name.replace(/^1x\s*/i, '').replace(/^\d+\s+/, '').trim();
             const shopItem = catalog.find((i: any) => i.name.toLowerCase() === cleanName.toLowerCase());
             const itemId = shopItem ? shopItem.id : null;
             if (!itemId) {
                console.warn("Item não encontrado no banco de dados:", cleanName);
                addCombatLog('Mestre do Jogo', '⚠️ Item Desconhecido', `O item ${cleanName} não existe no banco de dados e não pôde ser adicionado.`, 'system');
                continue;
             }
             await addItemToInventory(character.id, itemId, 1, null);
             equipmentSet.add(item.name.toLowerCase());
          }
        }
      }

      let newBestiary = character.defeated_monsters || character.defeatedMonsters || {};
      if (victoryData.defeatedMonsters) {
        newBestiary = { ...newBestiary };
        Object.entries(victoryData.defeatedMonsters).forEach(([name, count]) => {
          newBestiary[name] = (newBestiary[name] || 0) + (count as number);
        });
        character.defeated_monsters = newBestiary;
        character.defeatedMonsters = newBestiary;
        const bestiaryKey = `bestiary_${character.id}`;
        localStorage.setItem(bestiaryKey, JSON.stringify(newBestiary));
      }

      const maxHp = character.max_hp || 20;
      const fullLevel = character.level || 1;

      const stats = {
        str: character.strength || 10,
        dex: character.dexterity || 10,
        con: character.constitution || 10,
        int: character.intelligence || 10,
        wis: character.wisdom || 10,
        cha: character.charisma || 10,
      };
      let refreshedRes = calculateResources(
        character.class_name || 'Guerreiro',
        fullLevel,
        stats,
        character.subclass || 'Champion'
      );
      const raceRes = calculateRaceResources(
        character.race || '',
        fullLevel,
        character.draconic_ancestry,
        character.giant_ancestry || character.giantAncestry
      );
      raceRes.forEach(rr => {
        if (!refreshedRes.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
          refreshedRes.push(rr);
        }
      });
      refreshedRes = refreshedRes.map((r: any) => ({ ...r, used: 0 }));

      character.xp = currentXp;
      character.current_hp = maxHp;
      character.temp_hp = 0;
      character.hit_dice_current = fullLevel;
      character.exhaustion_level = 0;
      character.class_resources = refreshedRes;

      const updatePayload: any = {
        xp: currentXp,
        current_hp: maxHp,
        temp_hp: 0,
        hit_dice_current: fullLevel,
        exhaustion_level: 0,
        class_resources: refreshedRes,
        defeated_monsters: newBestiary
      };
      
      await updateCharacter(character.id, updatePayload);

      alert(`🎉 Recompensas salvas na Ficha com sucesso!\n\n⭐ +${victoryData.totalXp} XP (Total: ${currentXp} XP)\n🎒 ${victoryData.loot.filter((i: any) => i.type !== 'gold').length} item(ns) no inventário!${hasLevelUpAvailable ? '\n\n🔥 EVOLUÇÃO DISPONÍVEL! Vá até a Ficha do Personagem para Rolar seu Dado de Vida e Ativar as Habilidades do Nível!' : ''}`);
      
      setMapStreak(1);
      setVictoryData({ totalXp: 0, loot: [], defeatedMonsters: {}, totalDamageDealt: 0 });
      setShowVictorySummaryModal(false);
      if (onCharacterUpdated) await onCharacterUpdated();
      onExitGame();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar progresso no banco de dados: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Inicializar combate automaticamente ao montar o hook
  useEffect(() => {
    initNewCombat();
  }, []);

  return {
    biome,
    setBiome,
    grid,
    setGrid,
    torches,
    setTorches,
    entities,
    setEntities,
    activeEntityIndex,
    setActiveEntityIndex,
    currentTurnRound,
    setCurrentTurnRound,
    weather,
    setWeather,
    weatherTime,
    setWeatherTime,
    isNightManual,
    setIsNightManual,
    combatDifficulty,
    setCombatDifficulty,
    isBattleOver,
    setIsBattleOver,
    isVictoryScreenVisible,
    setIsVictoryScreenVisible,
    showVictorySummaryModal,
    setShowVictorySummaryModal,
    victoryData,
    setVictoryData,
    droppedLoot,
    setDroppedLoot,
    chests,
    setChests,
    hazards,
    setHazards,
    powerups,
    setPowerUps,
    restPoints,
    setRestPoints,
    pendingRestPointId,
    setPendingRestPointId,
    totalGameTurns,
    setTotalGameTurns,
    movementStepsCount,
    setMovementStepsCount,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    prevTurns,
    mapStreak,
    setMapStreak,
    isSaving,
    setIsSaving,
    lastEncounterPos,
    setLastEncounterPos,
    processedDeathIdsRef,
    collectedLootIdsRef,
    openedChestIdsRef,
    exploredCellsRef,
    victoryLogged,
    prevHadVisibleMonstersRef,
    initNewCombat,
    addLootItemToInventory,
    collectLootItem,
    openChest,
    useRestPoint,
    useShortRestPoint,
    handleFinishExploration,
    handleClaimLootAndSave,
    expandMapIfNeeded
  };
}
