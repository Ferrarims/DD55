import React from 'react';
import { CombatEntity, LootItem } from '../../../../game/types';
import { addItemToInventory, updateCharacter } from '../../../../lib/api/characterService';
import { getAllShopCatalog, getRandomItemFromDatabase, parseCoinsToGoldNumber } from '../../../../lib/mechanics/xpAndLootManager';
import { playCollectSound } from '../../../../lib/audio';
import { VictoryData, DroppedLootData, ChestData } from './types';

export interface UseArenaLootProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  isSfxEnabled: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  entities: CombatEntity[];
  droppedLoot: DroppedLootData[];
  setDroppedLoot: React.Dispatch<React.SetStateAction<DroppedLootData[]>>;
  chests: ChestData[];
  setChests: React.Dispatch<React.SetStateAction<ChestData[]>>;
  setVictoryData: React.Dispatch<React.SetStateAction<VictoryData | null>>;
  collectedLootIdsRef: React.MutableRefObject<Set<string>>;
  openedChestIdsRef: React.MutableRefObject<Set<string>>;
}

export function useArenaLoot(props: UseArenaLootProps) {
  const {
    character,
    onCharacterUpdated,
    isSfxEnabled,
    addCombatLog,
    entities,
    droppedLoot,
    setDroppedLoot,
    chests,
    setChests,
    setVictoryData,
    collectedLootIdsRef,
    openedChestIdsRef,
  } = props;

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

    const newLootEntities: DroppedLootData[] = [];
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

  return {
    addLootItemToInventory,
    collectLootItem,
    openChest,
  };
}
