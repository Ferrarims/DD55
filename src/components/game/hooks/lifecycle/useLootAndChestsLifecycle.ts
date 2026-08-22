import React, { useEffect } from 'react';
import { CombatEntity } from '../../../../game/types';

export interface UseLootAndChestsLifecycleProps {
  heroEntity?: CombatEntity;
  isHeroDead: boolean;
  isBattleOver: boolean;
  droppedLoot: any[];
  setDroppedLoot: React.Dispatch<React.SetStateAction<any[]>>;
  collectLootItem: (id: string) => Promise<void> | void;
  chests: any[];
  openChest: (id: string) => Promise<void> | void;
  addLootItemToInventory: (item: any) => Promise<void> | void;
  setVictoryData: React.Dispatch<React.SetStateAction<any>>;
  addCombatLog: (actorName: string, title: string, detail: string, type: any) => void;
}

export function useLootAndChestsLifecycle({
  heroEntity,
  isHeroDead,
  isBattleOver,
  droppedLoot,
  setDroppedLoot,
  collectLootItem,
  chests,
  openChest,
  addLootItemToInventory,
  setVictoryData,
  addCombatLog,
}: UseLootAndChestsLifecycleProps) {
  // Monitorar Coleta de Loot quando o Herói pisa em um quadrado contendo itens
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

  // Monitorar Abertura de Baús quando o Herói pisa na célula de um baú fechado
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

  // Monitorar Fim da Batalha para recolhimento automático de espólios restantes no chão
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
}
