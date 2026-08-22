import React from 'react';
import { CombatEntity, CellData, BiomeType } from '../../../game/types';
import { useInitiativeLifecycle } from './lifecycle/useInitiativeLifecycle';
import { useLootAndChestsLifecycle } from './lifecycle/useLootAndChestsLifecycle';
import { useCombatResolutionLifecycle } from './lifecycle/useCombatResolutionLifecycle';
import { useInfiniteMapSpawnLifecycle } from './lifecycle/useInfiniteMapSpawnLifecycle';

export interface UseGameLifecycleProps {
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

export function useGameLifecycle(props: UseGameLifecycleProps) {
  const heroEntity = props.entities.find(e => e.type === 'hero');
  const isHeroDead = heroEntity ? (heroEntity.isDead || heroEntity.currentHp <= 0) : false;
  const activeEntity = props.entities[props.activeEntityIndex];

  // 1. Iniciativa
  useInitiativeLifecycle({
    ...props,
  });

  // 2. Coleta de Itens e Baús
  useLootAndChestsLifecycle({
    heroEntity,
    isHeroDead,
    isBattleOver: props.isBattleOver,
    droppedLoot: props.droppedLoot,
    setDroppedLoot: props.setDroppedLoot,
    collectLootItem: props.collectLootItem,
    chests: props.chests,
    openChest: props.openChest,
    addLootItemToInventory: props.addLootItemToInventory,
    setVictoryData: props.setVictoryData,
    addCombatLog: props.addCombatLog,
  });

  // 3. Resolução de Vitória / Derrota / Exaustão
  useCombatResolutionLifecycle({
    ...props,
    heroEntity,
    isHeroDead,
  });

  // 4. Spawn Infinito, Velocidade e Skip de Mortos
  useInfiniteMapSpawnLifecycle({
    ...props,
    activeEntity,
    isHeroDead,
  });
}
