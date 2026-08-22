import React from 'react';
import { BiomeType, WeatherType, CombatEntity, CellData, LootItem, PowerUp } from '../../../../game/types';

export interface VictoryData {
  totalXp: number;
  loot: LootItem[];
  defeatedMonsters: Record<string, number>;
  totalDamageDealt?: number;
}

export interface DroppedLootData {
  id: string;
  x: number;
  y: number;
  item: LootItem;
  isCollected: boolean;
}

export interface ChestData {
  id: string;
  x: number;
  y: number;
  rarity: 'comum' | 'raro' | 'lendário';
  isOpened: boolean;
}

export interface HazardData {
  id: string;
  x: number;
  y: number;
  type: 'spikes' | 'mushrooms' | 'mud' | 'web' | 'fire_vent';
  name: string;
  icon?: string;
  dc?: number;
  isTriggered: boolean;
  isHidden?: boolean;
  isDisarmed?: boolean;
}

export interface RestPointData {
  id: string;
  x: number;
  y: number;
  size?: number;
  isUsed: boolean;
  icon?: string;
}

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
